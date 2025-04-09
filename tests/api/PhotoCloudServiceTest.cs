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
    private PhotoCloudService photoCloudService;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var loggerMock = new Mock<ILogger<PhotoCloudService>>();

        var s3Client = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        photoCloudService = new PhotoCloudService(loggerMock.Object, s3Client, configuration, contextAccessorMock.Object, context);
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
