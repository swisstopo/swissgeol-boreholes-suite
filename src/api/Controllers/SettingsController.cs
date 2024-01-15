using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace BDMS.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v{version:apiVersion}/[controller]")]
public partial class SettingsController : ControllerBase
{
    private readonly IConfiguration configuration;

    public SettingsController(IConfiguration serverConfiguration)
    {
        configuration = serverConfiguration;
    }

    [HttpGet("Auth")]
    [SwaggerResponse(StatusCodes.Status200OK, "The current AuthSettings of the application.")]
    public AuthSettings? GetAuth()
        => configuration.GetRequiredSection("Auth").Get<AuthSettings>();
}
