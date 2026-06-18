using BDMS.Models;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;

namespace BDMS.Services;

[TestClass]
public class FileOcrServiceTest
{
    private BdmsContext context = null!;
    private Profile profile = null!;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholeId = context.Boreholes.Min(b => b.Id);
        profile = new Profile
        {
            BoreholeId = boreholeId,
            Name = "test.pdf",
            NameUuid = $"{Guid.NewGuid()}.pdf",
            Type = "application/pdf",
            OcrStatus = OcrStatus.Created,
        };
        context.Profiles.Add(profile);
        context.SaveChanges();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    private (FileOcrService Service, Mock<HttpMessageHandler> Handler) CreateTestService(params HttpResponseMessage[] responses)
    {
        var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        var queue = new Queue<HttpResponseMessage>(responses);
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(() => queue.Dequeue());

        var httpClient = new HttpClient(handlerMock.Object) { BaseAddress = new Uri("https://ocr.test/") };
        var factoryMock = new Mock<IHttpClientFactory>();
        factoryMock.Setup(f => f.CreateClient("OcrApi")).Returns(httpClient);

        var service = new FileOcrService(context, factoryMock.Object, NullLogger<FileOcrService>.Instance);
        return (service, handlerMock);
    }

    private static HttpResponseMessage Ok(string json) =>
        new(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    [TestMethod]
    public async Task ProcessAsyncSuccessfulRunTransitionsToSuccess()
    {
        var (service, _) = CreateTestService(
            Ok("{}"),
            Ok("{\"has_finished\":false}"),
            Ok("{\"has_finished\":true,\"data\":{}}"));

        await service.ProcessAsync(profile.Id, pollDelay: TimeSpan.Zero);

        var reloaded = context.Profiles.Single(p => p.Id == profile.Id);
        Assert.AreEqual(OcrStatus.Success, reloaded.OcrStatus);
    }

    [TestMethod]
    public async Task ProcessAsyncOcrApiReturnsErrorTransitionsToError()
    {
        var (service, _) = CreateTestService(
            Ok("{}"),
            Ok("{\"has_finished\":true,\"error\":\"boom\"}"));

        await service.ProcessAsync(profile.Id, pollDelay: TimeSpan.Zero);

        var reloaded = context.Profiles.Single(p => p.Id == profile.Id);
        Assert.AreEqual(OcrStatus.Error, reloaded.OcrStatus);
    }

    [TestMethod]
    public async Task ProcessAsyncStartRequestFailsTransitionsToError()
    {
        var (service, _) = CreateTestService(new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("crash"),
        });

        await service.ProcessAsync(profile.Id, pollDelay: TimeSpan.Zero);

        var reloaded = context.Profiles.Single(p => p.Id == profile.Id);
        Assert.AreEqual(OcrStatus.Error, reloaded.OcrStatus);
    }

    [TestMethod]
    public async Task ProcessAsyncUnknownProfileIdReturnsWithoutCallingOcrApi()
    {
        var (service, handler) = CreateTestService();

        await service.ProcessAsync(int.MaxValue, pollDelay: TimeSpan.Zero);

        handler.Protected().Verify(
            "SendAsync",
            Times.Never(),
            ItExpr.IsAny<HttpRequestMessage>(),
            ItExpr.IsAny<CancellationToken>());
    }

    [TestMethod]
    public async Task ProcessAsyncAlreadyTerminalSkipsOcrApi()
    {
        profile.OcrStatus = OcrStatus.Success;
        await context.SaveChangesAsync();

        var (service, handler) = CreateTestService();

        await service.ProcessAsync(profile.Id, pollDelay: TimeSpan.Zero);

        handler.Protected().Verify(
            "SendAsync",
            Times.Never(),
            ItExpr.IsAny<HttpRequestMessage>(),
            ItExpr.IsAny<CancellationToken>());

        var reloaded = context.Profiles.Single(p => p.Id == profile.Id);
        Assert.AreEqual(OcrStatus.Success, reloaded.OcrStatus);
    }
}
