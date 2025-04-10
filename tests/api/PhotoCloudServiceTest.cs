using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;

namespace BDMS;

[TestClass]
public class PhotoCloudServiceTest
{
    private BdmsContext context;
    private User adminUser;
    private Mock<IAmazonS3> s3ClientMock;
    private PhotoCloudService photoCloudService;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string> { { "S3:PHOTOS_BUCKET_NAME", "CANNONFLEA-PHOTOS" } })
            .Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var loggerMock = new Mock<ILogger<PhotoCloudService>>();

        s3ClientMock = new Mock<IAmazonS3>(MockBehavior.Strict);

        photoCloudService = new PhotoCloudService(loggerMock.Object, s3ClientMock.Object, configuration, contextAccessorMock.Object, context);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public void ExtractDepthFromFileNameValid()
    {
        var fileName = $"{Guid.NewGuid()}_123.00-456.50_all.tif";

        var depth = photoCloudService.ExtractDepthFromFileName(fileName);
        Assert.AreEqual((123.0, 456.5), depth);
    }

    [TestMethod]
    public void ExtractDepthFromFileNameOneValueMissing()
    {
        var fileName = $"{Guid.NewGuid()}_123.00_all.tif";

        var depth = photoCloudService.ExtractDepthFromFileName(fileName);
        Assert.AreEqual(null, depth);
    }

    [TestMethod]
    public void ExtractDepthFromFileNameDepthMissing()
    {
        var fileName = $"{Guid.NewGuid()}.tif";

        var depth = photoCloudService.ExtractDepthFromFileName(fileName);
        Assert.AreEqual(null, depth);
    }
}
