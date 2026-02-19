using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeFileController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly BoreholeFileCloudService boreholeFileCloudService;
    private readonly ILogger logger;
    private readonly IBoreholePermissionService boreholePermissionService;

    public BoreholeFileController(BdmsContext context, ILogger<BoreholeFileController> logger, BoreholeFileCloudService boreholeFileCloudService, IBoreholePermissionService boreholePermissionService)
        : base()
    {
        this.logger = logger;
        this.boreholeFileCloudService = boreholeFileCloudService;
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Uploads a file to the cloud storage and links it to the borehole.
    /// </summary>
    /// <param name="file">The file to upload and link to the <see cref="Borehole"/>.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to link the uploaded <paramref name="file"/> to.</param>
    /// <returns>The newly created borehole file.</returns>
    [HttpPost("upload")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> Upload(IFormFile file, [Range(1, int.MaxValue)] int boreholeId)
    {
        if (file == null || file.Length == 0) return BadRequest("No file provided.");
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        // Check if associated borehole is locked or user has permissions
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (file.Length > MaxFileSize) return BadRequest($"File size exceeds maximum file size of {MaxFileSize} bytes.");

        try
        {
            var boreholeFile = await boreholeFileCloudService.UploadFileAndLinkToBoreholeAsync(file.OpenReadStream(), file.FileName, null, false, file.ContentType, boreholeId).ConfigureAwait(false);
            return Ok(boreholeFile);
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
    /// Downloads a file from the cloud storage.
    /// </summary>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to download.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> Download([Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        try
        {
            var boreholeFile = await context.BoreholeFiles
                .Include(f => f.File)
                .FirstOrDefaultAsync(f => f.FileId == boreholeFileId)
                .ConfigureAwait(false);

            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeFile.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            if (boreholeFile?.File?.NameUuid == null) return NotFound($"File with id {boreholeFileId} not found.");

            var fileBytes = await boreholeFileCloudService.GetObject(boreholeFile.File.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", boreholeFile.File.Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while downloading the file.");
            return Problem("An error occurred while downloading the file.");
        }
    }

    /// <summary>
    /// Get the borehole file information for the data extraction file with the provided boreholeFileId and page index.
    /// </summary>
    /// <param name="boreholeFileId">The id of the borehole file.</param>
    /// <param name="index">The index of the page in the borehole file, with 1 as index for the first page.</param>
    /// <returns>The name and size of the selected image as well as the total image count for the borehole file.</returns>
    [HttpGet("getDataExtractionFileInfo")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDataExtractionFileInfo([Required, Range(1, int.MaxValue)] int boreholeFileId, int index)
    {
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        try
        {
            var boreholeFile = await context.BoreholeFiles
                .Include(f => f.File)
                .FirstOrDefaultAsync(f => f.FileId == boreholeFileId)
                .ConfigureAwait(false);

            // Check if user has permission to view the borehole file.
            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeFile.BoreholeId).ConfigureAwait(false))
            {
                return Unauthorized("You are missing permissions to view the borehole file.");
            }

            if (boreholeFile.File?.NameUuid == null) return NotFound($"File with id {boreholeFileId} not found.");

            var fileUuid = boreholeFile.File.NameUuid.Replace(".pdf", "", StringComparison.OrdinalIgnoreCase);
            var fileCount = await boreholeFileCloudService.CountDataExtractionObjects(fileUuid).ConfigureAwait(false);

            try
            {
                var dataExtractionImageInfo = await boreholeFileCloudService.GetDataExtractionImageInfo(fileUuid, index).ConfigureAwait(false);
                return Ok(new DataExtractionInfo(dataExtractionImageInfo.FileName, dataExtractionImageInfo.Width, dataExtractionImageInfo.Height, fileCount));
            }
            catch (Exception ex)
            {
                // No image found for the requested index, return an empty response with the file info.
                if (ex.Message.Contains("The specified key does not exist.", StringComparison.OrdinalIgnoreCase))
                {
                    return Ok(new DataExtractionInfo(fileUuid, 0, 0, 0));
                }

                // Re-throw the exception so it gets handled by the outer exception handler.
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving the file info.");
            return Problem(ex.Message);
        }
    }

    /// <summary>
    /// Downloads an image from the data extraction folder in the cloud storage.
    /// </summary>
    /// <param name="imageName">The image name.</param>
    /// <returns>The stream of the image.</returns>
    [HttpGet("dataextraction/{*imageName}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDataExtractionImage(string imageName)
    {
        try
        {
            var decodedImageName = Uri.UnescapeDataString($"dataextraction/{imageName}");
            var fileBytes = await boreholeFileCloudService.GetObject(decodedImageName).ConfigureAwait(false);
            return File(fileBytes, "image/png", decodedImageName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while loading the image");
            return Problem(ex.Message);
        }
    }

    /// <summary>
    /// Get all <see cref="BoreholeFile"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="BoreholeFile"/>.</returns>
    [HttpGet("getAllForBorehole")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<BoreholeFile>>> GetAllOfBorehole([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        // Get all borehole files that are linked to the borehole.
        return await context.BoreholeFiles
            .Include(bf => bf.User)
            .Include(bf => bf.File)
            .Where(bf => bf.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Detaches a <see cref="BoreholeFile"/> from the <see cref="Borehole"/> and deletes the <see cref="Models.File"/>.
    /// </summary>
    /// <param name="boreholeFileId">The <see cref="BoreholeFile.FileId"/> of the file to detach from the borehole.</param>
    [HttpPost("detachFile")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DetachFromBorehole([Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        try
        {
            // Get the file and its borehole files from the database.
            var boreholeFile = await context.BoreholeFiles.Include(f => f.File).SingleOrDefaultAsync(f => f.FileId == boreholeFileId).ConfigureAwait(false);

            if (boreholeFile == null) return NotFound($"Borehole file for the provided {nameof(boreholeFileId)} not found.");

            // Check if associated borehole is locked or user has permissions
            if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeFile.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var fileId = boreholeFile.File.Id;

            // Remove the requested borehole file from the database.
            context.BoreholeFiles.Remove(boreholeFile);
            await context.SaveChangesAsync().ConfigureAwait(false);

            // Delete the file from the cloud storage and the database.
            var file = await context.Files.SingleOrDefaultAsync(f => f.Id == fileId).ConfigureAwait(false);
            if (file?.NameUuid != null)
            {
                await boreholeFileCloudService.DeleteObject(file.NameUuid).ConfigureAwait(false);
                context.Files.Remove(file);
                await context.SaveChangesAsync().ConfigureAwait(false);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while detaching the file.");
            return Problem("An error occurred while detaching the file.");
        }
    }

    /// <summary>
    /// Update the <see cref="BoreholeFile"/> with the provided <paramref name="boreholeId"/> and <paramref name="boreholeFileId"/>.
    /// </summary>
    /// <param name="boreholeFileUpdate">The updated <see cref="BoreholeFileUpdate"/> object containing the new <see cref="BoreholeFile"/> properties.</param>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/> to which the <see cref="BoreholeFile"/> is linked to.</param>
    /// <param name="boreholeFileId">The id of the <see cref="BoreholeFile"/> to update.</param>
    /// <remarks>
    /// Only the <see cref="BoreholeFile.Public"/> and <see cref="BoreholeFile.Description"/> properties can be updated.
    /// </remarks>
    [HttpPut("update")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> Update([FromBody] BoreholeFileUpdate boreholeFileUpdate, [Required, Range(1, int.MaxValue)] int boreholeId, [Range(1, int.MaxValue)] int boreholeFileId)
    {
        if (boreholeFileUpdate == null) return BadRequest("No boreholeFileUpdate provided.");
        if (boreholeId == 0) return BadRequest("No boreholeId provided.");
        if (boreholeFileId == 0) return BadRequest("No boreholeFileId provided.");

        var existingBoreholeFile = await context.BoreholeFiles
            .FirstOrDefaultAsync(bf => bf.FileId == boreholeFileId && bf.BoreholeId == boreholeId)
            .ConfigureAwait(false);

        if (existingBoreholeFile == null) return NotFound("Borehole file not found.");

        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        existingBoreholeFile.Public = boreholeFileUpdate.Public;
        existingBoreholeFile.Description = boreholeFileUpdate.Description;

        context.Entry(existingBoreholeFile).State = EntityState.Modified;
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
