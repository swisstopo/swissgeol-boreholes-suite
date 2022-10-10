using BDMS.Models;
using Bogus;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using System.Globalization;

namespace BDMS;

#pragma warning disable CA1505
/// <summary>
/// The EF database context containing data for the BDMS application.
/// </summary>
public static class BdmsContextExtensions
{
    /// <summary>
    /// Seed data for <see cref="Workgroup"/>, <see cref="Borehole"/> and <see cref="Stratigraphy"/>.
    /// </summary>
    public static void SeedData(this BdmsContext context)
    {
        using var transaction = context.Database.BeginTransaction();

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
        context.Workgroups.AddRange(workgroupRange.Select(SeededWorkgroups));
        context.SaveChanges();

        // ranges for exsiting tables
        var userRange = Enumerable.Range(1, 5);
        var cantonRange = Enumerable.Range(1, 51);
        var municipalityRange = Enumerable.Range(1, 2371);

        // local codelists
        List<Codelist> codelists = context.Codelists.ToList();
        List<int> kindIds = codelists.Where(c => c.Schema == "kind").Select(s => s.Id).ToList();
        List<int> srsIds = codelists.Where(c => c.Schema == "srs").Select(s => s.Id).ToList();
        List<int> hrsIds = codelists.Where(c => c.Schema == "hrs").Select(s => s.Id).ToList();
        List<int> restrictionIds = codelists.Where(c => c.Schema == "qt_location").Select(s => s.Id).ToList();
        List<int> qtLocationnIds = codelists.Where(c => c.Schema == "qt_elevation").Select(s => s.Id).ToList();
        List<int> qtDescriptionIds = codelists.Where(c => c.Schema == "qt_description").Select(s => s.Id).ToList();
        List<int> drillingMethodIds = codelists.Where(c => c.Schema == "extended.drilling_method").Select(s => s.Id).ToList();
        List<int> cuttingsIds = codelists.Where(c => c.Schema == "custom.cuttings").Select(s => s.Id).ToList();
        List<int> qtDepthIds = codelists.Where(c => c.Schema == "custom.qt_depth").Select(s => s.Id).ToList();
        List<int> qtElevationIds = codelists.Where(c => c.Schema == "qt_elevation").Select(s => s.Id).ToList();
        List<int> layerKindIds = codelists.Where(c => c.Schema == "layer_kind").Select(s => s.Id).ToList();
        List<int> purposeIds = codelists.Where(c => c.Schema == "extended.purpose").Select(s => s.Id).ToList();
        List<int> statusIds = codelists.Where(c => c.Schema == "extended.status").Select(s => s.Id).ToList();
        List<int> qtTopBedrockIds = codelists.Where(c => c.Schema == "custom.qt_top_bedrock").Select(s => s.Id).ToList();
        List<int> lithologyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithology_top_bedrock").Select(s => s.Id).ToList();
        List<int> qtInclinationDirectionIds = codelists.Where(c => c.Schema == "custom.qt_bore_inc_dir").Select(s => s.Id).ToList();
        List<int> chronostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.chronostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> lithostratigraphyTopBedrockIds = codelists.Where(c => c.Schema == "custom.lithostratigraphy_top_bedrock").Select(s => s.Id).ToList();
        List<int> instrumentKindIds = codelists.Where(c => c.Schema == "inst100").Select(s => s.Id).ToList();
        List<int> instrumentMaterialIds = codelists.Where(c => c.Schema == "inst101").Select(s => s.Id).ToList();
        List<int> casingKindIds = codelists.Where(c => c.Schema == "casi200").Select(s => s.Id).ToList();
        List<int> casingMaterialIds = codelists.Where(c => c.Schema == "casi201").Select(s => s.Id).ToList();
        List<int> plasticityIds = codelists.Where(c => c.Schema == "mlpr101").Select(s => s.Id).ToList();
        List<int> compactnessIds = codelists.Where(c => c.Schema == "mlpr102").Select(s => s.Id).ToList();
        List<int> consistanceIds = codelists.Where(c => c.Schema == "mlpr103").Select(s => s.Id).ToList();
        List<int> humidityIds = codelists.Where(c => c.Schema == "mlpr105").Select(s => s.Id).ToList();
        List<int> alterationIds = codelists.Where(c => c.Schema == "mlpr106").Select(s => s.Id).ToList();
        List<int> cohesionIds = codelists.Where(c => c.Schema == "mlpr116").Select(s => s.Id).ToList();
        List<int> fillKindIds = codelists.Where(c => c.Schema == "fill100").Select(s => s.Id).ToList();
        List<int> fillMaterialIds = codelists.Where(c => c.Schema == "fill200").Select(s => s.Id).ToList();
        List<int> uscsIds = codelists.Where(c => c.Schema == "mcla101").Select(s => s.Id).ToList();
        List<int> uscsDeterminationIds = codelists.Where(c => c.Schema == "mcla104").Select(s => s.Id).ToList();
        List<int> soilStateIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> kirostIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> lithokIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> symbolIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> tectonicUnitIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> tectonicIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> unconrocksIds = codelists.Where(c => c.Schema == "mlpr117").Select(s => s.Id).ToList();  // unclear with codelist
        List<int> grainSize1Ids = codelists.Where(c => c.Schema == "mlpr101").Select(s => s.Id).ToList(); // unclear with codelist
        List<int> grainSize2Ids = codelists.Where(c => c.Schema == "mlpr103").Select(s => s.Id).ToList(); // unclear with codelist

        // Seed Boreholes
        var borehole_ids = 1000;
        var boreholeRange = Enumerable.Range(borehole_ids, 30);
        var fakeBoreholes = new Faker<Borehole>()
           .StrictMode(true)
           .RuleFor(o => o.Id, f => borehole_ids++)
           .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
           .RuleFor(o => o.CreatedBy, _ => default!)
           .RuleFor(o => o.ContactId, f => f.Random.Int().OrNull(f, .1f))
           .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
           .RuleFor(o => o.UpdatedBy, _ => default!)
           .RuleFor(o => o.LockedById, f => f.PickRandom(userRange).OrNull(f, .9f))
           .RuleFor(o => o.LockedBy, _ => default!)
           .RuleFor(o => o.Created, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.Updated, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.Locked, f => f.Date.Past().ToUniversalTime().OrNull(f, .9f))
           .RuleFor(o => o.WorkgroupId, f => f.PickRandom(workgroupRange).OrNull(f, .2f))
           .RuleFor(o => o.Workgroup, _ => default!)
           .RuleFor(o => o.IsPublic, f => { if (borehole_ids % 10 < 9) return true; else return false; }) // Generate mostly public records.
           .RuleFor(o => o.LocationX, f => f.Random.Int(2477750, 2830750))
           .RuleFor(o => o.LocationY, f => f.Random.Int(1066750, 1310750))
           .RuleFor(o => o.ElevationZ, f => f.Random.Double(0, 4500))
           .RuleFor(o => o.KindId, f => f.PickRandom(kindIds).OrNull(f, .6f))
           .RuleFor(o => o.Kind, _ => default!)
           .RuleFor(o => o.SrsId, f => f.PickRandom(srsIds).OrNull(f, .1f))
           .RuleFor(o => o.Srs, _ => default!)
           .RuleFor(o => o.HrsId, f => f.PickRandom(hrsIds).OrNull(f, .1f))
           .RuleFor(o => o.Hrs, _ => default!)
           .RuleFor(o => o.TotalDepth, f => f.Random.Double(0, 2000))
           .RuleFor(o => o.Date, f => f.Date.Past().ToUniversalTime())
           .RuleFor(o => o.RestrictionId, f => f.PickRandom(restrictionIds).OrNull(f, .5f))
           .RuleFor(o => o.Restriction, _ => default!)
           .RuleFor(o => o.RestrictionUntil, f => DateOnly.FromDateTime(f.Date.Future()).OrNull(f, .9f))
           .RuleFor(o => o.OriginalName, f => f.Name.FullName())
           .RuleFor(o => o.AlternateName, f => f.Person.UserName.OrNull(f, .1f))
           .RuleFor(o => o.QtLocationId, f => f.PickRandom(qtLocationnIds).OrNull(f, .1f))
           .RuleFor(o => o.QtLocation, _ => default!)
           .RuleFor(o => o.QtElevationId, f => f.PickRandom(qtElevationIds).OrNull(f, .1f))
           .RuleFor(o => o.QtElevation, _ => default!)
           .RuleFor(o => o.ProjectName, f => f.Company.CatchPhrase().OrNull(f, .1f))
           .RuleFor(o => o.CantonId, f => f.PickRandom(cantonRange))
           .RuleFor(o => o.Canton, _ => default!)
           .RuleFor(o => o.CityId, f => f.PickRandom(municipalityRange).OrNull(f, .05f))
           .RuleFor(o => o.City, _ => default!)
           .RuleFor(o => o.DrillingMethodId, f => f.PickRandom(drillingMethodIds).OrNull(f, .05f))
           .RuleFor(o => o.DrillingMethod, _ => default!)
           .RuleFor(o => o.DrillingDate, f => DateOnly.FromDateTime(f.Date.Past().ToUniversalTime()))
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
           .RuleFor(o => o.QtTopBedrockId, f => f.PickRandom(qtTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.QtTopBedrock, _ => default!)
           .RuleFor(o => o.HasGroundwater, f => f.Random.Bool().OrNull(f, .2f))
           .RuleFor(o => o.Remarks, f => f.Rant.Review().OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.LithologyTopBedrock, _ => default!)
           .RuleFor(o => o.LithostratigraphyId, f => f.PickRandom(lithostratigraphyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.Lithostratigraphy, _ => default!)
           .RuleFor(o => o.ChronostratigraphyId, f => f.PickRandom(chronostratigraphyTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.Chronostratigraphy, _ => default!)
           .RuleFor(o => o.TectonicId, f => f.PickRandom(tectonicIds))
           .RuleFor(o => o.Tectonic, _ => default!)
           .RuleFor(o => o.ImportId, f => f.Random.Int().OrNull(f, .05f))
           .RuleFor(o => o.SpudDate, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
           .RuleFor(o => o.TopBedrockTvd, f => f.Random.Double(0, 1000).OrNull(f, .05f))
           .RuleFor(o => o.QtTopBedrockTvdId, f => f.PickRandom(qtTopBedrockIds).OrNull(f, .05f))
           .RuleFor(o => o.QtTopBedrockTvd, _ => default!)
           .RuleFor(o => o.ReferenceElevation, f => f.Random.Double(0, 4500).OrNull(f, .05f))
           .RuleFor(o => o.QtReferenceElevationId, f => f.PickRandom(qtElevationIds).OrNull(f, .05f))
           .RuleFor(o => o.QtReferenceElevation, _ => default!)
           .RuleFor(o => o.QtInclinationDirectionId, f => f.PickRandom(qtInclinationDirectionIds).OrNull(f, .05f))
           .RuleFor(o => o.QtInclinationDirection, _ => default!)
           .RuleFor(o => o.ReferenceElevationTypeId, f => f.PickRandom(qtElevationIds).OrNull(f, .05f))
           .RuleFor(o => o.ReferenceElevationType, _ => default!)
           .RuleFor(o => o.TotalDepthTvd, f => f.Random.Double(0, 4500).OrNull(f, .05f))
           .RuleFor(o => o.QtTotalDepthTvdId, f => f.PickRandom(qtDepthIds).OrNull(f, .05f))
           .RuleFor(o => o.QtTotalDepthTvd, _ => default!)
           .RuleFor(o => o.Geometry, f =>
           {
               var point = new Point(f.Random.Int(2477750, 2830750), f.Random.Int(1066750, 1310750));
               point.SRID = 2056;
               return point.OrNull(f, .05f);
           });

        Borehole SeededBoreholes(int seed) => fakeBoreholes.UseSeed(seed).Generate();
        context.Boreholes.AddRange(boreholeRange.Select(SeededBoreholes));
        context.SaveChanges();

        // Seed BoringEvents
        var event_ids = 3000;
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
        context.BoringEvents.AddRange(eventRange.Select(SeededEvents));
        context.SaveChanges();

        // Seed feedback
        var feedback_ids = 4000;
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
        context.Feedbacks.AddRange(feedbackRange.Select(Seededfeedbacks));
        context.SaveChanges();

        // Seed file
        var file_ids = 5000;
        var fileRange = Enumerable.Range(file_ids, 20);
        var fakefiles = new Faker<Models.File>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => file_ids++)
               .RuleFor(o => o.UserId, f => f.PickRandom(userRange).OrNull(f, .05f))
               .RuleFor(o => o.User, _ => default!)
               .RuleFor(o => o.Name, f => f.Random.Word())
               .RuleFor(o => o.Hash, f => f.Random.Hash())
               .RuleFor(o => o.Type, f => f.Random.Word())
               .RuleFor(o => o.Uploaded, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
               .RuleFor(o => o.Conf, f => null);

        Models.File Seededfiles(int seed) => fakefiles.UseSeed(seed).Generate();
        context.Files.AddRange(fileRange.Select(Seededfiles));
        context.SaveChanges();

        // Seed stratigraphy
        var stratigraphy_ids = 6000;
        var stratigraphyRange = Enumerable.Range(stratigraphy_ids, 150);
        var fakeStratigraphies = new Faker<Stratigraphy>()
            .StrictMode(true)
            .RuleFor(o => o.Id, f => stratigraphy_ids++)
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange).OrNull(f, .05f))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange).OrNull(f, .05f))
            .RuleFor(o => o.Borehole, _ => default!)
            .RuleFor(o => o.Casing, f => f.Random.Words(2))
            .RuleFor(o => o.CasingDate, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .05f))
            .RuleFor(o => o.Creation, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.Date, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .05f))
            .RuleFor(o => o.FillCasingId, f => f.Random.Int())
            .RuleFor(o => o.ImportId, f => f.Random.Int().OrNull(f, .05f))
            .RuleFor(o => o.KindId, f => f.PickRandom(layerKindIds))
            .RuleFor(o => o.Kind, _ => default!)
            .RuleFor(o => o.Name, f => f.Name.FullName())
            .RuleFor(o => o.Notes, f => f.Rant.Review())
            .RuleFor(o => o.IsPrimary, f => f.Random.Bool())
            .RuleFor(o => o.Update, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.Layers, _ => default!);

        Stratigraphy Seededstratigraphys(int seed) => fakeStratigraphies.UseSeed(seed).Generate();
        context.Stratigraphies.AddRange(stratigraphyRange.Select(Seededstratigraphys));
        context.SaveChanges();

        // Seed layers
        var layer_ids = 7000;
        var layerRange = Enumerable.Range(layer_ids, 1500);

        var fakelayers = new Faker<Layer>()
            .StrictMode(true)
            .RuleFor(o => o.FromDepth, f => (layer_ids % 10) * 10)
            .RuleFor(o => o.ToDepth, f => ((layer_ids % 10) + 1) * 10)
            .RuleFor(o => o.AlterationId, f => f.PickRandom(alterationIds).OrNull(f, .6f))
            .RuleFor(o => o.Alteration, _ => default!)
            .RuleFor(o => o.Casing, f => f.Random.Words(2).OrNull(f, .05f))
            .RuleFor(o => o.CasingDateFinish, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .05f))
            .RuleFor(o => o.CasingDateSpud, f => DateOnly.FromDateTime(f.Date.Past()).OrNull(f, .05f))
            .RuleFor(o => o.CasingInnerDiameter, f => f.Random.Double(0, 15))
            .RuleFor(o => o.CasingKindId, f => f.PickRandom(casingKindIds).OrNull(f, .6f))
            .RuleFor(o => o.CasingKind, _ => default!)
            .RuleFor(o => o.CasingMaterialId, f => f.PickRandom(casingMaterialIds).OrNull(f, .6f))
            .RuleFor(o => o.CasingMaterial, _ => default!)
            .RuleFor(o => o.CasingOuterDiameter, f => f.Random.Double(0, 20))
            .RuleFor(o => o.ChronostratigraphyId, f => f.PickRandom(chronostratigraphyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Chronostratigraphy, _ => default!)
            .RuleFor(o => o.CohesionId, f => f.PickRandom(cohesionIds).OrNull(f, .05f))
            .RuleFor(o => o.Cohesion, _ => default!)
            .RuleFor(o => o.CompactnessId, f => f.PickRandom(compactnessIds).OrNull(f, .05f))
            .RuleFor(o => o.Compactness, _ => default!)
            .RuleFor(o => o.ConsistanceId, f => f.PickRandom(consistanceIds).OrNull(f, .05f))
            .RuleFor(o => o.Consistance, _ => default!)
            .RuleFor(o => o.Creation, f => f.Date.Past().ToUniversalTime().OrNull(f, .05f))
            .RuleFor(o => o.CreatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.CreatedBy, _ => default!)
            .RuleFor(o => o.UpdatedById, f => f.PickRandom(userRange))
            .RuleFor(o => o.UpdatedBy, _ => default!)
            .RuleFor(o => o.FillKindId, f => f.PickRandom(fillKindIds).OrNull(f, .05f))
            .RuleFor(o => o.FillKind, _ => default!)
            .RuleFor(o => o.FillMaterialId, f => f.PickRandom(fillMaterialIds).OrNull(f, .05f))
            .RuleFor(o => o.FillMaterial, _ => default!)
            .RuleFor(o => o.GradationId, f => f.Random.Int())
            .RuleFor(o => o.GrainSize1Id, f => f.PickRandom(grainSize1Ids).OrNull(f, .05f))
            .RuleFor(o => o.GrainSize1, _ => default!)
            .RuleFor(o => o.GrainSize2Id, f => f.PickRandom(grainSize2Ids).OrNull(f, .05f))
            .RuleFor(o => o.GrainSize2, _ => default!)
            .RuleFor(o => o.HumidityId, f => f.PickRandom(humidityIds).OrNull(f, .05f))
            .RuleFor(o => o.Humidity, _ => default!)
            .RuleFor(o => o.InstrumentKindId, f => f.PickRandom(instrumentKindIds).OrNull(f, .05f))
            .RuleFor(o => o.InstrumentKind, _ => default!)
            .RuleFor(o => o.InstrumentStatusId, f => f.PickRandom(instrumentMaterialIds).OrNull(f, .05f))
            .RuleFor(o => o.InstrumentStatus, _ => default!)
            .RuleFor(o => o.InstrumentStratigraphyId, f => f.Random.Int())
            .RuleFor(o => o.KirostId, f => f.PickRandom(kirostIds).OrNull(f, .05f))
            .RuleFor(o => o.Kirost, _ => default!)
            .RuleFor(o => o.IsLast, f => layer_ids % 10 == 9)
            .RuleFor(o => o.LithokId, f => f.PickRandom(lithokIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithok, _ => default!)
            .RuleFor(o => o.LithologyId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithology, _ => default!)
            .RuleFor(o => o.LithostratigraphyId, f => f.PickRandom(lithostratigraphyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.Lithostratigraphy, _ => default!)
            .RuleFor(o => o.PlasticityId, f => f.PickRandom(plasticityIds).OrNull(f, .05f))
            .RuleFor(o => o.Plasticity, _ => default!)
            .RuleFor(o => o.QtDescriptionId, f => f.PickRandom(qtDescriptionIds).OrNull(f, .05f))
            .RuleFor(o => o.QtDescription, _ => default!)
            .RuleFor(o => o.SoilStateId, f => f.PickRandom(soilStateIds))
            .RuleFor(o => o.SoilState, _ => default!)
            .RuleFor(o => o.StratigraphyId, f => 6000 + (int)Math.Floor((double)((layer_ids - 7000) / 10)))
            .RuleFor(o => o.Stratigraphy, _ => default!)
            .RuleFor(o => o.IsStriae, f => f.Random.Bool())
            .RuleFor(o => o.SymbolId, f => f.PickRandom(symbolIds).OrNull(f, .05f))
            .RuleFor(o => o.Symbol, _ => default!)
            .RuleFor(o => o.TectonicUnitId, f => f.PickRandom(tectonicUnitIds).OrNull(f, .05f))
            .RuleFor(o => o.TectonicUnit, _ => default!)
            .RuleFor(o => o.IsUndefined, f => f.Random.Bool())
            .RuleFor(o => o.Update, f => f.Date.Past().ToUniversalTime())
            .RuleFor(o => o.Uscs1Id, f => f.PickRandom(uscsIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs1, _ => default!)
            .RuleFor(o => o.Uscs2Id, f => f.PickRandom(uscsIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs2, _ => default!)
            .RuleFor(o => o.Uscs3Id, f => f.PickRandom(uscsIds).OrNull(f, .05f))
            .RuleFor(o => o.Uscs3, _ => default!)
            .RuleFor(o => o.UscsDeterminationId, f => f.PickRandom(uscsDeterminationIds).OrNull(f, .05f))
            .RuleFor(o => o.UscsDetermination, _ => default!)
            .RuleFor(o => o.DescriptionFacies, f => f.Random.Words(5).OrNull(f, .05f))
            .RuleFor(o => o.DescriptionLithological, f => f.Random.Words(3).OrNull(f, .05f))
            .RuleFor(o => o.Import, f => f.Random.Int().OrNull(f, .05f))
            .RuleFor(o => o.Instrument, f => f.Music.Genre().OrNull(f, .05f))
            .RuleFor(o => o.LithologyTopBedrockId, f => f.PickRandom(lithologyTopBedrockIds).OrNull(f, .05f))
            .RuleFor(o => o.LithologyTopBedrock, _ => default!)
            .RuleFor(o => o.Notes, f => f.Random.Words(4).OrNull(f, .05f))
            .RuleFor(o => o.OriginalUscs, f => f.Random.Word().OrNull(f, .05f))
            .RuleFor(o => o.UnconrocksId, f => f.PickRandom(unconrocksIds).OrNull(f, .05f))
            .RuleFor(o => o.Unconrocks, _ => default!)
            .RuleFor(o => o.Id, f => layer_ids++);

        Layer SeededLayers(int seed) => fakelayers.UseSeed(seed).Generate();

        for (int i = 0; i < stratigraphyRange.Count(); i++)
        {
            // Add 10 layers per stratigraphy
            var start = (i * 10) + 1;
            var range = Enumerable.Range(start, 10);  // ints in range must be different on each loop, so that properties are not repeated in dataset.
            context.Layers.AddRange(range.Select(SeededLayers));
            context.SaveChanges();
        }

        // Seed workflows
        var workflow_ids = 5000;
        var workflowRange = Enumerable.Range(workflow_ids, 200);
        var fakeWorkflows = new Faker<Workflow>()
               .StrictMode(true)
               .RuleFor(o => o.Id, f => workflow_ids++)
               .RuleFor(o => o.UserId, f => f.PickRandom(userRange))
               .RuleFor(o => o.User, _ => default!)
               .RuleFor(o => o.BoreholeId, f => f.PickRandom(boreholeRange))
               .RuleFor(o => o.Borehole, _ => default!)
               .RuleFor(o => o.Notes, f => f.Random.Words(4))
               .RuleFor(o => o.Mentions, f => new[] { f.Random.Word(), f.Random.Word(), f.Random.Word(), f.Random.Word() })
               .RuleFor(o => o.Role, f => f.PickRandom<Role>())
               .RuleFor(o => o.Started, f => f.Date.Between(new DateTime(1990, 1, 1).ToUniversalTime(), new DateTime(2005, 1, 1).ToUniversalTime()))
               .RuleFor(o => o.Finished, f => f.Date.Between(new DateTime(2005, 2, 1).ToUniversalTime(), new DateTime(2022, 1, 1).ToUniversalTime()));

        Workflow SeededWorkflows(int seed) => fakeWorkflows.UseSeed(seed).Generate();
        context.Workflows.AddRange(workflowRange.Select(SeededWorkflows));
        context.SaveChanges();

        // Sync all database sequences
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.workgroups', 'id_wgp'), {workgroup_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.borehole', 'id_bho'), {borehole_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.events', 'id_evs'), {event_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.feedbacks', 'id_feb'), {feedback_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.files', 'id_fil'), {file_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.stratigraphy', 'id_sty'), {stratigraphy_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.layer', 'id_lay'), {layer_ids - 1})");
        context.Database.ExecuteSqlRaw($"SELECT setval(pg_get_serial_sequence('bdms.workflow', 'id_wkf'), {workflow_ids - 1})");

        transaction.Commit();
    }
}
#pragma warning restore CA1505
