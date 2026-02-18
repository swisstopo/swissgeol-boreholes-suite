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
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

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

        var ProfileControllerLoggerMock = new Mock<ILogger<ProfileController>>(MockBehavior.Strict);
        ProfileControllerLoggerMock.Setup(l => l.Log(It.IsAny<LogLevel>(), It.IsAny<EventId>(), It.IsAny<It.IsAnyType>(), It.IsAny<Exception>(), (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()));
        controller = new ProfileController(context, ProfileControllerLoggerMock.Object, profileCloudService, boreholePermissionServiceMock.Object);
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

        // Get uploaded file from db
        var file = context.Files.Single(f => f.Name == fileName);

        // Download uploaded file
        response = await controller.Download(file.Id);

        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        // Get file
        Assert.AreEqual(DateTime.UtcNow.Date, file.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, file.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, file.CreatedById);

        var Profile = context.Profiles.Single(bf => bf.FileId == file.Id);
        Assert.AreEqual(DateTime.UtcNow.Date, Profile.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, Profile.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, Profile.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, Profile.Updated?.Date);
        Assert.AreEqual(adminUser.SubjectId, Profile.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, Profile.UpdatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, Profile.Attached?.Date);
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

        // Get all Profiles of borehole
        var ProfilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);
        Assert.IsNotNull(ProfilesOfBorehole.Value);

        // Get the uploaded borehole file in the response list
        var uploadedProfile = ProfilesOfBorehole.Value.FirstOrDefault(bf => bf.File.Name == fileName);
        Assert.IsNotNull(uploadedProfile);

        // Download uploaded file
        var response = await controller.Download(uploadedProfile.FileId);
        var fileContentResult = (FileContentResult)response;
        string contentResult = Encoding.ASCII.GetString(fileContentResult.FileContents);
        Assert.AreEqual(content, contentResult);

        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var unauthorizedResponse = await controller.Download(uploadedProfile.FileId);
        ActionResultAssert.IsUnauthorized(unauthorizedResponse);
    }

    [TestMethod]
    public async Task GetAllOfBorehole()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        // Get counts before upload
        var ProfilesBeforeUpload = context.Profiles.Where(bf => bf.BoreholeId == minBoreholeId).Count();

        var firstFileName = $"{Guid.NewGuid}.pdf";
        var secondFileName = $"{Guid.NewGuid}.pdf";
        var firstPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), firstFileName);
        var secondPdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), secondFileName);

        await controller.Upload(firstPdfFormFile, minBoreholeId);
        await controller.Upload(secondPdfFormFile, minBoreholeId);

        // Get Profiles of borehole from controller
        var ProfilesOfBorehole = await controller.GetAllOfBorehole(minBoreholeId);

        var firstProfile = ProfilesOfBorehole.Value?.FirstOrDefault(bf => bf.File.Name == firstFileName);
        var secondProfile = ProfilesOfBorehole.Value?.FirstOrDefault(bf => bf.File.Name == secondFileName);

        Assert.AreEqual(firstFileName, firstProfile.File.Name);
        Assert.AreEqual(adminUser.SubjectId, firstProfile.User.SubjectId);
        Assert.AreEqual(secondFileName, secondProfile.File.Name);
        Assert.AreEqual(adminUser.SubjectId, secondProfile.User.SubjectId);
        Assert.AreEqual(ProfilesBeforeUpload + 2, ProfilesOfBorehole.Value?.Count());
    }

    [TestMethod]
    public async Task GetAllForBoreholeReturnsUnauthorizedWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var response = await controller.GetAllOfBorehole(minBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithFileUsedByMultipleBoreholeShouldDetachAndDeleteFile()
    {
        // Get borehole Ids
        var firstBoreholeId = context.Boreholes.First().Id;
        var secondBoreholeId = context.Boreholes.Skip(1).First().Id;

        // Get counts before upload
        var filesCountBeforeUpload = context.Files.Count();
        var ProfilesCountBeforeUpload = context.Profiles.Count();
        var firstBoreholeProfilesBeforeUpload = context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count();
        var secondBoreholeProfilesBeforeUpload = context.Profiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), File1);

        // Upload file for both boreholes
        await controller.Upload(pdfFormFile, firstBoreholeId);
        await controller.Upload(pdfFormFile, secondBoreholeId);

        // Check counts after upload
        Assert.AreEqual(filesCountBeforeUpload + 2, context.Files.Count());
        Assert.AreEqual(ProfilesCountBeforeUpload + 2, context.Profiles.Count());
        Assert.AreEqual(firstBoreholeProfilesBeforeUpload + 1, context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());
        Assert.AreEqual(secondBoreholeProfilesBeforeUpload + 1, context.Profiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count());

        // Get the added files
        var firstBoreholeAddedFile = context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).OrderBy(bf => bf.FileId).Last().File;
        var secondBoreholeAddedFile = context.Profiles.Where(bf => bf.BoreholeId == secondBoreholeId).OrderBy(bf => bf.FileId).Last().File;

        // Clear context to ensure file has no info about its Profiles
        context.ChangeTracker.Clear();

        // Detach borehole file from first borehole
        await controller.DetachFromBorehole(firstBoreholeAddedFile.Profiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);

        // Check counts after detach
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(ProfilesCountBeforeUpload + 1, context.Profiles.Count());
        Assert.AreEqual(firstBoreholeProfilesBeforeUpload, context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());
        Assert.AreEqual(secondBoreholeProfilesBeforeUpload + 1, context.Profiles.Where(bf => bf.BoreholeId == secondBoreholeId).Count());

        // Ensure the file got deleted for the first borehole
        var exception = await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => profileCloudService.GetObject(firstBoreholeAddedFile.NameUuid!));
        Assert.AreEqual("The specified key does not exist.", exception.Message);

        // Ensure the file still exists for the second borehole
        await profileCloudService.GetObject(secondBoreholeAddedFile.NameUuid!);
    }

    [TestMethod]
    public async Task DetachFromBoreholeWithFileNotUsedByOtherBoreholeShouldDetachAndDeleteFile()
    {
        // Get borehole Ids
        var firstBoreholeId = context.Boreholes.First().Id;

        // Get counts before upload
        var filesCountBeforeUpload = context.Files.Count();
        var ProfilesCountBeforeUpload = context.Profiles.Count();
        var ProfilesBeforeUpload = context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), File1);

        // Upload file for boreholes
        await controller.Upload(pdfFormFile, firstBoreholeId);

        // Get latest file in db
        var latestFileInDb = context.Files.OrderBy(f => f.Id).Last();

        // Ensure file exists
        await profileCloudService.GetObject(latestFileInDb.NameUuid!);

        // Check counts after upload
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(ProfilesCountBeforeUpload + 1, context.Profiles.Count());
        Assert.AreEqual(ProfilesBeforeUpload + 1, context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());

        // Detach borehole file from first borehole
        await controller.DetachFromBorehole(latestFileInDb.Profiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);

        // Check counts after detach
        Assert.AreEqual(filesCountBeforeUpload, context.Files.Count());
        Assert.AreEqual(ProfilesCountBeforeUpload, context.Profiles.Count());
        Assert.AreEqual(ProfilesBeforeUpload, context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());

        // Ensure file does not exist
        await Assert.ThrowsExactlyAsync<AmazonS3Exception>(() => profileCloudService.GetObject(latestFileInDb.NameUuid!));
    }

    [TestMethod]
    public async Task UpdateWithValidProfile()
    {
        var borehole = new Borehole();
        context.Boreholes.Add(borehole);

        var file = new Models.File() { Name = $"{Guid.NewGuid}.pdf", NameUuid = $"{Guid.NewGuid}.pdf", Type = "pdf" };
        context.Files.Add(file);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var Profile = new Profile() { BoreholeId = borehole.Id, FileId = file.Id, Description = null, Public = null };
        context.Profiles.Add(Profile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Create update borehole file object
        var updateProfile = new ProfileUpdate() { Description = "Changed Description", Public = true };

        // Update borehole file
        var response = await controller.Update(updateProfile, borehole.Id, file.Id).ConfigureAwait(false);
        ActionResultAssert.IsOk(response);

        Assert.AreEqual(true, Profile.Public);
        Assert.AreEqual("Changed Description", Profile.Description);
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
    public async Task UploadWithMissingProfileId()
    {
        var content = Guid.NewGuid().ToString();
        var firstPdfFormFile = GetFormFileByContent(content, File1);

        await AssertIsBadRequestResponse(() => controller.Upload(firstPdfFormFile, 0));
    }

    [TestMethod]
    public async Task CanUploadIdenticalFileMultipleTimes()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var fileContent = "ANT-VII, REDASSOCIATION\r\nMONKEYBONES";

        // Upload same content using the same and different file names
        await AssertIsOkResponse(() => controller.Upload(GetFormFileByContent(fileContent, "IRATEWATCH.pdf"), minBoreholeId));
        await AssertIsOkResponse(() => controller.Upload(GetFormFileByContent(fileContent, "IRATEWATCH.pdf"), minBoreholeId));
        await AssertIsOkResponse(() => controller.Upload(GetFormFileByContent(fileContent, "PAINTEDSHADOW.png"), minBoreholeId));
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
    public async Task DetachFromBoreholeWithMissingProfileId() => await AssertIsBadRequestResponse(() => controller.DetachFromBorehole(0));

    [TestMethod]
    public async Task DetachFailsWithoutPermission()
    {
        // Get borehole Id
        var firstBoreholeId = context.Boreholes.First().Id;

        // Get counts before upload
        var filesCountBeforeUpload = context.Files.Count();
        var ProfilesCountBeforeUpload = context.Profiles.Count();
        var ProfilesBeforeUpload = context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count();

        // Create file to upload
        var pdfFormFile = GetFormFileByContent(Guid.NewGuid().ToString(), File1);

        // Upload file for boreholes
        await controller.Upload(pdfFormFile, firstBoreholeId);

        // Get latest file in db
        var latestFileInDb = context.Files.OrderBy(f => f.Id).Last();

        // Ensure file exists
        await profileCloudService.GetObject(latestFileInDb.NameUuid!);

        // Check counts after upload
        Assert.AreEqual(filesCountBeforeUpload + 1, context.Files.Count());
        Assert.AreEqual(ProfilesCountBeforeUpload + 1, context.Profiles.Count());
        Assert.AreEqual(ProfilesBeforeUpload + 1, context.Profiles.Where(bf => bf.BoreholeId == firstBoreholeId).Count());

        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        // Detach borehole file from first borehole
        var response = await controller.DetachFromBorehole(latestFileInDb.Profiles.First(bf => bf.BoreholeId == firstBoreholeId).FileId);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UpdateWithMissingBoreholeId() => await AssertIsBadRequestResponse(() => controller.Update(new ProfileUpdate(), 0, 1));

    [TestMethod]
    public async Task UpdateWithMissingProfileId() => await AssertIsBadRequestResponse(() => controller.Update(new ProfileUpdate(), 1, 0));

    [TestMethod]
    public async Task UpdateWithProfileNotFound()
    {
        var result = await controller.Update(new ProfileUpdate(), 1, 1);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task UpdateFailsWithoutPermission()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var borehole = new Borehole();
        await context.Boreholes.AddAsync(borehole);

        var file = new Models.File() { Name = $"{Guid.NewGuid}.pdf", NameUuid = $"{Guid.NewGuid}.pdf", Type = "pdf" };
        await context.Files.AddAsync(file);
        await context.SaveChangesAsync().ConfigureAwait(false);

        var Profile = new Profile() { BoreholeId = borehole.Id, FileId = file.Id, Description = null, Public = null };
        await context.Profiles.AddAsync(Profile);
        await context.SaveChangesAsync().ConfigureAwait(false);

        // Create update borehole file object
        var updateProfile = new ProfileUpdate() { Description = "Changed Description", Public = true };

        // Update borehole file
        var response = await controller.Update(updateProfile, borehole.Id, file.Id).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task GetDataExtractionInfo()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as Profile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

        var image1 = GetFormFileByExistingFile("labeling_attachment-1.png");
        await profileCloudService.UploadObject(image1.OpenReadStream(), $"dataextraction/{fileUuid}-1.png", image1.ContentType);
        var image2 = GetFormFileByExistingFile("labeling_attachment-2.png");
        await profileCloudService.UploadObject(image2.OpenReadStream(), $"dataextraction/{fileUuid}-2.png", image2.ContentType);
        var image3 = GetFormFileByExistingFile("labeling_attachment-3.png");
        await profileCloudService.UploadObject(image3.OpenReadStream(), $"dataextraction/{fileUuid}-3.png", image3.ContentType);

        // Test
        var result = await controller.GetDataExtractionFileInfo(file.FileId, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (result as OkObjectResult)?.Value as DataExtractionInfo;
        Assert.IsNotNull(dataExtractionInfo);
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
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as Profile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

        // Test
        var result = await controller.GetDataExtractionFileInfo(file.FileId, 1);
        ActionResultAssert.IsOk(result);
        var dataExtractionInfo = (result as OkObjectResult)?.Value as DataExtractionInfo;
        Assert.IsNotNull(dataExtractionInfo);
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
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as Profile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

        // Test
        controller.HttpContext.SetClaimsPrincipal("sub_viewer", PolicyNames.Viewer);
        var result = await controller.GetDataExtractionFileInfo(file.FileId, 1);
        ActionResultAssert.IsUnauthorized(result);
    }

    [TestMethod]
    public async Task GetDataExtractionInfoFileNotFound()
    {
        var result = await controller.Update(new ProfileUpdate(), 1, 1);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task GetDataExtractionImage()
    {
        // Test setup
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var labelingFile = GetFormFileByExistingFile("labeling_attachment.pdf");
        var uploadResult = await controller.Upload(labelingFile, minBoreholeId);
        ActionResultAssert.IsOk(uploadResult);
        var file = (uploadResult as OkObjectResult)?.Value as Profile;
        var fileUuid = file.File.NameUuid.Replace(".pdf", "");

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
            image1.CopyTo(ms);
            originalBytes = ms.ToArray();
        }

        CollectionAssert.AreEqual(originalBytes, fileContentResult.FileContents);

        // Reset data
        await profileCloudService.DeleteObject($"dataextraction/{fileUuid}-1.png");
    }

    private static async Task AssertIsBadRequestResponse(Func<Task<IActionResult>> func) =>
        ActionResultAssert.IsBadRequest(await func());

    private static async Task AssertIsOkResponse(Func<Task<IActionResult>> func) =>
        ActionResultAssert.IsOk(await func());
}
