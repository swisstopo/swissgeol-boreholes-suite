using Amazon.Runtime;
using Amazon.S3;
using BDMS;
using BDMS.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Server.HttpSys;
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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.Admin, options => options.RequireRole(PolicyNames.Admin));
    options.AddPolicy(PolicyNames.Viewer, options => options.RequireRole(PolicyNames.Admin, PolicyNames.Viewer));

    // Remarks: By default controller endpoints are accessible only to administrators (isAdmin flag in user entity).
    // The default authorization policy `[Authorize]` should not be used because its already set as the default fallback
    // policy and because it leads to unwanted behavior. If you have an endpoint which should be accessible for a specific
    // role use `[Authorize(Policy = PolicyNames.Viewer)]`. Use `[AllowAnonymous]` for endpoints which should be accessible
    // without authentication (e.g. /version or /health endpoints).
    options.DefaultPolicy = options.GetPolicy(PolicyNames.Admin)!;
    options.FallbackPolicy = options.DefaultPolicy;
});

builder.Services.AddAuthentication("BasicAuthentication")
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("BasicAuthentication", null);

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

var connectionString = builder.Configuration.GetConnectionString("BdmsContext");
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
        Title = "BDMS REST API v2",
    });
    options.AddSecurityDefinition("Basic", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = nameof(AuthenticationSchemes.Basic),
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = nameof(AuthenticationSchemes.Basic),
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
        using var credentials = new InstanceProfileAWSCredentials();
        return new AmazonS3Client(credentials, clientConfig);
    }

    return new AmazonS3Client(accessKey, secretKey, clientConfig);
});

var app = builder.Build();

// Migrate db changes on startup
using var scope = app.Services.CreateScope();
using var context = scope.ServiceProvider.GetRequiredService<BdmsContext>();
context.Database.Migrate();

if (app.Environment.IsDevelopment())
{
    context.EnsureSeeded();
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v2/swagger.json", "v2");
    options.RoutePrefix = string.Empty;
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
