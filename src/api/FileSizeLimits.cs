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
    /// The limit that applies to a file arriving in chunks, which is not bounded by what one
    /// request may carry. Every chunked upload accepts up to this much, whatever it is uploading.
    /// </summary>
    public const long Large = 5_000_000_000;

    /// <summary>
    /// The limit that applies to an import archive. Nothing of this size reaches the API: the
    /// archive is unpacked by the client, which sends its small description in one request and each
    /// of its attachments as an upload of its own. The limit is served so that the client holds the
    /// user to a number the product chose rather than one it picked for itself.
    /// </summary>
    public const long MaxImportArchive = 20_000_000_000;
}
