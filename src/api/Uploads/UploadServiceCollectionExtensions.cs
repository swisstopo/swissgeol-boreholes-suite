using Amazon.S3;
using BDMS.Uploads.S3;

namespace BDMS.Uploads;

/// <summary>
/// Registers what the chunked log file upload needs.
/// </summary>
public static class UploadServiceCollectionExtensions
{
    /// <summary>
    /// Adds the tus store the log file upload writes through, and the sweep that removes the
    /// uploads it was never told to finish.
    /// </summary>
    /// <param name="services">The service collection to add to.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection, so calls can be chained.</returns>
    public static IServiceCollection AddLogFileUploads(this IServiceCollection services, IConfiguration configuration)
    {
#pragma warning disable CA1308 // Normalize strings to uppercase
        var bucketName = configuration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant();
#pragma warning restore CA1308 // Normalize strings to uppercase

        // The store holds nothing that belongs to one request, so one instance serves them all.
        services.AddSingleton<S3UploadStateStore>(sp => new S3UploadStateStore(
            sp.GetRequiredService<IAmazonS3>(),
            bucketName));
        services.AddSingleton<S3TusStore>(sp => new S3TusStore(
            sp.GetRequiredService<IAmazonS3>(),
            sp.GetRequiredService<S3UploadStateStore>(),
            bucketName));

        // Without cloud storage there is no client to reach and no upload that could have been
        // started, so the sweep would do nothing but fail once an hour for as long as the
        // application runs.
        if (IsCloudStorageConfigured(configuration))
        {
            services.AddHostedService<ExpiredUploadCleanupService>();
        }

        return services;
    }

    /// <summary>
    /// Whether the application was given a cloud storage to reach, which it is not in the
    /// anonymous mode that serves boreholes without their files.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <returns><see langword="true"/> if the storage is configured; otherwise, <see langword="false"/>.</returns>
    private static bool IsCloudStorageConfigured(IConfiguration configuration)
    {
        var serviceUrl = configuration["S3:ENDPOINT"];
        return !string.IsNullOrEmpty(serviceUrl) && Uri.TryCreate(serviceUrl, UriKind.Absolute, out _);
    }
}
