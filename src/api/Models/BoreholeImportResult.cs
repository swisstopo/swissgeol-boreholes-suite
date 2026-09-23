namespace BDMS.Models;

/// <summary>
/// What an import did, and what it is still waiting for.
/// </summary>
/// <param name="BoreholeCount">How many boreholes were created.</param>
/// <param name="Attachments">The rows written for attachments that have yet to be uploaded.</param>
public record BoreholeImportResult(int BoreholeCount, IReadOnlyList<PendingAttachment> Attachments);

/// <summary>
/// A profile row waiting for the file that fills it.
/// </summary>
/// <param name="ProfileId">The row the upload names.</param>
/// <param name="BoreholeId">
/// The borehole the row belongs to. The upload is authorized against the borehole rather than the
/// row, so the client has to name it, and reading it back per attachment would be a request each.
/// </param>
/// <param name="FileName">
/// The archive entry holding the file, named the way the export wrote it. The server builds this
/// rather than the client, so the two cannot come to disagree about how a name is sanitised.
/// </param>
public record PendingAttachment(int ProfileId, int BoreholeId, string FileName);
