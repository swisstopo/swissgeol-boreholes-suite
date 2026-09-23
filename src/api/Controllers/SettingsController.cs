using BDMS.Models;
using BDMS.Uploads.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v{version:apiVersion}/[controller]")]
public class SettingsController(IConfiguration configuration) : ControllerBase
{
    /// <summary>
    /// The upload limits the client is held to, reported from the same constants the endpoints
    /// enforce so that neither side keeps a copy that can drift from the other.
    /// </summary>
    private static readonly UploadSettings uploadSettings = new(FileSizeLimits.Standard, FileSizeLimits.Large, FileSizeLimits.MaxImportArchive, S3TusStore.ChunkSize);

    [HttpGet]
    [SwaggerResponse(StatusCodes.Status200OK, "The current settings of the application.")]
    public Settings? Get() => new(configuration.GetValue<string>("GoogleAnalytics:TrackingId"), configuration.GetRequiredSection("Auth").Get<AuthSettings>(), uploadSettings);
}
