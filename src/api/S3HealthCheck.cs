using Amazon.S3;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Net;

namespace BDMS;

public class S3HealthCheck : IHealthCheck
{
    private readonly IAmazonS3 s3Client;

    /// <summary>
    /// Creates a new instance of <see cref="S3HealthCheck"/>.
    /// </summary>
    /// <param name="s3Client">The <see cref="IAmazonS3"/> client.</param>
    /// <param name="configuration">The <see cref="IConfiguration"/> object.</param>
    public S3HealthCheck(IAmazonS3 s3Client, IConfiguration configuration) => this.s3Client = s3Client;

    /// <inheritdoc />
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var healthCheckResult = HealthCheckResult.Healthy();

        try
        {
            var response = await s3Client.ListBucketsAsync(cancellationToken).ConfigureAwait(false);
            if (response.HttpStatusCode != HttpStatusCode.OK)
            {
                healthCheckResult = HealthCheckResult.Unhealthy();
            }
        }
        catch (Exception)
        {
            healthCheckResult = HealthCheckResult.Unhealthy();
        }

        return await Task.FromResult(healthCheckResult).ConfigureAwait(false);
    }
}
