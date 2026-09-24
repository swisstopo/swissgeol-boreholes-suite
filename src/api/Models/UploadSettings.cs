namespace BDMS.Models;

/// <summary>
/// What the client needs to know to upload a file the API will accept, so that it validates and
/// chunks against the same numbers the API enforces instead of a copy of its own.
/// </summary>
/// <param name="MaxFileSize">The largest file accepted by the endpoints that take one in a single request, in bytes.</param>
/// <param name="LargeMaxFileSize">The largest log file accepted by the chunked upload, in bytes.</param>
/// <param name="MaxImportArchiveSize">The largest import archive the client accepts, in bytes. No archive is sent to the API: the client unpacks it and sends its contents as a description and one upload per attachment.</param>
/// <param name="ChunkSize">How much of a file the chunked upload is expected to send per request, in bytes.</param>
public record UploadSettings(int MaxFileSize, long LargeMaxFileSize, long MaxImportArchiveSize, int ChunkSize);
