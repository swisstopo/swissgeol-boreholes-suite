using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class InstrumentationController : BdmsControllerBase<Instrumentation>
{
    private readonly BdmsContext context;

    public InstrumentationController(BdmsContext context, ILogger<Instrumentation> logger)
        : base(context, logger)
    {
        this.context = context;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Instrumentation"/>s, optionally filtered by <paramref name="completionId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Instrumentation"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Instrumentation>>> GetAsync([FromQuery] int? completionId = null)
    {
        var instrumentations = context.Instrumentations.AsNoTracking();
        if (completionId != null)
        {
            instrumentations = instrumentations.Where(i => i.CompletionId == completionId);
        }

        return await instrumentations.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Instrumentation"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Instrumentation>> GetByIdAsync(int id)
    {
        var instrumentation = await context.Instrumentations
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (instrumentation == null)
        {
            return NotFound();
        }

        return Ok(instrumentation);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> CreateAsync(Instrumentation entity)
        => base.CreateAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> EditAsync(Instrumentation entity)
        => base.EditAsync(entity);

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);
}
