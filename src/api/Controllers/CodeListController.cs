using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using System.Text;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class CodeListController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IConfiguration configuration;

    public CodeListController(BdmsContext context, IConfiguration configuration)
    {
        this.context = context;
        this.configuration = configuration;
    }

    /// <summary>
    /// Asynchronously gets the <see cref="Codelist"/>s, optionally filtered by <paramref name="schema"/>.
    /// </summary>
    /// <param name="schema">The schema of the codelists to get.</param>
    /// <param name="testKindIds">The hydrotest kinds used to filter the codelists to get.</param>
    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<Codelist>> GetAsync(string? schema = null, [FromQuery(Name = "testKindIds")] int[]? testKindIds = null)
    {
        var codeLists = context.Codelists.AsQueryable();

        if (!string.IsNullOrEmpty(schema))
        {
            codeLists = codeLists.Where(c => c.Schema == schema);
        }

        if (testKindIds?.Length > 0)
        {
            List<int> hydrotestResultGeolcodes = new();
            List<int> flowDirectionGeolCodes = new();
            List<int> evaluationMethodIds = new();

            Array.ForEach(testKindIds, testKindId =>
            {
                // Get the Geolcode associated with the TestKindId.
                int testKindGeolCode = context.Codelists.SingleOrDefault(c => c.Id == testKindId)?.Geolcode ?? 0;

                // Get the lists of Geolcodes from the HydroCodeLookup based on the testKindGeolCode.
                hydrotestResultGeolcodes.AddRange(HydroCodeLookup.HydrotestResultParameterOptions.TryGetValue(testKindGeolCode, out List<int>? tempHRIds) ? tempHRIds : new List<int>());
                flowDirectionGeolCodes.AddRange(HydroCodeLookup.HydrotestFlowDirectionOptions.TryGetValue(testKindGeolCode, out List<int>? tempFDIds) ? tempFDIds : new List<int>());
                evaluationMethodIds.AddRange(HydroCodeLookup.HydrotestEvaluationMethodOptions.TryGetValue(testKindGeolCode, out List<int>? tempEMIds) ? tempEMIds : new List<int>());
            });

            // Return the Codelists where the Codelist's Geolcode matches any of the compatible geolcodes form  the HydroCodeLookup.
            codeLists = codeLists.Where(c =>
                c.Geolcode != null &&
                ((c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema && hydrotestResultGeolcodes.Contains(c.Geolcode.Value)) ||
                (c.Schema == HydrogeologySchemas.FlowdirectionSchema && flowDirectionGeolCodes.Contains(c.Geolcode.Value)) ||
                (c.Schema == HydrogeologySchemas.EvaluationMethodSchema && evaluationMethodIds.Contains(c.Geolcode.Value))));
        }

        return await codeLists.AsNoTracking().ToListAsync().ConfigureAwait(false);
    }

    [HttpGet("csv")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ContentResult> DownloadCsvAsync(CancellationToken cancellationToken)
    {
        using var connection = new NpgsqlConnection(configuration.GetConnectionString("BdmsContext"));
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        using var reader = await connection.BeginTextExportAsync(
            @"COPY (
            SELECT id_cli, schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, text_cli_ro
            FROM bdms.codelist) TO STDOUT WITH DELIMITER ',' CSV HEADER;",
            cancellationToken).ConfigureAwait(false);

        Response.Headers.ContentDisposition = "attachment; filename=codelist_export.csv";
        return Content(await reader.ReadToEndAsync(cancellationToken).ConfigureAwait(false), "text/csv", Encoding.UTF8);
    }
}
