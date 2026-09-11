namespace BDMS.Uploads.S3;

/// <summary>
/// What an upload in progress is, beyond the parts the cloud storage already holds for it.
///
/// The storage can list the parts of a multipart upload but knows nothing about what the upload is
/// for, so the little that the later requests need is kept alongside it.
/// </summary>
/// <param name="ObjectKey">The key the finished object takes, chosen before the first byte arrives.</param>
/// <param name="UploadId">The multipart upload the parts belong to, absent when the object was stored without one.</param>
/// <param name="UploadLength">The size the client declared, absent while it defers it.</param>
/// <param name="Metadata">The decoded tus upload metadata, saying what the file is for.</param>
/// <param name="Expires">When the upload stops being resumable, absent while it never does.</param>
public record S3UploadState(
    string ObjectKey,
    string? UploadId,
    long? UploadLength,
    Dictionary<string, string> Metadata,
    DateTimeOffset? Expires);
