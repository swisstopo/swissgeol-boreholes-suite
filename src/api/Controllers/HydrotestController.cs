using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class HydrotestController : BdmsControllerBase<Hydrotest>
{
    public HydrotestController(BdmsContext context, ILogger<Hydrotest> logger, IBoreholeLockService boreholeLockService)
        : base(context, logger, boreholeLockService)
    {
    }

    /// <summary>
    /// Asynchronously gets all hydrotest records optionally filtered by <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the borehole referenced in the observations to get.</param>
    /// <returns>An IEnumerable of type <see cref="Hydrotest"/>.</returns>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Hydrotest>> GetAsync([FromQuery] int? boreholeId = null)
    {
        var hydrotestes = Context.Hydrotests
            .Include(w => w.Codelists)
            .Include(w => w.Reliability)
            .Include(f => f.Casing)
            .ThenInclude(c => c.Completion)
            .Include(w => w.HydrotestResults).ThenInclude(h => h.Parameter)
            .AsNoTracking();

        if (boreholeId != null)
        {
            hydrotestes = hydrotestes.Where(w => w.BoreholeId == boreholeId);
        }

        return await hydrotestes.ToListAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously creates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The hydrotest to create.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Hydrotest>> CreateAsync(Hydrotest entity) => await ProcessHydrotestAsync(entity).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously updates the <paramref name="entity"/> specified.
    /// </summary>
    /// <param name="entity">The hydrotest to update.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<ActionResult<Hydrotest>> EditAsync(Hydrotest entity) => await ProcessHydrotestAsync(entity).ConfigureAwait(false);

    /// <summary>
    /// Asynchronously deletes the hydrotest with the specified <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The id of the hydrotest to delete.</param>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public override async Task<IActionResult> DeleteAsync(int id)
    {
        var hydrotestToDelete = await Context.FindAsync(typeof(Hydrotest), id).ConfigureAwait(false);
        if (hydrotestToDelete == null)
        {
            return NotFound();
        }

        // Check if associated borehole is locked
        if (await BoreholeLockService.IsBoreholeLockedAsync(((Hydrotest)hydrotestToDelete).BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        Context.Remove(hydrotestToDelete);
        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok();
    }

    private async Task<ActionResult> ProcessHydrotestAsync(Hydrotest hydrotest)
    {
        // Check if associated borehole is locked
        if (await BoreholeLockService.IsBoreholeLockedAsync(hydrotest.BoreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (AreCodelistIdsPresent(hydrotest))
        {
            hydrotest.Codelists = await GetCodelists((List<int>)hydrotest.CodelistIds!).ConfigureAwait(false);

            if (!AreHydrotestCodelistsCompatible(hydrotest))
            {
                return BadRequest("You submitted codelists for evaluation method, flow direction, or hydrotest results that are not compatible with the provided hydrotest kind.");
            }
        }

        var hydrotestToEdit = await GetHydrotestToEdit(hydrotest.Id).ConfigureAwait(false);

        if (hydrotest.Id != 0)
        {
            if (hydrotestToEdit == null)
            {
                return NotFound();
            }

            UpdateHydrotest(hydrotest, hydrotestToEdit);
        }
        else
        {
            await Context.AddAsync(hydrotest).ConfigureAwait(false);
        }

        await Context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok(hydrotest);
    }

    private async Task<Hydrotest?> GetHydrotestToEdit(int id)
    {
        return await Context.Hydrotests
        .Include(h => h.Codelists)
        .Include(h => h.HydrotestResults)
        .SingleOrDefaultAsync(w => w.Id == id).ConfigureAwait(false);
    }

    private void UpdateHydrotest(Hydrotest source, Hydrotest target)
    {
        Context.Entry(target).CurrentValues.SetValues(source);
        target.Codelists = source.Codelists;
        target.HydrotestResults = source.HydrotestResults;
    }

    private async Task<List<Codelist>> GetCodelists(List<int> codelistIds)
    {
        return await Context.Codelists
                    .Where(c => codelistIds.Contains(c.Id))
                    .ToListAsync().ConfigureAwait(false);
    }

    private bool AreCodelistIdsPresent(Hydrotest hydrotest)
    {
        return hydrotest.CodelistIds?.Count > 0;
    }

    private bool AreHydrotestCodelistsCompatible(Hydrotest hydrotest)
    {
        // Get the Geolcodes associated with the TestKindIds.
        var hydrotestKindCodelistIds = hydrotest.Codelists!
            .Where(hc => hc.Schema == HydrogeologySchemas.HydrotestKindSchema)
            .Select(hc => hc.Id)
            .ToList();

        var testKindGeolCodes = Context.Codelists
            .Where(c => hydrotestKindCodelistIds.Contains(c.Id) && c.Geolcode.HasValue)
            .Select(c => c.Geolcode!.Value)
            .ToList();

        // If there are HydrotestResults, check if the ParameterIds in the results are compatible.
        if (hydrotest.HydrotestResults?.Count > 0 && testKindGeolCodes.Count > 0)
        {
            var compatibleParameterIds = GetCompatibleCodelistIds(testKindGeolCodes, HydrogeologySchemas.HydrotestResultParameterSchema, HydroCodeLookup.HydrotestResultParameterOptions);
            if (!hydrotest.HydrotestResults.All(r => compatibleParameterIds.Contains(r.ParameterId)))
            {
                return false;
            }
        }

        var compatibleCodelistIds = new List<int>();

        // If there are CodelistIds, find the compatible CodelistIds for the flow direction and evaluation method options.
        if (hydrotest.CodelistIds?.Count > 0 && testKindGeolCodes.Count > 0)
        {
            compatibleCodelistIds.AddRange(hydrotestKindCodelistIds);
            compatibleCodelistIds.AddRange(GetCompatibleCodelistIds(testKindGeolCodes, HydrogeologySchemas.FlowdirectionSchema, HydroCodeLookup.HydrotestFlowDirectionOptions));
            compatibleCodelistIds.AddRange(GetCompatibleCodelistIds(testKindGeolCodes, HydrogeologySchemas.EvaluationMethodSchema, HydroCodeLookup.HydrotestEvaluationMethodOptions));
        }

        // Return true if all CodelistIds are compatible, or there are no CodelistIds.
        return hydrotest.CodelistIds?.All(c => compatibleCodelistIds.Contains(c)) ?? true;
    }

    private List<int> GetCompatibleCodelistIds(List<int> testKindGeolCodes, string schema, Dictionary<int, List<int>> optionsLookup)
    {
        // Get the list of Geolcodes from the optionsLookup based on the testKindGeolCode and find the compatible CodelistIds.
        var compatibleGeolCodes = new List<int>();
        testKindGeolCodes.ForEach(t =>
        {
            if (optionsLookup.TryGetValue(t, out List<int>? geolcodes))
            {
                compatibleGeolCodes.AddRange(Context.Codelists
                    .Where(c => c.Schema == schema && c.Geolcode != null && geolcodes.Contains(c.Geolcode.Value))
                    .Select(c => c.Id)
                    .ToList());
            }
        });

        if (compatibleGeolCodes.Count > 0)
        {
            return compatibleGeolCodes.Distinct().ToList();
        }
        else
        {
            return new List<int>();
        }
    }

    /// <inheritdoc />
    protected override Task<int?> GetBoreholeId(Hydrotest entity)
    {
        if (entity == null) return Task.FromResult<int?>(default);

        return Task.FromResult<int?>(entity.BoreholeId);
    }
}
