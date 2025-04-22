using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IO.Compression;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class PhotoController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IBoreholePermissionService boreholePermissionService;
    private readonly PhotoCloudService photoCloudService;

    public PhotoController(BdmsContext context, ILogger<PhotoController> logger, IBoreholePermissionService boreholePermissionService, PhotoCloudService photoCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholePermissionService = boreholePermissionService;
        this.photoCloudService = photoCloudService;
    }

    /// <summary>
    /// Uploads a photo to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The photo to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    /// <returns>The newly created photo.</returns>
    [HttpPost("upload")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> Upload(IFormFile file, [Range(1, int.MaxValue)] int boreholeId)
    {
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (file == null || file.Length == 0) return BadRequest("No file provided.");
        if (file.Length > MaxFileSize) return BadRequest($"File size exceeds maximum file size of {MaxFileSize} bytes.");

        var depth = photoCloudService.ExtractDepthFromFileName(file.FileName);
        if (depth == null)
        {
            return BadRequest("No depth information found in file name.");
        }

        try
        {
            var (fromDepth, toDepth) = depth.Value;
            var photo = await photoCloudService.UploadPhotoAndLinkToBoreholeAsync(file.OpenReadStream(), file.FileName, file.ContentType, boreholeId, fromDepth, toDepth).ConfigureAwait(false);
            return Ok(photo);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError(ex, "An error occurred while uploading the file.");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while uploading the file.");
            return Problem("An error occurred while uploading the file.");
        }
    }

    /// <summary>
    /// Get all <see cref="Photo"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="Photo"/>.</returns>
    [HttpGet("getAllForBorehole")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Photo>>> GetAllOfBorehole([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        // Get all photos that are linked to the borehole.
        return await context.Photos
            .Include(bp => bp.CreatedBy)
            .Where(bp => bp.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Exports the photos matching the <paramref name="photoIds"/>.
    /// </summary>
    /// <param name="photoIds">Ids of the photos to export.</param>
    /// <returns>The file content for a single photo or a zip file containing multiple photos.</returns>
    [HttpGet("export")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> Export([FromQuery][MaxLength(100)] IReadOnlyList<int> photoIds)
    {
        if (photoIds == null || photoIds.Count == 0) return BadRequest("The list of photoIds must not be empty.");

        var photos = await context.Photos
            .Where(p => photoIds.Contains(p.Id))
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);

        if (photos.Count == 0) return NotFound();

        var boreholeIds = photos.Select(p => p.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("Not all photos are attached to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (photos.Count == 1)
        {
            var photo = photos.Single();
            var fileBytes = await photoCloudService.GetObject(photo.NameUuid).ConfigureAwait(false);
            return File(fileBytes, photo.FileType, photo.Name);
        }

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            foreach (var photo in photos)
            {
                var fileBytes = await photoCloudService.GetObject(photo.NameUuid).ConfigureAwait(false);

                // Export the file with the original name and the UUID as a prefix to make it unique while preserving the original name
                var zipEntry = archive.CreateEntry($"{photo.NameUuid}_{photo.Name}", CompressionLevel.Fastest);
                using var zipEntryStream = zipEntry.Open();
                await zipEntryStream.WriteAsync(fileBytes.AsMemory(0, fileBytes.Length)).ConfigureAwait(false);
            }
        }

        return File(memoryStream.ToArray(), "application/zip", "photos.zip");
    }

    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> Delete([FromQuery][MaxLength(100)] IReadOnlyList<int> photoIds)
    {
        if (photoIds == null || photoIds.Count == 0) return BadRequest("The list of photoIds must not be empty.");

        var photos = await context.Photos
            .Where(p => photoIds.Contains(p.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (photos.Count == 0) return NotFound();

        var boreholeIds = photos.Select(p => p.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("Not all photos are attached to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false))
        {
            return BadRequest("The borehole is locked by another user or you are missing permissions.");
        }

        await photoCloudService.DeleteObjects(photos.Select(p => p.NameUuid)).ConfigureAwait(false);

        context.RemoveRange(photos);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
