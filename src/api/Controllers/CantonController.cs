using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

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
    public async Task<ICollection<string?>> GetAllAsync()
    {
        var cantons = context.Boreholes
            .Select(bho => bho.Canton)
            .Where(c => c != null)
            .Distinct()
            .AsQueryable();

        return await cantons.ToArrayAsync().ConfigureAwait(false);
    }
}
