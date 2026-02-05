using Amazon.S3;
using Amazon.S3.Util;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace BDMS;

public class S3HealthCheck : IHealthCheck
{
    private readonly IAmazonS3 s3Client;
    private readonly IConfiguration configuration;

    /// <summary>
    /// Creates a new instance of <see cref="S3HealthCheck"/>.
    /// </summary>
    /// <param name="s3Client">The <see cref="IAmazonS3"/> client.</param>
    /// <param name="configuration">The <see cref="IConfiguration"/> object.</param>
    public S3HealthCheck(IAmazonS3 s3Client, IConfiguration configuration)
    {
        this.s3Client = s3Client;
        this.configuration = configuration;
    }

    /// <inheritdoc />
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var bucketKeys = new[] { "S3:BUCKET_NAME", "S3:PHOTOS_BUCKET_NAME", "S3:LOGFILES_BUCKET_NAME" };

        if (bucketKeys.All(key => string.IsNullOrEmpty(configuration[key])))
        {
            return HealthCheckResult.Healthy("S3 not configured, skipping check.");
        }

        foreach (var key in bucketKeys)
        {
            var bucketName = configuration[key];

            try
            {
                if (!await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName).ConfigureAwait(false))
                {
                    return HealthCheckResult.Unhealthy($"Bucket '{bucketName}' does not exist or is not accessible.");
                }
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy($"Bucket '{bucketName}': {ex.Message}");
            }
        }

        return HealthCheckResult.Healthy();
    }
}
