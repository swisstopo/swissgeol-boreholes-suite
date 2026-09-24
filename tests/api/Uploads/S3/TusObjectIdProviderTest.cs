using System.Text;

namespace BDMS.Uploads.S3;

/// <summary>
/// One provider names the uploads of every feature, so what it reads out of the upload metadata has
/// to be the one key every feature carries and nothing else.
/// </summary>
[TestClass]
public class TusObjectIdProviderTest
{
    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value));

    /// <summary>
    /// A profile upload names no log run. A provider that read the metadata as a log upload's would
    /// give up on it and name the object after nothing, and the extension is what the download and
    /// the handling that tells a TIFF from a PDF both read off that name.
    /// </summary>
    [TestMethod]
    public async Task CreateIdNamesAnUploadCarryingNoLogRunAfterTheFileExtension()
    {
        var metadata = $"boreholeId {Encode("42")},filename {Encode("profile.pdf")},contentType {Encode("application/pdf")}";

        var fileId = await new TusObjectIdProvider().CreateId(metadata);

        StringAssert.EndsWith(fileId, ".pdf", $"<{fileId}> carries no extension of the file the user picked.");
        Assert.IsTrue(
            Guid.TryParseExact(fileId[..^".pdf".Length], "D", out _),
            $"<{fileId}> is not a name of the shape the objects in the bucket have.");
    }

    /// <summary>
    /// The metadata a log file upload carries, to show that the name above is what every feature
    /// gets rather than what one of them traded for another.
    /// </summary>
    [TestMethod]
    public async Task CreateIdNamesALogFileUploadAfterTheFileExtension()
    {
        var metadata = $"logRunId {Encode("42")},filename {Encode("gamma.las")},contentType {Encode("text/plain")}";

        var fileId = await new TusObjectIdProvider().CreateId(metadata);

        StringAssert.EndsWith(fileId, ".las", $"<{fileId}> carries no extension of the file the user picked.");
    }
}
