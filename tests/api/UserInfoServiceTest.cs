using BDMS.Authentication;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using System.Net;
using System.Security.Claims;
using System.Text.Json;

namespace BDMS;

[TestClass]
public class UserInfoServiceTest
{
    private const string Authority = "http://localhost:4011";
    private const string UserInfoEndpointUrl = "http://localhost:4011/connect/userinfo";
    private const string DiscoveryUrl = "http://localhost:4011/.well-known/openid-configuration";

    private MemoryCache cache;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<UserInfoService>> loggerMock;
    private Mock<HttpMessageHandler> httpMessageHandlerMock;
    private IConfiguration configuration;

    [TestInitialize]
    public void TestInitialize()
    {
        cache = new MemoryCache(new MemoryCacheOptions());
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<UserInfoService>>(MockBehavior.Strict);
        httpMessageHandlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);

        configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { { "Auth:Authority", Authority } })
            .Build();

        var httpClient = new HttpClient(httpMessageHandlerMock.Object);
        httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);
    }

    [TestCleanup]
    public void TestCleanup()
    {
        cache.Dispose();
        httpMessageHandlerMock.Verify();
    }

    [TestMethod]
    public async Task ShouldReturnCachedClaims_WhenCacheHit()
    {
        var expectedClaims = new List<Claim> { new Claim(ClaimTypes.Email, "cached@example.com") };
        cache.Set("userinfo:sub123", expectedClaims.AsEnumerable(), TimeSpan.FromMinutes(60));

        var service = CreateService();

        var result = await service.GetUserInfoClaimsAsync("sub123", "token123");

        Assert.IsNotNull(result);
        Assert.AreEqual(1, result.Count());
        Assert.AreEqual("cached@example.com", result.First().Value);
    }

    [TestMethod]
    public async Task ShouldFetchAndCacheClaims_WhenCacheMiss()
    {
        SetupDiscoveryResponse();
        SetupUserInfoResponse(new { email = "test@example.com", given_name = "John", family_name = "Doe" });

        var service = CreateService();

        var result = await service.GetUserInfoClaimsAsync("sub456", "token456");

        Assert.IsNotNull(result);
        Assert.AreEqual(3, result.Count());

        // Verify the result is now cached.
        Assert.IsTrue(cache.TryGetValue("userinfo:sub456", out IEnumerable<Claim>? cachedClaims));
        Assert.AreEqual(3, cachedClaims!.Count());
    }

    [TestMethod]
    public async Task ShouldParseAllClaims_FromUserInfoResponse()
    {
        SetupDiscoveryResponse();
        SetupUserInfoResponse(new { email = "jane@example.com", given_name = "Jane", family_name = "Smith" });

        var service = CreateService();

        var result = (await service.GetUserInfoClaimsAsync("sub789", "token789"))!.ToList();

        Assert.AreEqual(3, result.Count);
        Assert.AreEqual(ClaimTypes.Email, result[0].Type);
        Assert.AreEqual("jane@example.com", result[0].Value);
        Assert.AreEqual(ClaimTypes.GivenName, result[1].Type);
        Assert.AreEqual("Jane", result[1].Value);
        Assert.AreEqual(ClaimTypes.Surname, result[2].Type);
        Assert.AreEqual("Smith", result[2].Value);
    }

    [TestMethod]
    public async Task ShouldHandlePartialResponse()
    {
        SetupDiscoveryResponse();
        SetupUserInfoResponse(new { email = "only@example.com" });

        var service = CreateService();

        var result = (await service.GetUserInfoClaimsAsync("sub_partial", "token_partial"))!.ToList();

        Assert.AreEqual(1, result.Count);
        Assert.AreEqual(ClaimTypes.Email, result[0].Type);
        Assert.AreEqual("only@example.com", result[0].Value);
    }

    [TestMethod]
    public async Task ShouldReturnNull_WhenDiscoveryFails()
    {
        httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == DiscoveryUrl), ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("Connection refused"))
            .Verifiable();

        loggerMock.Setup(l => l.Log(
            LogLevel.Warning,
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception?>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

        var service = CreateService();

        var result = await service.GetUserInfoClaimsAsync("sub_fail", "token_fail");

        Assert.IsNull(result);
    }

    [TestMethod]
    public async Task ShouldReturnNull_WhenUserInfoEndpointFails()
    {
        SetupDiscoveryResponse();

        httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == UserInfoEndpointUrl), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.InternalServerError))
            .Verifiable();

        loggerMock.Setup(l => l.Log(
            LogLevel.Warning,
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception?>(),
            It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

        var service = CreateService();

        var result = await service.GetUserInfoClaimsAsync("sub_500", "token_500");

        Assert.IsNull(result);
    }

    [TestMethod]
    public async Task ShouldCacheDiscoveryEndpoint()
    {
        SetupDiscoveryResponse();

        // Setup UserInfo to respond twice (for two different subs).
        httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == UserInfoEndpointUrl), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(new { email = "user@example.com" }), System.Text.Encoding.UTF8, "application/json"),
            })
            .Verifiable();

        var service = CreateService();

        await service.GetUserInfoClaimsAsync("sub_a", "token_a");
        await service.GetUserInfoClaimsAsync("sub_b", "token_b");

        // Discovery should have been called exactly once (cached on the service instance).
        httpMessageHandlerMock.Protected()
            .Verify("SendAsync", Times.Once(), ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == DiscoveryUrl), ItExpr.IsAny<CancellationToken>());

        // UserInfo should have been called twice (once per sub, since each has a different cache key).
        httpMessageHandlerMock.Protected()
            .Verify("SendAsync", Times.Exactly(2), ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == UserInfoEndpointUrl), ItExpr.IsAny<CancellationToken>());
    }

    private UserInfoService CreateService()
    {
        return new UserInfoService(cache, httpClientFactoryMock.Object, configuration, loggerMock.Object);
    }

    private void SetupDiscoveryResponse()
    {
        var discoveryJson = JsonSerializer.Serialize(new { userinfo_endpoint = UserInfoEndpointUrl });
        httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == DiscoveryUrl), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(discoveryJson, System.Text.Encoding.UTF8, "application/json"),
            })
            .Verifiable();
    }

    private void SetupUserInfoResponse(object responseBody)
    {
        var json = JsonSerializer.Serialize(responseBody);
        httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.Is<HttpRequestMessage>(r => r.RequestUri!.ToString() == UserInfoEndpointUrl), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json"),
            })
            .Verifiable();
    }
}
