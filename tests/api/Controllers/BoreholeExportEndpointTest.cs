using BDMS.Authentication;
using BDMS.Models;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace BDMS.Controllers;

/// <summary>
/// Sends export requests through a real Kestrel server. The in-memory test server ignores request body
/// size limits, so only Kestrel shows whether an oversized request is refused. Kestrel also rejects
/// synchronous writes to the response body, which a streamed export must not make.
/// </summary>
[TestClass]
public class BoreholeExportEndpointTest
{
    private const string CsvExportPath = "/api/v2/boreholeexport/csv";
    private const string JsonExportPath = "/api/v2/boreholeexport/json";
    private const string ZipExportPath = "/api/v2/boreholeexport/zip";
    private const int ExportedBoreholeId = 1_000_068;
    private static BdmsWebApplicationFactory factory;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext)
    {
        factory = new BdmsWebApplicationFactory();
        factory.UseKestrel(0);
        factory.StartServer();
    }

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    [TestMethod]
    [DataRow(CsvExportPath, DisplayName = "CSV")]
    [DataRow(JsonExportPath, DisplayName = "JSON")]
    [DataRow(ZipExportPath, DisplayName = "JSON + profile")]
    public async Task ExportRefusesABodyOverTheLimitAsTooLarge(string exportPath)
    {
        using var client = CreateAdminClient();

        using var response = await client.PostAsync(exportPath, CreateExportBody(BoreholeExportRequest.MaxRequestBodySize + 1));

        Assert.AreEqual(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
    }

    [TestMethod]
    [DataRow(CsvExportPath, DisplayName = "CSV")]
    [DataRow(JsonExportPath, DisplayName = "JSON")]
    [DataRow(ZipExportPath, DisplayName = "JSON + profile")]
    public async Task ExportAcceptsABodyAtTheLimit(string exportPath)
    {
        using var client = CreateAdminClient();

        using var response = await client.PostAsync(exportPath, CreateExportBody(BoreholeExportRequest.MaxRequestBodySize));

        // The requested borehole does not exist, so a body that passes the limit is answered with 404.
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode, await response.Content.ReadAsStringAsync());
    }

    [TestMethod]
    public async Task CsvExportStreamsTheFileThroughKestrel()
    {
        // Kestrel rejects synchronous writes to the response body, so this fails if any part of the
        // streamed file is written or flushed synchronously.
        using var client = CreateAdminClient();
        using var body = JsonContent.Create(new BoreholeExportRequest { Ids = [ExportedBoreholeId] });

        using var response = await client.PostAsync(CsvExportPath, body);

        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, await response.Content.ReadAsStringAsync());
        Assert.AreEqual("text/csv", response.Content.Headers.ContentType?.MediaType);
        var fileContent = await response.Content.ReadAsByteArrayAsync();
        CollectionAssert.AreEqual(new byte[] { 0xEF, 0xBB, 0xBF }, fileContent.Take(3).ToArray());
        StringAssert.Contains(Encoding.UTF8.GetString(fileContent), $"\r\n{ExportedBoreholeId};");
    }

    /// <summary>
    /// Creates an export request body of exactly <paramref name="size"/> bytes. It asks for one borehole id
    /// that does not exist and is padded with whitespace, so reaching the size costs no database work.
    /// </summary>
    private static ByteArrayContent CreateExportBody(int size)
    {
        const string start = "{\"ids\":[1]";
        const string end = "}";
        var json = start + new string(' ', size - start.Length - end.Length) + end;

        var content = new ByteArrayContent(Encoding.UTF8.GetBytes(json));
        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        return content;
    }

    private static HttpClient CreateAdminClient()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.SubjectIdHeader, "sub_admin");
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, PolicyNames.Admin);
        return client;
    }
}
