﻿using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeController : ControllerBase
{
    private readonly BdmsContext context;
    private readonly ILogger logger;

    public BoreholeController(BdmsContext context, ILogger<BoreholeController> logger)
    {
        this.context = context;
        this.logger = logger;
    }

    /// <summary>
    /// Asynchronously copies a <see cref="Borehole"/>.
    /// </summary>
    /// <param name="id">The <see cref="Borehole.Id"/> of the borehole to copy.</param>
    /// <param name="workgroupId">The <see cref="Workgroup.Id"/> of the new <see cref="Borehole"/>.</param>
    /// <returns>The id of the newly created <see cref="Borehole"/>.</returns>
    [HttpPost("copy")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<ActionResult<int>> CopyAsync([Required] int id, [Required] int workgroupId)
    {
        logger.LogInformation("Copy borehole with id <{BoreholeId}> to workgroup with id <{WorkgroupId}>", id, workgroupId);

        var user = await context.Users
            .Include(u => u.WorkgroupRoles)
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == HttpContext.GetUserSubjectId())
            .ConfigureAwait(false);

        if (user == null || user.WorkgroupRoles == null || !user.WorkgroupRoles.Any(w => w.WorkgroupId == workgroupId && w.Role == Role.Editor))
        {
            return Unauthorized();
        }

        var borehole = await context.Boreholes
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerColorCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerDebrisCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainAngularityCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerGrainShapeCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerOrganicComponentCodes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.Layers).ThenInclude(l => l.LayerUscs3Codes)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.ChronostratigraphyLayers)
            .Include(b => b.Stratigraphies).ThenInclude(s => s.LithostratigraphyLayers)
            .Include(b => b.Completions).ThenInclude(c => c.Casings).ThenInclude(c => c.CasingElements)
            .Include(b => b.Completions).ThenInclude(c => c.Instrumentations)
            .Include(b => b.Completions).ThenInclude(c => c.Backfills)
            .Include(b => b.Sections).ThenInclude(s => s.SectionElements)
            .Include(b => b.Observations)
            .Include(b => b.BoreholeCodelists)
            .Include(b => b.Workflows)
            .Include(b => b.BoreholeFiles)
            .Include(b => b.BoreholeGeometry)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id)
            .ConfigureAwait(false);

        if (borehole == null)
        {
            return NotFound();
        }

        // Include FieldMeasurementResults and HydrotestResults separately since Entity Framework does not support casting in an Include statement
        var fieldMeasurements = borehole.Observations.OfType<FieldMeasurement>().ToList();
       #pragma warning disable CS8603
        // Cannot include null test for fieldMeasurementResults and hydrotestResults since they are not yet loaded
        // if there are no fieldMeasurementResults of hydrotestResults the LoadAsync method will be called but have no effect
        foreach (var fieldMeasurement in fieldMeasurements)
        {
            await context.Entry(fieldMeasurement)
                .Collection(f => f.FieldMeasurementResults)
                .LoadAsync()
                .ConfigureAwait(false);
        }

        var hydrotests = borehole.Observations.OfType<Hydrotest>().ToList();
        foreach (var hydrotest in hydrotests)
        {
                await context.Entry(hydrotest)
                    .Collection(h => h.HydrotestResults)
                    .LoadAsync()
                    .ConfigureAwait(false);
        }
        #pragma warning restore CS8603

        // Set ids of copied entities to zero. Entities with an id of zero are added as new entities to the DB.
        borehole.Id = 0;
        foreach (var stratigraphy in borehole.Stratigraphies)
        {
            stratigraphy.Id = 0;
            foreach (var layer in stratigraphy.Layers)
            {
                layer.Id = 0;
                layer.LayerColorCodes?.ResetLayerIds();
                layer.LayerDebrisCodes?.ResetLayerIds();
                layer.LayerGrainShapeCodes?.ResetLayerIds();
                layer.LayerGrainAngularityCodes?.ResetLayerIds();
                layer.LayerOrganicComponentCodes?.ResetLayerIds();
                layer.LayerUscs3Codes?.ResetLayerIds();
            }

            foreach (var lithologicalDescription in stratigraphy.LithologicalDescriptions)
            {
                lithologicalDescription.Id = 0;
            }

            foreach (var faciesDescription in stratigraphy.FaciesDescriptions)
            {
                faciesDescription.Id = 0;
            }

            foreach (var chronostratigraphy in stratigraphy.ChronostratigraphyLayers)
            {
                chronostratigraphy.Id = 0;
            }

            foreach (var lithostratigraphy in stratigraphy.LithostratigraphyLayers)
            {
                lithostratigraphy.Id = 0;
            }
        }

        foreach (var completion in borehole.Completions)
        {
            completion.Id = 0;
            foreach (var casing in completion.Casings)
            {
                casing.Id = 0;
                foreach (var casingElement in casing.CasingElements)
                {
                    casingElement.Id = 0;
                }
            }

            foreach (var instrumentation in completion.Instrumentations)
            {
                instrumentation.Id = 0;
            }

            foreach (var backfill in completion.Backfills)
            {
                backfill.Id = 0;
            }
        }

        foreach (var section in borehole.Sections)
        {
            section.Id = 0;
            foreach (var sectionElement in section.SectionElements)
            {
                sectionElement.Id = 0;
            }
        }

        foreach (var observation in borehole.Observations)
        {
            observation.Id = 0;
            if (observation is FieldMeasurement fieldMeasurement)
            {
                if (fieldMeasurement.FieldMeasurementResults != null)
                {
                    foreach (var fieldMeasurementResult in fieldMeasurement.FieldMeasurementResults)
                    {
                        fieldMeasurementResult.Id = 0;
                    }
                }
            }

            if (observation is Hydrotest hydrotest)
            {
                if (hydrotest.HydrotestResults != null)
                {
                    foreach (var hydrotestResult in hydrotest.HydrotestResults)
                    {
                        hydrotestResult.Id = 0;
                    }
                }
            }
        }

        foreach (var boreholeFile in borehole.BoreholeFiles)
        {
            boreholeFile.BoreholeId = 0;
        }

        foreach (var boreholeGeometry in borehole.BoreholeGeometry)
        {
            boreholeGeometry.Id = 0;
        }

        borehole.WorkgroupId = workgroupId;

        borehole.Workflows.Clear();
        borehole.Workflows.Add(new Workflow { Borehole = borehole, Role = Role.Editor, UserId = user.Id });

        borehole.OriginalName += " (Copy)";

        var entityEntry = await context.AddAsync(borehole).ConfigureAwait(false);
        await context.SaveChangesAsync().ConfigureAwait(false);

        return Ok(entityEntry.Entity.Id);
    }
}
