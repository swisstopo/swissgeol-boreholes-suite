using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class DocumentController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly IBoreholePermissionService boreholePermissionService;

    public DocumentController(BdmsContext context, IBoreholePermissionService boreholePermissionService)
    {
        this.context = context;
        this.boreholePermissionService = boreholePermissionService;
    }

    /// <summary>
    /// Adds the <see cref="Document"/> to the <see cref="Borehole"/> by <see cref="Document.BoreholeId"/>.
    /// </summary>
    /// <param name="document">The <see cref="Document"/> to add.</param>
    /// <returns>The created <see cref="Document"/>.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<Document>> CreateAsync([Required] Document document)
    {
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), document.BoreholeId).ConfigureAwait(false)) return Unauthorized();

        await context.Documents.AddAsync(document).ConfigureAwait(false);
        await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);
        return Ok(document);
    }

    /// <summary>
    /// Get all <see cref="Document"/> that are linked to the <see cref="Borehole"/> with <see cref="Borehole.Id"/> provided in <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="boreholeId">The id of the <see cref="Borehole"/>.</param>
    /// <returns>A list of <see cref="Document"/>.</returns>
    [HttpGet("getAllForBorehole")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<IEnumerable<Document>>> GetAllOfBoreholeAsync([Required, Range(1, int.MaxValue)] int boreholeId)
    {
        if (!await boreholePermissionService.CanViewBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        // Get all Documents that are linked to the borehole.
        return await context.Documents
            .Include(d => d.CreatedBy)
            .Where(d => d.BoreholeId == boreholeId)
            .OrderBy(d => d.Id)
            .AsNoTracking()
            .ToListAsync()
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Updates the documents with the provided data.
    /// </summary>
    /// <param name="documentUpdates">An array of objects containing the updated values for the documents.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> UpdateAsync([FromBody] Collection<DocumentUpdate> documentUpdates)
    {
        if (documentUpdates == null || documentUpdates.Count == 0 || documentUpdates.Any(d => d == null || d.Id <= 0)) return BadRequest("The data must not be empty and must contain valid entries.");

        var documentIds = documentUpdates.Select(d => d.Id).ToList();

        var documents = await context.Documents
            .Where(p => documentIds.Contains(p.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (documents.Count == 0) return NotFound();

        var boreholeIds = documents.Select(p => p.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("Not all Documents are attached to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        foreach (var document in documents)
        {
            var updateData = documentUpdates.FirstOrDefault(d => d.Id == document.Id);
            if (updateData != null)
            {
                document.Url = updateData.Url;
                document.Description = updateData.Description;
                document.Public = updateData.Public;
            }
        }

        await context.UpdateChangeInformationAndSaveChangesAsync(HttpContext).ConfigureAwait(false);

        return Ok();
    }

    /// <summary>
    /// Deletes the <see cref="Document"/>s with the provided <paramref name="documentIds"/>.
    /// </summary>
    /// <param name="documentIds">The ids of the <see cref="Document"/>s to delete.</param>
    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult> DeleteAsync([FromQuery][MaxLength(100)] IReadOnlyList<int> documentIds)
    {
        if (documentIds == null || documentIds.Count == 0) return BadRequest("The list of documentIds must not be empty.");

        var documents = await context.Documents
            .Where(p => documentIds.Contains(p.Id))
            .ToListAsync()
            .ConfigureAwait(false);

        if (documents.Count == 0) return NotFound();

        var boreholeIds = documents.Select(p => p.BoreholeId).Distinct().ToList();
        if (boreholeIds.Count != 1) return BadRequest("Not all Documents are attached to the same borehole.");

        var boreholeId = boreholeIds.Single();
        if (!await boreholePermissionService.CanEditBoreholeAsync(HttpContext.GetUserSubjectId(), boreholeId).ConfigureAwait(false)) return Unauthorized();

        context.RemoveRange(documents);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok();
    }
}
