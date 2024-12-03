using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class UploadControllerTest
{
    private const int MaxBoreholeSeedId = 1002999;
    private const int MaxStratigraphySeedId = 6002999;
    private const int MaxLayerSeedId = 7029999;

    private BdmsContext context;
    private UploadController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<UploadController>> loggerMock;
    private Mock<ILogger<LocationService>> loggerLocationServiceMock;
    private Mock<ILogger<CoordinateService>> loggerCoordinateServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<UploadController>>();

        loggerLocationServiceMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        var locationService = new LocationService(loggerLocationServiceMock.Object, httpClientFactoryMock.Object);

        loggerCoordinateServiceMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
        var coordinateService = new CoordinateService(loggerCoordinateServiceMock.Object, httpClientFactoryMock.Object);

        var s3ClientMock = new AmazonS3Client(configuration["S3:ACCESS_KEY"], configuration["S3:SECRET_KEY"], new AmazonS3Config()
        {
            ServiceURL = configuration["S3:ENDPOINT"],
            ForcePathStyle = true,
            UseHttp = configuration["S3:SECURE"] == "0",
        });
        var loggerBoreholeFileCloudService = new Mock<ILogger<BoreholeFileCloudService>>(MockBehavior.Strict);
        var contextAccessorMock = new Mock<IHttpContextAccessor>(MockBehavior.Strict);
        contextAccessorMock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext());
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, context.Users.FirstOrDefault().SubjectId) }));
        var boreholeFileCloudService = new BoreholeFileCloudService(context, configuration, loggerBoreholeFileCloudService.Object, contextAccessorMock.Object, s3ClientMock);

        controller = new UploadController(context, loggerMock.Object, locationService, coordinateService, boreholeFileCloudService) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // Remove boreholes that were uploaded.
        var addedBoreholes = context.Boreholes.Where(b => b.Id > MaxBoreholeSeedId);
        var addedWorkflows = context.Workflows.Where(w => addedBoreholes.Select(b => b.Id).Contains(w.BoreholeId));
        var addedStratigraphies = context.Stratigraphies.Where(s => s.Id > MaxStratigraphySeedId);
        var addedLayers = context.Layers.Where(l => l.Id > MaxLayerSeedId);
        context.Boreholes.RemoveRange(addedBoreholes);
        context.Workflows.RemoveRange(addedWorkflows);
        context.Stratigraphies.RemoveRange(addedStratigraphies);
        context.Layers.RemoveRange(addedLayers);
        context.SaveChanges();

        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        loggerMock.Verify();
    }

    [TestMethod]
    public async Task UploadJsonWithSingleObjectInsteadOfArrayShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_single.json");

        ActionResult<int> response = await controller.UploadJsonFile(workgroupId: 1, boreholeJsonFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("The provided file is not a array of boreholes or is not a valid JSON format.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadJsonWithValidJsonShouldSaveData()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_valid.json");

        ActionResult<int> response = await controller.UploadJsonFile(workgroupId: 1, boreholeJsonFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);

        var borehole = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "PURPLETOLL");

        // Assert borehole
        Assert.IsNotNull(borehole.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(borehole.Created, "Created should not be null");
        Assert.IsNotNull(borehole.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(borehole.Updated, "Updated should not be null");
        Assert.IsNull(borehole.LockedById, "LockedById should be null");
        Assert.IsNull(borehole.Locked, "Locked should be null");
        Assert.AreEqual(1, borehole.WorkgroupId, "WorkgroupId");
        Assert.IsNotNull(borehole.Workgroup, "Workgroup should not be null");
        Assert.IsTrue(borehole.IsPublic, "IsPublic");
        Assert.IsNull(borehole.TypeId, "TypeId should be null");
        Assert.IsNull(borehole.Type, "Type should be null");
        Assert.AreEqual(2739000, borehole.LocationX, "LocationX");
        Assert.AreEqual(6, borehole.PrecisionLocationX, "PrecisionLocationX");
        Assert.AreEqual(1291100, borehole.LocationY, "LocationY");
        Assert.AreEqual(7, borehole.PrecisionLocationY, "PrecisionLocationY");
        Assert.AreEqual(610700, borehole.LocationXLV03, "LocationXLV03");
        Assert.AreEqual(4, borehole.PrecisionLocationXLV03, "PrecisionLocationXLV03");
        Assert.AreEqual(102500, borehole.LocationYLV03, "LocationYLV03");
        Assert.AreEqual(3, borehole.PrecisionLocationYLV03, "PrecisionLocationYLV03");
        Assert.AreEqual((ReferenceSystem)20104002, borehole.OriginalReferenceSystem, "OriginalReferenceSystem");
        Assert.AreEqual(3160.6575921925983, borehole.ElevationZ, "ElevationZ");
        Assert.AreEqual(20106001, borehole.HrsId, "HrsId");
        Assert.IsNull(borehole.Hrs, "Hrs should be null");
        Assert.AreEqual(567.0068294587577, borehole.TotalDepth, "TotalDepth");
        Assert.IsNull(borehole.RestrictionId, "RestrictionId should be null");
        Assert.IsNull(borehole.Restriction, "Restriction should be null");
        Assert.IsNull(borehole.RestrictionUntil, "RestrictionUntil should be null");
        Assert.IsFalse(borehole.NationalInterest, "NationalInterest");
        Assert.AreEqual("PURPLETOLL", borehole.OriginalName, "OriginalName");
        Assert.AreEqual("GREYGOAT", borehole.AlternateName, "AlternateName");
        Assert.IsNull(borehole.LocationPrecisionId, "LocationPrecisionId should be null");
        Assert.IsNull(borehole.LocationPrecision, "LocationPrecision should be null");
        Assert.AreEqual(20114002, borehole.ElevationPrecisionId, "ElevationPrecisionId");
        Assert.IsNull(borehole.ElevationPrecision, "ElevationPrecision should be null");
        Assert.AreEqual("Switchable explicit superstructure", borehole.ProjectName, "ProjectName");
        Assert.AreEqual("Montenegro", borehole.Country, "Country");
        Assert.AreEqual("Texas", borehole.Canton, "Canton");
        Assert.AreEqual("Lake Reecechester", borehole.Municipality, "Municipality");
        Assert.AreEqual(22103009, borehole.PurposeId, "PurposeId");
        Assert.IsNull(borehole.Purpose, "Purpose should be null");
        Assert.AreEqual(22104006, borehole.StatusId, "StatusId");
        Assert.IsNull(borehole.Status, "Status should be null");
        Assert.AreEqual(22108003, borehole.QtDepthId, "QtDepthId");
        Assert.IsNull(borehole.QtDepth, "QtDepth should be null");
        Assert.AreEqual(759.5479580385368, borehole.TopBedrockFreshMd, "TopBedrockFreshMd");
        Assert.AreEqual(1.338392690447342, borehole.TopBedrockWeatheredMd, "TopBedrockWeatheredMd");
        Assert.IsFalse(borehole.HasGroundwater, "HasGroundwater");
        Assert.AreEqual(borehole.Remarks, "This product works too well.");
        Assert.AreEqual(15104543, borehole.LithologyTopBedrockId, "LithologyTopBedrockId");
        Assert.IsNull(borehole.LithologyTopBedrock, "LithologyTopBedrock should be null");
        Assert.AreEqual(15302037, borehole.LithostratigraphyId, "LithostratigraphyId");
        Assert.IsNull(borehole.Lithostratigraphy, "Lithostratigraphy should be null");
        Assert.AreEqual(15001060, borehole.ChronostratigraphyId, "ChronostratigraphyId");
        Assert.IsNull(borehole.Chronostratigraphy, "Chronostratigraphy should be null");
        Assert.AreEqual(899.1648284248844, borehole.ReferenceElevation, "ReferenceElevation");
        Assert.AreEqual(20114006, borehole.QtReferenceElevationId, "QtReferenceElevationId");
        Assert.IsNull(borehole.QtReferenceElevation, "QtReferenceElevation should be null");
        Assert.AreEqual(20117005, borehole.ReferenceElevationTypeId, "ReferenceElevationTypeId");
        Assert.IsNull(borehole.ReferenceElevationType, "ReferenceElevationType should be null");

        // Assert stratigraphy
        Assert.AreEqual(2, borehole.Stratigraphies.Count, "Stratigraphies.Count");
        var stratigraphy = borehole.Stratigraphies.First();
        Assert.IsNotNull(stratigraphy.Borehole, "stratigraphy.Borehole should not be null");
        Assert.IsTrue(stratigraphy.IsPrimary, "IsPrimary");
        Assert.IsNotNull(stratigraphy.Updated, "Updated should not be null");
        Assert.IsNotNull(stratigraphy.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(stratigraphy.Created, "Created should not be null");
        Assert.IsNotNull(stratigraphy.CreatedById, "CreatedById should not be null");
        Assert.AreEqual("Marjolaine Hegmann", stratigraphy.Name, "Name");
        Assert.AreEqual(9003, stratigraphy.QualityId, "QualityId");
        Assert.IsNull(stratigraphy.Quality, "Quality should be null");
        Assert.AreEqual("My co-worker Ali has one of these. He says it looks towering.", stratigraphy.Notes, "Notes");

        // Assert stratigraphy's layers
        Assert.AreEqual(2, stratigraphy.Layers.Count, "Stratigraphy.Layers.Count");
        var layer = stratigraphy.Layers.First();
        Assert.IsNotNull(layer.Created, "Created should not be null");
        Assert.IsNotNull(layer.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(layer.Updated, "Updated should not be null");
        Assert.IsNotNull(layer.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(layer.Stratigraphy, "layer.Stratigraphy should not be null");
        Assert.IsTrue(layer.IsUndefined, "IsUndefined should be true");
        Assert.AreEqual(0, layer.FromDepth, "FromDepth");
        Assert.AreEqual(10, layer.ToDepth, "ToDepth");
        Assert.IsFalse(layer.IsLast, "IsLast should be false");
        Assert.AreEqual(9002, layer.DescriptionQualityId, "DescriptionQualityId");
        Assert.IsNull(layer.DescriptionQuality, "DescriptionQuality should be null");
        Assert.AreEqual(15104888, layer.LithologyId, "LithologyId");
        Assert.IsNull(layer.Lithology, "Lithology should be null");
        Assert.AreEqual(21101003, layer.PlasticityId, "PlasticityId");
        Assert.IsNull(layer.Plasticity, "Plasticity should be null");
        Assert.AreEqual(21103003, layer.ConsistanceId, "ConsistanceId");
        Assert.IsNull(layer.Consistance, "Consistance should be null");
        Assert.IsNull(layer.AlterationId, "AlterationId should be null");
        Assert.IsNull(layer.Alteration, "Alteration should be null");
        Assert.AreEqual(21102003, layer.CompactnessId, "CompactnessId");
        Assert.IsNull(layer.Compactness, "Compactness should be null");
        Assert.AreEqual(21109002, layer.GrainSize1Id, "GrainSize1Id");
        Assert.IsNull(layer.GrainSize1, "GrainSize1 should be null");
        Assert.AreEqual(21109002, layer.GrainSize2Id, "GrainSize2Id");
        Assert.IsNull(layer.GrainSize2, "GrainSize2 should be null");
        Assert.AreEqual(21116003, layer.CohesionId, "CohesionId");
        Assert.IsNull(layer.Cohesion, "Cohesion should be null");
        Assert.AreEqual("synergistic", layer.OriginalUscs, "OriginalUscs");
        Assert.AreEqual(23107001, layer.UscsDeterminationId, "UscsDeterminationId");
        Assert.IsNull(layer.UscsDetermination, "UscsDetermination should be null");
        Assert.AreEqual("payment optical copy networks", layer.Notes, "Notes");
        Assert.AreEqual(15303008, layer.LithostratigraphyId, "LithostratigraphyId");
        Assert.IsNull(layer.Lithostratigraphy, "Lithostratigraphy should be null");
        Assert.AreEqual(21105004, layer.HumidityId, "HumidityId");
        Assert.IsNull(layer.Humidity, "Humidity should be null");
        Assert.IsTrue(layer.IsStriae, "IsStriae should be true");
        Assert.AreEqual(30000019, layer.GradationId, "GradationId");
        Assert.IsNull(layer.Gradation, "Gradation should be null");
        Assert.AreEqual(15104470, layer.LithologyTopBedrockId, "LithologyTopBedrockId");
        Assert.IsNull(layer.LithologyTopBedrock, "LithologyTopBedrock should be null");
        Assert.AreEqual("Handmade connect Data Progressive Danish Krone", layer.OriginalLithology, "OriginalLithology");
        Assert.IsNotNull(layer.LayerDebrisCodes, "LayerDebrisCodes should not be null");
        Assert.IsNotNull(layer.LayerGrainShapeCodes, "LayerGrainShapeCodes should not be null");
        Assert.IsNotNull(layer.LayerGrainAngularityCodes, "LayerGrainAngularityCodes should not be null");
        Assert.IsNotNull(layer.LayerOrganicComponentCodes, "LayerOrganicComponentCodes should not be null");
        Assert.IsNotNull(layer.LayerUscs3Codes, "LayerUscs3Codes should not be null");
        Assert.IsNotNull(layer.LayerColorCodes, "LayerColorCodes should not be null");

        // Assert stratigraphy's lithological descriptions
        Assert.AreEqual(2, stratigraphy.LithologicalDescriptions.Count, "Stratigraphy.LithologicalDescriptions.Count");
        var lithologicalDescription = stratigraphy.LithologicalDescriptions.First(x => x.FromDepth == 0f);
        Assert.IsNotNull(lithologicalDescription.Created, "Created should not be null");
        Assert.IsNotNull(lithologicalDescription.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(lithologicalDescription.Updated, "Updated should not be null");
        Assert.IsNotNull(lithologicalDescription.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(lithologicalDescription.Stratigraphy, "lithologicalDescription.Stratigraphy should not be null");
        Assert.AreEqual("Bouvet Island (Bouvetoya) Borders networks", lithologicalDescription.Description, "Description");
        Assert.AreEqual(9005, lithologicalDescription.DescriptionQualityId, "DescriptionQualityId");
        Assert.IsNull(lithologicalDescription.DescriptionQuality, "DescriptionQuality should be null");
        Assert.AreEqual(0, lithologicalDescription.FromDepth, "FromDepth");
        Assert.AreEqual(10, lithologicalDescription.ToDepth, "ToDepth");

        // Assert stratigraphy's facies descriptions
        Assert.AreEqual(2, stratigraphy.FaciesDescriptions.Count, "Stratigraphy.FaciesDescriptions.Count");
        var faciesDescription = stratigraphy.FaciesDescriptions.First(x => x.FromDepth == 0f);
        Assert.IsNotNull(faciesDescription.Created, "Created should not be null");
        Assert.IsNotNull(faciesDescription.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(faciesDescription.Updated, "Updated should not be null");
        Assert.IsNotNull(faciesDescription.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(faciesDescription.Stratigraphy, "faciesDescription.Stratigraphy should not be null");
        Assert.AreEqual("Bouvet Island (Bouvetoya) Borders networks", faciesDescription.Description, "Description");
        Assert.AreEqual(9005, faciesDescription.DescriptionQualityId, "DescriptionQualityId");
        Assert.IsNull(faciesDescription.DescriptionQuality, "DescriptionQuality should be null");
        Assert.AreEqual(0, faciesDescription.FromDepth, "FromDepth");
        Assert.AreEqual(10, faciesDescription.ToDepth, "ToDepth");

        // Assert stratigraphy's chronostratigraphy layers
        Assert.AreEqual(2, stratigraphy.ChronostratigraphyLayers.Count, "Stratigraphy.ChronostratigraphyLayers.Count");
        var chronostratigraphyLayer = stratigraphy.ChronostratigraphyLayers.First(x => x.FromDepth == 0f);
        Assert.IsNotNull(chronostratigraphyLayer.Created, "Created should not be null");
        Assert.IsNotNull(chronostratigraphyLayer.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(chronostratigraphyLayer.Updated, "Updated should not be null");
        Assert.IsNotNull(chronostratigraphyLayer.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(chronostratigraphyLayer.Stratigraphy, "chronostratigraphyLayer.Stratigraphy should not be null");
        Assert.AreEqual(15001134, chronostratigraphyLayer.ChronostratigraphyId, "ChronostratigraphyId");
        Assert.IsNull(chronostratigraphyLayer.Chronostratigraphy, "Chronostratigraphy should be null");
        Assert.AreEqual(0, chronostratigraphyLayer.FromDepth, "FromDepth");
        Assert.AreEqual(10, chronostratigraphyLayer.ToDepth, "ToDepth");

        // Assert stratigraphy's lithostratigraphy layers
        Assert.AreEqual(2, stratigraphy.LithostratigraphyLayers.Count, "Stratigraphy.LithostratigraphyLayers.Count");
        var lithostratigraphyLayer = stratigraphy.LithostratigraphyLayers.First(x => x.FromDepth == 0f);
        Assert.IsNotNull(lithostratigraphyLayer.Created, "Created should not be null");
        Assert.IsNotNull(lithostratigraphyLayer.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(lithostratigraphyLayer.Updated, "Updated should not be null");
        Assert.IsNotNull(lithostratigraphyLayer.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(lithostratigraphyLayer.Stratigraphy, "lithostratigraphyLayer.Stratigraphy should not be null");
        Assert.AreEqual(15303501, lithostratigraphyLayer.LithostratigraphyId, "LithostratigraphyId");
        Assert.IsNull(lithostratigraphyLayer.Lithostratigraphy, "lithostratigraphyLayer.Lithostratigraphy should not be null");
        Assert.AreEqual(0, lithostratigraphyLayer.FromDepth, "FromDepth");
        Assert.AreEqual(10, lithostratigraphyLayer.ToDepth, "ToDepth");

        // Assert borehole's completions
        Assert.AreEqual(2, borehole.Completions.Count, "Completions.Count");
        var completion = borehole.Completions.First();
        Assert.IsNotNull(completion.Created, "Created should not be null");
        Assert.IsNotNull(completion.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(completion.Updated, "Updated should not be null");
        Assert.IsNotNull(completion.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(completion.Borehole, "completion.Borehole should not be null");
        Assert.AreEqual("Handcrafted Rubber Chair", completion.Name, "Name");
        Assert.AreEqual(16000000, completion.KindId, "KindId");
        Assert.IsNull(completion.Kind, "Kind should be null");
        Assert.AreEqual("Ratione ut non in recusandae labore.", completion.Notes, "Notes");
        Assert.AreEqual(DateOnly.Parse("2021-01-24"), completion.AbandonDate, "AbandonDate");

        // Assert completion's instrumentations
        Assert.AreEqual(1, completion.Instrumentations.Count, "Instrumentations.Count");
        var instrumentation = completion.Instrumentations.First();
        Assert.IsNotNull(instrumentation.Created, "Created should not be null");
        Assert.IsNotNull(instrumentation.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(instrumentation.Updated, "Updated should not be null");
        Assert.IsNotNull(instrumentation.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(instrumentation.Completion, "instrumentation.Completion should be null");
        Assert.AreEqual(70, instrumentation.FromDepth, "FromDepth");
        Assert.AreEqual(80, instrumentation.ToDepth, "ToDepth");
        Assert.AreEqual("Explorer", instrumentation.Name, "Name");
        Assert.AreEqual(25000201, instrumentation.KindId, "KindId");
        Assert.IsNull(instrumentation.Kind, "Kind should be null");
        Assert.AreEqual(25000213, instrumentation.StatusId, "StatusId");
        Assert.IsNull(instrumentation.Status, "Status should be null");
        Assert.IsFalse(instrumentation.IsOpenBorehole, "IsOpenBorehole should be false");
        Assert.AreEqual(17000312, instrumentation.CasingId, "CasingId");
        Assert.IsNotNull(instrumentation.Casing, "instrumentation.Casing should not be null");
        Assert.AreEqual("copy Field bandwidth Burg", instrumentation.Notes, "Notes");

        // Assert completion's backfills
        Assert.AreEqual(1, completion.Backfills.Count, "Backfills.Count");
        var backfill = completion.Backfills.First();
        Assert.IsNotNull(backfill.Created, "Created should not be null");
        Assert.IsNotNull(backfill.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(backfill.Updated, "Updated should not be null");
        Assert.IsNotNull(backfill.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(backfill.Completion, "backfill.Completion should be null");
        Assert.AreEqual(70, backfill.FromDepth, "FromDepth");
        Assert.AreEqual(80, backfill.ToDepth, "ToDepth");
        Assert.AreEqual(25000300, backfill.KindId, "KindId");
        Assert.IsNull(backfill.Kind, "Kind should be null");
        Assert.AreEqual(25000306, backfill.MaterialId, "MaterialId");
        Assert.IsNull(backfill.Material, "Material should be null");
        Assert.IsFalse(backfill.IsOpenBorehole, "IsOpenBorehole should be false");
        Assert.AreEqual(17000011, backfill.CasingId, "CasingId");
        Assert.IsNotNull(backfill.Casing, "backfill.Casing should not be null");
        Assert.AreEqual("Licensed Plastic Soap Managed withdrawal Tools & Industrial", backfill.Notes, "Notes");

        // Assert completion's casings
        Assert.AreEqual(1, completion.Casings.Count, "Casings.Count");
        var casing = completion.Casings.First();
        Assert.IsNotNull(casing.Created, "Created should not be null");
        Assert.IsNotNull(casing.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(casing.Updated, "Updated should not be null");
        Assert.IsNotNull(casing.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(casing.Completion, "casing.Completion should not be null");
        Assert.AreEqual("Rustic", casing.Name, "Name");
        Assert.AreEqual(DateOnly.Parse("2021-03-24"), casing.DateStart, "DateStart");
        Assert.AreEqual(DateOnly.Parse("2021-12-12"), casing.DateFinish, "DateFinish");
        Assert.AreEqual("matrices Managed withdrawal Tools & Industrial", casing.Notes, "Notes");

        // Assert casing's casingelements
        Assert.AreEqual(2, casing.CasingElements.Count, "CasingElements.Count");
        var casingElement = casing.CasingElements.First();
        Assert.IsNotNull(casingElement.Created, "Created should not be null");
        Assert.IsNotNull(casingElement.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(casingElement.Updated, "Updated should not be null");
        Assert.IsNotNull(casingElement.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(casingElement.Casing, "casingElement.Casing should not be null");
        Assert.AreEqual(0, casingElement.FromDepth, "FromDepth");
        Assert.AreEqual(10, casingElement.ToDepth, "ToDepth");
        Assert.AreEqual(25000116, casingElement.KindId, "KindId");
        Assert.IsNull(casingElement.Kind, "Kind should be null");
        Assert.AreEqual(25000114, casingElement.MaterialId, "MaterialId");
        Assert.IsNull(casingElement.Material, "Material should be null");
        Assert.AreEqual(7.91766288360472, casingElement.InnerDiameter, "InnerDiameter");
        Assert.AreEqual(4.857009269696199, casingElement.OuterDiameter, "OuterDiameter");

        // Assert borehole's sections
        Assert.AreEqual(2, borehole.Sections.Count, "Sections.Count");
        var section = borehole.Sections.First();
        Assert.IsNotNull(section.Created, "Created should not be null");
        Assert.IsNotNull(section.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(section.Updated, "Updated should not be null");
        Assert.IsNotNull(section.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(section.Borehole, "section.Borehole should not be null");
        Assert.AreEqual("Gourde", section.Name, "Name");

        // Assert section's sectionelements
        Assert.AreEqual(2, section.SectionElements.Count, "SectionElements.Count");
        var sectionElement = section.SectionElements.First();
        Assert.IsNotNull(sectionElement.Created, "Created should not be null");
        Assert.IsNotNull(sectionElement.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(sectionElement.Updated, "Updated should not be null");
        Assert.IsNotNull(sectionElement.UpdatedById, "UpdatedById should not be null");
        Assert.IsNotNull(sectionElement.Section, "sectionElement.Section should not be null");
        Assert.AreEqual(60, sectionElement.FromDepth, "FromDepth");
        Assert.AreEqual(143, sectionElement.ToDepth, "ToDepth");
        Assert.AreEqual(0, sectionElement.Order, "Order");
        Assert.AreEqual(22107004, sectionElement.DrillingMethodId, "DrillingMethodId");
        Assert.AreEqual(DateOnly.Parse("2021-04-06"), sectionElement.DrillingStartDate, "DrillingStartDate");
        Assert.AreEqual(DateOnly.Parse("2021-05-31"), sectionElement.DrillingEndDate, "DrillingEndDate");
        Assert.AreEqual(22102002, sectionElement.CuttingsId, "CuttingsId");
        Assert.AreEqual(8.990221083625322, sectionElement.DrillingDiameter, "DrillingDiameter");
        Assert.AreEqual(18.406672318655378, sectionElement.DrillingCoreDiameter, "DrillingCoreDiameter");
        Assert.AreEqual(22109003, sectionElement.DrillingMudTypeId, "DrillingMudTypeId");
        Assert.AreEqual(22109020, sectionElement.DrillingMudSubtypeId, "DrillingMudSubtypeId");

        // Assert borehole's observations
        Assert.AreEqual(2, borehole.Observations.Count, "Observations.Count");
        var observation = borehole.Observations.First(x => x.FromDepthM == 1900);
        Assert.IsNotNull(observation.Created, "Created should not be null");
        Assert.IsNotNull(observation.CreatedById, "CreatedById should not be null");
        Assert.IsNotNull(observation.Updated, "Updated should not be null");
        Assert.IsNotNull(observation.UpdatedById, "UpdatedById should not be null");
        Assert.AreEqual((ObservationType)2, observation.Type, "Type");
        Assert.AreEqual(DateTime.Parse("2021-10-05T17:41:48.389173Z", null, System.Globalization.DateTimeStyles.AdjustToUniversal), observation.StartTime, "StartTime");
        Assert.AreEqual(DateTime.Parse("2021-09-21T20:42:21.785577Z", null, System.Globalization.DateTimeStyles.AdjustToUniversal), observation.EndTime, "EndTime");
        Assert.AreEqual(1380.508568643829, observation.Duration, "Duration");
        Assert.AreEqual(1900.0, observation.FromDepthM, "FromDepthM");
        Assert.AreEqual(2227.610979433456, observation.ToDepthM, "ToDepthM");
        Assert.AreEqual(3136.3928836828063, observation.FromDepthMasl, "FromDepthMasl");
        Assert.AreEqual(4047.543691819787, observation.ToDepthMasl, "ToDepthMasl");
        Assert.IsTrue(observation.IsOpenBorehole, "IsOpenBorehole");
        Assert.IsNotNull(observation.Casing, "observation.Casing should be null");
        Assert.AreEqual("Quis repellendus nihil et ipsam ut ad eius.", observation.Comment, "Comment");
        Assert.AreEqual(15203156, observation.ReliabilityId, "ReliabilityId");
        Assert.IsNull(observation.Reliability, "Reliability should be null");
        Assert.IsNotNull(observation.Borehole, "observation.Borehole should not be null");

        // Assert borehole's workflows
        Assert.AreEqual(1, borehole.Workflows.Count, "Workflows.Count");
        var workflow = borehole.Workflows.First();
        Assert.IsNull(workflow.Started, "Started should be null");
        Assert.IsNull(workflow.Finished, "Finished should be null");
        Assert.IsNull(workflow.Notes, "Notes should be null");
        Assert.AreEqual(Role.Editor, workflow.Role, "Role");
        Assert.IsNotNull(workflow.User, "User should be null");
        Assert.IsNotNull(workflow.Borehole, "workflow.Borehole should not be null");
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
    }

    [TestMethod]
    public async Task UploadJsonWithNoJsonFileShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("not_a_json_file.csv");

        ActionResult<int> response = await controller.UploadJsonFile(workgroupId: 1, boreholeJsonFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid file type for borehole JSON.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadJsonWithDuplicateBoreholesByLocationShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_duplicated_by_location.json");

        ActionResult<int> response = await controller.UploadJsonFile(workgroupId: 1, boreholeJsonFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole0"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole1"]);
    }

    [TestMethod]
    public async Task UploadJsonWithDuplicatesExistingBoreholeShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_duplicates_existing.json");

        ActionResult<int> response = await controller.UploadJsonFile(workgroupId: 1, boreholeJsonFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Borehole0"]);
    }

    [TestMethod]
    public async Task UploadLithologyShouldSaveData()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: lithoCsvFile, attachments: null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Seth Patel");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Seth Patel", borehole.OriginalName);

        // Assert imported stratigraphy & lithologies
        Assert.AreEqual(2, borehole.Stratigraphies.Count);

        // First stratigraphy
        var stratigraphy = borehole.Stratigraphies.First();
        Assert.AreEqual(new DateTime(2021, 8, 6), stratigraphy.Date?.Date);
        Assert.AreEqual("Bennett", stratigraphy.Name);
        Assert.AreEqual(2, stratigraphy.Layers.Count);
        var lithology = stratigraphy.Layers.First(l => l.FromDepth == 0.125);
        Assert.AreEqual(100, lithology.ToDepth);
        Assert.AreEqual(false, lithology.IsLast);
        Assert.AreEqual(9001, lithology.DescriptionQualityId);
        Assert.AreEqual(15104915, lithology.LithologyId);
        Assert.AreEqual(15302034, lithology.LithostratigraphyId);
        Assert.AreEqual("Granite", lithology.OriginalUscs);
        Assert.AreEqual(23107001, lithology.UscsDeterminationId);
        Assert.AreEqual(23101005, lithology.Uscs1Id);
        Assert.AreEqual(21101001, lithology.GrainSize1Id);
        Assert.AreEqual(23101008, lithology.Uscs2Id);
        Assert.AreEqual(21103008, lithology.GrainSize2Id);
        Assert.AreEqual(false, lithology.IsStriae);
        Assert.AreEqual(21103003, lithology.ConsistanceId);
        Assert.AreEqual(21101001, lithology.PlasticityId);
        Assert.AreEqual(21102007, lithology.CompactnessId);
        Assert.AreEqual(21116005, lithology.CohesionId);
        Assert.AreEqual(21105002, lithology.HumidityId);
        Assert.AreEqual(21106004, lithology.AlterationId);
        Assert.AreEqual("instruction set Dynamic backing up Lock", lithology.Notes);
        Assert.AreEqual("trace back Peso", lithology.OriginalLithology);
        Assert.AreEqual(30000018, lithology.GradationId);
        Assert.AreEqual(15104916, lithology.LithologyTopBedrockId);
        Assert.AreEqual(2, lithology.ColorCodelists.Count);
        Assert.AreEqual(2, lithology.DebrisCodelists.Count);
        Assert.AreEqual(2, lithology.GrainAngularityCodelists.Count);
        Assert.AreEqual(2, lithology.GrainShapeCodelists.Count);
        Assert.AreEqual(3, lithology.OrganicComponentCodelists.Count);
        Assert.AreEqual(3, lithology.Uscs3Codelists.Count);

        lithology = stratigraphy.Layers.First(l => l.FromDepth == 11);
        Assert.AreEqual(12, lithology.ToDepth);

        // Second stratigraphy
        stratigraphy = borehole.Stratigraphies.Skip(1).First();
        Assert.AreEqual(1, stratigraphy.Layers.Count);
        lithology = stratigraphy.Layers.First();
        Assert.AreEqual(55, lithology.FromDepth);
        Assert.AreEqual(55.23, lithology.ToDepth);
    }

    [TestMethod]
    public async Task UploadLithologyWithMultiCodeListPropertiesProvidedShouldSaveData()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_with_multi_code_list_properties/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_with_multi_code_list_properties/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: lithoCsvFile, attachments: null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = GetBoreholesWithIncludes(context.Boreholes)
            .ToList().Find(b => b.OriginalName == "Seth Patel");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Seth Patel", borehole.OriginalName);

        // Assert imported stratigraphy & lithologies
        Assert.AreEqual(2, borehole.Stratigraphies.Count);

        // First stratigraphy
        var stratigraphy = borehole.Stratigraphies.First();
        Assert.AreEqual(2, stratigraphy.Layers.Count);
        var lithology = stratigraphy.Layers.First(l => l.FromDepth == 0.125);
        Assert.AreEqual(100, lithology.ToDepth);
        Assert.AreEqual(2, lithology.ColorCodelists.Count);
        Assert.AreEqual(2, lithology.DebrisCodelists.Count);
        Assert.AreEqual(3, lithology.GrainAngularityCodelists.Count);
        Assert.AreEqual(3, lithology.GrainShapeCodelists.Count);
        Assert.AreEqual(3, lithology.OrganicComponentCodelists.Count);
        Assert.AreEqual(3, lithology.Uscs3Codelists.Count);
        lithology = stratigraphy.Layers.First(l => l.FromDepth == 11);
        Assert.AreEqual(12, lithology.ToDepth);
        Assert.AreEqual(0, lithology.ColorCodelists.Count);
        Assert.AreEqual(1, lithology.DebrisCodelists.Count);
        Assert.AreEqual(0, lithology.GrainAngularityCodelists.Count);
        Assert.AreEqual(0, lithology.GrainShapeCodelists.Count);
        Assert.AreEqual(0, lithology.OrganicComponentCodelists.Count);
        Assert.AreEqual(0, lithology.Uscs3Codelists.Count);

        // Second stratigraphy
        stratigraphy = borehole.Stratigraphies.Skip(1).First();
        Assert.AreEqual(1, stratigraphy.Layers.Count);
        lithology = stratigraphy.Layers.First();
        Assert.AreEqual(55, lithology.FromDepth);
        Assert.AreEqual(55.23, lithology.ToDepth);
        Assert.AreEqual(0, lithology.ColorCodelists.Count);
        Assert.AreEqual(0, lithology.DebrisCodelists.Count);
        Assert.AreEqual(0, lithology.GrainAngularityCodelists.Count);
        Assert.AreEqual(0, lithology.GrainShapeCodelists.Count);
        Assert.AreEqual(0, lithology.OrganicComponentCodelists.Count);
        Assert.AreEqual(2, lithology.Uscs3Codelists.Count);
    }

    [TestMethod]
    public async Task UploadShouldSaveDataToDatabaseAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Unit_Test_6");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_6_a", borehole.AlternateName);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(new DateTime(2024, 06, 15), borehole.RestrictionUntil);
        Assert.AreEqual(2474.472693, borehole.TotalDepth);
        Assert.AreEqual("Projekt 6", borehole.ProjectName);
        Assert.AreEqual(4, borehole.BoreholeCodelists.Count);
        Assert.AreEqual("Id_16", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000003).Value);
        Assert.AreEqual("AUTOSTEED", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000011).Value);
        Assert.AreEqual("Bern", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Thun", borehole.Municipality);
        Assert.AreEqual(20113004, borehole.LocationPrecisionId);
        Assert.AreEqual(20114005, borehole.ElevationPrecisionId);
        Assert.AreEqual(20101001, borehole.TypeId);
        Assert.AreEqual(827.8441205, borehole.TopBedrockFreshMd);
        Assert.AreEqual(759.7574008, borehole.TopBedrockWeatheredMd);

        Assert.AreEqual("POINT (2613116 1179127)", borehole.Geometry.ToString());

        // Assert workflow was created for borehole.
        var workflow = context.Workflows.SingleOrDefault(w => w.BoreholeId == borehole.Id);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(Role.Editor, workflow.Role);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(null, workflow.Finished);
    }

    [TestMethod]
    public async Task UploadShouldSaveMinimalDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, attachments: null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Unit_Test_2");
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual(null, borehole.AlternateName);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(null, borehole.RestrictionUntil);
        Assert.AreEqual(null, borehole.TotalDepth);
        Assert.AreEqual(null, borehole.ProjectName);
        Assert.AreEqual(0, borehole.BoreholeCodelists.Count);
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000010 1000010)", borehole.Geometry.ToString());

        // Assert workflow was created for borehole.
        var workflow = context.Workflows.SingleOrDefault(w => w.BoreholeId == borehole.Id);
        Assert.IsNotNull(workflow);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(Role.Editor, workflow.Role);
        Assert.AreEqual(borehole.CreatedById, workflow.UserId);
        Assert.AreEqual(null, workflow.Finished);
    }

    [TestMethod]
    public async Task UploadShouldSavePrecisionDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("precision_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, attachments: null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(7, okResult.Value);

        // Assert imported values
        var boreholeLV95 = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Unit_Test_2");
        Assert.AreEqual(ReferenceSystem.LV95, boreholeLV95.OriginalReferenceSystem);
        Assert.AreEqual(2000010.12, boreholeLV95.LocationX);
        Assert.AreEqual(1000010.1, boreholeLV95.LocationY);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationX);
        Assert.AreEqual(1, boreholeLV95.PrecisionLocationY);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationXLV03);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationYLV03);

        var boreholeLV03 = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Unit_Test_6");
        Assert.AreEqual(ReferenceSystem.LV03, boreholeLV03.OriginalReferenceSystem.Value);
        Assert.AreEqual(20050.12, boreholeLV03.LocationXLV03);
        Assert.AreEqual(10050.12345, boreholeLV03.LocationYLV03);
        Assert.AreEqual(2, boreholeLV03.PrecisionLocationXLV03);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationYLV03);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationX);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationY);

        var boreholeWithZeros = GetBoreholesWithIncludes(context.Boreholes).ToList().Find(b => b.OriginalName == "Unit_Test_7");
        Assert.AreEqual(ReferenceSystem.LV03, boreholeWithZeros.OriginalReferenceSystem.Value);
        Assert.AreEqual(20060.000, boreholeWithZeros.LocationXLV03);
        Assert.AreEqual(10060.0000, boreholeWithZeros.LocationYLV03);
        Assert.AreEqual(3, boreholeWithZeros.PrecisionLocationXLV03);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationYLV03);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationX);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationY);
    }

    [TestMethod]
    public async Task UploadShouldSaveBoreholeWithAttachmentsAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("borehole_with_attachments.csv");
        var firstAttachmentFile = GetRandomPDFFile("attachment_1.pdf");
        var secondAttachmentFile = GetRandomFile("attachment_2.txt");
        var thirdAttachmentFile = GetRandomFile("attachment_3.zip");
        var fourthAttachmentFile = GetRandomFile("attachment_4.jpg");
        var fifthAttachmentFile = GetRandomFile("attachment_5.csv");
        var sixthAttachmentFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var seventhAttachmentFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");
        var eighthAttachmentFile = GetFormFileByExistingFile("borehole_attachment_3.csv");
        var ninthAttachmentFile = GetFormFileByExistingFile("borehole_attachment_4.zip");
        var tenthAttachmentFile = GetFormFileByExistingFile("borehole_attachment_5.png");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, lithologyFile: null, new List<IFormFile>() { firstAttachmentFile, secondAttachmentFile, thirdAttachmentFile, fourthAttachmentFile, fifthAttachmentFile, sixthAttachmentFile, seventhAttachmentFile, eighthAttachmentFile, ninthAttachmentFile, tenthAttachmentFile });

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        var borehole = GetBoreholesWithIncludes(context.Boreholes).Single(b => b.OriginalName == "ACORNFLEA");
        Assert.AreEqual(10, borehole.BoreholeFiles.Count);
    }

    [TestMethod]
    public async Task UploadShouldSaveBoreholesWithNotAllHaveAttachmentsAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("boreholes_not_all_have_attachments.csv");
        var firstAttachmentFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondAttachmentFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, lithologyFile: null, new List<IFormFile>() { firstAttachmentFile, secondAttachmentFile });

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(3, okResult.Value);
    }

    [TestMethod]
    public async Task UploadShouldSaveBoreholeWithAttachmentFileNamesMixedCaseAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFormFile = GetFormFileByExistingFile("borehole_with_mixed_case_in_attachments_filenames.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFormFile, lithologyFile: null, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
    }

    [TestMethod]
    public async Task UploadShouldSaveSpecialCharsDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("special_chars_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.OrderByDescending(b => b.Id).FirstOrDefault();
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_special_chars_1", borehole.OriginalName);
        Assert.AreEqual("„ÖÄÜöäü-*#%&7{}[]()='~^><\\@¦+Š", borehole.ProjectName);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadWithMissingCoordinatesAsync()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("no_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_x' is required.", "Field 'location_y' is required." }, problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV95CoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("lv95_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV95 - All coordinates set"));
        Assert.AreEqual(ReferenceSystem.LV95, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2631690, borehole.LocationX);
        Assert.AreEqual(1170516, borehole.LocationY);
        Assert.AreEqual(631690, borehole.LocationXLV03);
        Assert.AreEqual(170516, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2631690 1170516)", borehole.Geometry.ToString());
        Assert.AreEqual("Bern", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Aarmühle", borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV03CoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("lv03_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - All coordinates set"));
        Assert.AreEqual(ReferenceSystem.LV03, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2649258.1270818082, borehole.LocationX);
        Assert.AreEqual(1131551.4611465326, borehole.LocationY);
        Assert.AreEqual(649258.36125645251, borehole.LocationXLV03);
        Assert.AreEqual(131551.85893587855, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2649258.127081808 1131551.4611465326)", borehole.Geometry.ToString());
        Assert.AreEqual("Valais", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Filet", borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadBoreholeWithLV03OutOfRangeCoordinatesAsync()
    {
        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("lv03_out_of_range_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - LV03 x out of range"));
        Assert.AreEqual(ReferenceSystem.LV03, borehole.OriginalReferenceSystem);
        Assert.AreEqual(2999999, borehole.LocationX);
        Assert.AreEqual(1, borehole.LocationY);
        Assert.AreEqual(999999, borehole.LocationXLV03);
        Assert.AreEqual(-999999, borehole.LocationYLV03);
        Assert.AreEqual("POINT (2999999 1)", borehole.Geometry.ToString());
        Assert.IsNull(borehole.Canton);
        Assert.IsNull(borehole.Country);
        Assert.IsNull(borehole.Municipality);
    }

    [TestMethod]
    public async Task UploadEmptyFileShouldReturnError()
    {
        var boreholeCsvFile = new FormFile(null, 0, 0, null, "non_existent_file.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, null);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No borehole csv file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadInvalidFileTypeBoreholeCsvShouldReturnError()
    {
        var invalidFileTypeBoreholeFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "invalid_file_type.txt");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, invalidFileTypeBoreholeFile, lithologyFile: null, null);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid file type for borehole csv.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithoutAttachmentsButWithProvidedFilesShouldCreateBorehole()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByContent(fileContent: "import_id;original_name;location_x;location_y\r\n123;Frank Place;2000000;1000000", fileName: "boreholes.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithAttachmentsLinkedPdfsShouldCreateBorehole()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var firstAttachmentFileName = "borehole_attachment_1.pdf";
        var secondAttachmentFileName = "borehole_attachment_2.pdf";

        var pdfContent = @"import_id;original_name;location_x;location_y;attachments
123;Frank Place;2000000;1000000;borehole_attachment_1.pdf,borehole_attachment_2.pdf";
        var boreholeCsvFile = GetFormFileByContent(fileContent: pdfContent, fileName: "boreholes.csv");
        var firstPdfFormFile = GetFormFileByExistingFile(firstAttachmentFileName);
        var secondPdfFormFile = GetFormFileByExistingFile(secondAttachmentFileName);

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Get latest borehole Ids
        var latestBoreholeId = context.Boreholes.OrderByDescending(b => b.Id).First().Id;

        var borehole = GetBoreholesWithIncludes(context.Boreholes)
            .Single(b => b.Id == latestBoreholeId);

        Assert.AreEqual(borehole.BoreholeFiles.First().File.Name, firstAttachmentFileName);
        Assert.AreEqual(borehole.BoreholeFiles.Last().File.Name, secondAttachmentFileName);
        Assert.AreEqual(borehole.BoreholeFiles.Count, 2);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithNotPresentAttachmentsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("borehole_with_not_present_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var secondPdfFormFile = GetFormFileByExistingFile("borehole_attachment_2.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, new List<IFormFile>() { firstPdfFormFile, secondPdfFormFile });

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(
            new[] { "Attachment file 'is_not_present_in_upload_files.pdf' not found." },
            problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadBoreholeCsvFileWithWhiteSpaceInAttachmentFileNameShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("borehole_with_not_present_attachments.csv");
        var firstPdfFormFile = GetFormFileByExistingFile("borehole_attachment_1.pdf");
        var whiteSpacePdf = GetFormFileByExistingFile("white space.pdf");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: null, new List<IFormFile>() { firstPdfFormFile, whiteSpacePdf });

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("One or more file name(s) contain a whitespace.", badRequestResult.Value);
    }

    [TestMethod]
    public void IsCorrectFileType()
    {
        var validCsvFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "boreholes.csv");
        Assert.AreEqual(true, FileTypeChecker.IsCsv(validCsvFile));

        var emptyCsvFile = new FormFile(null, 0, 12, null, "boreholes.csv");
        Assert.AreEqual(true, FileTypeChecker.IsCsv(emptyCsvFile));

        var invalidCsvFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "boreholes.txt");
        Assert.AreEqual(false, FileTypeChecker.IsCsv(invalidCsvFile));
    }

    [TestMethod]
    public async Task UploadNoFileShouldReturnError()
    {
        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, null, null);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("No borehole csv file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadNoDataButRequiredHeadersSetShouldUploadNoBorehole()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("no_data_but_required_headers.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(0, okResult.Value);
    }

    [TestMethod]
    public async Task UploadMultipleRowsMissingRequiredFieldsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("multiple_rows_missing_required_attributes_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'location_y' is required." }, problemDetails.Errors["Row2"]);
        CollectionAssert.AreEquivalent(
            new[]
            {
                "Field 'original_name' is required.",
                "Field 'location_x' is required.",
                "Field 'location_y' is required.",
            },
            problemDetails.Errors["Row3"]);
    }

    [TestMethod]
    public async Task UploadLithologyMultipleRowsMissingRequiredFieldsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_missing_required_fields/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_missing_required_fields/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithoCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(3, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { "Field 'to_depth' is required." }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { "Field 'from_depth' is required." }, problemDetails.Errors["Row2"]);
        CollectionAssert.AreEquivalent(new[] { "Field 'from_depth' is required." }, problemDetails.Errors["Row3"]);
    }

    [TestMethod]
    public async Task UploadRequiredHeadersMissingShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("missing_required_headers_testdata.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        var result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        Assert.AreEqual(4, Regex.Matches(problemDetails.Detail!, "Header with name ").Count);
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_x'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_y'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'OriginalName'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'ImportId'[0] was not found.");
    }

    [TestMethod]
    public async Task UploadLithologyRequiredHeadersMissingShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_missing_required_headers/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_missing_required_headers/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithoCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        StringAssert.Contains(problemDetails.Detail, "Header with name 'ImportId'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'StratiImportId'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'FromDepth'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'ToDepth'[0] was not found.");
    }

    [TestMethod]
    public async Task UploadLithologyDiffInStratiAttributesForSameStratiIdShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_diff_in_strati_attributes_for_same_starti_id/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_diff_in_strati_attributes_for_same_starti_id/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithoCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(
            new[]
            {
                $"Lithology with {nameof(LithologyImport.StratiImportId)} '1001' has various {nameof(LithologyImport.StratiName)}.",
                $"Lithology with {nameof(LithologyImport.StratiImportId)} '1001' has various {nameof(LithologyImport.StratiDate)}.",
            },
            problemDetails.Errors["Row1"]);
    }

    [TestMethod]
    public async Task UploadLithologyWithImportIdNotPresentInBoreholeFileShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_import_id_not_present_in_borehole_file/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_import_id_not_present_in_borehole_file/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithoCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(
            new[] { "Borehole with ImportId '2' not found." },
            problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInFileShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInFile.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadLithologyWithInvalidCodeListIdsShouldSaveData()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("data_sets/import_litho_with_invalid_code_list_ids/borehole.csv");
        var lithoCsvFile = GetFormFileByExistingFile("data_sets/import_litho_with_invalid_code_list_ids/litho.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, lithologyFile: lithoCsvFile, attachments: null);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"One or more invalid (not a number) code list id in any of the following properties: {nameof(LithologyImport.ColorIds)}, {nameof(LithologyImport.OrganicComponentIds)}, {nameof(LithologyImport.GrainShapeIds)}, {nameof(LithologyImport.GrainGranularityIds)}, {nameof(LithologyImport.Uscs3Ids)}, {nameof(LithologyImport.DebrisIds)}.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"One or more invalid (not a number) code list id in any of the following properties: {nameof(LithologyImport.ColorIds)}, {nameof(LithologyImport.OrganicComponentIds)}, {nameof(LithologyImport.GrainShapeIds)}, {nameof(LithologyImport.GrainGranularityIds)}, {nameof(LithologyImport.Uscs3Ids)}, {nameof(LithologyImport.DebrisIds)}.", }, problemDetails.Errors["Row2"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInDbShouldReturnError()
    {
        // Create Boreholes with same LocationX, LocationY and TotalDepth as in provided csv and with the same WorkgroupId as provided
        context.Boreholes.Add(new Borehole
        {
            Id = 2100000,
            LocationX = 2100000,
            LocationY = 1100000,
            TotalDepth = 855,
            WorkgroupId = 1,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100001,
            LocationX = 2500000,
            LocationY = 1500000,
            TotalDepth = null,
            WorkgroupId = 1,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100002,
            LocationX = 2676701,
            LocationY = 1185081,
            LocationXLV03 = 676700,
            LocationYLV03 = 185081,
            TotalDepth = 1000,
            WorkgroupId = 1,
        });
        context.SaveChanges();

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDb.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(3, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Row2"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Row3"]);
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInDbButDifferentWorkgroupShouldUploadBoreholes()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var maxWorkgroudId = context.Workgroups.Max(w => w.Id);
        var minWorkgroudId = context.Workgroups.Min(w => w.Id);

        // Create Boreholes with same LocationX, LocationY and TotalDepth as in provided csv, but different WorkgroupId as provided
        context.Boreholes.Add(new Borehole
        {
            Id = 2100000,
            LocationX = 2100000,
            LocationY = 1100000,
            TotalDepth = 855,
            WorkgroupId = maxWorkgroudId,
        });
        context.Boreholes.Add(new Borehole
        {
            Id = 2100001,
            LocationX = 2500000,
            LocationY = 1500000,
            TotalDepth = null,
        });
        context.SaveChanges();

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDbButDifferentWorkgroup.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: minWorkgroudId, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);
    }

    [TestMethod]
    public async Task UploadWithAttachmentToLargeShouldThrowError()
    {
        var minBoreholeId = context.Boreholes.Min(b => b.Id);
        var boreholeCsvFile = GetRandomFile("borehoel.csv");

        long targetSizeInBytes = 201 * 1024 * 1024; // 201MB
        byte[] content = new byte[targetSizeInBytes];
        var stream = new MemoryStream(content);

        var attachment = new FormFile(stream, 0, stream.Length, "file", "dummy.txt");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null, new[] { attachment });

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual($"One or more attachment exceed maximum file size of 200 Mb.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadWithMaxValidationErrorsExceededShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("maxValidationErrorsExceeded.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        Assert.AreEqual(1000, problemDetails.Errors.Count);
    }

    [TestMethod]
    public void CompareValueWithTolerance()
    {
        Assert.AreEqual(true, UploadController.CompareValuesWithTolerance(null, null, 0));
        Assert.AreEqual(true, UploadController.CompareValuesWithTolerance(2100000, 2099998, 2));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2100000, 2000098, 1.99));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2100002, 2000000, 1.99));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(21000020, 2000000, 20));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(null, 2000000, 0));
        Assert.AreEqual(false, UploadController.CompareValuesWithTolerance(2000000, null, 2));
    }

    [TestMethod]
    public async Task UploadShouldIgnoreLocationFields()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("borehole_and_location_data.csv");

        ActionResult<int> response = await controller.UploadFileAsync(workgroupId: 1, boreholeCsvFile, null);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = context.Boreholes.Single(b => b.OriginalName == "ACORNFLEA");
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }
}
