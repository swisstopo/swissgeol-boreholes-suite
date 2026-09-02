namespace BDMS.Services;

/// <summary>
/// One entry to be written into a streamed ZIP archive.
/// </summary>
/// <param name="EntryName">The path of the entry inside the archive, using forward slashes for folders.</param>
/// <param name="OpenContent">
/// Opens the entry content. Invoked once, at the moment the entry is written, so that only one
/// entry's content is in flight at a time. The returned stream is disposed by the writer.
/// </param>
internal sealed record ZipEntrySource(string EntryName, Func<Task<Stream>> OpenContent);
