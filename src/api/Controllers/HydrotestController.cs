using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class HydrotestController : BoreholeControllerBase<Hydrotest>
{
    public HydrotestController(BdmsContext context, ILogger<HydrotestController> logger, IBoreholePermissionService boreholePermissionService)
        : base(context, logger, boreholePermissionService)
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
        var user = await Context.UsersWithIncludes
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        var hydrotests = Context.Hydrotests
            .Include(h => h.KindCodelists)
            .Include(h => h.FlowDirectionCodelists)
            .Include(h => h.EvaluationMethodCodelists)
            .Include(h => h.Reliability)
            .Include(h => h.Casing)
            .ThenInclude(c => c.Completion)
            .Include(h => h.HydrotestResults).ThenInclude(h => h.Parameter)
            .AsNoTracking();

        if (!user.IsAdmin)
        {
            var allowedWorkgroupIds = user.WorkgroupRoles.Select(w => w.WorkgroupId).ToList();
            hydrotests = hydrotests
                .Where(h => Context.Boreholes
                .Where(b => b.WorkgroupId.HasValue)
                .Any(b => b.Id == h.BoreholeId && allowedWorkgroupIds
                .Contains(b.WorkgroupId!.Value)));
        }

        if (boreholeId != null)
        {
            hydrotests = hydrotests.Where(w => w.BoreholeId == boreholeId);
        }

        return await hydrotests.ToListAsync().ConfigureAwait(false);
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
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), ((Hydrotest)hydrotestToDelete).BoreholeId).ConfigureAwait(false))
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
        if (!await BoreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), hydrotest.BoreholeId).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (AreCodelistIdsPresent(hydrotest))
        {
            hydrotest.KindCodelists = await GetCodelists((List<int>)hydrotest.KindCodelistIds!).ConfigureAwait(false);
            hydrotest.FlowDirectionCodelists = await GetCodelists((List<int>)hydrotest.FlowDirectionCodelistIds!).ConfigureAwait(false);
            hydrotest.EvaluationMethodCodelists = await GetCodelists((List<int>)hydrotest.EvaluationMethodCodelistIds!).ConfigureAwait(false);

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
        .Include(h => h.KindCodelists)
        .Include(h => h.FlowDirectionCodelists)
        .Include(h => h.EvaluationMethodCodelists)
        .Include(h => h.HydrotestResults)
        .SingleOrDefaultAsync(w => w.Id == id).ConfigureAwait(false);
    }

    private void UpdateHydrotest(Hydrotest source, Hydrotest target)
    {
        Context.Entry(target).CurrentValues.SetValues(source);
        target.KindCodelists = source.KindCodelists;
        target.FlowDirectionCodelists = source.FlowDirectionCodelists;
        target.EvaluationMethodCodelists = source.EvaluationMethodCodelists;
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
        return hydrotest.KindCodelistIds?.Count > 0 || hydrotest.FlowDirectionCodelistIds?.Count > 0 || hydrotest.EvaluationMethodCodelistIds?.Count > 0;
    }

    private bool AreHydrotestCodelistsCompatible(Hydrotest hydrotest)
    {
        var hydrotestCodelists = Context.Codelists
        .Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema
                || c.Schema == HydrogeologySchemas.FlowdirectionSchema
                || c.Schema == HydrogeologySchemas.EvaluationMethodSchema).ToList();

        // Get the Geolcodes associated with the TestKindIds.
        var testKindGeolCodes = hydrotestCodelists
            .Where(c => hydrotest.KindCodelists!.Select(hc => hc.Id)
            .Contains(c.Id) && c.Geolcode.HasValue)
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

        var kindCompatible = true;
        var flowDirectionsCompatible = true;
        var evaluationMethodsCompatible = true;

        var kindCodelistIds = hydrotestCodelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Select(c => c.Id).ToList();
        kindCompatible = hydrotest.KindCodelistIds?.All(c => kindCodelistIds.Contains(c)) ?? true;

        if (testKindGeolCodes.Count > 0)
        {
            // If there are FlowDirectionCodelistIds, check their compatibility with the test kind.
            if (hydrotest.FlowDirectionCodelistIds.Count > 0)
            {
                var compatibleFlowDirectionCodelistIds = GetCompatibleCodelistIds(testKindGeolCodes, HydrogeologySchemas.FlowdirectionSchema, HydroCodeLookup.HydrotestFlowDirectionOptions)
                    .Union(hydrotestCodelists.Where(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema).Select(c => c.Id))
                    .ToList();

                flowDirectionsCompatible = hydrotest.FlowDirectionCodelistIds?.All(compatibleFlowDirectionCodelistIds.Contains) ?? true;
            }

            // If there are EvaluationMethodCodelistIds, check their compatibility with the test kind.
            if (hydrotest.EvaluationMethodCodelistIds.Count > 0)
            {
                var compatibleEvaluationMethodCodelistIds = GetCompatibleCodelistIds(testKindGeolCodes, HydrogeologySchemas.EvaluationMethodSchema, HydroCodeLookup.HydrotestEvaluationMethodOptions)
                    .Union(hydrotestCodelists.Where(c => c.Schema == HydrogeologySchemas.EvaluationMethodSchema).Select(c => c.Id))
                    .ToList();
                evaluationMethodsCompatible = hydrotest.EvaluationMethodCodelistIds?.All(compatibleEvaluationMethodCodelistIds.Contains) ?? true;
            }
        }

        // Return true if all CodelistIds are compatible, or there are no FlowDirectionCodelists or EvaluationMethodCodelists.
        return kindCompatible && flowDirectionsCompatible && evaluationMethodsCompatible;
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
