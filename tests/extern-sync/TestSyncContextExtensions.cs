using BDMS.Json;
using BDMS.Models;
using DotNet.Testcontainers.Builders;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Testcontainers.PostgreSql;
using static BDMS.BdmsContextConstants;
using static BDMS.ExternSync.SyncContextExtensions;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="TestSyncContext"/> extension methods.
/// </summary>
internal static class TestSyncContextExtensions
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        Converters = { new GeoJsonConverterFactory(), new DateOnlyJsonConverter(), new LTreeJsonConverter() },
    };

    /// <summary>
    /// Creates a new <see cref="BdmsContext"/> for testing purposes. Use <paramref name="useInMemory"/> to specify
    /// whether to use a real PostgreSQL database or an in-memory context.
    /// </summary>
    internal static async Task<BdmsContext> CreateDbContextAsync(bool useInMemory, bool seedTestData) =>
        useInMemory ? CreateInMemoryDbContext() : await CreatePostgreSqlDbContextAsync(seedTestData).ConfigureAwait(false);

    private static BdmsContext CreateInMemoryDbContext() =>
        new(new DbContextOptionsBuilder<BdmsContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static async Task<BdmsContext> CreatePostgreSqlDbContextAsync(bool seedTestData)
    {
        var postgreSqlContainer = await CreatePostgreSqlContainerAsync().ConfigureAwait(false);
        var context = new BdmsContext(GetDbContextOptions(postgreSqlContainer.GetConnectionString()));
        await context.Database.MigrateAsync().ConfigureAwait(false);
        if (seedTestData) context.SeedData();
        return context;
    }

    private static async Task<PostgreSqlContainer> CreatePostgreSqlContainerAsync()
    {
        var initDbDirectoryPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "initdb.d"));
        var postgreSqlContainer = new PostgreSqlBuilder()
            .WithImage("postgis/postgis:15-3.4-alpine")
            .WithDatabase(BoreholesDatabaseName)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(5432))
            .WithResourceMapping(initDbDirectoryPath, "/docker-entrypoint-initdb.d")
            .Build();
        await postgreSqlContainer.StartAsync();
        return postgreSqlContainer;
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for this <paramref name="borehole"/>.
    /// </summary>
    /// <param name="borehole">The <see cref="Borehole"/> to set the publication status on.</param>
    /// <param name="status">The <see cref="Role"/> to be set. <see cref="Role.View"/>
    /// is not a valid publication status.</param>
    internal static Borehole SetBoreholePublicationStatus(this Borehole borehole, Role status)
    {
        ArgumentNullException.ThrowIfNull(borehole);

        if (status == Role.View)
        {
            throw new NotSupportedException($"The given status <{status}> is not supported.");
        }

        if (status == Role.Publisher)
        {
            return borehole.SetBoreholePublicationStatusPublished();
        }
        else
        {
            // Remove all previous workflow entries/history.
            borehole.Workflows.Clear();

            for (int i = 1; i <= (int)status; i++)
            {
                borehole.Workflows.Add(new Workflow
                {
                    Role = (Role)i,
                    Started = DateTime.Now.ToUniversalTime(),
                    Finished = DateTime.Now.ToUniversalTime(),
                });
            }

            // For all states except 'published', the next state is already
            // created (but without started and finished dates).
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)(int)status + 1,
                Started = null,
                Finished = null,
            });

            return borehole;
        }
    }

    /// <summary>
    /// Sets the publication <paramref name="status"/> for the specified <paramref name="boreholeId"/>.
    /// </summary>
    /// <param name="context">The database context to be used.</param>
    /// <param name="boreholeId">The <see cref="Borehole.Id"/> to set the publication state on.</param>
    /// <param name="userId">The <see cref="User.Id"/> to be assigned to each <see cref="Workflow"/> entry.</param>
    /// <param name="status">The <see cref="Role"/> to be set.</param>
    /// <param name="cancellationToken">The <see cref="CancellationToken"/>.</param>
    /// <returns>The updated <see cref="Borehole"/> entity.</returns>
    internal static async Task<Borehole> SetBoreholePublicationStatusAsync(this BdmsContext context, int boreholeId, int userId, Role status, CancellationToken cancellationToken)
    {
        var borehole = await context.Boreholes
            .Include(b => b.Workflows).ThenInclude(w => w.User)
            .SingleAsync(borehole => borehole.Id == boreholeId, cancellationToken);

        var user = await context.Users.SingleAsync(u => u.Id == userId, cancellationToken);

        borehole.SetBoreholePublicationStatus(status);
        borehole.Workflows.UpdateAttachedUser(user);
        await context.SaveChangesAsync(cancellationToken);
        return borehole;
    }

    /// <summary>
    /// Sorts some pre-defined <see cref="Borehole"/> content in order to be able to compare the raw data of
    /// two serialized <see cref="Borehole"/> objects.
    /// </summary>
    internal static Borehole SortBoreholeContent(this Borehole borehole)
    {
        foreach (var stratigraphy in borehole.Stratigraphies)
        {
            stratigraphy.LithologicalDescriptions = stratigraphy.LithologicalDescriptions?.OrderBy(l => l.FromDepth).ToList();
            stratigraphy.FaciesDescriptions = stratigraphy.FaciesDescriptions?.OrderBy(f => f.FromDepth).ToList();
            stratigraphy.ChronostratigraphyLayers = stratigraphy.ChronostratigraphyLayers?.OrderBy(c => c.FromDepth).ToList();
            stratigraphy.LithostratigraphyLayers = stratigraphy.LithostratigraphyLayers?.OrderBy(l => l.FromDepth).ToList();

            foreach (var layer in stratigraphy.Layers)
            {
                layer.LayerColorCodes = layer.LayerColorCodes.OrderBy(l => l.CodelistId).ToList();
                layer.LayerDebrisCodes = layer.LayerDebrisCodes.OrderBy(l => l.CodelistId).ToList();
                layer.LayerGrainShapeCodes = layer.LayerGrainShapeCodes.OrderBy(l => l.CodelistId).ToList();
                layer.LayerGrainAngularityCodes = layer.LayerGrainAngularityCodes.OrderBy(l => l.CodelistId).ToList();
                layer.LayerOrganicComponentCodes = layer.LayerOrganicComponentCodes.OrderBy(l => l.CodelistId).ToList();
                layer.LayerUscs3Codes = layer.LayerUscs3Codes.OrderBy(l => l.CodelistId).ToList();
            }
        }

        foreach (var completion in borehole.Completions)
        {
            completion.Instrumentations = completion.Instrumentations?.OrderBy(i => i.FromDepth).ToList();
            completion.Backfills = completion.Backfills?.OrderBy(i => i.FromDepth).ToList();

            foreach (var casing in completion.Casings)
            {
                casing.CasingElements = casing.CasingElements.OrderBy(i => i.InnerDiameter).ToList();
            }

            completion.Casings = completion.Casings.OrderBy(c => c.CasingElements.FirstOrDefault()?.InnerDiameter).ToList();
        }

        foreach (var section in borehole.Sections)
        {
            section.SectionElements = section.SectionElements.OrderBy(s => s.FromDepth).ToList();
        }

        borehole.BoreholeGeometry = borehole.BoreholeGeometry?.OrderBy(g => g.MD).ToList();
        borehole.Observations = borehole.Observations?.OrderBy(o => o.FromDepthM).ToList();

        return borehole;
    }

    /// <summary>
    /// Serializes the given <paramref name="borehole"/> to a JSON string. Some irrelevant
    /// fields (e.g. ids, users, workflows/workgroup) are omitted in order to be able to compare the raw
    /// data output of another <see cref="Borehole"/>.
    /// </summary>
    internal static string SerializeToJson(this Borehole borehole)
    {
        // Collections, objects and attributes to be removed.
        var listsToRemove = new[] { "Workflows" };
        var objectsToRemove = new[] { "Workgroup", "UpdatedBy", "Settings" };
        var attributesToRemove = new[] { "Id", "BoreholeId", "StratigraphyId", "CompletionId", "Created", "CreatedById", "Updated", "UpdatedById", "CreatedAt", "SectionId", "LayerId", "FileId", "WorkgroupId", "UserId", "CasingId", "LockedById" };

        // Build dynamic regular expressions.
        var removeSettingsRegex = $"\"Settings\"\\s*:\\s*\".*?\"\\s*,?";
        var removeListsRegex = $"\"({string.Join("|", listsToRemove)})\"\\s*:\\s*\\[\\s*(\\{{[^{{}}]*\\}}\\s*,?\\s*)+\\],?";
        var removeObjectsRegex = $"\"({string.Join("|", objectsToRemove)})\"\\s*:\\s*\\{{(?:[^{{}}]|\\{{[^{{}}]*\\}})*\\}}\\s*,?";
        var removeAttributesRegex = $"\"({string.Join("|", attributesToRemove)})\"\\s*:\\s*[^,}}]+,?";

        return JsonSerializer
            .Serialize(borehole, jsonSerializerOptions)
            .Remove(removeSettingsRegex)
            .Remove(removeListsRegex)
            .Remove(removeObjectsRegex)
            .Remove(removeAttributesRegex);
    }

    /// <summary>
    /// Removes all occurrences of the <paramref name="pattern "/> (regular expression)
    /// from the given <paramref name="input"/>.
    /// </summary>
    private static string Remove(this string input, string pattern) => Regex.Replace(input, pattern, "", RegexOptions.IgnoreCase);

    /// <summary>
    /// <see cref="Casing"/>s in <see cref="Instrumentation"/>s, <see cref="Backfill"/>s and <see cref="Observation"/>s
    /// are expected to be also available in <see cref="Completion"/>s. Our test data seeded with
    /// <see cref="BdmsContextExtensions.SeedData(BdmsContext)"/> does not meet these requirements atm. This method fixes
    /// <see cref="Borehole"/>s with publication status 'published' only and can be executed multiple times.
    /// </summary>
    internal static async Task FixCasingReferencesAsync(this BdmsContext context, CancellationToken cancellationToken)
    {
        var boreholes = context.BoreholesWithIncludes.WithPublicationStatusPublished();

        foreach (var borehole in boreholes)
        {
            // Remove all casing references if there are no completions
            if (borehole.Completions.Count == 0)
            {
                borehole.PurgeCasingReferences();
            }
            else
            {
                borehole.FixFaultyCasingReferences();
            }
        }

        if (!boreholes.ValidateCasingReferences())
        {
            throw new AssertFailedException(
                $"The casings in one of the given ${nameof(Borehole)}s in ${nameof(boreholes)} does not validate successfully.");
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Gets all non-<c>null</c> <see cref="Casing"/>s from the given list of <paramref name="casingReferences"/>.
    /// </summary>
    private static IEnumerable<Casing> GetNonNullCasings(this IEnumerable<ICasingReference> casingReferences) =>
        casingReferences.Where(c => c.Casing != null).Select(ca => ca.Casing!);

    /// <summary>
    /// Purges all <see cref="Casing"/> references in the given <paramref name="borehole"/>.
    /// </summary>
    private static void PurgeCasingReferences(this Borehole borehole)
    {
        borehole.Observations.PurgeCasingReferences();

        foreach (var completion in borehole.Completions)
        {
            completion.Instrumentations.PurgeCasingReferences();
            completion.Backfills.PurgeCasingReferences();
        }
    }

    /// <summary>
    /// Purges all <see cref="Casing"/> references for all objects in the given list of <paramref name="casingReferences"/>.
    /// </summary>/param>
    private static void PurgeCasingReferences(this IEnumerable<ICasingReference> casingReferences)
    {
        foreach (var casingReference in casingReferences)
        {
            casingReference.DeleteCasingReference();
        }
    }

    /// <summary>
    /// Fixes faulty <see cref="Casing"/> references in the given <paramref name="borehole"/>.
    /// </summary>
    private static void FixFaultyCasingReferences(this Borehole borehole)
    {
        var referencedCasings = new List<Casing>();

        borehole.Observations.FixFaultyCasingReferences();
        referencedCasings.AddRange(borehole.Observations.GetNonNullCasings());

        foreach (var completion in borehole.Completions)
        {
            completion.Instrumentations.FixFaultyCasingReferences();
            completion.Backfills.FixFaultyCasingReferences();

            referencedCasings.AddRange(completion.Instrumentations.GetNonNullCasings());
            referencedCasings.AddRange(completion.Backfills.GetNonNullCasings());
        }

        var alreadyExistingCompletionCasingIds = borehole.Completions
            .SelectMany(completion => completion.Casings.Select(casing => casing.Id)).ToHashSet();

        foreach (var referencedCasing in referencedCasings)
        {
            // Add missing casing references to the first completion
            if (!alreadyExistingCompletionCasingIds.Contains(referencedCasing.Id))
            {
                borehole.Completions.First().Casings.Add(referencedCasing);
            }
        }
    }

    /// <summary>
    /// Fixes faulty <see cref="Casing"/> references in the given list of <paramref name="casingReferences"/>.
    /// </summary>
    private static void FixFaultyCasingReferences(this IEnumerable<ICasingReference> casingReferences)
    {
        foreach (var casingReference in casingReferences)
        {
            if (casingReference.Casing == null)
            {
                casingReference.DeleteCasingReference();
            }
        }
    }

    /// <summary>
    /// Deletes the <see cref="Casing"/> in the given <paramref name="casingReference"/>.
    /// </summary>
    private static ICasingReference DeleteCasingReference(this ICasingReference casingReference)
    {
        casingReference.Casing = null;
        casingReference.CasingId = null;
        return casingReference;
    }
}
