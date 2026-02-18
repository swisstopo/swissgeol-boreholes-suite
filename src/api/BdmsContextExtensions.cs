using BDMS.Models;
using Bogus;
using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;
using System.Collections.ObjectModel;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using static BDMS.BdmsContextConstants;

namespace BDMS;

#pragma warning disable CA1505
/// <summary>
/// Contains extensions methods for the <see cref="BdmsContext"/>.
/// </summary>
public static class BdmsContextExtensions
{
    /// <summary>
    /// Sets the default <see cref="NpgsqlDbContextOptionsBuilder"/> options for the boreholes database context.
    /// </summary>
    public static void SetDbContextOptions(this NpgsqlDbContextOptionsBuilder options)
    {
        options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        options.UseNetTopologySuite();
        options.MigrationsHistoryTable("__EFMigrationsHistory", BoreholesDatabaseName);
        options.CommandTimeout(420);
    }

    /// <summary>
    /// Seed test data but only if the database is not yet seeded.
    /// </summary>
    public static void EnsureSeeded(this BdmsContext context)
    {
        // Check the content of the table that is seeded first.
        // The default workgroup is inserted by migrations.
        if (context.Workgroups.Count() <= 1)
        {
            context.SeedData();
        }
    }

    /// <summary>
    /// Seed test data.
    /// </summary>
    [SuppressMessage("Security", "CA5394:Do not use insecure randomness", Justification = "Accepted for test data seeding.")]
    public static void SeedData(this BdmsContext context)
    {
        var bulkConfig = new BulkConfig { SqlBulkCopyOptions = SqlBulkCopyOptions.KeepIdentity };

        // Set Bogus Data System Clock
        Bogus.DataSets.Date.SystemClock = () => DateTime.Parse("01.01.2022 00:00:00", new CultureInfo("de_CH", false));

        // Seed Workgroups
        var workgroup_ids = 2;
        var workgroupRange = Enumerable.Range(workgroup_ids, 5);
        var fakeWorkgroups = new Faker<Workgroup>()
           .StrictMode(true)
           .RuleFor(o => o.Id, f => workgroup_ids++)
           .RuleFor(o => o.Name, f => f.Music.Genre())
           .RuleFor(o => o.CreatedAt, f => f.Date.Past().ToUniversalTime().OrNull(f, .1f))
           .RuleFor(o => o.DisabledAt, f => f.Date.Past().ToUniversalTime().OrNull(f, .1f))
           .RuleFor(o => o.Settings, f => null)
           .RuleFor(o => o.Boreholes, _ => default!);
        Workgroup SeededWorkgroups(int seed) => fakeWorkgroups.UseSeed(seed).Generate();
        context.BulkInsert(workgroupRange.Select(SeededWorkgroups).ToList(), bulkConfig);

        // ranges for existing tables
        var userRange = Enumerable.Range(1, 5);

        // local codelists, ordered by id because the order after migrations is not guaranteed
        List<Codelist> codelists = context.Codelists.OrderBy(c => c.Id).ToList();
        List<int> kindIds = codelists.Where(c => c.Schema == "borehole_type").Select(s => s.Id).ToList();
        List<int> srsIds = codelists.Where(c => c.Schema == "spatial_reference_system").Select(s => s.Id).ToList();
        List<int> hrsIds = codelists.Where(c => c.Schema == "height_reference_system").Select(s => s.Id).ToList();
        List<int> restrictionIds = codelists.Where(c => c.Schema == "restriction").Select(s => s.Id).ToList();
        List<int> locationPrecisionIds = codelists.Where(c => c.Schema == "location_precision").Select(s => s.Id).ToList();
        List<int> descriptionQualityIds = codelists.Where(c => c.Schema == "description_quality").Select(s => s.Id).ToList();
        List<int> drillingMethodIds = codelists.Where(c => c.Schema == "extended.drilling_method").Select(s => s.Id).ToList();
        List<int> cuttingsIds = codelists.Where(c => c.Schema == "custom.cuttings").Select(s => s.Id).ToList();
        List<int> qtDepthIds = codelists.Where(c => c.Schema == "depth_precision").Select(s => s.Id).ToList();
        List<int> elevationPrecisionIds = codelists.Where(c => c.Schema == "elevation_precision").Select(s => s.Id).ToList();
        List<int> layerKindIds = codelists.Where(c => c.Schema == "layer_kind").Select(s => s.Id).ToList();
        List<int> purposeIds = codelists.Where(c => c.Schema == "extended.purpose").Select(s => s.Id).ToList();
        List<int> statusIds = codelists.Where(c => c.Schema == "extended.status").Select(s => s.Id).ToList();
        List<int> referenceElevationTypeIds = codelists.Where(c => c.Schema == "reference_elevation_type").Select(s => s.Id).ToList();
        List<int> drillingMudTypeIds = codelists.Where(c => c.Schema == "drilling_mud_type").Select(s => s.Id).ToList();

        // Lithology codelists (schema without LithologySchemas static class belong to legacy schemas)
        List<int> lithologyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithology_top_bedrock").Select(s => s.Id).ToList();
        List<int> chronostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.chronostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> lithostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> alterationIds = codelists.Where(c => c.Schema == "alteration").Select(s => s.Id).ToList();
        List<int> colourIds = codelists.Where(c => c.Schema == "colour").Select(s => s.Id).ToList();
        List<int> debrisIds = codelists.Where(c => c.Schema == "debris").Select(s => s.Id).ToList();
        List<int> organicComponentIds = codelists.Where(c => c.Schema == "organic_components").Select(s => s.Id).ToList();
        List<int> soilStateIds = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList();  // unclear which codelist
        List<int> kirostIds = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList();  // unclear which codelist
        List<int> grainSize1Ids = codelists.Where(c => c.Schema == "grain_size").Select(s => s.Id).ToList();
        List<int> grainSize2Ids = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList(); // unclear which codelist

        List<int> plasticityIds = codelists.Where(c => c.Schema == StratigraphySchemas.PlasticitySchema).Select(s => s.Id).ToList();
        List<int> compactnessIds = codelists.Where(c => c.Schema == StratigraphySchemas.CompactnessSchema).Select(s => s.Id).ToList();
        List<int> consistencyIds = codelists.Where(c => c.Schema == StratigraphySchemas.ConsistencySchema).Select(s => s.Id).ToList();
        List<int> humidityIds = codelists.Where(c => c.Schema == StratigraphySchemas.HumiditySchema).Select(s => s.Id).ToList();
        List<int> cohesionIds = codelists.Where(c => c.Schema == StratigraphySchemas.CohesionSchema).Select(s => s.Id).ToList();
        List<int> grainShapeIds = codelists.Where(c => c.Schema == StratigraphySchemas.GrainShapeSchema).Select(s => s.Id).ToList();
        List<int> grainAngularityIds = codelists.Where(c => c.Schema == StratigraphySchemas.GrainAngularitySchema).Select(s => s.Id).ToList();
        List<int> uscsDeterminationIds = codelists.Where(c => c.Schema == StratigraphySchemas.UscsDeterminationSchema).Select(s => s.Id).ToList();
        List<int> gradationIds = codelists.Where(c => c.Schema == StratigraphySchemas.GradationSchema).Select(s => s.Id).ToList();
        List<int> uscsTypeIds = codelists.Where(c => c.Schema == StratigraphySchemas.UscsTypeSchema).Select(s => s.Id).ToList();
        List<int> grainSizeIds = codelists.Where(c => c.Schema == StratigraphySchemas.GrainSizeSchema).Select(s => s.Id).ToList();
        List<int> lithologyUnconMainIds = codelists.Where(c => c.Schema == StratigraphySchemas.LithologyUnconMainSchema).Select(s => s.Id).ToList();
        List<int> lithologyUnconSecondaryIds = codelists.Where(c => c.Schema == StratigraphySchemas.LithologyUnconSecondarySchema).Select(s => s.Id).ToList();
        List<int> componentUnconOrganicIds = codelists.Where(c => c.Schema == StratigraphySchemas.ComponentUnconOrganicSchema).Select(s => s.Id).ToList();
        List<int> componentUnconDebrisIds = codelists.Where(c => c.Schema == StratigraphySchemas.ComponentUnconDebrisSchema).Select(s => s.Id).ToList();
        List<int> colorIds = codelists.Where(c => c.Schema == StratigraphySchemas.ColorSchema).Select(s => s.Id).ToList();
        List<int> rockConditionIds = codelists.Where(c => c.Schema == StratigraphySchemas.RockConditionSchema).Select(s => s.Id).ToList();
        List<int> alterationDegreeIds = codelists.Where(c => c.Schema == StratigraphySchemas.AlterationDegreeSchema).Select(s => s.Id).ToList();
        List<int> componentConParticleIds = codelists.Where(c => c.Schema == StratigraphySchemas.ComponentConParticleSchema).Select(s => s.Id).ToList();
        List<int> componentConMineralIds = codelists.Where(c => c.Schema == StratigraphySchemas.ComponentConMineralSchema).Select(s => s.Id).ToList();
        List<int> cementationIds = codelists.Where(c => c.Schema == StratigraphySchemas.CementationSchema).Select(s => s.Id).ToList();
        List<int> structureSynGenIds = codelists.Where(c => c.Schema == StratigraphySchemas.StructureSynGenSchema).Select(s => s.Id).ToList();
        List<int> structurePostGenIds = codelists.Where(c => c.Schema == StratigraphySchemas.StructurePostGenSchema).Select(s => s.Id).ToList();
        List<int> textureMetaIds = codelists.Where(c => c.Schema == StratigraphySchemas.TextureMetaSchema).Select(s => s.Id).ToList();
        List<int> lithologyConIds = codelists.Where(c => c.Schema == StratigraphySchemas.LithologyConSchema).Select(s => s.Id).ToList();
        List<int> faciesConIds = codelists.Where(c => c.Schema == StratigraphySchemas.FaciesConSchema).Select(s => s.Id).ToList();
        List<int> chronostratigraphyIds = codelists.Where(c => c.Schema == StratigraphySchemas.ChronostratigraphySchema).Select(s => s.Id).ToList();
        List<int> lithostratigraphyIds = codelists.Where(c => c.Schema == StratigraphySchemas.LithostratigraphySchema).Select(s => s.Id).ToList();

        // Completion codelists
        List<int> completionKindIds = codelists.Where(c => c.Schema == CompletionSchemas.CompletionKindSchema).Select(s => s.Id).ToList();
        List<int> instrumentKindIds = codelists.Where(c => c.Schema == CompletionSchemas.InstrumentationTypeSchema).Select(s => s.Id).ToList();
        List<int> instrumentStatusIds = codelists.Where(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Select(s => s.Id).ToList();
        List<int> casingKindIds = codelists.Where(c => c.Schema == CompletionSchemas.CasingTypeSchema).Select(s => s.Id).ToList();
        List<int> casingMaterialIds = codelists.Where(c => c.Schema == CompletionSchemas.CasingMaterialSchema).Select(s => s.Id).ToList();
        List<int> backfillKindIds = codelists.Where(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Select(s => s.Id).ToList();
        List<int> backfillMaterialIds = codelists.Where(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Select(s => s.Id).ToList();

        // Hydrogeology codelists
        List<int> waterIngressReliabilityIds = codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Select(s => s.Id).ToList();
        List<int> waterIngressQuantityIds = codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).Select(s => s.Id).ToList();
        List<int> waterIngressConditionsIds = codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).Select(s => s.Id).ToList();
        List<int> hydrotestKindIds = codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Select(s => s.Id).ToList();
        List<int> hydrotestResultParameterIds = codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema).Select(s => s.Id).ToList();
        List<int> groundwaterLevelMeasurementKindIds = codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).Select(s => s.Id).ToList();
        List<int> fieldMeasurementSampleTypeIds = codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Select(s => s.Id).ToList();
        List<int> fieldMeasurementParameterIds = codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Select(s => s.Id).ToList();

