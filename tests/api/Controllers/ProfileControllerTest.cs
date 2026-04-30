using Amazon.S3;
using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using System.Text;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class ProfileControllerTest
{
    private const string SubAdmin = "sub_admin";
    private const string LabelingAttachmentPdf = "labeling_attachment.pdf";
    private BdmsContext context;
    private ProfileController controller;
    private ProfileCloudService profileCloudService;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private User adminUser;

    private static string File1 => "file_1.pdf";

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == SubAdmin) ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));

        var s3ClientMock = new AmazonS3Client(
            configuration["S3:ACCESS_KEY"],
            configuration["S3:SECRET_KEY"],
            new AmazonS3Config
            {
                ServiceURL = configuration["S3:ENDPOINT"],
                ForcePathStyle = true,
                UseHttp = configuration["S3:SECURE"] == "0",
            });

        var profileCloudServiceLoggerMock = new Mock<ILogger<ProfileCloudService>>(MockBehavior.Strict);
        profileCloudServiceLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        profileCloudService = new ProfileCloudService(context, configuration, profileCloudServiceLoggerMock.Object, contextAccessorMock.Object, s3ClientMock);

        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_viewer", It.IsAny<int?>()))
            .ReturnsAsync(false);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_viewer", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var profileControllerLoggerMock = new Mock<ILogger<ProfileController>>(MockBehavior.Strict);
        profileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        controller = new ProfileController(context, profileControllerLoggerMock.Object, profileCloudService, boreholePermissionServiceMock.Object);
        controller.ControllerContext = GetControllerContextAdmin();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task UploadAndDownload()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload
        var response = await controller.Upload(firstPdfFormFile, minBoreholeId);
        ActionResultAssert.IsOk(response);

        // Get uploaded profile from db
        var profile = context.Profiles.Single(p => p.Name == fileName);

        // Download uploaded file
        response = await controller.Download(profile.Id);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        // Verify audit columns
        Assert.AreEqual(DateTime.UtcNow.Date, profile.Created?.Date);
        Assert.AreEqual(adminUser.Id, profile.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, profile.Updated?.Date);
        Assert.AreEqual(adminUser.Id, profile.UpdatedById);
    }

    [TestMethod]
    public async Task DownloadFileShouldReturnDownloadedFileIfHasPermissions()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, fileName);

        // Upload
        await controller.Upload(firstPdfFormFile, minBoreholeId);

        // Get all profiles of borehole
        var profilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(profilesOfBorehole.Value);

        // Get the uploaded profile in the response list
        var uploadedProfile = profilesOfBorehole.Value.First(p => p.Name == fileName);

        // Download uploaded file
        var response = await controller.Download(uploadedProfile.Id);
        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(SubAdmin, It.IsAny<int?>()))
            .ReturnsAsync(false);

        var unauthorizedResponse = await controller.Download(uploadedProfile.Id);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse);
    }

    [TestMethod]
    public async Task GetAllOfBorehole()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        // Get counts before upload
        var profilesBeforeUpload = context.Profiles.Where(p => p.BoreholeId == minBoreholeId).Count();

        var firstFileName = $"{Guid.NewGuid()}.pdf";
        var secondFileName = $"{Guid.NewGuid()}.pdf";
        var firstPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), firstFileName);
        var secondPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), secondFileName);

        await controller.Upload(firstPdfFormFile, minBoreholeId);
        await controller.Upload(secondPdfFormFile, minBoreholeId);

        // Get profiles of borehole from controller
        var profilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);

        var firstProfile = profilesOfBorehole.Value!.First(p => p.Name == firstFileName);
        var secondProfile = profilesOfBorehole.Value!.First(p => p.Name == secondFileName);

        Assert.AreEqual(firstFileName, firstProfile.Name);
        Assert.AreEqual(adminUser.SubjectId, firstProfile.CreatedBy.SubjectId);
        Assert.AreEqual(secondFileName, secondProfile.Name);
        Assert.AreEqual(adminUser.SubjectId, secondProfile.CreatedBy.SubjectId);
        Assert.AreEqual(profilesBeforeUpload + 2, profilesOfBorehole.Value?.Count());
    }

    [TestMethod]
    public async Task GetAllForBoreholeReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(SubAdmin, It.IsAny<int?>()))
            .ReturnsAsync(false);

        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var response = await controller.GetAllOfBorehole(minBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task DeleteProfileShouldRemoveProfileAndDeleteFile()
    {
        var firstBoreholeId = context.Boreholes.First().Id;

        // Get counts before upload
        var profilesCountBeforeUpload = context.Profiles.Count();
        var profilesForBoreholeBeforeUpload = context.Profiles.Where(p => p.BoreholeId == firstBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), File1);

        // Upload file for borehole
        await controller.Upload(pdfFormFile, firstBoreholeId);

        // Get latest profile in db
        var latestProfileInDb = context.Profiles.OrderBy(p => p.Id).Last();

        // Ensure file exists in cloud storage
        await profileCloudService.GetObject(latestProfileInDb.NameUuid);

        // Check counts after upload
        Assert.AreEqual(profilesCountBeforeUpload + 1, context.Profiles.Count());
        Assert.AreEqual(profilesForBoreholeBeforeUpload + 1, context.Profiles.Where(p => p.BoreholeId == firstBoreholeId).Count());

        // Delete profile
        await controller.Delete(latestProfileInDb.Id);

        // Check counts after delete
        Assert.AreEqual(profilesCountBeforeUpload, context.Profiles.Count());
        Assert.AreEqual(profilesForBoreholeBeforeUpload, context.Profiles.Where(p => p.BoreholeId == firstBoreholeId).Count());

        // Ensure file does not exist in cloud storage
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => profileCloudService.GetObject(latestProfileInDb.NameUuid));
    }

    [TestMethod]
    public async Task UpdateWithValidProfile()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var profile = new Profile() { BoreholeId = borehole.Id, Name = $"{Guid.NewGuid()}.pdf", NameUuid = $"{Guid.NewGuid()}.pdf", Type = "pdf" };
        context.Profiles.Add(profile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Create update profile object
        var updateProfile = new ProfileUpdate() { Description = "Changed Description", Public = true };

        // Update profile
        var response = await controller.Update(profile.Id, updateProfile).ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        Assert.AreEqual(true, profile.Public);
        Assert.AreEqual("Changed Description", profile.Description);
    }

    [TestMethod]
    public async Task UploadWithFileToLargeShouldThrowError()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        long targetSizeInBytes = 210 * 1024 * 1024; // 210MB
        byte[] content = new byte[targetSizeInBytes];
        var stream = new MemoryStream(content);

        var formFile = new FormFile(stream, 0, stream.Length, "file", "dummy.txt");

        await AssertIsBadRequestResponse(() => controller.Upload(formFile, minBoreholeId));
    }

    [TestMethod]
    public async Task UploadWithMissingBoreholeId()
    {
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, File1);

        await AssertIsBadRequestResponse(() => controller.Upload(firstPdfFormFile, 0));
    }

    [TestMethod]
    public async Task UploadWithMissingFile() => await AssertIsBadRequestResponse(() => controller.Upload(null, 1));

    [TestMethod]
    public async Task DownloadWithMissingProfileId() => await AssertIsBadRequestResponse(() => controller.Download(0));

    [TestMethod]
    public async Task GetAllOfBoreholeWithMissingBoreholeId()
    {
        var result = await controller.GetAllOfBorehole(0);
        ActionResultAssert.IsBadRequest(result.Result);
    }

    [TestMethod]
    public async Task DeleteWithMissingProfileId() => await AssertIsBadRequestResponse(() => controller.Delete(0));

    [TestMethod]
    public async Task DeleteFailsWithoutPermission()
    {
        var firstBoreholeId = context.Boreholes.First().Id;

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), File1);

        // Upload file for borehole
        await controller.Upload(pdfFormFile, firstBoreholeId);

        // Get latest profile in db
        var latestProfileInDb = context.Profiles.OrderBy(p => p.Id).Last();

        // Ensure file exists in cloud storage
        await profileCloudService.GetObject(latestProfileInDb.NameUuid);

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(SubAdmin, It.IsAny<int?>()))
            .ReturnsAsync(false);

        // Attempt to delete profile
        var response = await controller.Delete(latestProfileInDb.Id);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UpdateWithMissingProfileId() => await AssertIsBadRequestResponse(() => controller.Update(0, new ProfileUpdate()));

    [TestMethod]
    public async Task UpdateWithProfileNotFound()
    {
        var result = await controller.Update(int.MaxValue, new ProfileUpdate());
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task UpdateFailsWithoutPermission()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(SubAdmin, It.IsAny<int?>()))
            .ReturnsAsync(false);

        var borehole = new Borehole();
        await context.Boreholes.AddAsync(borehole);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var profile = new Profile() { BoreholeId = borehole.Id, Name = $"{Guid.NewGuid()}.pdf", NameUuid = $"{Guid.NewGuid()}.pdf", Type = "pdf" };
        await context.Profiles.AddAsync(profile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Create update profile object
        var updateProfile = new ProfileUpdate() { Description = "Changed Description", Public = true };

        // Update profile
        var response = await controller.Update(profile.Id, updateProfile).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task GetDataExtractionInfo()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile(LabelingAttachmentPdf);
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var profile = (Profile)((OkObjectResult)uploadResult).Value!;
        var fileUuid = profile.NameUuid.Replace(".pdf", "");

        var image1 = GetFormFileByExistingFile("labeling_attachment-1.png");
        await profileCloudService.UploadObject(image1.OpenReadStream(), $"dataextraction/{fileUuid}-1.png", image1.ContentType);
        var image2 = GetFormFileByExistingFile("labeling_attachment-2.png");
        await profileCloudService.UploadObject(image2.OpenReadStream(), $"dataextraction/{fileUuid}-2.png", image2.ContentType);
        var image3 = GetFormFileByExistingFile("labeling_attachment-3.png");
        await profileCloudService.UploadObject(image3.OpenReadStream(), $"dataextraction/{fileUuid}-3.png", image3.ContentType);

        // Test
        var result = await controller.GetDataExtractionFileInfo(profile.Id, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (DataExtractionInfo)((OkObjectResult)result).Value!;
        Assert.AreEqual($"{fileUuid}-1.png", dataExtractionInfo.FileName);
        Assert.AreEqual(1786, dataExtractionInfo.Width);
        Assert.AreEqual(2526, dataExtractionInfo.Height);
        Assert.AreEqual(3, dataExtractionInfo.Count);

        // Reset data
        await profileCloudService.DeleteObject($"dataextraction/{fileUuid}-1.png");
        await profileCloudService.DeleteObject($"dataextraction/{fileUuid}-2.png");
        await profileCloudService.DeleteObject($"dataextraction/{fileUuid}-3.png");
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileNoPngFound()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile(LabelingAttachmentPdf);
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var profile = (Profile)((OkObjectResult)uploadResult).Value!;
        var fileUuid = profile.NameUuid.Replace(".pdf", "");

        // Test
        var result = await controller.GetDataExtractionFileInfo(profile.Id, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (DataExtractionInfo)((OkObjectResult)result).Value!;
        Assert.AreEqual(fileUuid, dataExtractionInfo.FileName);
        Assert.AreEqual(0, dataExtractionInfo.Width);
        Assert.AreEqual(0, dataExtractionInfo.Height);
        Assert.AreEqual(0, dataExtractionInfo.Count);
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileWithUnauthorizedUser()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile(LabelingAttachmentPdf);
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var profile = (Profile)((OkObjectResult)uploadResult).Value!;

        // Test
        controller.HttpContext.SetClaimsPrincipal("sub_viewer", PolicyNames.Viewer);
        var result = await controller.GetDataExtractionFileInfo(profile.Id, 1);
        ActionResultAssert.IsUnauthorized(result);
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileNotFound()
    {
        var result = await controller.Update(int.MaxValue, new ProfileUpdate());
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task GetDataExtractionImage()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile(LabelingAttachmentPdf);
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var profile = (Profile)((OkObjectResult)uploadResult).Value!;
        var fileUuid = profile.NameUuid.Replace(".pdf", "");

        var image1 = GetFormFileByExistingFile("labeling_attachment-1.png");
        await profileCloudService.UploadObject(image1.OpenReadStream(), $"dataextraction/{fileUuid}-1.png", image1.ContentType);

        // Test
        var response = await controller.GetDataExtractionImage($"{fileUuid}-1.png");
        Assert.IsNotNull(response);
        var fileContentResult = (FileContentResult)response;
        Assert.AreEqual("image/png", fileContentResult.ContentType);

        byte[] originalBytes = new byte[image1.Length];
        using (var ms = new MemoryStream())
        {
            await image1.CopyToAsync(ms);
            originalBytes = ms.ToArray();
        }

        CollectionAssert.AreEqual(originalBytes, fileContentResult.FileContents);

        // Reset data
        await profileCloudService.DeleteObject($"dataextraction/{fileUuid}-1.png");
    }

    private static async Task AssertIsBadRequestResponse(Func<Task<IActionResult>> func) =>
        ActionResultAssert.IsBadRequest(await func());
}
