using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class PhotoController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IBoreholeLockService boreholeLockService;
    private readonly PhotoCloudService photoCloudService;

    public PhotoController(BdmsContext context, ILogger<PhotoController> logger, IBoreholeLockService boreholeLockService, PhotoCloudService photoCloudService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeLockService = boreholeLockService;
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
        if (file == null || file.Length == 0) return BadRequest("No file provided.");
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");
        if (file.Length > MaxFileSize) return BadRequest($"File size exceeds maximum file size of {MaxFileSize} bytes.");

        var depth = photoCloudService.ExtractDepthFromFileName(file.FileName);
        if (depth == null)
        {
            return BadRequest("No depth information found in file name.");
        }

        if (await boreholeLockService.IsUserLackingPermissionsAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false)) return Unauthorized();

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
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        if (!await boreholeLockService.HasUserWorkgroupPermissionsAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false)) return Unauthorized();

        // Get all photos that are linked to the borehole.
        return await context.Photos
            .Include(bp => bp.CreatedBy)
            .Where(bp => bp.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }
}
