using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    private Mock<IAmazonS3> s3ClientMock;
    private PhotoCloudService photoCloudService;
    private PhotoController controller;

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
        s3ClientMock
            .Setup(x => x.PutObjectAsync(It.IsAny<PutObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new PutObjectResponse());
        s3ClientMock
            .Setup(x => x.GetObjectAsync(It.IsAny<GetObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new GetObjectResponse { ResponseStream = Stream.Null });

        photoCloudService = new PhotoCloudService(loggerMock.Object, s3ClientMock.Object, configuration, contextAccessorMock.Object, context);

        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsUserLackingPermissionsAsync(It.IsAny<int?>(), "sub_admin"))
            .ReturnsAsync(false);

        boreholeLockServiceMock
            .Setup(x => x.HasUserWorkgroupPermissionsAsync(It.IsAny<int?>(), "sub_admin"))
            .ReturnsAsync(true);

        var controllerLoggerMock = new Mock<ILogger<PhotoController>>();
        controller = new PhotoController(context, controllerLoggerMock.Object, boreholeLockServiceMock.Object, photoCloudService);
        controller.ControllerContext = GetControllerContextAdmin();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Mock.VerifyAll();
        await context.DisposeAsync();
    }

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

    [TestMethod]
    public async Task ExportSinglePhoto()
    {
        var photo = await CreatePhotoAsync();

        var response = await controller.Export([photo.Id]);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("image/tiff", fileResult.ContentType);
        Assert.AreEqual(photo.Name, fileResult.FileDownloadName);
    }

    [TestMethod]
    public async Task ExportMultiplePhotos()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        var response = await controller.Export([photo1.Id, photo2.Id]);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("application/zip", fileResult.ContentType);
        Assert.AreEqual("photos.zip", fileResult.FileDownloadName);
    }

    [TestMethod]
    public async Task ExportFromMultipleBoreholesNotAllowed()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        // Attach photo to a different borehole
        photo2.BoreholeId = context.Boreholes.Max(b => b.Id);
        await context.SaveChangesAsync();

        var response = await controller.Export([photo1.Id, photo2.Id]);
        ActionResultAssert.IsBadRequest(response);
    }

    private async Task<Photo> CreatePhotoAsync()
    {
        var fileName = $"{Guid.NewGuid()}_123.00-456.50_all.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var photo = new Photo
        {
            BoreholeId = minBoreholeId,
            Name = fileName,
            NameUuid = Guid.NewGuid().ToString() + ".tif",
            FileType = "image/tiff",
        };

        context.Add(photo);
        await context.SaveChangesAsync();
        return photo;
    }
}
