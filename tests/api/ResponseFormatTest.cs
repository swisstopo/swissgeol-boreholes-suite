using System.Net;
using System.Net.Http.Headers;
using System.Text;

namespace BDMS;

/// <summary>
/// Sends requests through the whole API pipeline, because the JSON formatting and the response
/// compression are configured in <c>Program.cs</c> and only show on the wire.
/// </summary>
[TestClass]
public class ResponseFormatTest
{
    private const string SubAdmin = "sub_admin";

    private static BdmsWebApplicationFactory factory;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext) => factory = new BdmsWebApplicationFactory();

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    [TestMethod]
    public async Task FilterResponseIsNotIndented()
    {
        using var client = factory.CreateClient();
        using var request = CreateFilterRequest();

        using var response = await client.SendAsync(request);

        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.IsFalse(body.Contains('\n', StringComparison.Ordinal), "The JSON response contains line breaks.");
    }

    [TestMethod]
    [DataRow("br")]
    [DataRow("gzip")]
    public async Task FilterResponseIsCompressedWhenRequested(string encoding)
    {
        using var client = factory.CreateClient();
        using var request = CreateFilterRequest();
        request.Headers.AcceptEncoding.Add(new StringWithQualityHeaderValue(encoding));

        using var response = await client.SendAsync(request);

        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        CollectionAssert.AreEqual(new[] { encoding }, response.Content.Headers.ContentEncoding.ToList());
    }

    private static HttpRequestMessage CreateFilterRequest()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v2/borehole/filter")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };
        request.Headers.Add(TestAuthHandler.SubjectIdHeader, SubAdmin);
        return request;
    }
}
