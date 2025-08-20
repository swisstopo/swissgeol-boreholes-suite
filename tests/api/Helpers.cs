using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using System.Text;
using File = System.IO.File;

namespace BDMS;

internal static class Helpers
{
    internal static ControllerContext GetControllerContextAdmin()
        => new() { HttpContext = new DefaultHttpContext().SetAdminClaimsPrincipal() };

    internal static HttpContext SetAdminClaimsPrincipal(this HttpContext httpContext)
        => httpContext.SetClaimsPrincipal("sub_admin", PolicyNames.Admin);

    internal static HttpContext SetClaimsPrincipal(this HttpContext httpContext, string subjectId, string role)
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.NameIdentifier, subjectId),
           new Claim(ClaimTypes.Role, role),
        };

        var userIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        httpContext.User = new ClaimsPrincipal(userIdentity);

        return httpContext;
    }

    /// <summary>
    /// Creates a mock of IBoreholePermissionService with standard setup for testing.
    /// </summary>
    /// <returns>A configured Mock of IBoreholePermissionService</returns>
    internal static Mock<IBoreholePermissionService> CreateBoreholePermissionServiceMock()
    {
        var boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanViewBoreholeAsync("sub_unauthorized", It.IsAny<int?>()))
            .ReturnsAsync(false);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync(It.IsAny<string?>(), It.IsAny<int?>()))
            .ReturnsAsync(true);
        boreholePermissionServiceMock
            .Setup(x => x.CanEditBoreholeAsync("sub_unauthorized", It.IsAny<int?>()))
            .ReturnsAsync(false);

        return boreholePermissionServiceMock;
    }

    /// <summary>
    /// Creates a FormFile from an existing file.
    /// </summary>
    internal static FormFile GetFormFileByExistingFile(string fileName)
    {
        var fileBytes = File.ReadAllBytes(fileName);
        var stream = new MemoryStream(fileBytes);
        return new FormFile(stream, 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    /// <summary>
    /// Creates a FormFile from a string.
    /// </summary>
    internal static FormFile GetFormFileByContent(string fileContent, string fileName)
    {
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        return new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    /// <summary>
    /// Creates a FormFile from a string starting with the magic number of a pdf file.
    /// </summary>
    internal static FormFile GetRandomPDFFile(string fileName)
    {
        byte[] pdfMagicNumber = { 37, 80, 68, 70 };
        byte[] fileBytes = pdfMagicNumber.Concat(Guid.NewGuid().ToByteArray()).ToArray();

        return new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    /// <summary>
    /// Creates a FormFile from a random string.
    /// </summary>
    internal static FormFile GetRandomFile(string fileName)
    {
        byte[] fileBytes = Guid.NewGuid().ToByteArray();

        return new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    /// <summary>
    /// Get the content type of a file based on its extension.
    /// </summary>
    private static string GetContentType(string fileName)
    {
        switch (Path.GetExtension(fileName).ToLowerInvariant())
        {
            case ".txt":
                return "text/plain";
            case ".pdf":
                return "application/pdf";
            case ".doc":
            case ".docx":
                return "application/msword";
            case ".xls":
            case ".xlsx":
                return "application/vnd.ms-excel";
            case ".ppt":
            case ".pptx":
                return "application/vnd.ms-powerpoint";
            case ".jpeg":
            case ".jpg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            default:
                return "application/octet-stream";
        }
    }

    /// <summary>
    /// Get the codelists for the provided codelist ids.
    /// </summary>
    internal static async Task<List<Codelist>> GetCodelists(BdmsContext context, List<int> codelistIds)
    {
        return await context.Codelists.Where(c => codelistIds.Contains(c.Id)).ToListAsync().ConfigureAwait(false);
    }

    internal static string ShouldBeNullMessage(this string propertyName)
        => $"{propertyName} should be null.";

    internal static string ShouldNotBeNullMessage(this string propertyName)
        => $"{propertyName} should not be null.";
}
