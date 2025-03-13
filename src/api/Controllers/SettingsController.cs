using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v{version:apiVersion}/[controller]")]
public class SettingsController(IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    [SwaggerResponse(StatusCodes.Status200OK, "The current settings of the application.")]
    public Settings? Get() => new(configuration.GetValue<string>("GoogleAnalytics:TrackingId"), configuration.GetRequiredSection("Auth").Get<AuthSettings>());
}
