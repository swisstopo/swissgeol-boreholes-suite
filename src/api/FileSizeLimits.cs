namespace BDMS;

/// <summary>
/// The largest files the API accepts, in bytes.
///
/// These are the single source of truth for the limits: the endpoints enforce them and
/// <see cref="Controllers.SettingsController"/> reports them, so the client validates against the
/// same numbers rather than a copy of its own. They are constants because the request size
/// attributes that enforce them take compile time arguments.
/// </summary>
public static class FileSizeLimits
{
    /// <summary>
    /// The limit that applies to a file arriving in a single request. 1024 x 1024 x 200 = 209715200 bytes.
    /// </summary>
    public const int Standard = 210_000_000;

    /// <summary>
    /// The limit that applies to a log file, which arrives in chunks and so is not bounded by what
    /// one request may carry.
    /// </summary>
    public const long Large = 5_000_000_000;
}