        // Seed Boreholes
        var borehole_ids = 1_000_000;
        var boreholeRange = Enumerable.Range(borehole_ids, 3000).ToList();
        var richBoreholeRange = Enumerable.Range(borehole_ids, 100).ToList(); // generate boreholes with more data for testing
        var fakeBoreholes = new Faker<Borehole>()
           .StrictMode(true)
           .RuleFor(o => o.Id, f => borehole_ids++)
           .RuleFor(o => o.Stratigraphies, _ => new Collection<StratigraphyV2>())
           .RuleFor(o => o.Completions, _ => new Collection<Completion>())
           .RuleFor(o => o.Sections, _ => new Collection<Section>())
           .RuleFor(o => o.Observations, _ => new Collection<Observation>())
           .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
           .RuleFor(o => o.CreatedBy, _ => default!)
           .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
           .RuleFor(o => o.UpdatedBy, _ => default!)
           .RuleFor(o => o.LockedById, f => f.PickRandom(userRange).OrNull(f, .9f))
           .RuleFor(o => o.LockedBy, _ => default!)
           .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.Locked, f => f.Date.Past().ToUniversalTime().OrNull(f, .9f))
           .RuleFor(o => o.WorkgroupId, f => 1)
           .RuleFor(o => o.Workgroup, _ => default!)
           .RuleFor(o => o.IsPublic, f => { if (borehole_ids % 10 < 9) return true; else return false; }) // Generate mostly public records.
           .RuleFor(o => o.LocationX, f => { if (borehole_ids % 10 < 5) return f.Random.Int(2477750, 2830750).OrNull(f, .1f); else return f.Random.Double(2477750, 2830750).OrNull(f, .1f); })
           .RuleFor(o => o.LocationY, f => { if (borehole_ids % 10 < 5) return f.Random.Int(1066750, 1310750).OrNull(f, .1f); else return f.Random.Double(1066750, 1310750).OrNull(f, .1f); })
           .RuleFor(o => o.LocationXLV03, f => { if (borehole_ids % 10 < 5) return f.Random.Int(477750, 830750).OrNull(f, .1f); else return f.Random.Double(477750, 830750).OrNull(f, .1f); })
           .RuleFor(o => o.LocationYLV03, f => { if (borehole_ids % 10 < 5) return f.Random.Int(66750, 310750).OrNull(f, .1f); else return f.Random.Double(66750, 310750).OrNull(f, .1f); })
           .RuleFor(o => o.OriginalReferenceSystem, f => f.PickRandom(ReferenceSystem.LV95, ReferenceSystem.LV03))
           .RuleFor(o => o.ElevationZ, f => f.Random.Double(0, 4500))
           .RuleFor(o => o.TypeId, f => f.PickRandom(kindIds).OrNull(f, .6f))
           .RuleFor(o => o.Type, _ => default!)
           .RuleFor(o => o.HrsId, f => f.PickRandom(hrsIds).OrNull(f, .1f))
           .RuleFor(o => o.Hrs, _ => default!)
           .RuleFor(o => o.TotalDepth, f => f.Random.Double(0, 2000))
           .RuleFor(o => o.RestrictionId, f => f.PickRandom(restrictionIds).OrNull(f, .5f))
           .RuleFor(o => o.Restriction, _ => default!)
           .RuleFor(o => o.RestrictionUntil, f => f.Date.Future().ToUniversalTime().OrNull(f, .9f))
           .RuleFor(o => o.OriginalName, f => f.Name.FullName())
           .RuleFor(o => o.Name, f => "")
           .RuleFor(o => o.LocationPrecisionId, f => f.PickRandom(locationPrecisionIds).OrNull(f, .1f))
           .RuleFor(o => o.LocationPrecision, _ => default!)
           .RuleFor(o => o.ElevationPrecisionId, f => f.PickRandom(elevationPrecisionIds).OrNull(f, .1f))
           .RuleFor(o => o.ElevationPrecision, _ => default!)
           .RuleFor(o => o.ProjectName, f => f.Company.CatchPhrase().OrNull(f, .1f))
           .RuleFor(o => o.Country, f => f.Address.Country().OrNull(f, 0.01f))
           .RuleFor(o => o.Canton, f => f.Address.State().OrNull(f, 0.01f))
           .RuleFor(o => o.Municipality, f => f.Address.City().OrNull(f, 0.01f))
           .RuleFor(o => o.PurposeId, f => f.PickRandom(purposeIds).OrNull(f, .05f))
           .RuleFor(o => o.Purpose, _ => default!)
           .RuleFor(o => o.StatusId, f => f.PickRandom(statusIds).OrNull(f, .05f))
           .RuleFor(o => o.Status, _ => default!)
           .RuleFor(o => o.DepthPrecisionId, f => f.PickRandom(qtDepthIds).OrNull(f, .05f))
           .RuleFor(o => o.DepthPrecision, _ => default!)
           .RuleFor(o => o.TopBedrockFreshMd, f => f.Random.Double(0, 1000).OrNull(f, .05f))
           .RuleFor(o => o.TopBedrockWeatheredMd, f => f.Random.Double(0, 2).OrNull(f, .05f))
           .RuleFor(o => o.HasGroundwater, f => f.Random.Bool().OrNull(f, .2f))
           .RuleFor(o => o.Remarks, f => f.Rant.Review().OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyConIds).OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrock, _ => default!)
           .RuleFor(o => o.LithostratigraphyTopBedrockId, f => f.PickRandom(lithostratigraphyIds).OrNull(f, .05f))
           .RuleFor(o => o.LithostratigraphyTopBedrock, _ => default!)
           .RuleFor(o => o.ChronostratigraphyTopBedrockId, f => f.PickRandom(chronostratigraphyIds).OrNull(f, .05f))
           .RuleFor(o => o.ChronostratigraphyTopBedrock, _ => default!)
           .RuleFor(o => o.ReferenceElevation, f => f.Random.Double(0, 4500).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevationPrecisionId, f => f.PickRandom(elevationPrecisionIds).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevationPrecision, _ => default!)
           .RuleFor(o => o.ReferenceElevationTypeId, f => f.PickRandom(referenceElevationTypeIds).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevationType, _ => default!)
           .RuleFor(o => o.Workflow, _ => default!)
           .RuleFor(o => o.BoreholeCodelists, _ => new Collection<BoreholeCodelist>())
           .RuleFor(o => o.Codelists, _ => new Collection<Codelist>())
           .RuleFor(o => o.Geometry, f =>
           {
               var point = new Point(f.Random.Int(2477750, 2830750), f.Random.Int(1066750, 1310750));
               point.SRID = SpatialReferenceConstants.SridLv95;
               return point.OrNull(f, .05f);
           })
           .RuleFor(o => o.NationalInterest, f => borehole_ids % 10 == 9)
           .RuleFor(o => o.PrecisionLocationX, f => f.PickRandom(Enumerable.Range(0, 10)))
           .RuleFor(o => o.PrecisionLocationY, f => f.PickRandom(Enumerable.Range(0, 10)))
           .RuleFor(o => o.PrecisionLocationXLV03, f => f.PickRandom(Enumerable.Range(0, 10)))
           .RuleFor(o => o.PrecisionLocationYLV03, f => f.PickRandom(Enumerable.Range(0, 10)))
           .RuleFor(o => o.TotalDepthTvd, _ => null)
           .RuleFor(o => o.TopBedrockFreshTvd, _ => null)
           .RuleFor(o => o.TopBedrockWeatheredTvd, _ => null)
           .RuleFor(o => o.Observations, _ => new Collection<Observation>())
           .RuleFor(o => o.BoreholeGeometry, _ => new Collection<BoreholeGeometryElement>())
           .RuleFor(o => o.Profiles, _ => new Collection<Profile>())
           .RuleFor(o => o.TopBedrockIntersected, f => f.Random.Bool().OrNull(f, .2f))
           .RuleFor(o => o.Photos, _ => new Collection<Photo>())
           .RuleFor(o => o.Documents, _ => new Collection<Document>())
           .RuleFor(o => o.LogRuns, _ => new Collection<LogRun>())
           .FinishWith((f, o) => { o.Name = o.OriginalName; });

        Borehole SeededBoreholes(int seed) => fakeBoreholes.UseSeed(seed).Generate();
        context.BulkInsert(boreholeRange.Select(SeededBoreholes).ToList(), bulkConfig);

        // Seed a workflow for each borehole
        var tabStatus_ids = 3_000_000;
        var tabStatusRange = Enumerable.Range(tabStatus_ids, boreholeRange.Count * 2).ToList();
        var fakeTabStatus = new Faker<TabStatus>()
            .StrictMode(false)
            .RuleFor(o => o.Id, f => tabStatus_ids++);

        TabStatus SeededTabStatus(int seed) => fakeTabStatus.UseSeed(seed).Generate();
        context.BulkInsert(tabStatusRange.Select(SeededTabStatus).ToList(), bulkConfig);

        var workflow_ids = 2_000_000;
        var workflowRange = Enumerable.Range(workflow_ids, boreholeRange.Count);
        var fakeWorkflows = new Faker<Workflow>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => workflow_ids++)
            .RuleFor(o => o.HasRequestedChanges, f => f.Random.Bool(.05f))
            .RuleFor(o => o.Status, f => WorkflowStatus.Draft)
            .RuleFor(o => o.BoreholeId, (f, o) => boreholeRange[o.Id - workflowRange.First()])
            .RuleFor(o => o.Borehole, f => default!)
            .RuleFor(o => o.ReviewedTabsId, (f, o) => tabStatusRange[(o.Id - workflowRange.First()) * 2])
            .RuleFor(o => o.ReviewedTabs, f => default!)
            .RuleFor(o => o.PublishedTabsId, (f, o) => o.ReviewedTabsId + 1)
            .RuleFor(o => o.PublishedTabs, f => default!)
            .RuleFor(o => o.AssigneeId, f => f.PickRandom(userRange).OrNull(f))
            .RuleFor(o => o.Assignee, f => default!)
            .RuleFor(o => o.Changes, f => new Collection<WorkflowChange>());

        Workflow SeededWorkflows(int seed) => fakeWorkflows.UseSeed(seed).Generate();
        context.BulkInsert(workflowRange.Select(SeededWorkflows).ToList(), bulkConfig);

        // Seed some workflow changes for richBoreholeRange
        var workflowChange_ids = 15_000_000;
        var workflowChangeRange = Enumerable.Range(workflowChange_ids, richBoreholeRange.Count * 3);

        var fakeWorkflowChanges = new Faker<WorkflowChange>()
            .RuleFor(o => o.Id, f => workflowChange_ids++)
            .RuleFor(o => o.Comment, f => f.Lorem.Sentence())
            .RuleFor(o => o.FromStatus, f => f.PickRandom<WorkflowStatus>())
            .RuleFor(o => o.ToStatus, (f, o) =>
            {
                // Ensure it's not the same as FromStatus
                var toStatus = f.PickRandom<WorkflowStatus>();
                while (toStatus == o.FromStatus)
                {
                    toStatus = f.PickRandom<WorkflowStatus>();
                }

                return toStatus;
            })
            .RuleFor(o => o.WorkflowId, f => f.PickRandom(richBoreholeRange) + 1_000_000)
            .RuleFor(o => o.Workflow, f => default!)
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, f => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.AssigneeId, f => f.PickRandom(userRange).OrNull(f, .3f))
            .RuleFor(o => o.Assignee, f => default!);

        WorkflowChange SeededWorkflowChanges(int seed) => fakeWorkflowChanges.UseSeed(seed).Generate();
        context.BulkInsert(workflowChangeRange.Select(SeededWorkflowChanges).ToList(), bulkConfig);

        // Seed file
        var filesUserRange = Enumerable.Range(1, 6); // Include dedicated user that only has file
        var file_ids = 5_000_000;
        var fileRange = Enumerable.Range(file_ids, 20);
        var fakefiles = new Faker<Models.File>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => file_ids++)
               .RuleFor(o => o.CreatedById, f => f.PickRandom(filesUserRange).OrNull(f, .05f))
               .RuleFor(o => o.CreatedBy, _ => default!)
               .RuleFor(o => o.UpdatedById, _ => default!)
               .RuleFor(o => o.UpdatedBy, _ => default!)
               .RuleFor(o => o.Updated, _ => default!)
               .RuleFor(o => o.Name, f => f.Random.Word())
               .RuleFor(o => o.Type, f => f.Random.Word())
               .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
               .RuleFor(o => o.NameUuid, f => null);

        Models.File Seededfiles(int seed) => fakefiles.UseSeed(seed).Generate();
        context.BulkInsert(fileRange.Select(Seededfiles).ToList(), bulkConfig);

        // Seed borehole_files
        var fakeBoreholeFiles = new Faker<Profile>()
            .StrictMode(true)
            .RuleFor(o => o.FileId, f => f.PickRandom(fileRange))
            .RuleFor(o => o.File, f => default!)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(richBoreholeRange))
            .RuleFor(o => o.Borehole, f => default!)
            .RuleFor(o => o.UserId, f => f.PickRandom(userRange))
            .RuleFor(o => o.User, f => default!)
            .RuleFor(o => o.Attached, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime().OrNull(f, .5f))
            .RuleFor(o => o.UpdatedById, (f, bf) => bf.Updated == null ? null : f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, f => default!)
            .RuleFor(o => o.CreatedById, _ => default!)
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Created, _ => default!)
            .RuleFor(o => o.Description, f => f.Random.Words().OrNull(f, .5f))
            .RuleFor(o => o.Public, f => f.Random.Bool(.9f));

        Profile SeededBoreholeFiles(int seed) => fakeBoreholeFiles.UseSeed(seed).Generate();

        var filesToInsert = richBoreholeRange
            .Select(SeededBoreholeFiles)
            .GroupBy(bf => new { bf.BoreholeId, bf.FileId })
            .Select(bf => bf.FirstOrDefault())
            .ToList();
        context.BulkInsert<Profile>(filesToInsert, bulkConfig);

        // Seed borehole_photo
        var photo_ids = 4_000_000;
        var photosRange = Enumerable.Range(photo_ids, 80);
        var fakePhotos = new Faker<Photo>()
            .StrictMode(true)
            .RuleFor(o => o.Id, _ => photo_ids++)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(richBoreholeRange))
            .RuleFor(o => o.Borehole, f => default!)
            .RuleFor(o => o.Name, f => f.Random.Word())
            .RuleFor(o => o.NameUuid, f => f.Random.Uuid().ToString())
            .RuleFor(o => o.FileType, f => f.Random.Word())
            .RuleFor(o => o.FromDepth, f => f.Random.Int(0, 100))
            .RuleFor(o => o.ToDepth, f => f.Random.Int(100, 200))
            .RuleFor(o => o.Public, f => f.Random.Bool(.9f))
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime().OrNull(f, .5f))
            .RuleFor(o => o.UpdatedById, (f, bf) => bf.Updated == null ? null : f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, f => default!)
            .RuleFor(o => o.CreatedById, _ => default!)
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Created, _ => default!);

        Photo SeededPhotos(int seed) => fakePhotos.UseSeed(seed).Generate();
        context.BulkInsert(photosRange.Select(SeededPhotos).ToList(), bulkConfig);

        // Seed documents
        var document_ids = 5_000_000;
        var documentsRange = Enumerable.Range(document_ids, 80);
        var fakeDocuments = new Faker<Document>()
            .StrictMode(true)
            .RuleFor(o => o.Id, _ => document_ids++)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(richBoreholeRange))
            .RuleFor(o => o.Borehole, f => default!)
            .RuleFor(o => o.Url, f => new Uri(f.Internet.UrlWithPath()))
            .RuleFor(o => o.Description, f => f.Random.Words().OrNull(f, .5f))
            .RuleFor(o => o.Public, f => f.Random.Bool(.9f))
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, f => default!)
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime());

        Document SeededDocuments(int seed) => fakeDocuments.UseSeed(seed).Generate();
        context.BulkInsert(documentsRange.Select(SeededDocuments).ToList(), bulkConfig);

        // Seed stratigraphy
        var stratigraphy_ids = 6_000_000;
        var stratigraphyRange = Enumerable.Range(stratigraphy_ids, boreholeRange.Count).ToList();
        var fakeStratigraphies = new Faker<Stratigraphy>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => stratigraphy_ids++)
            .RuleFor(o => o.Layers, _ => new Collection<Layer>())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange).OrNull(f, .05f))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange).OrNull(f, .05f))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.Date, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.QualityId, f => f.PickRandom(descriptionQualityIds).OrNull(f, .05f))
            .RuleFor(o => o.Quality, _ => default!)
            .RuleFor(o => o.Name, f => f.Name.FullName())
            .RuleFor(o => o.Notes, f => f.Rant.Review())
            .RuleFor(o => o.IsPrimary, f => f.Random.Bool())
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Layers, _ => default!);

        Stratigraphy Seededstratigraphys(int seed) => fakeStratigraphies.UseSeed(seed).Generate();
        context.BulkInsert(stratigraphyRange.Select(Seededstratigraphys).ToList(), bulkConfig);

        // Seed layers
        var layer_ids = 7_000_000;

        // Each ten layers should be associated with the one stratigraphy.
        int GetStratigraphyId(int currentLayerId, int startId)
        {
            return 6_000_000 + (int)Math.Floor((double)((currentLayerId - startId) / 10));
        }

        var fakelayers = new Faker<Layer>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (layer_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((layer_ids % 10) + 1) * 10)
            .RuleFor(o => o.AlterationId, f => f.PickRandom(alterationIds).OrNull(f, .6f))
            .RuleFor(o => o.Alteration, _ => default!)
            .RuleFor(o => o.CohesionId, f => f.PickRandom(cohesionIds).OrNull(f, .05f))
            .RuleFor(o => o.Cohesion, _ => default!)
            .RuleFor(o => o.CompactnessId, f => f.PickRandom(compactnessIds).OrNull(f, .05f))
            .RuleFor(o => o.Compactness, _ => default!)
            .RuleFor(o => o.ConsistanceId, f => f.PickRandom(consistencyIds).OrNull(f, .05f))
            .RuleFor(o => o.Consistance, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.GradationId, f => f.PickRandom(gradationIds).OrNull(f, .05f))
            .RuleFor(o => o.Gradation, f => default!)
            .RuleFor(o => o.GrainSize1Id, f => f.PickRandom(grainSize1Ids).OrNull(f, .05f))
            .RuleFor(o => o.GrainSize1, _ => default!)
            .RuleFor(o => o.GrainSize2Id, f => f.PickRandom(grainSize2Ids).OrNull(f, .05f))
            .RuleFor(o => o.GrainSize2, _ => default!)
            .RuleFor(o => o.HumidityId, f => f.PickRandom(humidityIds).OrNull(f, .05f))
            .RuleFor(o => o.Humidity, _ => default!)
            .RuleFor(o => o.IsLast, f => layer_ids % 10 == 9)
            .RuleFor(o => o.LithologyId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithology, _ => default!)
            .RuleFor(o => o.LithostratigraphyId, f => f.PickRandom(lithostratigraphyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithostratigraphy, _ => default!)
            .RuleFor(o => o.PlasticityId, f => f.PickRandom(plasticityIds).OrNull(f, .05f))
            .RuleFor(o => o.Plasticity, _ => default!)
            .RuleFor(o => o.DescriptionQualityId, f => f.PickRandom(descriptionQualityIds).OrNull(f, .05f))
            .RuleFor(o => o.DescriptionQuality, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyId(layer_ids, 7_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.IsStriae, f => f.Random.Bool())
            .RuleFor(o => o.IsUndefined, f => f.Random.Bool())
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.Uscs1Id, f => f.PickRandom(uscsTypeIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs1, _ => default!)
            .RuleFor(o => o.Uscs2Id, f => f.PickRandom(uscsTypeIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs2, _ => default!)
            .RuleFor(o => o.UscsDeterminationId, f => f.PickRandom(uscsDeterminationIds).OrNull(f, .05f))
            .RuleFor(o => o.UscsDetermination, _ => default!)
            .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.LithologyTopBedrock, _ => default!)
            .RuleFor(o => o.Notes, f => f.Random.Words(4).OrNull(f, .05f))
            .RuleFor(o => o.OriginalUscs, f => f.Random.Word().OrNull(f, .05f))
            .RuleFor(o => o.OriginalLithology, f => f.Random.Words(5).OrNull(f, .05f))
            .RuleFor(o => o.ColorCodelists, new Collection<Codelist>())
            .RuleFor(o => o.ColorCodelistIds, new List<int>())
            .RuleFor(o => o.LayerColorCodes, _ => new Collection<LayerColorCode>())
            .RuleFor(o => o.DebrisCodelistIds, _ => new List<int>())
            .RuleFor(o => o.DebrisCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LayerDebrisCodes, _ => new Collection<LayerDebrisCode>())
            .RuleFor(o => o.GrainShapeCodelistIds, _ => new List<int>())
            .RuleFor(o => o.GrainShapeCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LayerGrainShapeCodes, _ => new Collection<LayerGrainShapeCode>())
            .RuleFor(o => o.GrainAngularityCodelistIds, _ => new List<int>())
            .RuleFor(o => o.GrainAngularityCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LayerGrainAngularityCodes, _ => new Collection<LayerGrainAngularityCode>())
            .RuleFor(o => o.OrganicComponentCodelistIds, _ => new List<int>())
            .RuleFor(o => o.OrganicComponentCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LayerOrganicComponentCodes, _ => new Collection<LayerOrganicComponentCode>())
            .RuleFor(o => o.Uscs3CodelistIds, _ => new List<int>())
            .RuleFor(o => o.Uscs3Codelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LayerUscs3Codes, _ => new Collection<LayerUscs3Code>())
            .RuleFor(o => o.Id, f => layer_ids++);

        Layer SeededLayers(int seed) => fakelayers.UseSeed(seed).Generate();

        var layersToInsert = new List<Layer>();
        for (int i = 0; i < stratigraphyRange.Count; i++)
        {
            // Add 10 layers per stratigraphy
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);  // ints in range must be different on each loop, so that properties are not repeated in dataset.
            layersToInsert.AddRange(range.Select(SeededLayers));
        }

        context.BulkInsert(layersToInsert, bulkConfig);

        // Seed layer codelist join tables (without using Faker)
        var layerRange = Enumerable.Range(7_000_000, 20_000);

        void SeedLayerCodeRelationships<T>(IEnumerable<int> codelistIds)
            where T : class, ILayerCode, new()
        {
            var layerCodes = new List<T>();

            // Create a smaller representative sample (not all possible combinations).
            // This significantly reduces the data volume while maintaining distribution.
            var random = new Random(layerRange.Count());
            var codeListSampleSize = Math.Min(5, codelistIds.Count());

            foreach (var layerId in layerRange)
            {
                // Select a smaller subset of codes for each layer.
                // This is more realistic than assigning every code to every layer.
                var codeListSample = codelistIds
                    .OrderBy(_ => random.Next())
                    .Take(random.Next(1, codeListSampleSize + 1))
                    .ToList();

                foreach (var codeId in codeListSample)
                {
                    layerCodes.Add(new() { LayerId = layerId, CodelistId = codeId });
                }
            }

            context.BulkInsert(layerCodes, bulkConfig);
        }

        SeedLayerCodeRelationships<LayerColorCode>(colourIds);
        SeedLayerCodeRelationships<LayerDebrisCode>(debrisIds);
        SeedLayerCodeRelationships<LayerGrainShapeCode>(grainShapeIds);
        SeedLayerCodeRelationships<LayerGrainAngularityCode>(grainAngularityIds);
        SeedLayerCodeRelationships<LayerOrganicComponentCode>(organicComponentIds);
        SeedLayerCodeRelationships<LayerUscs3Code>(uscsTypeIds);

        // Seed completions
        var completion_ids = 14_000_000;
        var completionRange = Enumerable.Range(completion_ids, 500);
        var fakeCompletions = new Faker<Completion>()
            .StrictMode(true)
            .RuleFor(c => c.Instrumentations, _ => new Collection<Instrumentation>())
            .RuleFor(c => c.Casings, _ => new Collection<Casing>())
            .RuleFor(c => c.Backfills, _ => new Collection<Backfill>())
            .RuleFor(c => c.BoreholeId, f => f.PickRandom(richBoreholeRange))
            .RuleFor(c => c.Borehole, _ => default!)
            .RuleFor(c => c.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.CreatedBy, _ => default!)
            .RuleFor(c => c.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.UpdatedBy, _ => default!)
            .RuleFor(c => c.AbandonDate, f => DateOnly.FromDateTime(f.Date.Past()))
            .RuleFor(c => c.Name, f => f.Random.Word())
            .RuleFor(c => c.Notes, f => f.Lorem.Sentence())
            .RuleFor(c => c.IsPrimary, f => f.Random.Bool())
            .RuleFor(c => c.KindId, f => f.PickRandom(completionKindIds))
            .RuleFor(o => o.Kind, _ => default!)
            .RuleFor(c => c.Id, f => completion_ids++);

        Completion SeededCompletion(int seed) => fakeCompletions.UseSeed(seed).Generate();
        var completions = completionRange.Select(SeededCompletion).ToList();

        context.BulkInsert(completions, bulkConfig);

        context.SaveChanges();

        // Seed Casing
        var casing_ids = 17_000_000;
        var fakeCasing = new Faker<Casing>()
            .RuleFor(c => c.CompletionId, f => f.PickRandom(completions.Select(c => c.Id)))
            .RuleFor(c => c.Completion, _ => default!)
            .RuleFor(c => c.Name, f => f.Random.Word())
            .RuleFor(c => c.DateFinish, f => DateOnly.FromDateTime(f.Date.Past()))
            .RuleFor(c => c.DateStart, f => DateOnly.FromDateTime(f.Date.Past()))
            .RuleFor(c => c.Notes, f => f.Random.Words(4))
            .RuleFor(c => c.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.CreatedBy, _ => default!)
            .RuleFor(c => c.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.UpdatedBy, _ => default!)
            .RuleFor(c => c.Id, f => casing_ids++);

        Casing SeededCasing(Completion completion)
        {
            return fakeCasing
                .UseSeed(completion.Id)
                .Generate();
        }

        var casings = completions.Select(c => SeededCasing(c)).ToList();

        context.BulkInsert(casings, bulkConfig);

        context.SaveChanges();

        // Seed Casing elements
        var casingElement_ids = 18_000_000;
        var casingElementRange = Enumerable.Range(casingElement_ids, 1000).ToList();
        var fakeCasingElement = new Faker<CasingElement>()
            .RuleFor(c => c.CasingId, f => f.PickRandom(casings.Select(c => c.Id)))
            .RuleFor(c => c.Casing, _ => default!)
            .RuleFor(c => c.FromDepth, f => (casing_ids % 10) * 10)
            .RuleFor(c => c.ToDepth, f => ((casing_ids % 10) + 1) * 10)
            .RuleFor(c => c.KindId, f => f.PickRandom(casingKindIds))
            .RuleFor(c => c.Kind, _ => default!)
            .RuleFor(c => c.MaterialId, f => f.PickRandom(casingMaterialIds))
            .RuleFor(c => c.Material, _ => default!)
            .RuleFor(c => c.InnerDiameter, f => f.Random.Double(0, 15))
            .RuleFor(c => c.OuterDiameter, f => f.Random.Double(0, 20))
            .RuleFor(c => c.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.CreatedBy, _ => default!)
            .RuleFor(c => c.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(c => c.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(c => c.UpdatedBy, _ => default!)
            .RuleFor(c => c.Id, f => casingElement_ids++);

        CasingElement SeededCasingElements(int seed) => fakeCasingElement.UseSeed(seed).Generate();
        context.BulkInsert(casingElementRange.Select(SeededCasingElements).ToList(), bulkConfig);

        context.SaveChanges();

        // Seed Instrumentation
        var instrumentation_ids = 15_000_000;
        var fakeInstrumentation = new Faker<Instrumentation>()
            .RuleFor(i => i.CompletionId, f => f.PickRandom(completions.Select(c => c.Id)))
            .RuleFor(i => i.Completion, _ => default!)
            .RuleFor(i => i.FromDepth, f => (instrumentation_ids % 10) * 10)
            .RuleFor(i => i.ToDepth, f => ((instrumentation_ids % 10) + 1) * 10)
            .RuleFor(i => i.Name, f => f.Vehicle.Model())
            .RuleFor(i => i.KindId, f => f.PickRandom(instrumentKindIds))
            .RuleFor(i => i.Kind, _ => default!)
            .RuleFor(i => i.StatusId, f => f.PickRandom(instrumentStatusIds))
            .RuleFor(i => i.Status, _ => default!)
            .RuleFor(i => i.Notes, f => f.Random.Words(4))
            .RuleFor(i => i.CasingId, (f, o) =>
            {
                var validCasings = casings.Where(c => c.CompletionId == o.CompletionId).ToList();
                return validCasings.Count == 0 ? null : f.PickRandom(validCasings.Select(c => c.Id));
            })
            .RuleFor(i => i.Casing, _ => default!)
            .RuleFor(i => i.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(i => i.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(i => i.CreatedBy, _ => default!)
            .RuleFor(i => i.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(i => i.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(i => i.UpdatedBy, _ => default!)
            .RuleFor(i => i.Id, f => instrumentation_ids++);

        Instrumentation SeededInstrumentation(Completion completion)
        {
            return fakeInstrumentation
                .UseSeed(completion.Id)
                .Generate();
        }

        var instrumentations = completions.Select(c => SeededInstrumentation(c)).ToList();

        context.BulkInsert(instrumentations, bulkConfig);

        context.SaveChanges();

        // Seed Backfill
        var backfill_ids = 16_000_000;
        var fakeBackfill = new Faker<Backfill>()
            .RuleFor(b => b.CompletionId, f => f.PickRandom(completions.Select(c => c.Id)))
            .RuleFor(b => b.Completion, _ => default!)
            .RuleFor(b => b.FromDepth, f => (backfill_ids % 10) * 10)
            .RuleFor(b => b.ToDepth, f => ((backfill_ids % 10) + 1) * 10)
            .RuleFor(b => b.KindId, f => f.PickRandom(backfillKindIds))
            .RuleFor(b => b.Kind, _ => default!)
            .RuleFor(b => b.MaterialId, f => f.PickRandom(backfillMaterialIds))
            .RuleFor(b => b.Material, _ => default!)
            .RuleFor(i => i.Notes, f => f.Random.Words(4))
            .RuleFor(i => i.CasingId, (f, o) =>
            {
                var validCasings = casings.Where(c => c.CompletionId == o.CompletionId).ToList();
                return validCasings.Count == 0 ? null : f.PickRandom(validCasings.Select(c => c.Id));
            })
            .RuleFor(i => i.Casing, _ => default!)
            .RuleFor(i => i.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(i => i.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(i => i.CreatedBy, _ => default!)
            .RuleFor(i => i.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(i => i.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(i => i.UpdatedBy, _ => default!)
            .RuleFor(i => i.Id, f => backfill_ids++);

        Backfill SeededBackfill(Completion completion)
        {
            return fakeBackfill
                .UseSeed(completion.Id)
                .Generate();
        }

        var backfills = completions.Select(c => SeededBackfill(c)).ToList();

        context.BulkInsert(backfills, bulkConfig);

        context.SaveChanges();

        // Seed observations
        var observation_ids = 12_000_000;
        var observationRange = Enumerable.Range(observation_ids, 500);
        var fakeObservations = new Faker<Observation>()
            .StrictMode(true)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(richBoreholeRange))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.StartTime, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.EndTime, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.Duration, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.FromDepthM, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.ToDepthM, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.FromDepthMasl, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.ToDepthMasl, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.IsOpenBorehole, f => f.Random.Bool())
            .RuleFor(o => o.Comment, f => f.Lorem.Sentence())
            .RuleFor(o => o.ReliabilityId, f => f.PickRandom(waterIngressReliabilityIds))
            .RuleFor(o => o.Reliability, _ => default!)
            .RuleFor(o => o.Type, f => f.PickRandom<ObservationType>())
            .RuleFor(i => i.CasingId, (f, o) =>
            {
                var completion = f.PickRandom(completions.Where(c => c.BoreholeId == o.BoreholeId));
                var validCasings = casings.Where(c => c.CompletionId == completion.Id).ToList();
                return validCasings.Count == 0 ? null : f.PickRandom(validCasings.Select(c => c.Id));
            })
            .RuleFor(i => i.Casing, _ => default!)
            .RuleFor(o => o.Id, f => observation_ids++)
            .RuleFor(o => o.OriginalVerticalReferenceSystem, f => f.PickRandom(VerticalReferenceSystem.Unknown, VerticalReferenceSystem.MD, VerticalReferenceSystem.Masl));

        Observation SeededObservations(int seed) => fakeObservations.UseSeed(seed).Generate();
        var observations = observationRange.Select(SeededObservations).ToList();

        // Seed water ingresses
        var fakeWaterIngresses = new Faker<WaterIngress>()
            .RuleFor(o => o.QuantityId, f => f.PickRandom(waterIngressQuantityIds))
            .RuleFor(o => o.Quantity, _ => default!)
            .RuleFor(o => o.ConditionsId, f => f.PickRandom(waterIngressConditionsIds))
            .RuleFor(o => o.Conditions, _ => default!);

        WaterIngress SeededWaterIngresses(Observation observation)
        {
            return fakeWaterIngresses
                .UseSeed(observation.Id)
                .RuleFor(o => o.Id, _ => observation.Id)
                .Generate();
        }

        var waterIngresses = observations.Where(o => o.Type == ObservationType.WaterIngress).Select(observation => SeededWaterIngresses(observation)).ToList();

        // Seed hydrotests
        var fakeHydrotests = new Faker<Hydrotest>();

        Hydrotest SeededHydrotests(Observation observation)
        {
            return fakeHydrotests
                .UseSeed(observation.Id)
                .RuleFor(o => o.Id, _ => observation.Id)
                .Generate();
        }

        var hydrotests = observations.Where(o => o.Type == ObservationType.Hydrotest).Select(observation => SeededHydrotests(observation)).ToList();

        context.BulkInsert(observations, bulkConfig);
        context.BulkInsert(waterIngresses, bulkConfig);
        context.BulkInsert(hydrotests, bulkConfig);

        // Seed hydrotest results
        var hydrotestResult_ids = 13_000_000;
        var hydrotestResultRange = Enumerable.Range(hydrotestResult_ids, 1000).ToList();
        var fakeHydrotestResults = new Faker<HydrotestResult>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => hydrotestResult_ids++)
            .RuleFor(o => o.ParameterId, f => f.PickRandom(hydrotestResultParameterIds))
            .RuleFor(o => o.Parameter, _ => default!)
            .RuleFor(o => o.Value, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.MinValue, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.MaxValue, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.HydrotestId, f => f.PickRandom(hydrotests.Select(h => h.Id)))
            .RuleFor(o => o.Hydrotest, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!);

        HydrotestResult SeededHydrotestResults(int seed) => fakeHydrotestResults.UseSeed(seed).Generate();
        context.BulkInsert(hydrotestResultRange.Select(SeededHydrotestResults).ToList(), bulkConfig);

        // Seed groundwater level measurements
        var fakeGroundwaterLevelMeasurements = new Faker<GroundwaterLevelMeasurement>()
            .RuleFor(o => o.KindId, f => f.PickRandom(groundwaterLevelMeasurementKindIds))
            .RuleFor(o => o.Kind, _ => default!)
            .RuleFor(o => o.LevelM, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.LevelMasl, f => f.Random.Double(1, 5000));

        GroundwaterLevelMeasurement SeededGroundwaterLevelMeasurements(Observation observation)
        {
            return fakeGroundwaterLevelMeasurements
                .UseSeed(observation.Id)
                .RuleFor(o => o.Id, _ => observation.Id)
                .Generate();
        }

        var groundwaterLevelMeasurements = observations.Where(o => o.Type == ObservationType.GroundwaterLevelMeasurement).Select(observation => SeededGroundwaterLevelMeasurements(observation)).ToList();

        context.BulkInsert(groundwaterLevelMeasurements, bulkConfig);

        // Seed field measurements
        var fakeFieldMeasurement = new Faker<FieldMeasurement>();

        FieldMeasurement SeededFieldMeasurements(Observation observation)
        {
            return fakeFieldMeasurement
                .UseSeed(observation.Id)
                .RuleFor(o => o.Id, _ => observation.Id)
                .Generate();
        }

        var fieldMeasurements = observations.Where(o => o.Type == ObservationType.FieldMeasurement).Select(observation => SeededFieldMeasurements(observation)).ToList();

        context.BulkInsert(fieldMeasurements, bulkConfig);

        // Seed field measurement results
        var fieldMeasurementResult_ids = 14_000_000;
        var fieldMeasurementResultRange = Enumerable.Range(fieldMeasurementResult_ids, 1000).ToList();
        var fakeFieldMeasurementResults = new Faker<FieldMeasurementResult>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => fieldMeasurementResult_ids++)
            .RuleFor(o => o.FieldMeasurementId, f => f.PickRandom(fieldMeasurements.Select(h => h.Id)))
            .RuleFor(o => o.FieldMeasurement, _ => default!)
            .RuleFor(o => o.SampleTypeId, f => f.PickRandom(fieldMeasurementSampleTypeIds))
            .RuleFor(o => o.SampleType, _ => default!)
            .RuleFor(o => o.ParameterId, f => f.PickRandom(fieldMeasurementParameterIds))
            .RuleFor(o => o.Parameter, _ => default!)
            .RuleFor(o => o.Value, f => f.Random.Double(1, 5000))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!);

        FieldMeasurementResult SeededFieldMeasurementResults(int seed) => fakeFieldMeasurementResults.UseSeed(seed).Generate();
        context.BulkInsert(fieldMeasurementResultRange.Select(SeededFieldMeasurementResults).ToList(), bulkConfig);

        context.SaveChanges();

        // Seed sections
        var section_ids = 19_000_000;
        var sectionRange = Enumerable.Range(section_ids, 500).ToList();
        var fakeSections = new Faker<Section>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => section_ids++)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(richBoreholeRange.Take(sectionRange.Count)))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Name, f => f.Random.Word())
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.SectionElements, _ => default!);

        Section SeededSection(int seed) => fakeSections.UseSeed(seed).Generate();
        var sections = sectionRange.Select(SeededSection).ToList();

        // Seed section elements
        var sectionElement_ids = 20_000_000;
        var fakeSectionElements = new Faker<SectionElement>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => sectionElement_ids++)
            .RuleFor(o => o.SectionId, f => f.PickRandom(sectionRange))
            .RuleFor(o => o.Section, _ => default!)
            .RuleFor(o => o.FromDepth, f => f.Random.Int(0, 99))
            .RuleFor(o => o.ToDepth, f => f.Random.Int(100, 199))
            .RuleFor(o => o.Order, f => f.Random.Int(0, 99))
            .RuleFor(o => o.DrillingMethodId, f => f.PickRandom(drillingMethodIds).OrNull(f, .2f))
            .RuleFor(o => o.DrillingMethod, _ => default!)
            .RuleFor(o => o.DrillingStartDate, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .2f))
            .RuleFor(o => o.DrillingEndDate, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .2f))
            .RuleFor(o => o.CuttingsId, f => f.PickRandom(cuttingsIds).OrNull(f, .2f))
            .RuleFor(o => o.Cuttings, _ => default!)
            .RuleFor(o => o.DrillingDiameter, f => f.Random.Double(0, 20).OrNull(f, .2f))
            .RuleFor(o => o.DrillingCoreDiameter, f => f.Random.Double(0, 20).OrNull(f, .2f))
            .RuleFor(o => o.DrillingMudTypeId, f => f.PickRandom(drillingMudTypeIds).OrNull(f, .2f))
            .RuleFor(o => o.DrillingMudType, _ => default!)
            .RuleFor(o => o.DrillingMudSubtypeId, f => f.PickRandom(drillingMudTypeIds).OrNull(f, .2f))
            .RuleFor(o => o.DrillingMudSubtype, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!);

        SectionElement SeededSectionElement(int sectionId, int order) =>
            fakeSectionElements
                .UseSeed(sectionElement_ids)
                .RuleFor(o => o.SectionId, _ => sectionId)
                .RuleFor(o => o.Order, _ => order)
                .Generate();

        var sectionElementsToInsert = new List<SectionElement>((sectionRange.Count * 2) + 2);
        foreach (var sectionId in sectionRange)
        {
            // Add 1, 2 or 3 section elements per section.
            var sectionElements = (sectionId % 3) + 1;
            for (int i = 0; i < sectionElements; i++)
            {
                sectionElementsToInsert.Add(SeededSectionElement(sectionId, i));
            }
        }

        context.BulkInsert(sections, bulkConfig);
        context.BulkInsert(sectionElementsToInsert, bulkConfig);
        context.SaveChanges();

        // Seed borehole geometries
        var boreholeGeometry_ids = 21_000_000;
        var geometryElementsToInsert = new List<BoreholeGeometryElement>(richBoreholeRange.Count * 100);
        var pointCountPerBorehole = 50;
        foreach (var boreholeId in richBoreholeRange)
        {
            // Generate a random arced geometry
            Random r = new Random(boreholeId);
            var inc = (r.NextDouble() * Math.PI / 4) + (Math.PI / 4);
            var azi = r.NextDouble() * 2 * Math.PI;
            var radius = (r.NextDouble() * 1000) + 2000;
            var makeAziIncNull = r.NextDouble() < 0.5;

            // First point is at the borehole location (0, 0, 0)
            geometryElementsToInsert.Add(new BoreholeGeometryElement { Id = boreholeGeometry_ids++, BoreholeId = boreholeId, X = 0, Y = 0, Z = 0 });

            for (int i = 1; i < pointCountPerBorehole; i++)
            {
                var currentInc = inc * i / (pointCountPerBorehole - 1);
                var currentAzi = azi + ((Math.PI / 4) * i / (pointCountPerBorehole - 1));
                geometryElementsToInsert.Add(new BoreholeGeometryElement
                {
                    Id = boreholeGeometry_ids++,
                    BoreholeId = boreholeId,
                    X = radius * Math.Cos(currentAzi) * (1 - Math.Cos(currentInc)),
                    Y = radius * Math.Sin(currentAzi) * (Math.Cos(currentInc) - 1),
                    Z = radius * Math.Sin(currentInc),
                    MD = radius * Math.PI * currentInc,
                    HAZI = makeAziIncNull ? null : currentAzi,
                    DEVI = makeAziIncNull ? null : currentInc,
                });
            }
        }

        context.BulkInsert(geometryElementsToInsert, bulkConfig);
        context.SaveChanges();

        // Seed stratigraphyV2
        var stratigraphyV2_ids = 6_000_000;
        var stratigraphyV2Range = Enumerable.Range(stratigraphyV2_ids, boreholeRange.Count).ToList();
        var fakeStratigraphiesV2 = new Faker<StratigraphyV2>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => stratigraphyV2_ids++)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Name, f => f.Name.FullName())
            .RuleFor(o => o.Date, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.IsPrimary, _ => false)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange).OrNull(f, .05f))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Lithologies, _ => new Collection<Lithology>())
            .RuleFor(o => o.LithologicalDescriptions, _ => new Collection<LithologicalDescription>())
            .RuleFor(o => o.FaciesDescriptions, _ => new Collection<FaciesDescription>())
            .RuleFor(o => o.LithostratigraphyLayers, _ => new Collection<LithostratigraphyLayer>())
            .RuleFor(o => o.ChronostratigraphyLayers, _ => new Collection<ChronostratigraphyLayer>());

        StratigraphyV2 SeededStratigraphysV2(int seed) => fakeStratigraphiesV2.UseSeed(seed).Generate();
        var stratigraphiesV2 = stratigraphyV2Range.Select(SeededStratigraphysV2).ToList();

        // Group by BoreholeId and set exactly one IsPrimary = true per borehole
        var stratigraphiesByBorehole = stratigraphiesV2.GroupBy(s => s.BoreholeId);
        foreach (var group in stratigraphiesByBorehole)
        {
            var toSetPrimary = group.FirstOrDefault();
            if (toSetPrimary != null)
            {
                toSetPrimary.IsPrimary = true;
            }
        }

        context.BulkInsert(stratigraphiesByBorehole.SelectMany(g => g), bulkConfig);

        // Each ten layers should be associated with the one stratigraphy.
        int GetStratigraphyV2Id(int currentLayerId, int startId)
        {
            return 6_000_000 + (int)Math.Floor((double)((currentLayerId - startId) / 10));
        }

        // Seed a mix of consolidated and unconsolidated lithologies
        var lithology_ids = 23_000_000;
        var fakeLithologies = new Faker<Lithology>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => lithology_ids++)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyV2Id(lithology_ids, 23_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.FromDepth, f => (lithology_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((lithology_ids % 10) + 1) * 10)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Notes, f => f.Lorem.Sentence().OrNull(f, .3f))
            .RuleFor(o => o.IsUnconsolidated, f => lithology_ids % 3 != 0)
            .RuleFor(o => o.HasBedding, (f, l) => f.Random.Bool(.2f))
            .RuleFor(o => o.Share, (f, l) => l.HasBedding ? f.Random.Int(1, 100) : null)
            .RuleFor(o => o.AlterationDegreeId, f => f.PickRandom(alterationDegreeIds).OrNull(f, .3f))
            .RuleFor(o => o.AlterationDegree, _ => default!)
            .RuleFor(o => o.LithologyDescriptions, _ => new List<LithologyDescription>())
            .RuleFor(o => o.CompactnessId, _ => null)
            .RuleFor(o => o.Compactness, _ => default!)
            .RuleFor(o => o.CohesionId, _ => null)
            .RuleFor(o => o.Cohesion, _ => default!)
            .RuleFor(o => o.HumidityId, _ => null)
            .RuleFor(o => o.Humidity, _ => default!)
            .RuleFor(o => o.ConsistencyId, _ => null)
            .RuleFor(o => o.Consistency, _ => default!)
            .RuleFor(o => o.PlasticityId, _ => null)
            .RuleFor(o => o.Plasticity, _ => default!)
            .RuleFor(o => o.UscsDeterminationId, _ => null)
            .RuleFor(o => o.UscsDetermination, _ => default!)
            .RuleFor(o => o.UscsTypeCodelistIds, _ => new List<int>())
            .RuleFor(o => o.UscsTypeCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyUscsTypeCodes, _ => new List<LithologyUscsTypeCodes>())
            .RuleFor(o => o.RockConditionCodelistIds, _ => new List<int>())
            .RuleFor(o => o.RockConditionCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyRockConditionCodes, _ => new List<LithologyRockConditionCodes>())
            .RuleFor(o => o.TextureMetaCodelistIds, _ => new List<int>())
            .RuleFor(o => o.TextureMetaCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyTextureMetaCodes, _ => new List<LithologyTextureMetaCodes>());

        Lithology SeededLithologies(int seed) => fakeLithologies.UseSeed(seed).Generate();

        var lithologiesToInsert = new List<Lithology>();
        var random = new Random(42);
        for (int i = 0; i < stratigraphyV2Range.Count - 1; i++)
        {
            int switchIndex = random.Next(0, 10); // Pick a new switchIndex for each stratigraphy
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
            int localIndex = 0;
            foreach (var seed in range)
            {
                var lithology = SeededLithologies(seed);
                lithology.IsUnconsolidated = localIndex < switchIndex;

                if (lithology.IsUnconsolidated)
                {
                    lithology.CompactnessId = random.NextDouble() < 0.2 ? null : compactnessIds[random.Next(compactnessIds.Count)];
                    lithology.CohesionId = random.NextDouble() < 0.2 ? null : cohesionIds[random.Next(cohesionIds.Count)];
                    lithology.HumidityId = random.NextDouble() < 0.2 ? null : humidityIds[random.Next(humidityIds.Count)];
                    lithology.ConsistencyId = random.NextDouble() < 0.2 ? null : consistencyIds[random.Next(consistencyIds.Count)];
                    lithology.PlasticityId = random.NextDouble() < 0.2 ? null : plasticityIds[random.Next(plasticityIds.Count)];
                    lithology.UscsDeterminationId = random.NextDouble() < 0.2 ? null : uscsDeterminationIds[random.Next(uscsDeterminationIds.Count)];
                }

                lithologiesToInsert.Add(lithology);
                localIndex++;
            }
        }

        context.BulkInsert(lithologiesToInsert, bulkConfig);

        // Seed lithology codelist join tables (without using Faker)
        var lithologyRange = Enumerable.Range(23_000_000, 20_000);

        void SeedLithologyCodeRelationships<T>(IEnumerable<int> codelistIds)
            where T : class, ILithologyCode, new()
        {
            var lithologyCodes = new List<T>();

            // Create a smaller representative sample (not all possible combinations).
            // This significantly reduces the data volume while maintaining distribution.
            var random = new Random(lithologyRange.Count());
            var codeListSampleSize = Math.Min(5, codelistIds.Count());

            foreach (var lithologyId in lithologyRange)
            {
                // Select a smaller subset of codes for each lithology.
                // This is more realistic than assigning every code to every lithology.
                var codeListSample = codelistIds
                    .OrderBy(_ => random.Next())
                    .Take(random.Next(1, codeListSampleSize + 1))
                    .ToList();

                foreach (var codeId in codeListSample)
                {
                    lithologyCodes.Add(new() { LithologyId = lithologyId, CodelistId = codeId });
                }
            }

            context.BulkInsert(lithologyCodes, bulkConfig);
        }

        SeedLithologyCodeRelationships<LithologyRockConditionCodes>(rockConditionIds);
        SeedLithologyCodeRelationships<LithologyUscsTypeCodes>(uscsTypeIds);
        SeedLithologyCodeRelationships<LithologyTextureMetaCodes>(textureMetaIds);

        // Seed LithologyDescriptions
        var lithologyDescription_ids = 23_500_000;
        var lithologyDescriptionsToInsert = new List<LithologyDescription>();

        var fakeLithologyDescriptions = new Faker<LithologyDescription>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => lithologyDescription_ids++)
            .RuleFor(o => o.LithologyId, f => lithologiesToInsert[f.IndexFaker % lithologiesToInsert.Count].Id)
            .RuleFor(o => o.Lithology, (f, ld) => lithologiesToInsert.FirstOrDefault(l => l.Id == ld.LithologyId)).RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.IsFirst, f => true)
            .RuleFor(o => o.ColorPrimaryId, f => f.PickRandom(colorIds).OrNull(f, .2f))
            .RuleFor(o => o.ColorPrimary, _ => default!)
            .RuleFor(o => o.ColorSecondaryId, f => f.PickRandom(colorIds).OrNull(f, .3f))
            .RuleFor(o => o.ColorSecondary, _ => default!)
            .RuleFor(o => o.LithologyUnconMainId, _ => null)
            .RuleFor(o => o.LithologyUnconMain, _ => default!)
            .RuleFor(o => o.LithologyUncon2Id, _ => null)
            .RuleFor(o => o.LithologyUncon2, _ => default!)
            .RuleFor(o => o.LithologyUncon3Id, _ => null)
            .RuleFor(o => o.LithologyUncon3, _ => default!)
            .RuleFor(o => o.LithologyUncon4Id, _ => null)
            .RuleFor(o => o.LithologyUncon4, _ => default!)
            .RuleFor(o => o.LithologyUncon5Id, _ => null)
            .RuleFor(o => o.LithologyUncon5, _ => default!)
            .RuleFor(o => o.LithologyUncon6Id, _ => null)
            .RuleFor(o => o.LithologyUncon6, _ => default!)
            .RuleFor(o => o.HasStriae, f => f.Random.Bool())
            .RuleFor(o => o.ComponentUnconOrganicCodelistIds, _ => new List<int>())
            .RuleFor(o => o.ComponentUnconOrganicCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.ComponentUnconDebrisCodelistIds, _ => new List<int>())
            .RuleFor(o => o.ComponentUnconDebrisCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.GrainShapeCodelistIds, _ => new List<int>())
            .RuleFor(o => o.GrainShapeCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.GrainAngularityCodelistIds, _ => new List<int>())
            .RuleFor(o => o.GrainAngularityCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyUnconDebrisCodelistIds, _ => new List<int>())
            .RuleFor(o => o.LithologyUnconDebrisCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyConId, (f, ld) => !ld.Lithology.IsUnconsolidated ? f.PickRandom(lithologyConIds) : null)
            .RuleFor(o => o.LithologyCon, _ => default!)
            .RuleFor(o => o.GrainSizeId, (f, ld) => !ld.Lithology.IsUnconsolidated ? f.PickRandom(grainSizeIds).OrNull(f, .2f) : null)
            .RuleFor(o => o.GrainSize, _ => default!)
            .RuleFor(o => o.GrainAngularityId, (f, ld) => !ld.Lithology.IsUnconsolidated ? f.PickRandom(grainAngularityIds).OrNull(f, .2f) : null)
            .RuleFor(o => o.GrainAngularity, _ => default!)
            .RuleFor(o => o.GradationId, (f, ld) => !ld.Lithology.IsUnconsolidated ? f.PickRandom(gradationIds).OrNull(f, .2f) : null)
            .RuleFor(o => o.Gradation, _ => default!)
            .RuleFor(o => o.CementationId, (f, ld) => !ld.Lithology.IsUnconsolidated ? f.PickRandom(cementationIds).OrNull(f, .2f) : null)
            .RuleFor(o => o.Cementation, _ => default!)
            .RuleFor(o => o.ComponentConParticleCodelistIds, _ => new List<int>())
            .RuleFor(o => o.ComponentConParticleCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.ComponentConMineralCodelistIds, _ => new List<int>())
            .RuleFor(o => o.ComponentConMineralCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.StructureSynGenCodelistIds, _ => new List<int>())
            .RuleFor(o => o.StructureSynGenCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.StructurePostGenCodelistIds, _ => new List<int>())
            .RuleFor(o => o.StructurePostGenCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LithologyDescriptionComponentConParticleCodes, _ => new List<LithologyDescriptionComponentConParticleCodes>())
            .RuleFor(o => o.LithologyDescriptionComponentConMineralCodes, _ => new List<LithologyDescriptionComponentConMineralCodes>())
            .RuleFor(o => o.LithologyDescriptionStructureSynGenCodes, _ => new List<LithologyDescriptionStructureSynGenCodes>())
            .RuleFor(o => o.LithologyDescriptionStructurePostGenCodes, _ => new List<LithologyDescriptionStructurePostGenCodes>())
            .RuleFor(o => o.LithologyDescriptionComponentUnconOrganicCodes, _ => new List<LithologyDescriptionComponentUnconOrganicCodes>())
            .RuleFor(o => o.LithologyDescriptionComponentUnconDebrisCodes, _ => new List<LithologyDescriptionComponentUnconDebrisCodes>())
            .RuleFor(o => o.LithologyDescriptionGrainShapeCodes, _ => new List<LithologyDescriptionGrainShapeCodes>())
            .RuleFor(o => o.LithologyDescriptionGrainAngularityCodes, _ => new List<LithologyDescriptionGrainAngularityCodes>())
            .RuleFor(o => o.LithologyDescriptionLithologyUnconDebrisCodes, _ => new List<LithologyDescriptionLithologyUnconDebrisCodes>());

        void SetUnconsolidatedIds(
            int i,
            dynamic description,
            int seedOffset = 0)
        {
            int maxFractions = 6;
            int numSet = 1 + new Random(i + seedOffset + 12345).Next(maxFractions); // 1 to 6

            int? mainId = null;
            int?[] secondaryIds = new int?[5];

            if (lithologyUnconMainIds.Count > 0)
            {
                mainId = lithologyUnconMainIds[new Random(i + seedOffset + 1).Next(lithologyUnconMainIds.Count)];
            }

            for (int j = 0; j < 5; j++)
            {
                if (lithologyUnconSecondaryIds.Count > 0)
                {
                    secondaryIds[j] = lithologyUnconSecondaryIds[new Random(i + seedOffset + 100 + j).Next(lithologyUnconSecondaryIds.Count)];
                }
            }

            description.LithologyUnconMainId = mainId;
            description.LithologyUncon2Id = numSet >= 2 ? secondaryIds[0] : null;
            description.LithologyUncon3Id = numSet >= 3 ? secondaryIds[1] : null;
            description.LithologyUncon4Id = numSet >= 4 ? secondaryIds[2] : null;
            description.LithologyUncon5Id = numSet >= 5 ? secondaryIds[3] : null;
            description.LithologyUncon6Id = numSet >= 6 ? secondaryIds[4] : null;
        }

        // Generate lithology descriptions
        // First create one description for each lithology
        for (int i = 0; i < lithologiesToInsert.Count; i++)
        {
            var lithology = lithologiesToInsert[i];
            var description = fakeLithologyDescriptions.UseSeed(i).Generate();
            description.LithologyId = lithology.Id;
            description.IsFirst = true;

            if (lithology.IsUnconsolidated)
            {
                SetUnconsolidatedIds(i, description);
            }

            lithologyDescriptionsToInsert.Add(description);

            if (lithology.HasBedding)
            {
                var secondDescription = fakeLithologyDescriptions.UseSeed(i + 10000).Generate();
                secondDescription.LithologyId = lithology.Id;
                secondDescription.IsFirst = false;

                if (lithology.IsUnconsolidated)
                {
                    SetUnconsolidatedIds(i, secondDescription, 10000);
                }

                lithologyDescriptionsToInsert.Add(secondDescription);
            }
        }

        context.BulkInsert(lithologyDescriptionsToInsert, bulkConfig);

        // Seed lithology description codelist join tables (without using Faker)
        var lithologyDescriptionRange = Enumerable.Range(23_500_000, 20_000);

        void SeedLithologyDescriptionCodeRelationships<T>(IEnumerable<int> codelistIds)
            where T : class, ILithologyDescriptionCode, new()
        {
            var lithologyDescriptionCodes = new List<T>();

            // Create a smaller representative sample (not all possible combinations).
            // This significantly reduces the data volume while maintaining distribution.
            var random = new Random(lithologyDescriptionRange.Count());
            var codeListSampleSize = Math.Min(5, codelistIds.Count());

            foreach (var lithologyDescriptionId in lithologyDescriptionRange)
            {
                // Select a smaller subset of codes for each lithology description.
                // This is more realistic than assigning every code to every lithology description.
                var codeListSample = codelistIds
                    .OrderBy(_ => random.Next())
                    .Take(random.Next(1, codeListSampleSize + 1))
                    .ToList();

                foreach (var codeId in codeListSample)
                {
                    lithologyDescriptionCodes.Add(new() { LithologyDescriptionId = lithologyDescriptionId, CodelistId = codeId });
                }
            }

            context.BulkInsert(lithologyDescriptionCodes, bulkConfig);
        }

        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionComponentUnconOrganicCodes>(componentUnconOrganicIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionComponentUnconDebrisCodes>(componentUnconDebrisIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionGrainShapeCodes>(grainShapeIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionGrainAngularityCodes>(grainAngularityIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionLithologyUnconDebrisCodes>(lithologyConIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionComponentConParticleCodes>(componentConParticleIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionComponentConMineralCodes>(componentConMineralIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionStructurePostGenCodes>(structurePostGenIds);
        SeedLithologyDescriptionCodeRelationships<LithologyDescriptionStructureSynGenCodes>(structureSynGenIds);

        // Seed lithologicalDescriptions
        var lithologicalDescription_ids = 9_000_000;
        var fakelithologicalDescriptions = new Faker<LithologicalDescription>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (lithologicalDescription_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((lithologicalDescription_ids % 10) + 1) * 10)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyV2Id(lithologicalDescription_ids, 9_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Description, f => f.Random.Words(3).OrNull(f, .05f))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Id, f => lithologicalDescription_ids++);

        LithologicalDescription SeededLithologicalDescriptions(int seed) => fakelithologicalDescriptions.UseSeed(seed).Generate();
        var lithologicalDescriptionsToInsert = new List<LithologicalDescription>();
        for (int i = 0; i < stratigraphyV2Range.Count - 1; i++)
        {
            // Add 10 lithological descriptions per stratigraphy
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);  // ints in range must be different on each loop, so that properties are not repeated in dataset.
            lithologicalDescriptionsToInsert.AddRange(range.Select(SeededLithologicalDescriptions));
        }

        context.BulkInsert(lithologicalDescriptionsToInsert, bulkConfig);

        // Seed faciesDescriptions
        var faciesDescription_ids = 10_000_000;
        var fakeFaciesDescriptions = new Faker<FaciesDescription>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (faciesDescription_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((faciesDescription_ids % 10) + 1) * 10)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyV2Id(faciesDescription_ids, 10_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.FaciesId, f => f.PickRandom(faciesConIds).OrNull(f, .3f))
            .RuleFor(o => o.Facies, _ => default!)
            .RuleFor(o => o.Description, f => f.Random.Words(3).OrNull(f, .05f))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Id, f => faciesDescription_ids++);

        FaciesDescription SeededFaciesDescriptions(int seed) => fakeFaciesDescriptions.UseSeed(seed).Generate();

        var faciesDescriptionsToInsert = new List<FaciesDescription>();
        for (int i = 0; i < stratigraphyV2Range.Count - 1; i++)
        {
            // Add 10 facies descriptions per stratigraphy
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);  // ints in range must be different on each loop, so that properties are not repeated in dataset.
            faciesDescriptionsToInsert.AddRange(range.Select(SeededFaciesDescriptions));
        }

        context.BulkInsert(faciesDescriptionsToInsert, bulkConfig);

        // Seed chronostratigraphy
        var chronostratigraphy_ids = 11_000_000;
        var fakeChronostratigraphies = new Faker<ChronostratigraphyLayer>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (chronostratigraphy_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((chronostratigraphy_ids % 10) + 1) * 10)
            .RuleFor(o => o.ChronostratigraphyId, f => f.PickRandom(chronostratigraphyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Chronostratigraphy, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyV2Id(chronostratigraphy_ids, 11_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Id, f => chronostratigraphy_ids++);

        ChronostratigraphyLayer SeededChronostratigraphies(int seed) => fakeChronostratigraphies.UseSeed(seed).Generate();

        var chronostratigraphiesToInsert = new List<ChronostratigraphyLayer>(stratigraphyV2Range.Count * 10);
        for (int i = 0; i < stratigraphyV2Range.Count; i++)
        {
            // Add 10 chronostratigraphies per stratigraphy.
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
            chronostratigraphiesToInsert.AddRange(range.Select(SeededChronostratigraphies));
        }

        context.BulkInsert(chronostratigraphiesToInsert, bulkConfig);

        // Seed lithostratigraphy
        var lithostratigraphy_ids = 14_000_000;
        var fakeLithostratigraphies = new Faker<LithostratigraphyLayer>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (lithostratigraphy_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((lithostratigraphy_ids % 10) + 1) * 10)
            .RuleFor(o => o.LithostratigraphyId, f => f.PickRandom(lithostratigraphyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithostratigraphy, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyV2Id(lithostratigraphy_ids, 14_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Id, f => lithostratigraphy_ids++);

        LithostratigraphyLayer SeededLithostratigraphies(int seed) => fakeLithostratigraphies.UseSeed(seed).Generate();

        var lithostratigraphiesToInsert = new List<LithostratigraphyLayer>(stratigraphyV2Range.Count * 10);
        for (int i = 0; i < stratigraphyV2Range.Count; i++)
        {
            // Add 10 lithostratigraphies per stratigraphy.
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
            lithostratigraphiesToInsert.AddRange(range.Select(SeededLithostratigraphies));
        }

        context.BulkInsert(lithostratigraphiesToInsert, bulkConfig);

        // Seed log runs
        // Each ten log runs should be associated with the one borehole.
        int GetBoreholeId(int currentLogRunId, int startId)
        {
            return 1_000_000 + (int)Math.Floor((double)((currentLogRunId - startId) / 10));
        }

        var boreholeStatusIds = codelists.Where(c => c.Schema == "log_borehole_status").Select(s => s.Id).ToList();
        var conveyanceMethodIds = codelists.Where(c => c.Schema == "log_conveyance_method").Select(s => s.Id).ToList();
        var toolTypeIds = codelists.Where(c => c.Schema == "log_tool_type").Select(s => s.Id).ToList();
        var passTypeIds = codelists.Where(c => c.Schema == "log_pass_type").Select(s => s.Id).ToList();
        var depthTypeIds = codelists.Where(c => c.Schema == "log_depth_type").Select(s => s.Id).ToList();
        var dataPackageIds = codelists.Where(c => c.Schema == "log_data_package").Select(s => s.Id).ToList();

        var logRun_ids = 24_000_000;
        var logRunRange = Enumerable.Range(logRun_ids, 1000);
        var fakeLogRuns = new Faker<LogRun>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => logRun_ids++)
            .RuleFor(o => o.BoreholeId, f => GetBoreholeId(logRun_ids, 24_000_000))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.RunNumber, f => $"R{f.Random.Number(1, 99):D2}")
            .RuleFor(o => o.FromDepth, f => (logRun_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((logRun_ids % 10) + 1) * 10)
            .RuleFor(o => o.RunDate, f => DateOnly.FromDateTime(f.Date.Past()))
            .RuleFor(o => o.Comment, f => f.Lorem.Sentence().OrNull(f, .4f))
            .RuleFor(o => o.BitSize, f => f.Random.Double(5, 30))
            .RuleFor(o => o.ConveyanceMethodId, f => f.PickRandom(conveyanceMethodIds).OrNull(f, .1f))
            .RuleFor(o => o.ConveyanceMethod, _ => default!)
            .RuleFor(o => o.BoreholeStatusId, f => f.PickRandom(boreholeStatusIds).OrNull(f, .1f))
            .RuleFor(o => o.BoreholeStatus, _ => default!)
            .RuleFor(o => o.LogFiles, _ => new Collection<LogFile>())
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.ServiceCo, f => f.Random.Word());

        LogRun SeededLogRuns(int seed) => fakeLogRuns.UseSeed(seed).Generate();
        var logRuns = logRunRange.Select(SeededLogRuns).ToList();
        context.BulkInsert(logRuns, bulkConfig);

        // Seed log files
        var logFile_ids = 25_000_000;

        var fakeLogFiles = new Faker<LogFile>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => logFile_ids++)
            .RuleFor(o => o.LogRunId, f => f.PickRandom(logRuns).Id)
            .RuleFor(o => o.LogRun, _ => default!)
            .RuleFor(o => o.Name, f => f.System.FileName())
            .RuleFor(o => o.NameUuid, f => f.Random.Uuid().ToString())
            .RuleFor(o => o.PassTypeId, f => f.PickRandom(passTypeIds).OrNull(f, .1f))
            .RuleFor(o => o.PassType, _ => default!)
            .RuleFor(o => o.Pass, f => f.Random.Int(1, 5).OrNull(f, .2f))
            .RuleFor(o => o.DataPackageId, f => f.PickRandom(dataPackageIds).OrNull(f, .1f))
            .RuleFor(o => o.DataPackage, _ => default!)
            .RuleFor(o => o.DeliveryDate, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .1f))
            .RuleFor(o => o.DepthTypeId, f => f.PickRandom(depthTypeIds).OrNull(f, .1f))
            .RuleFor(o => o.DepthType, _ => default!)
            .RuleFor(o => o.ToolTypeCodelistIds, _ => new List<int>())
            .RuleFor(o => o.ToolTypeCodelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.LogFileToolTypeCodes, _ => new List<LogFileToolTypeCodes>())
            .RuleFor(o => o.Public, f => f.Random.Bool(.9f))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!);

        // Generate 1-4 log files per log run
        var logFilesToInsert = new List<LogFile>();
        foreach (var logRunId in logRuns.Select(l => l.Id))
        {
            int fileCount = new Random(logRunId).Next(1, 5);
            for (int i = 0; i < fileCount; i++)
            {
                var logFile = fakeLogFiles
                    .UseSeed(logFile_ids + i)
                    .RuleFor(o => o.LogRunId, _ => logRunId)
                    .Generate();
                logFilesToInsert.Add(logFile);
            }
        }

        context.BulkInsert(logFilesToInsert, bulkConfig);

        var logFileToolTypeRelationships = new List<LogFileToolTypeCodes>();
        foreach (var logFileId in logFilesToInsert.Select(l => l.Id))
        {
            int toolCount = new Random(logFileId).Next(1, 4);

            var selectedToolTypeIds = toolTypeIds
                .OrderBy(_ => new Random(logFileId).Next())
                .Take(toolCount)
                .ToList();

            foreach (var toolTypeId in selectedToolTypeIds)
            {
                logFileToolTypeRelationships.Add(new LogFileToolTypeCodes
                {
                    LogFileId = logFileId,
                    CodelistId = toolTypeId,
                });
            }
        }

        context.BulkInsert(logFileToolTypeRelationships, bulkConfig);

        // Sync all database sequences
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.workgroups', 'id_wgp'), {workgroup_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.borehole', 'id_bho'), {borehole_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.files', 'id_fil'), {file_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.stratigraphy_v2', 'id'), {stratigraphyV2_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.lithology', 'id'), {lithology_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.lithology_description', 'id'), {lithologyDescription_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.lithological_description', 'id'), {lithologicalDescription_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.facies_description', 'id'), {faciesDescription_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.chronostratigraphy', 'id'), {chronostratigraphy_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.lithostratigraphy', 'id'), {lithostratigraphy_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.observation', 'id'), {observation_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.hydrotest_result', 'id'), {hydrotestResult_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.fieldmeasurement_result', 'id'), {fieldMeasurementResult_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.section', 'id'), {section_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.section_element', 'id'), {sectionElement_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.borehole_geometry', 'id'), {boreholeGeometry_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.tab_status', 'tab_status_id'), {tabStatus_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.workflow', 'id'), {workflow_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.workflow_change', 'workflow_change_id'), {workflowChange_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.document', 'id'), {document_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.log_run', 'id'), {logRun_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.log_file', 'id'), {logFile_ids - 1})");
    }
}
#pragma warning restore CA1505
