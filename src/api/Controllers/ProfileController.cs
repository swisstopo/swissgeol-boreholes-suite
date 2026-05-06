using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ProfileController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ProfileCloudService profileCloudService;
    private readonly ILogger logger;
    private readonly IBoreholePermissionService boreholePermissionService;

    public ProfileController(BdmsContext context, ILogger<ProfileController> logger, ProfileCloudService profileCloudService, IBoreholePermissionService boreholePermissionService)
        : base()
    {
        this.logger = logger;
        this.profileCloudService = profileCloudService;
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Uploads a file to cloud storage and creates a <see cref="Profile"/> attached to the borehole.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to attach the uploaded profile to.</param>
    /// <returns>The newly created profile.</returns>
    [HttpPost("upload")]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> Upload([Required] IFormFile file, [Required, Range(1, int.MaxValue)] int boreholeId)
    {
        // Check if associated borehole is locked or user has permissions
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (file.Length > MaxFileSize) return BadRequest($"File size exceeds maximum file size of {MaxFileSize} bytes.");

        try
        {
            var profile = await profileCloudService.UploadProfileAsync(file.OpenReadStream(), file.FileName, null, false, file.ContentType, boreholeId).ConfigureAwait(false);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while uploading the profile.");
            return Problem("An error occurred while uploading the profile.");
        }
    }

    /// <summary>
    /// Downloads the file pointed to by the <see cref="Profile"/> with id <paramref name="profileId"/>.
    /// </summary>
    /// <param name="profileId">The <see cref="Profile.Id"/> of the profile to download.</param>
    /// <returns>The stream of the downloaded file.</returns>
    [HttpGet("download")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> Download([Range(1, int.MaxValue)] int profileId)
    {
        try
        {
            var profile = await context.Profiles
                .FirstOrDefaultAsync(p => p.Id == profileId)
                .ConfigureAwait(false);

            if (profile?.NameUuid == null) return NotFound($"Profile with id {profileId} not found.");

            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), profile.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            var fileBytes = await profileCloudService.GetObject(profile.NameUuid).ConfigureAwait(false);

            return File(fileBytes, "application/octet-stream", profile.Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while downloading the profile.");
            return Problem("An error occurred while downloading the profile.");
        }
    }

    /// <summary>
    /// Returns the data-extraction image info (size + total count) for the given profile and page index.
    /// </summary>
    /// <param name="profileId">The id of the profile.</param>
    /// <param name="index">The index of the page in the profile, with 1 as index for the first page.</param>
    /// <returns>The name and size of the selected image as well as the total image count for the profile.</returns>
    [HttpGet("getDataExtractionFileInfo")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> GetDataExtractionFileInfo([Required, Range(1, int.MaxValue)] int profileId, int index)
    {
        try
        {
            var profile = await context.Profiles
                .FirstOrDefaultAsync(p => p.Id == profileId)
                .ConfigureAwait(false);

            if (profile?.NameUuid == null) return NotFound($"Profile with id {profileId} not found.");

            // Check if user has permission to view the profile.
            if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), profile.BoreholeId).ConfigureAwait(false))
            {
                return Unauthorized("You are missing permissions to view the profile.");
            }

            var fileUuid = profile.NameUuid.Replace(".pdf", "", StringComparison.OrdinalIgnoreCase);
            var fileCount = await profileCloudService.CountDataExtractionObjects(fileUuid).ConfigureAwait(false);

            try
            {
                var dataExtractionImageInfo = await profileCloudService.GetDataExtractionImageInfo(fileUuid, index).ConfigureAwait(false);
                return Ok(new DataExtractionInfo(dataExtractionImageInfo.FileName, dataExtractionImageInfo.Width, dataExtractionImageInfo.Height, fileCount));
            }
            catch (Exception ex)
            {
                // No image found for the requested index, return an empty response with the file info.
                if (ex.Message.Contains("The specified key does not exist.", StringComparison.OrdinalIgnoreCase)
                    || ex.InnerException?.Message.Contains("The specified key does not exist.", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return Ok(new DataExtractionInfo(fileUuid, 0, 0, 0));
                }

                // Re-throw the exception so it gets handled by the outer exception handler.
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving the profile info.");
            return Problem(ex.Message);
        }
    }

    /// <summary>
    /// Downloads a data-extraction image from S3.
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
            var fileBytes = await profileCloudService.GetObject(decodedImageName).ConfigureAwait(false);
            return File(fileBytes, "image/png", decodedImageName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while loading the image");
            return Problem(ex.Message);
        }
    }

    /// <summary>
    /// Lists all <see cref="Profile"/>s attached to the given borehole.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="Profile"/>.</returns>
    [HttpGet("getAllForBorehole")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Profile>>> GetAllOfBorehole([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        if (boreholeId == 0) return BadRequest("No boreholeId provided.");

        return await context.Profiles
            .Include(p => p.CreatedBy)
            .Include(p => p.UpdatedBy)
            .Where(p => p.BoreholeId == boreholeId)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Deletes a <see cref="Profile"/> and removes its file from cloud storage.
    /// </summary>
    /// <param name="id">The id of the <see cref="Profile"/> to delete.</param>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> Delete([Required, Range(1, int.MaxValue)] int id)
    {
        try
        {
            var profile = await context.Profiles.SingleOrDefaultAsync(p => p.Id == id).ConfigureAwait(false);
            if (profile == null) return NotFound($"Profile with id {id} not found.");

            // Check if associated borehole is locked or user has permissions
            if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), profile.BoreholeId).ConfigureAwait(false)) return Unauthorized();

            // Attempt S3 delete first; if it succeeds, removing the DB row leaves nothing dangling.
            await profileCloudService.DeleteObject(profile.NameUuid).ConfigureAwait(false);
            context.Profiles.Remove(profile);
            await context.SaveChangesAsync().ConfigureAwait(false);

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting the profile.");
            return Problem("An error occurred while deleting the profile.");
        }
    }

    /// <summary>
    /// Updates the description and public flag of a <see cref="Profile"/>.
    /// </summary>
    /// <param name="id">The id of the <see cref="Profile"/> to update.</param>
    /// <param name="update">The updated <see cref="ProfileUpdate"/> body.</param>
    [HttpPut("{id:int}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> Update([Required, Range(1, int.MaxValue)] int id, [FromBody] ProfileUpdate update)
    {
        var profile = await context.Profiles
            .FirstOrDefaultAsync(p => p.Id == id)
            .ConfigureAwait(false);

        if (profile == null) return NotFound($"Profile with id {id} not found.");

        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), profile.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        profile.Description = update.Description;
        profile.Public = update.Public;

        context.Entry(profile).State = EntityState.Modified;
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
