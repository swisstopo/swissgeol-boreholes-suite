using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class PhotoControllerTest
{
    private BdmsContext context;
    private User adminUser;
    private PhotoCloudService photoCloudService;
    private PhotoController controller;

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

        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsUserLackingPermissionsAsync(It.IsAny<int?>(), "sub_admin"))
            .ReturnsAsync(false);

        var controllerLoggerMock = new Mock<ILogger<PhotoController>>();
        controller = new PhotoController(context, controllerLoggerMock.Object, boreholeLockServiceMock.Object, photoCloudService);
        controller.ControllerContext = GetControllerContextAdmin();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task Upload()
    {
        var fileName = $"{Guid.NewGuid()}_123.00-456.50_all.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        // Upload
        var response = await controller.Upload(file, minBoreholeId);
        ActionResultAssert.IsOk(response);

        // Get uploaded photo from db
        var photo = context.Photos.Single(f => f.Name == fileName);
        Assert.AreEqual(DateTime.UtcNow.Date, photo.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, photo.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, photo.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, photo.Updated?.Date);
        Assert.AreEqual(adminUser.SubjectId, photo.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, photo.UpdatedById);
        Assert.AreEqual(123, photo.FromDepth);
        Assert.AreEqual(456.5, photo.ToDepth);
    }
}
