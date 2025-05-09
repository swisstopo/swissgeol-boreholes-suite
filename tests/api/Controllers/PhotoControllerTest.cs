﻿using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
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
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
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
        s3ClientMock
            .Setup(x => x.DeleteObjectsAsync(It.IsAny<DeleteObjectsRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new DeleteObjectsResponse());

        photoCloudService = new PhotoCloudService(loggerMock.Object, s3ClientMock.Object, configuration, contextAccessorMock.Object, context);

        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(true);

        var controllerLoggerMock = new Mock<ILogger<PhotoController>>();
        controller = new PhotoController(context, controllerLoggerMock.Object, boreholePermissionServiceMock.Object, photoCloudService);
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
    public async Task UploadFailsForPhotoWithInvalidDepthInformation()
    {
        var fileName = $"{Guid.NewGuid()}_123.00_all.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.Upload(file, minBoreholeId);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task UploadFailsForPhotoWithoutDepthInformation()
    {
        var fileName = $"{Guid.NewGuid()}.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.Upload(file, minBoreholeId);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task UploadFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var fileName = $"{Guid.NewGuid()}_123.00-456.50_all.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.Upload(file, minBoreholeId);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task GetAllOfBorehole()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var response = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(response.Value);
    }

    [TestMethod]
    public async Task GetAllFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        IConvertToActionResult response = await controller.GetAllOfBorehole(minBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Convert());
    }

    [TestMethod]
    public async Task GetImage()
    {
        var photo = await CreatePhotoAsync();
        photo.FileType = "image/png";
        await context.SaveChangesAsync();

        var response = await controller.GetImage(photo.Id);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("image/png", fileResult.ContentType);
    }

    [TestMethod]
    [DeploymentItem("TestData/image.tif")]
    public async Task GetImageConvertsTiffToJpeg()
    {
        var tiffContent = System.IO.File.ReadAllBytes("image.tif");
        s3ClientMock
            .Setup(x => x.GetObjectAsync(It.IsAny<GetObjectRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GetObjectResponse
            {
                ResponseStream = new MemoryStream(tiffContent),
            });

        var photo = await CreatePhotoAsync();
        Assert.AreEqual("image/tiff", photo.FileType);

        var response = await controller.GetImage(photo.Id);
        Assert.IsInstanceOfType<FileResult>(response);

        var fileResult = (FileResult)response;
        Assert.AreEqual("image/jpeg", fileResult.ContentType);
    }

    [TestMethod]
    public async Task GetImageFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var response = await controller.GetImage(photo.Id);
        ActionResultAssert.IsUnauthorized(response);
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

    [TestMethod]
    public async Task ExportFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var response = await controller.Export([photo.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task DeleteMultiplePhotos()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        var response = await controller.Delete([photo1.Id, photo2.Id]);
        ActionResultAssert.IsOk(response);

        Assert.IsFalse(context.Photos.Any(p => p.Id == photo1.Id));
        Assert.IsFalse(context.Photos.Any(p => p.Id == photo2.Id));
    }

    [TestMethod]
    public async Task DeleteFromMultipleBoreholesNotAllowed()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        // Attach photo to a different borehole
        photo2.BoreholeId = context.Boreholes.Max(b => b.Id);
        await context.SaveChangesAsync();

        var response = await controller.Delete([photo1.Id, photo2.Id]);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task DeleteFailsForLockedBorehole()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var response = await controller.Delete([photo.Id]);
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
