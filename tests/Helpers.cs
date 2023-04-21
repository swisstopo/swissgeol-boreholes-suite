using BDMS.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace BDMS;

internal static class Helpers
{
    internal static ControllerContext GetControllerContextAdmin()
        => new() { HttpContext = new DefaultHttpContext().SetAdminClaimsPrincipal() };

    internal static HttpContext SetAdminClaimsPrincipal(this HttpContext httpContext)
        => httpContext.SetClaimsPrincipal("admin", PolicyNames.Admin);

    internal static HttpContext SetClaimsPrincipal(this HttpContext httpContext, string name, string role)
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.Name, name),
           new Claim(ClaimTypes.Role, role),
        };

        var userIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        httpContext.User = new ClaimsPrincipal(userIdentity);

        return httpContext;
    }

    internal static void ResetChangesInContext(this BdmsContext bdmsContext)
    {
        var changedEntries = bdmsContext.ChangeTracker.Entries()
            .Where(x => x.State != EntityState.Unchanged)
            .ToList();

        foreach (var entry in changedEntries)
        {
            switch (entry.State)
            {
                case EntityState.Modified:
                    entry.CurrentValues.SetValues(entry.OriginalValues);
                    entry.State = EntityState.Unchanged;
                    break;
                case EntityState.Added:
                    entry.State = EntityState.Detached;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Unchanged;
                    break;
            }
        }
    }

    // Create a FormFile from an existing file
    internal static FormFile GetFormFileByExistingFile(string fileName)
    {
        var fileBytes = File.ReadAllBytes(fileName);
        var stream = new MemoryStream(fileBytes);
        return new FormFile(stream, 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    // Create a FormFile from a provided content
    internal static FormFile GetFormFileByContent(string fileContent, string fileName)
    {
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        return new FormFile(new MemoryStream(fileBytes), 0, fileBytes.Length, null, fileName) { Headers = new HeaderDictionary(), ContentType = GetContentType(fileName) };
    }

    // Get the content type of a file
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
}
