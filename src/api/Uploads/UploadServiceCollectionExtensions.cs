using Amazon.S3;
using BDMS.Uploads.S3;

namespace BDMS.Uploads;

/// <summary>
/// Registers what the chunked uploads need.
/// </summary>
public static class UploadServiceCollectionExtensions
{
    /// <summary>
    /// Adds the tus endpoints the resumable uploads are reached through, the stores they write
    /// through, one per bucket, and the sweep that removes the uploads they were never told to
    /// finish.
    /// </summary>
    /// <param name="services">The service collection to add to.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection, so calls can be chained.</returns>
    public static IServiceCollection AddResumableUploads(this IServiceCollection services, IConfiguration configuration)
    {
        AddStore(services, UploadBuckets.LogFiles, configuration, "S3:LOGFILES_BUCKET_NAME");
        AddStore(services, UploadBuckets.Profiles, configuration, "S3:BUCKET_NAME");

        // An endpoint reads the database to decide what a request may do, so it lives as long as
        // the request it decides for.
        services.AddScoped<LogFileTusEndpoint>();
        services.AddScoped<ProfileTusEndpoint>();

        // Without cloud storage there is no client to reach and no upload that could have been
        // started, so the sweep would do nothing but fail once an hour for as long as the
        // application runs.
        if (IsCloudStorageConfigured(configuration))
        {
            // The sweep is handed the stores that were registered above rather than a list of its
            // own, so that a bucket added here is one it reaches without being told.
            services.AddHostedService(sp => new ExpiredUploadCleanupService(
                sp.GetRequiredService<ILogger<ExpiredUploadCleanupService>>(),
                sp.GetKeyedServices<S3TusStore>(KeyedService.AnyKey).ToList()));
        }

        return services;
    }

    /// <summary>
    /// Adds the store for one bucket. The store holds nothing that belongs to one request, so one
    /// instance serves them all.
    ///
    /// A missing bucket stops the application here rather than at the first upload, because a store
    /// has nowhere to write without one and the operator reading the failure is the only one who
    /// can supply it.
    /// </summary>
    /// <param name="services">The service collection to add to.</param>
    /// <param name="key">The key the store is resolved under.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="bucketNameSetting">The setting naming the bucket the store writes to.</param>
    /// <exception cref="InvalidOperationException">The setting names no bucket.</exception>
    private static void AddStore(IServiceCollection services, string key, IConfiguration configuration, string bucketNameSetting)
    {
        var bucketName = configuration[bucketNameSetting];
        if (string.IsNullOrWhiteSpace(bucketName))
        {
            throw new InvalidOperationException(
                $"The setting <{bucketNameSetting}> names no bucket, so <{key}> uploads have nowhere to be written.");
        }

#pragma warning disable CA1308 // Normalize strings to uppercase
        var normalizedBucketName = bucketName.ToLowerInvariant();
#pragma warning restore CA1308 // Normalize strings to uppercase

        services.AddKeyedSingleton<S3TusStore>(key, (sp, _) => new S3TusStore(
            sp.GetRequiredService<ILoggerFactory>(),
            sp.GetRequiredService<IAmazonS3>(),
            S3TusStore.CreateConfiguration(normalizedBucketName)));
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
