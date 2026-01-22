using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.ObjectModel;
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

        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();

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
        var response = await controller.UploadAsync(file, minBoreholeId);
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

        var response = await controller.UploadAsync(file, minBoreholeId);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task UploadFailsForPhotoWithoutDepthInformation()
    {
        var fileName = $"{Guid.NewGuid()}.tif";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var file = GetFormFileByContent(content, fileName);

        var response = await controller.UploadAsync(file, minBoreholeId);
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

        var response = await controller.UploadAsync(file, minBoreholeId);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task GetAllOfBorehole()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var response = await controller.GetAllOfBoreholeAsync(minBoreholeId);
        Assert.IsNotNull(response.Value);
    }

    [TestMethod]
    public async Task GetAllFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        IConvertToActionResult response = await controller.GetAllOfBoreholeAsync(minBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Convert());
    }

    [TestMethod]
    public async Task GetImage()
    {
        var photo = await CreatePhotoAsync();
        photo.FileType = "image/png";
        await context.SaveChangesAsync();

        var response = await controller.GetImageAsync(photo.Id);
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

        var response = await controller.GetImageAsync(photo.Id);
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

        var response = await controller.GetImageAsync(photo.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task ExportSinglePhoto()
    {
        var photo = await CreatePhotoAsync();

        var response = await controller.ExportAsync([photo.Id]);
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

        var response = await controller.ExportAsync([photo1.Id, photo2.Id]);
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

        var response = await controller.ExportAsync([photo1.Id, photo2.Id]);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task ExportFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var response = await controller.ExportAsync([photo.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task DeleteMultiplePhotos()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        var response = await controller.DeleteAsync([photo1.Id, photo2.Id]);
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

        var response = await controller.DeleteAsync([photo1.Id, photo2.Id]);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task DeleteFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var response = await controller.DeleteAsync([photo.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UpdateMultiplePhotosPublicState()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();

        var updateData = new Collection<PhotoUpdate>
        {
            new() { Id = photo1.Id, Public = true },
            new() { Id = photo2.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsOk(result);

        var updatedPhoto1 = context.Photos.Single(p => p.Id == photo1.Id);
        Assert.IsTrue(updatedPhoto1.Public);
        var updatedPhoto2 = context.Photos.Single(p => p.Id == photo2.Id);
        Assert.IsTrue(updatedPhoto2.Public);
    }

    [TestMethod]
    public async Task UpdateFailsWhenDataIsEmpty()
    {
        var result = await controller.UpdateAsync([]);
        ActionResultAssert.IsBadRequest(result);
    }

    [TestMethod]
    public async Task UpdateFailsWhenPhotoDoesNotExist()
    {
        var updateData = new Collection<PhotoUpdate>
        {
            new() { Id = int.MaxValue, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task UpdateFailsWhenPhotosFromMultipleBoreholes()
    {
        var photo1 = await CreatePhotoAsync();
        var photo2 = await CreatePhotoAsync();
        photo2.BoreholeId = context.Boreholes.Max(b => b.Id);
        await context.SaveChangesAsync();

        var updateData = new Collection<PhotoUpdate>
        {
            new() { Id = photo1.Id, Public = true },
            new() { Id = photo2.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsBadRequest(result);
    }

    [TestMethod]
    public async Task UpdateFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var photo = await CreatePhotoAsync();

        var updateData = new Collection<PhotoUpdate>
        {
            new() { Id = photo.Id, Public = true },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsUnauthorized(result);
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
