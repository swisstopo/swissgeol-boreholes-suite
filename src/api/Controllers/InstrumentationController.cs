using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class InstrumentationController : BoreholeControllerBase<Instrumentation>
{
    public InstrumentationController(BdmsContext context, ILogger<InstrumentationController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
    {
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Instrumentation"/>s, filtered by <paramref name="completionId"/>.
    /// </summary>
    /// <param name="completionId">The id of the completion containing the <see cref="Instrumentation"/> to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Instrumentation>>> GetAsync([FromQuery] int completionId)
    {
        var completion = await Context.Completions
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == completionId)
            .ConfigureAwait(false);

        if (completion == null)
        {
            return NotFound();
        }

        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), completion.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        return await GetInstrumentationsWithIncludes()
            .Where(x => x.CompletionId == completionId)
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Instrumentation"/> with the specified <paramref name="id"/>.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Instrumentation>> GetByIdAsync(int id)
    {
        var instrumentation = await GetInstrumentationsWithIncludes()
            .SingleOrDefaultAsync(i => i.Id == id)
            .ConfigureAwait(false);

        if (instrumentation == null)
        {
            return NotFound();
        }

        var boreholeId = await GetBoreholeId(instrumentation).ConfigureAwait(false);
        if (!await BoreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        return Ok(instrumentation);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Instrumentation>> CreateAsync(Instrumentation entity)
    {
        var instrumentation = ProcessInstrumentation(entity);

        return await base.CreateAsync(instrumentation).ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Instrumentation>> EditAsync(Instrumentation entity)
    {
        var instrumentation = ProcessInstrumentation(entity);

        return await base.EditAsync(instrumentation).ConfigureAwait(false);
    }

    /// <inheritdoc />
    [Authorize(Policy = PolicyNames.Viewer)]
    public override Task<IActionResult> DeleteAsync(int id)
        => base.DeleteAsync(id);

    private IQueryable<Instrumentation> GetInstrumentationsWithIncludes()
    {
        return Context.Instrumentations
            .Include(i => i.Status)
            .Include(i => i.Kind)
            .Include(i => i.Casing).ThenInclude(c => c.Completion)
            .AsNoTracking();
    }

    /// <inheritdoc />
    protected override async Task<int?> GetBoreholeId(Instrumentation entity)
    {
        if (entity == null) return default;

        var completion = await Context.Completions
            .AsNoTracking()
            .SingleOrDefaultAsync(i => i.Id == ((Instrumentation)(object)entity).CompletionId)
            .ConfigureAwait(false);
        return completion?.BoreholeId;
    }

    private Instrumentation ProcessInstrumentation(Instrumentation instrumentation)
    {
        if (instrumentation.IsOpenBorehole)
        {
            instrumentation.CasingId = null;
        }

        return instrumentation;
    }
}
