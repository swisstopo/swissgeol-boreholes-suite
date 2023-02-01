using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class FaciesDescriptionController : BdmsControllerBase<FaciesDescription>
{
    private readonly BdmsContext context;

    public FaciesDescriptionController(BdmsContext context, ILogger<FaciesDescription> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="FaciesDescription"/>s, optionally filtered by <paramref name="stratigraphyId"/>.
    /// </summary>
    /// <param name="stratigraphyId">The id of the stratigraphy referenced in the facies descriptions to get.</param>
    [HttpGet]
    public async Task<IEnumerable<FaciesDescription>> GetAsync([FromQuery] int? stratigraphyId = null)
    {
        var faciesDescriptions = context.FaciesDescriptions
            .Include(l => l.QtDescription)
            .AsNoTracking();

        if (stratigraphyId != null)
        {
            faciesDescriptions = faciesDescriptions.Where(l => l.StratigraphyId == stratigraphyId);
        }

        return await faciesDescriptions.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="FaciesDescription"/> with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the facies description to get.</param>
    [HttpGet("{id}")]
    public async Task<ActionResult<FaciesDescription>> GetByIdAsync(int id)
    {
        var faciesDescription = await context.FaciesDescriptions
            .Include(l => l.QtDescription)
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == id)
            .ConfigureAwait(false);

        if (faciesDescription == null)
        {
            return NotFound();
        }

        return Ok(faciesDescription);
    }
}
