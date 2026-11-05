using BDMS.Authentication;
using BDMS.Models;
using System.Net;
using System.Net.Http.Headers;
using System.Text;

namespace BDMS.Controllers;

/// <summary>
/// Sends export requests through a real Kestrel server. The in-memory test server ignores request body
/// size limits, so only Kestrel shows whether an oversized request is refused.
/// </summary>
[TestClass]
public class BoreholeExportEndpointTest
{
    private const string CsvExportPath = "/api/v2/boreholeexport/csv";
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
    public async Task CsvExportRefusesABodyOverTheLimitAsTooLarge()
    {
        using var client = CreateAdminClient();

        using var response = await client.PostAsync(CsvExportPath, CreateCsvExportBody(BoreholeExportRequest.MaxRequestBodySize + 1));

        Assert.AreEqual(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
    }

    [TestMethod]
    public async Task CsvExportAcceptsABodyAtTheLimit()
    {
        using var client = CreateAdminClient();

        using var response = await client.PostAsync(CsvExportPath, CreateCsvExportBody(BoreholeExportRequest.MaxRequestBodySize));

        // The requested borehole does not exist, so a body that passes the limit is answered with 404.
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode, await response.Content.ReadAsStringAsync());
    }

    /// <summary>
    /// Creates a CSV export request body of exactly <paramref name="size"/> bytes. It asks for one borehole id
    /// that does not exist and is padded with whitespace, so reaching the size costs no database work.
    /// </summary>
    private static ByteArrayContent CreateCsvExportBody(int size)
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
