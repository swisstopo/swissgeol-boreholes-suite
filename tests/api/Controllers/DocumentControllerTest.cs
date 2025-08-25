using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.ObjectModel;
using System.Security.Claims;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class DocumentControllerTest
{
    private BdmsContext context;
    private User adminUser;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;
    private DocumentController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        adminUser = context.Users.FirstOrDefault(u => u.SubjectId == "sub_admin") ?? throw new InvalidOperationException("No User found in database.");

        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, adminUser.SubjectId) }));
        boreholePermissionServiceMock = CreateBoreholePermissionServiceMock();

        controller = new DocumentController(context, boreholePermissionServiceMock.Object);
        controller.ControllerContext = GetControllerContextAdmin();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Mock.VerifyAll();
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task Create()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var document = new Document
        {
            BoreholeId = minBoreholeId,
            Url = new Uri("https://example.com/document.pdf"),
            Description = "Test Document",
            Public = true,
        };

        var response = await controller.CreateAsync(document);
        var responseDocument = ActionResultAssert.IsOkObjectResult<Document>(response.Result);

        Assert.AreEqual(DateTime.UtcNow.Date, responseDocument.Created?.Date);
        Assert.AreEqual(adminUser.SubjectId, responseDocument.CreatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, responseDocument.CreatedById);
        Assert.AreEqual(DateTime.UtcNow.Date, responseDocument.Updated?.Date);
        Assert.AreEqual(adminUser.SubjectId, responseDocument.UpdatedBy.SubjectId);
        Assert.AreEqual(adminUser.Id, responseDocument.UpdatedById);
        Assert.AreEqual(new Uri("https://example.com/document.pdf"), responseDocument.Url);
        Assert.AreEqual("Test Document", responseDocument.Description);
        Assert.IsTrue(responseDocument.Public);
    }

    [TestMethod]
    public async Task CreateFailsForUserWithInsufficientPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var document = new Document
        {
            BoreholeId = minBoreholeId,
            Url = new Uri("https://example.com/document.pdf"),
            Description = "Test Document",
            Public = true,
        };

        var response = await controller.CreateAsync(document);
        ActionResultAssert.IsUnauthorized(response.Result);
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

        var response = await controller.GetAllOfBoreholeAsync(minBoreholeId);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task DeleteMultipleDocuments()
    {
        var document1 = await CreateDocumentAsync();
        var document2 = await CreateDocumentAsync();

        var response = await controller.DeleteAsync([document1.Id, document2.Id]);
        ActionResultAssert.IsOk(response);

        Assert.IsFalse(context.Documents.Any(p => p.Id == document1.Id));
        Assert.IsFalse(context.Documents.Any(p => p.Id == document2.Id));
    }

    [TestMethod]
    public async Task DeleteFromMultipleBoreholesNotAllowed()
    {
        var document1 = await CreateDocumentAsync();
        var document2 = await CreateDocumentAsync();

        // Attach document to a different borehole
        document2.BoreholeId = context.Boreholes.Max(b => b.Id);
        await context.SaveChangesAsync();

        var response = await controller.DeleteAsync([document1.Id, document2.Id]);
        ActionResultAssert.IsBadRequest(response);
    }

    [TestMethod]
    public async Task DeleteFailsWithoutPermissions()
    {
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_admin", It.IsAny<int?>()))
            .ReturnsAsync(false);

        var document = await CreateDocumentAsync();

        var response = await controller.DeleteAsync([document.Id]);
        ActionResultAssert.IsUnauthorized(response);
    }

    [TestMethod]
    public async Task UpdateMultipleDocuments()
    {
        var document1 = await CreateDocumentAsync();
        var document2 = await CreateDocumentAsync();

        var updateData = new Collection<DocumentUpdate>
        {
            new() { Id = document1.Id, Public = true, Url = new Uri("http://localhost/test.pdf"), Description = "test" },
            new() { Id = document2.Id, Public = true, Url = new Uri("http://localhost/") },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsOk(result);

        var updatedDocument1 = context.Documents.Single(p => p.Id == document1.Id);
        Assert.IsTrue(updatedDocument1.Public);
        Assert.AreEqual("test", updatedDocument1.Description);

        var updatedDocument2 = context.Documents.Single(p => p.Id == document2.Id);
        Assert.IsTrue(updatedDocument2.Public);
        Assert.AreEqual(new Uri("http://localhost/"), updatedDocument2.Url);
    }

    [TestMethod]
    public async Task UpdateFailsWhenDataIsEmpty()
    {
        var result = await controller.UpdateAsync([]);
        ActionResultAssert.IsBadRequest(result);
    }

    [TestMethod]
    public async Task UpdateFailsWhenDocumentDoesNotExist()
    {
        var updateData = new Collection<DocumentUpdate>
        {
            new() { Id = int.MaxValue, Public = true, Url = new Uri("http://localhost/") },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsNotFound(result);
    }

    [TestMethod]
    public async Task UpdateFailsWhenDocumentsFromMultipleBoreholes()
    {
        var document1 = await CreateDocumentAsync();
        var document2 = await CreateDocumentAsync();
        document2.BoreholeId = context.Boreholes.Max(b => b.Id);
        await context.SaveChangesAsync();

        var updateData = new Collection<DocumentUpdate>
        {
            new() { Id = document1.Id, Public = true, Url = new Uri("http://localhost/") },
            new() { Id = document2.Id, Public = true, Url = new Uri("http://localhost/") },
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

        var document = await CreateDocumentAsync();

        var updateData = new Collection<DocumentUpdate>
        {
            new() { Id = document.Id, Public = true, Url = new Uri("http://localhost/") },
        };

        var result = await controller.UpdateAsync(updateData);
        ActionResultAssert.IsUnauthorized(result);
    }

    private async Task<Document> CreateDocumentAsync()
    {
        var fileName = $"{Guid.NewGuid()}.pdf";
        var minBoreholeId = context.Boreholes.Min(b => b.Id);

        var document = new Document
        {
            BoreholeId = minBoreholeId,
            Url = new Uri($"http://localhost/{fileName}"),
        };

        await context.Documents.AddAsync(document);
        await context.UpdateChangeInformationAndSaveChangesAsync(controller.HttpContext);
        return document;
    }
}
