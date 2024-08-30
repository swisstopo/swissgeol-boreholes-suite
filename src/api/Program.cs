using Amazon.Runtime;
using Amazon.S3;
using BDMS;
using BDMS.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
    options.JsonSerializerOptions.Converters.Add(new LTreeJsonConverter());
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => builder.Configuration.Bind("Auth", options));

builder.Services.AddTransient<IClaimsTransformation, DatabaseAuthenticationClaimsTransformation>();

builder.Services.AddAuthorization(options =>
{
    var groupClaimType = builder.Configuration.GetValue<string>("Auth:GroupClaimType")
        ?? throw new InvalidOperationException("The configuration 'Auth:GroupClaimType' is missing.");

    var authorizedGroupName = builder.Configuration.GetValue<string>("Auth:AuthorizedGroupName")
        ?? throw new InvalidOperationException("The configuration 'Auth:AuthorizedGroupName' is missing.");

    options.AddPolicy(PolicyNames.Admin, options => options
    .RequireClaim(groupClaimType, authorizedGroupName)
    .RequireRole(PolicyNames.Admin));

    options.AddPolicy(PolicyNames.Viewer, options => options
    .RequireClaim(groupClaimType, authorizedGroupName)
    .RequireRole(PolicyNames.Admin, PolicyNames.Viewer));

    // Remarks: By default controller endpoints are accessible only to administrators (isAdmin flag in user entity).
    // The default authorization policy `[Authorize]` should not be used because its already set as the default fallback
    // policy and because it leads to unwanted behavior. If you have an endpoint which should be accessible for a specific
    // role use `[Authorize(Policy = PolicyNames.Viewer)]`. Use `[AllowAnonymous]` for endpoints which should be accessible
    // without authentication (e.g. /version or /health endpoints).
    options.DefaultPolicy = options.GetPolicy(PolicyNames.Admin)!;
    options.FallbackPolicy = options.DefaultPolicy;
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

var connectionString = builder.Configuration.GetConnectionString(nameof(BdmsContext));
builder.Services.AddNpgsql<BdmsContext>(connectionString, options =>
{
    options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    options.UseNetTopologySuite();
    options.MigrationsHistoryTable("__EFMigrationsHistory", "bdms");
});

builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
builder.Services.AddSwaggerGen(options =>
{
    // Include existing documentation in Swagger UI.
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml"));

    options.EnableAnnotations();
    options.SupportNonNullableReferenceTypes();
    options.SwaggerDoc("v2", new OpenApiInfo
    {
        Version = "v2",
        Title = "Boreholes REST API v2",
    });
    options.AddSecurityDefinition("OpenIdConnect", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.OpenIdConnect,
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = nameof(SecuritySchemeType.OpenIdConnect),
                },
            },
            Array.Empty<string>()
        },
    });
});

builder.Services.AddApiVersioning(config =>
{
    config.AssumeDefaultVersionWhenUnspecified = true;
    config.DefaultApiVersion = new ApiVersion(2, 0);
    config.ReportApiVersions = true;
});

builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<CoordinateService>();
builder.Services.AddScoped<BoreholeFileUploadService>();
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var s3ConfigSection = builder.Configuration.GetSection("S3");
    var clientConfig = new AmazonS3Config
    {
        ServiceURL = s3ConfigSection.GetValue<string>("ENDPOINT"),
        UseHttp = s3ConfigSection.GetValue<string>("SECURE") == "0",
    };

    var accessKey = s3ConfigSection.GetValue<string>("ACCESS_KEY");
    var secretKey = s3ConfigSection.GetValue<string>("SECRET_KEY");

    // If access key or secret key is not specified, try get them via IAM
    if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
    {
        var credentials = new InstanceProfileAWSCredentials();
        return new AmazonS3Client(credentials, clientConfig);
    }

    // Force path style must be enabled for local minIO server
    clientConfig.ForcePathStyle = true;

    return new AmazonS3Client(accessKey, secretKey, clientConfig);
});

builder.Services.AddScoped<LegacyApiAuthenticationMiddleware>();
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddScoped<IBoreholeLockService, BoreholeLockService>();
builder.Services.AddSingleton(TimeProvider.System);

builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<BdmsContext>("Database")
    .AddCheck<S3HealthCheck>("S3");

var app = builder.Build();

// Migrate db changes on startup
using var scope = app.Services.CreateScope();
using var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();
{
    context.Database.Migrate();

    if (app.Environment.IsDevelopment())
    {
        context.EnsureSeeded();
    }
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v2/swagger.json", "v2");
    options.RoutePrefix = string.Empty;
});

if (builder.Configuration.IsAnonymousModeEnabled())
{
    app.UseMiddleware<AnonymousAuthenticationMiddleware>();
}
else
{
    app.UseAuthentication();
}

app.UseAuthorization();
app.UseMiddleware<LegacyApiAuthenticationMiddleware>();

app.MapControllers();
app.MapReverseProxy();
app.MapHealthChecks("/health").AllowAnonymous();

app.Run();
