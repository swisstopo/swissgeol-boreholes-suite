using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BDMS;

/// <summary>
/// Creates an in-memory test server for integration tests.
/// Replaces JWT authentication with <see cref="TestAuthHandler"/> so tests can set
/// identity claims via request headers without requiring a real identity provider.
/// </summary>
internal class BdmsWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // WebApplicationFactory infers content root from assembly name ("BDMS"),
        // but the project lives at src/api/, not BDMS/. Point to the actual project directory.
        builder.UseSolutionRelativeContentRoot("src/api");

        builder.ConfigureTestServices(services =>
        {
            // Remove the database-based claims transformation (it requires email/name claims we don't provide).
            services.RemoveAll<IClaimsTransformation>();

            // Replace JWT authentication with a header-based test scheme.
            services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.AuthenticationScheme, null);
        });
    }
}
