namespace BDMS.Uploads;

/// <summary>
/// The keys the tus stores are registered and resolved under, one per bucket.
/// </summary>
public static class UploadBuckets
{
    /// <summary>The bucket log files live in.</summary>
    public const string LogFiles = "logFiles";

    /// <summary>The bucket profiles live in.</summary>
    public const string Profiles = "profiles";
}
