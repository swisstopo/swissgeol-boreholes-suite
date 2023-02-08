using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CantonController : Controller
{
    private readonly BdmsContext context;

    public CantonController(BdmsContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets all existing values (except null) for <see cref="Borehole.Canton"/>/>.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<string>> GetAllAsync()
    {
        return await context.Boreholes
            .Select(bho => bho.Canton)
            .Where(c => c != null)
            .Distinct()
            .ToListAsync<string>()
            .ConfigureAwait(false);
    }
}
