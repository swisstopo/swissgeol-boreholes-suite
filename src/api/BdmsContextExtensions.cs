using BDMS.Models;
using Bogus;
using EFCore.BulkExtensions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.Collections.ObjectModel;
using System.Globalization;

namespace BDMS;

#pragma warning disable CA1505
/// <summary>
/// Contains extensions methods for the BDMS db context.
/// </summary>
public static class BdmsContextExtensions
{
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
           .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .1f))
           .RuleFor(o => o.Disabled, f => f.Date.Past().ToUniversalTime().OrNull(f, .1f))
           .RuleFor(o => o.IsSupplier, f => f.Random.Bool().OrNull(f, .1f))
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
        List<int> qtDepthIds = codelists.Where(c => c.Schema == "custom.qt_top_bedrock").Select(s => s.Id).ToList();
        List<int> elevationPrecisionIds = codelists.Where(c => c.Schema == "elevation_precision").Select(s => s.Id).ToList();
        List<int> layerKindIds = codelists.Where(c => c.Schema == "layer_kind").Select(s => s.Id).ToList();
        List<int> purposeIds = codelists.Where(c => c.Schema == "extended.purpose").Select(s => s.Id).ToList();
        List<int> statusIds = codelists.Where(c => c.Schema == "extended.status").Select(s => s.Id).ToList();
        List<int> lithologyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithology_top_bedrock").Select(s => s.Id).ToList();
        List<int> qtInclinationDirectionIds = codelists.Where(c => c.Schema == "custom.qt_bore_inc_dir").Select(s => s.Id).ToList();
        List<int> chronostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.chronostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> lithostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> instrumentKindIds = codelists.Where(c => c.Schema == CompletionSchemas.InstrumentationTypeSchema).Select(s => s.Id).ToList();
        List<int> instrumentStatusIds = codelists.Where(c => c.Schema == CompletionSchemas.InstrumentationStatusSchema).Select(s => s.Id).ToList();
        List<int> casingKindIds = codelists.Where(c => c.Schema == CompletionSchemas.CasingTypeSchema).Select(s => s.Id).ToList();
        List<int> casingMaterialIds = codelists.Where(c => c.Schema == CompletionSchemas.CasingMaterialSchema).Select(s => s.Id).ToList();
        List<int> plasticityIds = codelists.Where(c => c.Schema == "plasticity").Select(s => s.Id).ToList();
        List<int> compactnessIds = codelists.Where(c => c.Schema == "compactness").Select(s => s.Id).ToList();
        List<int> consistanceIds = codelists.Where(c => c.Schema == "consistency").Select(s => s.Id).ToList();
        List<int> humidityIds = codelists.Where(c => c.Schema == "humidity").Select(s => s.Id).ToList();
        List<int> alterationIds = codelists.Where(c => c.Schema == "alteration").Select(s => s.Id).ToList();
        List<int> cohesionIds = codelists.Where(c => c.Schema == "cohesion").Select(s => s.Id).ToList();
        List<int> backfillKindIds = codelists.Where(c => c.Schema == CompletionSchemas.BackfillTypeSchema).Select(s => s.Id).ToList();
        List<int> backfillMaterialIds = codelists.Where(c => c.Schema == CompletionSchemas.BackfillMaterialSchema).Select(s => s.Id).ToList();
        List<int> uscsIds = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList();
        List<int> uscsDeterminationIds = codelists.Where(c => c.Schema == "uscs_determination").Select(s => s.Id).ToList();
        List<int> gradationIds = codelists.Where(c => c.Schema == "gradation").Select(s => s.Id).ToList();
        List<int> soilStateIds = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList();  // unclear which codelist
        List<int> kirostIds = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList();  // unclear which codelist
        List<int> grainSize1Ids = codelists.Where(c => c.Schema == "grain_size").Select(s => s.Id).ToList();
        List<int> grainSize2Ids = codelists.Where(c => c.Schema == "uscs_type").Select(s => s.Id).ToList(); // unclear which codelist
        List<int> referenceElevationTypeIds = codelists.Where(c => c.Schema == "reference_elevation_type").Select(s => s.Id).ToList();
        List<int> waterIngressReliabilityIds = codelists.Where(c => c.Schema == HydrogeologySchemas.ObservationReliabilitySchema).Select(s => s.Id).ToList();
        List<int> waterIngressQuantityIds = codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressQualitySchema).Select(s => s.Id).ToList();
        List<int> waterIngressConditionsIds = codelists.Where(c => c.Schema == HydrogeologySchemas.WateringressConditionsSchema).Select(s => s.Id).ToList();
        List<int> hydrotestKindIds = codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestKindSchema).Select(s => s.Id).ToList();
        List<int> hydrotestResultParameterIds = codelists.Where(c => c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema).Select(s => s.Id).ToList();
        List<int> groundwaterLevelMeasurementKindIds = codelists.Where(c => c.Schema == HydrogeologySchemas.GroundwaterLevelMeasurementKindSchema).Select(s => s.Id).ToList();
        List<int> fieldMeasurementSampleTypeIds = codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementSampleTypeSchema).Select(s => s.Id).ToList();
        List<int> fieldMeasurementParameterIds = codelists.Where(c => c.Schema == HydrogeologySchemas.FieldMeasurementParameterSchema).Select(s => s.Id).ToList();
        List<int> completionKindIds = codelists.Where(c => c.Schema == CompletionSchemas.CompletionKindSchema).Select(s => s.Id).ToList();

        // Seed Boreholes
        var borehole_ids = 1_000_000;
        var boreholeRange = Enumerable.Range(borehole_ids, 3000).ToList();
        var fakeBoreholes = new Faker<Borehole>()
           .StrictMode(true)
           .RuleFor(o => o.Id, f => borehole_ids++)
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
           .RuleFor(o => o.AlternateName, f => f.Person.UserName.OrNull(f, .1f))
           .RuleFor(o => o.LocationPrecisionId, f => f.PickRandom(locationPrecisionIds).OrNull(f, .1f))
           .RuleFor(o => o.LocationPrecision, _ => default!)
           .RuleFor(o => o.ElevationPrecisionId, f => f.PickRandom(elevationPrecisionIds).OrNull(f, .1f))
           .RuleFor(o => o.ElevationPrecision, _ => default!)
           .RuleFor(o => o.ProjectName, f => f.Company.CatchPhrase().OrNull(f, .1f))
           .RuleFor(o => o.Country, f => f.Address.Country().OrNull(f, 0.01f))
           .RuleFor(o => o.Canton, f => f.Address.State().OrNull(f, 0.01f))
           .RuleFor(o => o.Municipality, f => f.Address.City().OrNull(f, 0.01f))
           .RuleFor(o => o.DrillingMethodId, f => f.PickRandom(drillingMethodIds).OrNull(f, .05f))
           .RuleFor(o => o.DrillingMethod, _ => default!)
           .RuleFor(o => o.DrillingDate, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.DrillingDiameter, f => f.Random.Double(0, 20))
           .RuleFor(o => o.CuttingsId, f => f.PickRandom(cuttingsIds).OrNull(f, .05f))
           .RuleFor(o => o.Cuttings, _ => default!)
           .RuleFor(o => o.PurposeId, f => f.PickRandom(purposeIds).OrNull(f, .05f))
           .RuleFor(o => o.Purpose, _ => default!)
           .RuleFor(o => o.StatusId, f => f.PickRandom(statusIds).OrNull(f, .05f))
           .RuleFor(o => o.Status, _ => default!)
           .RuleFor(o => o.Inclination, f => f.Random.Double(0, 5).OrNull(f, .05f))
           .RuleFor(o => o.InclinationDirection, f => f.Random.Double(0, 360).OrNull(f, .05f))
           .RuleFor(o => o.QtDepthId, f => f.PickRandom(qtDepthIds).OrNull(f, .05f))
           .RuleFor(o => o.QtDepth, _ => default!)
           .RuleFor(o => o.TopBedrock, f => f.Random.Double(0, 1000).OrNull(f, .05f))
           .RuleFor(o => o.QtTopBedrock, f => f.Random.Double(0, 2).OrNull(f, .05f))
           .RuleFor(o => o.HasGroundwater, f => f.Random.Bool().OrNull(f, .2f))
           .RuleFor(o => o.Remarks, f => f.Rant.Review().OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrock, _ => default!)
           .RuleFor(o => o.LithostratigraphyId, f => f.PickRandom(lithostratigraphyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.Lithostratigraphy, _ => default!)
           .RuleFor(o => o.ChronostratigraphyId, f => f.PickRandom(chronostratigraphyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.Chronostratigraphy, _ => default!)
           .RuleFor(o => o.SpudDate, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
           .RuleFor(o => o.TopBedrockTvd, f => f.Random.Double(0, 1000).OrNull(f, .05f))
           .RuleFor(o => o.QtTopBedrockTvd, f => f.Random.Double(0, 2).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevation, f => f.Random.Double(0, 4500).OrNull(f, .05f))
           .RuleFor(o => o.QtReferenceElevationId, f => f.PickRandom(elevationPrecisionIds).OrNull(f, .05f))
           .RuleFor(o => o.QtReferenceElevation, _ => default!)
           .RuleFor(o => o.QtInclinationDirectionId, f => f.PickRandom(qtInclinationDirectionIds).OrNull(f, .05f))
           .RuleFor(o => o.QtInclinationDirection, _ => default!)
           .RuleFor(o => o.ReferenceElevationTypeId, f => f.PickRandom(referenceElevationTypeIds).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevationType, _ => default!)
           .RuleFor(o => o.TotalDepthTvd, f => f.Random.Double(0, 4500).OrNull(f, .05f))
           .RuleFor(o => o.QtTotalDepthTvdId, f => f.PickRandom(qtDepthIds).OrNull(f, .05f))
           .RuleFor(o => o.QtTotalDepthTvd, _ => default!)
           .RuleFor(o => o.BoreholeCodelists, _ => new Collection<BoreholeCodelist>())
           .RuleFor(o => o.Codelists, _ => new Collection<Codelist>())
           .RuleFor(o => o.Geometry, f =>
           {
               var point = new Point(f.Random.Int(2477750, 2830750), f.Random.Int(1066750, 1310750));
               point.SRID = 2056;
               return point.OrNull(f, .05f);
           })
           .RuleFor(o => o.NationalInterest, f => borehole_ids % 10 == 9);

        Borehole SeededBoreholes(int seed) => fakeBoreholes.UseSeed(seed).Generate();
        context.BulkInsert(boreholeRange.Select(SeededBoreholes).ToList(), bulkConfig);

        // Seed BoringEvents
        var event_ids = 3_000_000;
        var eventRange = Enumerable.Range(event_ids, 200);
        var fakeEvents = new Faker<UserEvent>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => event_ids++)
               .RuleFor(o => o.UserId, f => f.PickRandom(userRange))
               .RuleFor(o => o.User, _ => default!)
               .RuleFor(o => o.Topic, f => f.Company.CompanyName())
               .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
               .RuleFor(o => o.Payload, f => null);

        UserEvent SeededEvents(int seed) => fakeEvents.UseSeed(seed).Generate();
        context.BulkInsert(eventRange.Select(SeededEvents).ToList(), bulkConfig);

        // Seed feedback
        var feedback_ids = 4_000_000;
        var feedbackRange = Enumerable.Range(feedback_ids, 10);
        var fakefeedbacks = new Faker<Feedback>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => feedback_ids++)
               .RuleFor(o => o.User, f => f.Person.FullName)
               .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
               .RuleFor(o => o.Message, f => f.Rant.Review())
               .RuleFor(o => o.Tag, f => f.Company.CompanySuffix())
               .RuleFor(o => o.IsFrw, f => f.Random.Bool().OrNull(f, .1f));

        Feedback Seededfeedbacks(int seed) => fakefeedbacks.UseSeed(seed).Generate();
        context.BulkInsert(feedbackRange.Select(Seededfeedbacks).ToList(), bulkConfig);

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
               .RuleFor(o => o.Hash, f => f.Random.Hash())
               .RuleFor(o => o.Type, f => f.Random.Word())
               .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
               .RuleFor(o => o.NameUuid, f => null);

        Models.File Seededfiles(int seed) => fakefiles.UseSeed(seed).Generate();
        context.BulkInsert(fileRange.Select(Seededfiles).ToList(), bulkConfig);

        // Seed borehole_files
        var fakeBoreholeFiles = new Faker<BoreholeFile>()
            .StrictMode(true)
            .RuleFor(o => o.FileId, f => f.PickRandom(fileRange))
            .RuleFor(o => o.File, f => default!)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange))
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

        BoreholeFile SeededBoreholeFiles(int seed) => fakeBoreholeFiles.UseSeed(seed).Generate();

        var filesToInsert = boreholeRange
            .Select(SeededBoreholeFiles)
            .GroupBy(bf => new { bf.BoreholeId, bf.FileId })
            .Select(bf => bf.FirstOrDefault())
            .ToList();
        context.BulkInsert<BoreholeFile>(filesToInsert, bulkConfig);

        // Seed stratigraphy
        var stratigraphy_ids = 6_000_000;
        var stratigraphyRange = Enumerable.Range(stratigraphy_ids, boreholeRange.Count).ToList();
        var fakeStratigraphies = new Faker<Stratigraphy>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => stratigraphy_ids++)
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange).OrNull(f, .05f))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange).OrNull(f, .05f))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.Date, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.KindId, f => f.PickRandom(layerKindIds))
            .RuleFor(o => o.Kind, _ => default!)
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

        // Each ten layers should be associated with the one stratigraphy or casing.
        int GetStratigraphyOrCasingId(int currentLayerId, int startId)
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
            .RuleFor(o => o.ConsistanceId, f => f.PickRandom(consistanceIds).OrNull(f, .05f))
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
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyOrCasingId(layer_ids, 7_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.IsStriae, f => f.Random.Bool())
            .RuleFor(o => o.IsUndefined, f => f.Random.Bool())
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.Uscs1Id, f => f.PickRandom(uscsIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs1, _ => default!)
            .RuleFor(o => o.Uscs2Id, f => f.PickRandom(uscsIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs2, _ => default!)
            .RuleFor(o => o.UscsDeterminationId, f => f.PickRandom(uscsDeterminationIds).OrNull(f, .05f))
            .RuleFor(o => o.UscsDetermination, _ => default!)
            .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.LithologyTopBedrock, _ => default!)
            .RuleFor(o => o.Notes, f => f.Random.Words(4).OrNull(f, .05f))
            .RuleFor(o => o.OriginalUscs, f => f.Random.Word().OrNull(f, .05f))
            .RuleFor(o => o.OriginalLithology, f => f.Random.Words(5).OrNull(f, .05f))
            .RuleFor(o => o.LayerCodelists, _ => new Collection<LayerCodelist>())
            .RuleFor(o => o.Codelists, _ => new Collection<Codelist>())
            .RuleFor(o => o.Id, f => layer_ids++)
            .RuleFor(o => o.CodelistIds, new List<int>());

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

        // Seed workflows for admin user
        var workflow_ids = 8_000_000;
        var workflowRange = Enumerable.Range(workflow_ids, boreholeRange.Count);
        var fakeWorkflows = new Faker<Workflow>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => workflow_ids++)
               .RuleFor(o => o.UserId, userRange.First())
               .RuleFor(o => o.User, _ => default!)
               .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange))
               .RuleFor(o => o.Borehole, _ => default!)
               .RuleFor(o => o.Notes, f => f.Random.Words(4))
               .RuleFor(o => o.Role, _ => Role.Editor)
               .RuleFor(o => o.Started, f => f.Date.Between(new DateTime(1990, 1, 1).ToUniversalTime(), new DateTime(2005, 1, 1).ToUniversalTime()))
               .RuleFor(o => o.Finished, _ => null);

        Workflow SeededWorkflows(int seed) => fakeWorkflows.UseSeed(seed).Generate();
        context.BulkInsert(workflowRange.Select(SeededWorkflows).ToList(), bulkConfig);

        // Seed lithologicalDescriptions
        var lithologicalDescription_ids = 9_000_000;
        var fakelithologicalDescriptions = new Faker<LithologicalDescription>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (lithologicalDescription_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((lithologicalDescription_ids % 10) + 1) * 10)
            .RuleFor(o => o.DescriptionQualityId, f => f.PickRandom(descriptionQualityIds).OrNull(f, .05f))
            .RuleFor(o => o.DescriptionQuality, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyOrCasingId(lithologicalDescription_ids, 9_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Description, f => f.Random.Words(3).OrNull(f, .05f))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.IsLast, f => lithologicalDescription_ids % 10 == 9)
            .RuleFor(o => o.Id, f => lithologicalDescription_ids++);

        LithologicalDescription SeededLithologicalDescriptions(int seed) => fakelithologicalDescriptions.UseSeed(seed).Generate();

        var lithologicalDescriptionsToInsert = new List<LithologicalDescription>(stratigraphyRange.Count * 10);
        for (int i = 0; i < stratigraphyRange.Count; i++)
        {
            // Add 10 lithological descriptions per stratigraphy profile.
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
            lithologicalDescriptionsToInsert.AddRange(range.Select(SeededLithologicalDescriptions));
        }

        context.BulkInsert(lithologicalDescriptionsToInsert, bulkConfig);

        // Seed faciesDescriptions
        var faciesDescription_ids = 10_000_000;
        var fakeFaciesDescriptions = new Faker<FaciesDescription>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (faciesDescription_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((faciesDescription_ids % 10) + 1) * 10)
            .RuleFor(o => o.DescriptionQualityId, f => f.PickRandom(descriptionQualityIds).OrNull(f, .05f))
            .RuleFor(o => o.DescriptionQuality, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyOrCasingId(faciesDescription_ids, 10_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Description, f => f.Random.Words(3).OrNull(f, .05f))
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.IsLast, f => faciesDescription_ids % 10 == 9)
            .RuleFor(o => o.Id, f => faciesDescription_ids++);

        FaciesDescription SeededFaciesDescriptions(int seed) => fakeFaciesDescriptions.UseSeed(seed).Generate();

        var faciesDescriptionsToInsert = new List<FaciesDescription>(stratigraphyRange.Count * 10);
        for (int i = 0; i < stratigraphyRange.Count; i++)
        {
            // Add 10 facies descriptions per stratigraphy.
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
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
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyOrCasingId(chronostratigraphy_ids, 11_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.IsLast, f => chronostratigraphy_ids % 10 == 9)
            .RuleFor(o => o.Id, f => chronostratigraphy_ids++);

        ChronostratigraphyLayer SeededChronostratigraphies(int seed) => fakeChronostratigraphies.UseSeed(seed).Generate();

        var chronostratigraphiesToInsert = new List<ChronostratigraphyLayer>(stratigraphyRange.Count * 10);
        for (int i = 0; i < stratigraphyRange.Count; i++)
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
            .RuleFor(o => o.StratigraphyId, f => GetStratigraphyOrCasingId(lithostratigraphy_ids, 14_000_000))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.IsLast, f => lithostratigraphy_ids % 10 == 9)
            .RuleFor(o => o.Id, f => lithostratigraphy_ids++);

        LithostratigraphyLayer SeededLithostratigraphies(int seed) => fakeLithostratigraphies.UseSeed(seed).Generate();

        var lithostratigraphiesToInsert = new List<LithostratigraphyLayer>(stratigraphyRange.Count * 10);
        for (int i = 0; i < stratigraphyRange.Count; i++)
        {
            // Add 10 lithostratigraphies per stratigraphy.
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);
            lithostratigraphiesToInsert.AddRange(range.Select(SeededLithostratigraphies));
        }

        context.BulkInsert(lithostratigraphiesToInsert, bulkConfig);

        // Seed layer_codelist table (only for a limited number of layers)
        var layerRange = Enumerable.Range(7_000_000, 10_000);
        var layerCodelistRange = Enumerable.Range(0, layerRange.Count() * 3); // Multiply layer range by 3 to generate multiple entries per layer
        var fakeLayerCodelists = new Faker<LayerCodelist>()
            .StrictMode(true)
            .RuleFor(o => o.LayerId, f => f.PickRandom(layerRange))
            .RuleFor(o => o.CodelistId, f => f.PickRandom(uscsIds))
            .RuleFor(o => o.SchemaName, "uscs_type")
            .RuleFor(o => o.Layer, _ => default!)
            .RuleFor(o => o.Codelist, _ => default!);

        LayerCodelist SeededLayerCodelist(int seed) => fakeLayerCodelists.UseSeed(seed).Generate();
        context.BulkInsert(layerCodelistRange.Select(SeededLayerCodelist).ToList(), bulkConfig);

        // Seed completions
        var completion_ids = 14_000_000;
        var completionRange = Enumerable.Range(completion_ids, 500);
        var fakeCompletions = new Faker<Completion>()
            .StrictMode(true)
            .RuleFor(c => c.BoreholeId, f => f.PickRandom(boreholeRange))
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
            .RuleFor(c => c.FromDepth, f => (casing_ids % 10) * 10)
            .RuleFor(c => c.ToDepth, f => ((casing_ids % 10) + 1) * 10)
            .RuleFor(c => c.KindId, f => f.PickRandom(casingKindIds))
            .RuleFor(c => c.Kind, _ => default!)
            .RuleFor(c => c.MaterialId, f => f.PickRandom(casingMaterialIds))
            .RuleFor(c => c.Material, _ => default!)
            .RuleFor(c => c.InnerDiameter, f => f.Random.Double(0, 15))
            .RuleFor(c => c.OuterDiameter, f => f.Random.Double(0, 20))
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
            .RuleFor(i => i.CasingId, f => f.PickRandom(casings.Select(c => c.Id)))
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
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange))
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
            .RuleFor(o => o.CompletionFinished, f => f.Random.Bool())
            .RuleFor(o => o.Comment, f => f.Lorem.Sentence())
            .RuleFor(o => o.ReliabilityId, f => f.PickRandom(waterIngressReliabilityIds))
            .RuleFor(o => o.Reliability, _ => default!)
            .RuleFor(o => o.Type, f => f.PickRandom<ObservationType>())
            .RuleFor(i => i.CasingId, f => f.PickRandom(casings.Select(c => c.Id)))
            .RuleFor(i => i.Casing, _ => default!)
            .RuleFor(o => o.Id, f => observation_ids++);

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
        var fakeFieldMeasurements = new Faker<FieldMeasurement>()
            .RuleFor(o => o.SampleTypeId, f => f.PickRandom(fieldMeasurementSampleTypeIds))
            .RuleFor(o => o.SampleType, _ => default!)
            .RuleFor(o => o.ParameterId, f => f.PickRandom(fieldMeasurementParameterIds))
            .RuleFor(o => o.Parameter, _ => default!)
            .RuleFor(o => o.Value, f => f.Random.Double(1, 5000));

        FieldMeasurement SeededFieldMeasurements(Observation observation)
        {
            return fakeFieldMeasurements
                .UseSeed(observation.Id)
                .RuleFor(o => o.Id, _ => observation.Id)
                .Generate();
        }

        var fieldMeasurements = observations.Where(o => o.Type == ObservationType.FieldMeasurement).Select(observation => SeededFieldMeasurements(observation)).ToList();

        context.BulkInsert(fieldMeasurements, bulkConfig);

        context.SaveChanges();

        // Sync all database sequences
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.workgroups', 'id_wgp'), {workgroup_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.borehole', 'id_bho'), {borehole_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.events', 'id_evs'), {event_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.feedbacks', 'id_feb'), {feedback_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.files', 'id_fil'), {file_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.stratigraphy', 'id_sty'), {stratigraphy_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.layer', 'id_lay'), {layer_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.workflow', 'id_wkf'), {workflow_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.observation', 'id'), {observation_ids - 1})");
        context.Database.ExecuteSqlInterpolated($"SELECT setval(pg_get_serial_sequence('bdms.hydrotest_result', 'id'), {hydrotestResult_ids - 1})");
    }
}
#pragma warning restore CA1505
