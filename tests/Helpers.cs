using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    /// Extends the provided <see cref="IQueryable"/> of type <see cref="Borehole"/> with all includes.
    /// </summary>
    /// <param name="query">The <see cref="IQueryable"/> of type <see cref="Borehole"/> to be extended.</param>
    /// <returns>The extended <see cref="IQueryable"/> of type <see cref="Borehole"/> with all includes.</returns>
    internal static IQueryable<Borehole> GetBoreholesWithIncludes(IQueryable<Borehole> query)
    {
        return query
            .Include(b => b.BoreholeFiles).ThenInclude(bf => bf.File)
            .Include(b => b.Files)
            .Include(b => b.Workflows)
            .Include(b => b.Workgroup)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerColorCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerDebrisCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainAngularityCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainShapeCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerOrganicComponentCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerUscs3Codes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.ColorCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.DebrisCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.GrainAngularityCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.GrainShapeCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.OrganicComponentCodelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.Uscs3Codelists)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.ChronostratigraphyLayers)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithostratigraphyLayers)
            .Include(b => b.Completions).ThenInclude(c => c.Casings).ThenInclude(c => c.CasingElements)
            .Include(b => b.Completions).ThenInclude(c => c.Instrumentations)
            .Include(b => b.Completions).ThenInclude(c => c.Backfills)
            .Include(b => b.Observations)
            .Include(b => b.Sections).ThenInclude(s => s.SectionElements)
            .Include(b => b.BoreholeGeometry)
            .Include(b => b.BoreholeCodelists)
            .Include(b => b.CreatedBy)
            .Include(b => b.UpdatedBy)
            .Include(b => b.LockedBy)
            .Include(b => b.Type);
    }

    /// <summary>
    /// Extends the provided <see cref="IQueryable"/> of type <see cref="Layer"/> with all includes.
    /// </summary>
    /// <param name="query">The <see cref="IQueryable"/> of type <see cref="Layer"/> to be extended.</param>
    /// <returns>The extended <see cref="IQueryable"/> of type <see cref="Layer"/> query with all includes.</returns>
    internal static IQueryable<Layer> GetLayersWithIncludes(IQueryable<Layer> query)
    {
        return query
            .Include(l => l.DescriptionQuality)
            .Include(l => l.Lithology)
            .Include(l => l.Plasticity)
            .Include(l => l.Consistance)
            .Include(l => l.Alteration)
            .Include(l => l.Compactness)
            .Include(l => l.GrainSize1)
            .Include(l => l.GrainSize2)
            .Include(l => l.Cohesion)
            .Include(l => l.Uscs1)
            .Include(l => l.Uscs2)
            .Include(l => l.UscsDetermination)
            .Include(l => l.Lithostratigraphy)
            .Include(l => l.Humidity)
            .Include(l => l.Gradation)
            .Include(l => l.LithologyTopBedrock)
            .Include(l => l.LayerColorCodes)
            .Include(l => l.ColorCodelists)
            .Include(l => l.LayerGrainShapeCodes)
            .Include(l => l.GrainShapeCodelists)
            .Include(l => l.LayerDebrisCodes)
            .Include(l => l.DebrisCodelists)
            .Include(l => l.LayerGrainAngularityCodes)
            .Include(l => l.GrainAngularityCodelists)
            .Include(l => l.LayerUscs3Codes)
            .Include(l => l.Uscs3Codelists)
            .Include(l => l.LayerOrganicComponentCodes)
            .Include(l => l.OrganicComponentCodelists);
    }
}
