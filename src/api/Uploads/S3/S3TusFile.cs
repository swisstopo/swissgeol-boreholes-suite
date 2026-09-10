using System.Text;
using tusdotnet.Interfaces;
using tusdotnet.Models;

namespace BDMS.Uploads.S3;

/// <summary>
/// An upload as the events of the endpoint see it. Only what the upload is for is available: the
/// authorization reads the log run from it and the completion reads the file name, and neither
/// needs the bytes.
/// </summary>
public class S3TusFile : ITusFile
{
    private readonly Dictionary<string, string> metadata;

    /// <summary>
    /// Initializes a new instance of the <see cref="S3TusFile"/> class.
    /// </summary>
    public S3TusFile(string id, Dictionary<string, string> metadata)
    {
        Id = id;
        this.metadata = metadata;
    }

    /// <inheritdoc/>
    public string Id { get; }

    /// <inheritdoc/>
    public Task<Dictionary<string, Metadata>> GetMetadataAsync(CancellationToken cancellationToken)
    {
        var parsed = metadata.ToDictionary(
            entry => entry.Key,
            entry => Metadata.Parse($"{entry.Key} {Convert.ToBase64String(Encoding.UTF8.GetBytes(entry.Value))}")[entry.Key],
            StringComparer.Ordinal);

        return Task.FromResult(parsed);
    }

    /// <inheritdoc/>
    /// <exception cref="NotSupportedException">Always, because an upload is never read back.</exception>
    public Task<Stream> GetContentAsync(CancellationToken cancellationToken) =>
        throw new NotSupportedException("An upload is written straight to the cloud storage and is not read back through the store.");
}
