using BDMS.Models;
using Microsoft.AspNetCore.Mvc;

namespace BDMS.Controllers;

public abstract class TestControllerBase
{
    protected BdmsContext context;

    /// <summary>
    /// Creates a test borehole in the database for testing purposes.
    /// </summary>
    /// <returns>The created borehole entity.</returns>
    protected async Task<Borehole> CreateTestBoreholeAsync()
    {
        var borehole = new Borehole
        {
            Name = "Test Borehole",
            OriginalName = "Test Borehole Original",
        };

        await context.Boreholes.AddAsync(borehole);
        await context.SaveChangesAsync();

        return borehole;
    }

    /// <summary>
    /// Creates a test log run associated with the specified borehole.
    /// </summary>
    /// <param name="boreholeId">The ID of the borehole to associate with the log run.</param>
    /// <returns>The created log run entity.</returns>
    protected async Task<LogRun> CreateTestLogRunAsync(int boreholeId)
    {
        var logRun = new LogRun
        {
            BoreholeId = boreholeId,
            RunNumber = "RUN01",
            FromDepth = 0,
            ToDepth = 100,
            BitSize = 0.2,
        };

        await context.LogRuns.AddAsync(logRun);
        await context.SaveChangesAsync();

        return logRun;
    }
}
