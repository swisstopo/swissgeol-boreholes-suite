using Amazon.S3;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Globalization;
using System.IO.Compression;
using System.Security.Claims;
using System.Text.RegularExpressions;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[DeploymentItem("TestData")]
[TestClass]
public class ImportControllerTest
{
    private const int MaxBoreholeSeedId = 1002999;
    private const int MaxStratigraphySeedId = 6002999;
    private const int MaxLayerSeedId = 7029999;
    private const int TestCodelistId = 955253;

    private BdmsContext context;
    private ImportController controller;
    private Mock<IHttpClientFactory> httpClientFactoryMock;
    private Mock<ILogger<ImportController>> loggerMock;
    private Mock<IBoreholePermissionService> boreholePermissionServiceMock;

    [TestInitialize]
    public void TestInitialize()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        context = ContextFactory.CreateContext();
        httpClientFactoryMock = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        loggerMock = new Mock<ILogger<ImportController>>();

        var loggerLocationServiceMock = new Mock<ILogger<LocationService>>(MockBehavior.Strict);
        var locationService = new LocationService(loggerLocationServiceMock.Object, httpClientFactoryMock.Object);

        var loggerCoordinateServiceMock = new Mock<ILogger<CoordinateService>>(MockBehavior.Strict);
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
        var testUser = context.Users.FirstOrDefault();
        Assert.IsNotNull(testUser, "Test database must contain at least one user.");
        contextAccessorMock.Object.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, testUser!.SubjectId) }));
        var boreholeFileCloudService = new BoreholeFileCloudService(context, configuration, loggerBoreholeFileCloudService.Object, contextAccessorMock.Object, s3ClientMock);

        boreholePermissionServiceMock = new Mock<IBoreholePermissionService>(MockBehavior.Strict);
        boreholePermissionServiceMock
            .Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<Role>()))
            .ReturnsAsync(true);

        controller = new ImportController(context, loggerMock.Object, locationService, coordinateService, boreholeFileCloudService, boreholePermissionServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        // Remove boreholes that were uploaded.
        var addedBoreholes = context.Boreholes.Where(b => b.Id > MaxBoreholeSeedId);
        var addedStratigraphies = context.Stratigraphies.Where(s => s.Id > MaxStratigraphySeedId);
        var addedLayers = context.Layers.Where(l => l.Id > MaxLayerSeedId);
        context.Boreholes.RemoveRange(addedBoreholes);
        context.Stratigraphies.RemoveRange(addedStratigraphies);
        context.Layers.RemoveRange(addedLayers);
        context.Codelists.RemoveRange(context.Codelists.Where(c => c.Id == TestCodelistId));
        await context.SaveChangesAsync().ConfigureAwait(false);

        await context.DisposeAsync();
        httpClientFactoryMock.Verify();
        boreholePermissionServiceMock.Verify();
        loggerMock.Verify();
    }

    /*
    [TestMethod]
    public async Task UploadJsonWithSingleObjectInsteadOfArrayShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_single.json");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("The provided file is not an array of boreholes or is not in a valid JSON format.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadJsonWithValidJsonShouldSaveData()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_valid.json");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);
        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);

        var borehole = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "PURPLETOLL").ConfigureAwait(false);
        Assert.IsNotNull(borehole.CreatedById, nameof(Borehole.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(borehole.Created, nameof(Borehole.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(borehole.UpdatedById, nameof(Borehole.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(borehole.Updated, nameof(Borehole.Updated).ShouldNotBeNullMessage());
        Assert.IsNull(borehole.LockedById, nameof(Borehole.LockedById).ShouldBeNullMessage());
        Assert.IsNull(borehole.Locked, nameof(Borehole.Locked).ShouldBeNullMessage());
        Assert.AreEqual(1, borehole.WorkgroupId, nameof(Borehole.WorkgroupId));
        Assert.IsNotNull(borehole.Workgroup, nameof(Borehole.Workgroup).ShouldNotBeNullMessage());
        Assert.IsTrue(borehole.IsPublic, nameof(Borehole.IsPublic));
        Assert.IsNull(borehole.TypeId, nameof(Borehole.TypeId).ShouldBeNullMessage());
        Assert.IsNull(borehole.Type, nameof(Borehole.Type).ShouldBeNullMessage());
        Assert.AreEqual(2739000, borehole.LocationX, nameof(Borehole.LocationX));
        Assert.AreEqual(6, borehole.PrecisionLocationX, nameof(Borehole.PrecisionLocationX));
        Assert.AreEqual(1291100, borehole.LocationY, nameof(Borehole.LocationY));
        Assert.AreEqual(7, borehole.PrecisionLocationY, nameof(Borehole.PrecisionLocationY));
        Assert.AreEqual(610700, borehole.LocationXLV03, nameof(Borehole.LocationXLV03));
        Assert.AreEqual(4, borehole.PrecisionLocationXLV03, nameof(Borehole.PrecisionLocationXLV03));
        Assert.AreEqual(102500, borehole.LocationYLV03, nameof(Borehole.LocationYLV03));
        Assert.AreEqual(3, borehole.PrecisionLocationYLV03, nameof(Borehole.PrecisionLocationYLV03));
        Assert.AreEqual((ReferenceSystem)20104002, borehole.OriginalReferenceSystem, nameof(Borehole.OriginalReferenceSystem));
        Assert.AreEqual(3160.6575921925983, borehole.ElevationZ, nameof(Borehole.ElevationZ));
        Assert.AreEqual(20106001, borehole.HrsId, nameof(Borehole.HrsId));
        Assert.IsNull(borehole.Hrs, nameof(Borehole.Hrs).ShouldBeNullMessage());
        Assert.AreEqual(567.0068294587577, borehole.TotalDepth, nameof(Borehole.TotalDepth));
        Assert.IsNull(borehole.RestrictionId, nameof(Borehole.RestrictionId).ShouldBeNullMessage());
        Assert.IsNull(borehole.Restriction, nameof(Borehole.Restriction).ShouldBeNullMessage());
        Assert.IsNull(borehole.RestrictionUntil, nameof(Borehole.RestrictionUntil).ShouldBeNullMessage());
        Assert.IsFalse(borehole.NationalInterest, nameof(Borehole.NationalInterest));
        Assert.AreEqual("PURPLETOLL", borehole.OriginalName, nameof(Borehole.OriginalName));
        Assert.AreEqual("GREYGOAT", borehole.Name, nameof(Borehole.Name));
        Assert.IsNull(borehole.LocationPrecisionId, nameof(Borehole.LocationPrecisionId).ShouldBeNullMessage());
        Assert.IsNull(borehole.LocationPrecision, nameof(Borehole.LocationPrecision).ShouldBeNullMessage());
        Assert.AreEqual(20114002, borehole.ElevationPrecisionId, nameof(Borehole.ElevationPrecisionId));
        Assert.IsNull(borehole.ElevationPrecision, nameof(Borehole.ElevationPrecision).ShouldBeNullMessage());
        Assert.AreEqual("Switchable explicit superstructure", borehole.ProjectName, nameof(Borehole.ProjectName));
        Assert.AreEqual("Montenegro", borehole.Country, nameof(Borehole.Country));
        Assert.AreEqual("Texas", borehole.Canton, nameof(Borehole.Canton));
        Assert.AreEqual("Lake Reecechester", borehole.Municipality, nameof(Borehole.Municipality));
        Assert.AreEqual(22103009, borehole.PurposeId, nameof(Borehole.PurposeId));
        Assert.IsNull(borehole.Purpose, nameof(Borehole.Purpose).ShouldBeNullMessage());
        Assert.AreEqual(22104006, borehole.StatusId, nameof(Borehole.StatusId));
        Assert.IsNull(borehole.Status, nameof(Borehole.Status).ShouldBeNullMessage());
        Assert.AreEqual(22108003, borehole.DepthPrecisionId, nameof(Borehole.DepthPrecisionId));
        Assert.IsNull(borehole.DepthPrecision, nameof(Borehole.DepthPrecision).ShouldBeNullMessage());
        Assert.AreEqual(759.5479580385368, borehole.TopBedrockFreshMd, nameof(Borehole.TopBedrockFreshMd));
        Assert.AreEqual(1.338392690447342, borehole.TopBedrockWeatheredMd, nameof(Borehole.TopBedrockWeatheredMd));
        Assert.IsFalse(borehole.HasGroundwater, nameof(Borehole.HasGroundwater));
        Assert.AreEqual("This product works too well.", borehole.Remarks, nameof(Borehole.Remarks));
        Assert.AreEqual(15104543, borehole.LithologyTopBedrockId, nameof(Borehole.LithologyTopBedrockId));
        Assert.IsNull(borehole.LithologyTopBedrock, nameof(Borehole.LithologyTopBedrock).ShouldBeNullMessage());
        Assert.AreEqual(15302037, borehole.LithostratigraphyTopBedrockId, nameof(Borehole.LithostratigraphyTopBedrockId));
        Assert.IsNull(borehole.LithostratigraphyTopBedrock, nameof(Borehole.LithostratigraphyTopBedrock).ShouldBeNullMessage());
        Assert.AreEqual(15001060, borehole.ChronostratigraphyTopBedrockId, nameof(Borehole.ChronostratigraphyTopBedrockId));
        Assert.IsNull(borehole.ChronostratigraphyTopBedrock, nameof(Borehole.ChronostratigraphyTopBedrock).ShouldBeNullMessage());
        Assert.AreEqual(899.1648284248844, borehole.ReferenceElevation, nameof(Borehole.ReferenceElevation));
        Assert.AreEqual(20114006, borehole.ReferenceElevationPrecisionId, nameof(Borehole.ReferenceElevationPrecisionId));
        Assert.IsNull(borehole.ReferenceElevationPrecision, nameof(Borehole.ReferenceElevationPrecision).ShouldBeNullMessage());
        Assert.AreEqual(20117005, borehole.ReferenceElevationTypeId, nameof(Borehole.ReferenceElevationTypeId));
        Assert.IsNull(borehole.ReferenceElevationType, nameof(Borehole.ReferenceElevationType).ShouldBeNullMessage());
        Assert.IsNotNull(borehole.Geometry, nameof(Borehole.Geometry).ShouldNotBeNullMessage());
        Assert.AreEqual(2056, borehole.Geometry.SRID, nameof(Borehole.Geometry.SRID));
        Assert.AreEqual(WorkflowStatus.Draft, borehole.Workflow.Status, nameof(Borehole.Workflow.Status));

        // Assert borehole geometry
        Assert.AreEqual(2, borehole.BoreholeGeometry.Count, nameof(borehole.BoreholeGeometry.Count));
        var borheoleGeometry = borehole.BoreholeGeometry.First(x => x.MD == 10);
        Assert.AreEqual(-0.13453418496717173, borheoleGeometry.X, nameof(borheoleGeometry.X));
        Assert.AreEqual(356436.1434696717173, borheoleGeometry.Y, nameof(borheoleGeometry.Y));
        Assert.AreEqual(-0.156717173, borheoleGeometry.Z, nameof(borheoleGeometry.Z));
        Assert.AreEqual(0, borheoleGeometry.HAZI, nameof(borheoleGeometry.HAZI));
        Assert.AreEqual(0.1468618496717173, borheoleGeometry.DEVI, nameof(borheoleGeometry.DEVI));

        // Assert stratigraphy's lithological descriptions
        Assert.AreEqual(2, borehole.Stratigraphies.Count, nameof(borehole.Stratigraphies.Count));
        var stratigraphy = borehole.Stratigraphies.First();
        Assert.IsNotNull(stratigraphy.Borehole, nameof(stratigraphy.Borehole).ShouldNotBeNullMessage());
        Assert.IsTrue(stratigraphy.IsPrimary, nameof(stratigraphy.IsPrimary));
        Assert.IsNotNull(stratigraphy.Updated, nameof(stratigraphy.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(stratigraphy.UpdatedById, nameof(stratigraphy.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(stratigraphy.Created, nameof(stratigraphy.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(stratigraphy.CreatedById, nameof(stratigraphy.CreatedById).ShouldNotBeNullMessage());
        Assert.AreEqual("Marjolaine Hegmann", stratigraphy.Name, nameof(stratigraphy.Name));

        Assert.AreEqual(9003, stratigraphy.QualityId, nameof(stratigraphy.QualityId));
        Assert.IsNull(stratigraphy.Quality, nameof(stratigraphy.Quality).ShouldBeNullMessage());
        Assert.AreEqual("My co-worker Ali has one of these. He says it looks towering.", stratigraphy.Notes, nameof(stratigraphy.Notes));

        // Assert stratigraphy’s layers
        Assert.AreEqual(2, stratigraphy.Layers.Count, nameof(stratigraphy.Layers.Count));
        var layer = stratigraphy.Layers.First();
        Assert.IsNotNull(layer.Created, nameof(layer.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.CreatedById, nameof(layer.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.Updated, nameof(layer.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.UpdatedById, nameof(layer.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.Stratigraphy, nameof(layer.Stratigraphy).ShouldNotBeNullMessage());
        Assert.IsTrue(layer.IsUndefined, nameof(layer.IsUndefined));
        Assert.AreEqual(0.1, layer.FromDepth, nameof(layer.FromDepth));
        Assert.AreEqual(10, layer.ToDepth, nameof(layer.ToDepth));
        Assert.IsFalse(layer.IsLast, nameof(layer.IsLast));
        Assert.AreEqual(9002, layer.DescriptionQualityId, nameof(layer.DescriptionQualityId));
        Assert.IsNull(layer.DescriptionQuality, nameof(layer.DescriptionQuality).ShouldBeNullMessage());
        Assert.AreEqual(15104888, layer.LithologyId, nameof(layer.LithologyId));
        Assert.IsNull(layer.Lithology, nameof(layer.Lithology).ShouldBeNullMessage());
        Assert.AreEqual(21101003, layer.PlasticityId, nameof(layer.PlasticityId));
        Assert.IsNull(layer.Plasticity, nameof(layer.Plasticity).ShouldBeNullMessage());
        Assert.AreEqual(21103003, layer.ConsistanceId, nameof(layer.ConsistanceId));
        Assert.IsNull(layer.Consistance, nameof(layer.Consistance).ShouldBeNullMessage());
        Assert.IsNull(layer.AlterationId, nameof(layer.AlterationId).ShouldBeNullMessage());
        Assert.IsNull(layer.Alteration, nameof(layer.Alteration).ShouldBeNullMessage());
        Assert.AreEqual(21102003, layer.CompactnessId, nameof(layer.CompactnessId));
        Assert.IsNull(layer.Compactness, nameof(layer.Compactness).ShouldBeNullMessage());
        Assert.AreEqual(21109002, layer.GrainSize1Id, nameof(layer.GrainSize1Id));
        Assert.IsNull(layer.GrainSize1, nameof(layer.GrainSize1).ShouldBeNullMessage());
        Assert.AreEqual(21109002, layer.GrainSize2Id, nameof(layer.GrainSize2Id));
        Assert.IsNull(layer.GrainSize2, nameof(layer.GrainSize2).ShouldBeNullMessage());
        Assert.AreEqual(21116003, layer.CohesionId, nameof(layer.CohesionId));
        Assert.IsNull(layer.Cohesion, nameof(layer.Cohesion).ShouldBeNullMessage());
        Assert.AreEqual("synergistic", layer.OriginalUscs, nameof(layer.OriginalUscs));
        Assert.AreEqual(23107001, layer.UscsDeterminationId, nameof(layer.UscsDeterminationId));
        Assert.IsNull(layer.UscsDetermination, nameof(layer.UscsDetermination).ShouldBeNullMessage());
        Assert.AreEqual("payment optical copy networks", layer.Notes, nameof(layer.Notes));
        Assert.AreEqual(15303008, layer.LithostratigraphyId, nameof(layer.LithostratigraphyId));
        Assert.IsNull(layer.Lithostratigraphy, nameof(layer.Lithostratigraphy).ShouldBeNullMessage());
        Assert.AreEqual(21105004, layer.HumidityId, nameof(layer.HumidityId));
        Assert.IsNull(layer.Humidity, nameof(layer.Humidity).ShouldBeNullMessage());
        Assert.IsTrue(layer.IsStriae, nameof(layer.IsStriae));
        Assert.AreEqual(30000019, layer.GradationId, nameof(layer.GradationId));
        Assert.IsNull(layer.Gradation, nameof(layer.Gradation).ShouldBeNullMessage());
        Assert.AreEqual(15104470, layer.LithologyTopBedrockId, nameof(layer.LithologyTopBedrockId));
        Assert.IsNull(layer.LithologyTopBedrock, nameof(layer.LithologyTopBedrock).ShouldBeNullMessage());
        Assert.AreEqual("Handmade connect Data Progressive Danish Krone", layer.OriginalLithology, nameof(layer.OriginalLithology));
        Assert.IsNotNull(layer.LayerDebrisCodes, nameof(layer.LayerDebrisCodes).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.LayerGrainShapeCodes, nameof(layer.LayerGrainShapeCodes).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.LayerGrainAngularityCodes, nameof(layer.LayerGrainAngularityCodes).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.LayerOrganicComponentCodes, nameof(layer.LayerOrganicComponentCodes).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.LayerUscs3Codes, nameof(layer.LayerUscs3Codes).ShouldNotBeNullMessage());
        Assert.IsNotNull(layer.LayerColorCodes, nameof(layer.LayerColorCodes).ShouldNotBeNullMessage());
        CollectionAssert.AreEqual(new List<int> { 9104 }, layer.LayerDebrisCodes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerDebrisCodes));
        CollectionAssert.AreEqual(new List<int> { 21110003 }, layer.LayerGrainShapeCodes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerGrainShapeCodes));
        CollectionAssert.AreEqual(new List<int> { 21115007 }, layer.LayerGrainAngularityCodes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerGrainAngularityCodes));
        CollectionAssert.AreEqual(new List<int> { 21108010 }, layer.LayerOrganicComponentCodes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerOrganicComponentCodes));
        CollectionAssert.AreEqual(new List<int> { 23101010 }, layer.LayerUscs3Codes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerUscs3Codes));
        CollectionAssert.AreEqual(new List<int> { 21112003 }, layer.LayerColorCodes.Select(code => code.CodelistId).ToList(), nameof(layer.LayerColorCodes));

        // Assert stratigraphy’s lithological descriptions
        Assert.AreEqual(2, stratigraphy.LithologicalDescriptions.Count, nameof(stratigraphy.LithologicalDescriptions.Count));
        var lithologicalDescription = stratigraphy.LithologicalDescriptions.First(x => x.FromDepth == 0.1);
        Assert.IsNotNull(lithologicalDescription.Created, nameof(lithologicalDescription.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithologicalDescription.CreatedById, nameof(lithologicalDescription.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithologicalDescription.Updated, nameof(lithologicalDescription.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithologicalDescription.UpdatedById, nameof(lithologicalDescription.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithologicalDescription.Stratigraphy, nameof(lithologicalDescription.Stratigraphy).ShouldNotBeNullMessage());
        Assert.AreEqual("Bouvet Island (Bouvetoya) Borders networks", lithologicalDescription.Description, nameof(lithologicalDescription.Description));
        Assert.AreEqual(0.1, lithologicalDescription.FromDepth, nameof(lithologicalDescription.FromDepth));
        Assert.AreEqual(10, lithologicalDescription.ToDepth, nameof(lithologicalDescription.ToDepth));

        // Assert stratigraphy’s facies descriptions
        Assert.AreEqual(2, stratigraphy.FaciesDescriptions.Count, nameof(stratigraphy.FaciesDescriptions.Count));
        var faciesDescription = stratigraphy.FaciesDescriptions.First(x => x.FromDepth == 0.1);
        Assert.IsNotNull(faciesDescription.Created, nameof(faciesDescription.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(faciesDescription.CreatedById, nameof(faciesDescription.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(faciesDescription.Updated, nameof(faciesDescription.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(faciesDescription.UpdatedById, nameof(faciesDescription.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(faciesDescription.Stratigraphy, nameof(faciesDescription.Stratigraphy).ShouldNotBeNullMessage());
        Assert.AreEqual("Bouvet Island (Bouvetoya) Borders networks", faciesDescription.Description, nameof(faciesDescription.Description));
        Assert.AreEqual(0.1, faciesDescription.FromDepth, nameof(faciesDescription.FromDepth));
        Assert.AreEqual(10, faciesDescription.ToDepth, nameof(faciesDescription.ToDepth));

        // Assert stratigraphy's chronostratigraphy layers
        Assert.AreEqual(2, stratigraphy.ChronostratigraphyLayers.Count, nameof(stratigraphy.ChronostratigraphyLayers.Count));
        var chronostratigraphyLayer = stratigraphy.ChronostratigraphyLayers.First(x => x.FromDepth == 0.1);
        Assert.IsNotNull(chronostratigraphyLayer.Created, nameof(chronostratigraphyLayer.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(chronostratigraphyLayer.CreatedById, nameof(chronostratigraphyLayer.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(chronostratigraphyLayer.Updated, nameof(chronostratigraphyLayer.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(chronostratigraphyLayer.UpdatedById, nameof(chronostratigraphyLayer.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(chronostratigraphyLayer.Stratigraphy, nameof(chronostratigraphyLayer.Stratigraphy).ShouldNotBeNullMessage());
        Assert.AreEqual(15001134, chronostratigraphyLayer.ChronostratigraphyId, nameof(chronostratigraphyLayer.ChronostratigraphyId));
        Assert.IsNull(chronostratigraphyLayer.Chronostratigraphy, nameof(chronostratigraphyLayer.Chronostratigraphy).ShouldBeNullMessage());
        Assert.AreEqual(0.1, chronostratigraphyLayer.FromDepth, nameof(chronostratigraphyLayer.FromDepth));
        Assert.AreEqual(10, chronostratigraphyLayer.ToDepth, nameof(chronostratigraphyLayer.ToDepth));

        // Assert stratigraphy's lithostratigraphy layers
        Assert.AreEqual(2, stratigraphy.LithostratigraphyLayers.Count, nameof(stratigraphy.LithostratigraphyLayers.Count));
        var lithostratigraphyLayer = stratigraphy.LithostratigraphyLayers.First(x => x.FromDepth == 0.1);
        Assert.IsNotNull(lithostratigraphyLayer.Created, nameof(lithostratigraphyLayer.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithostratigraphyLayer.CreatedById, nameof(lithostratigraphyLayer.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithostratigraphyLayer.Updated, nameof(lithostratigraphyLayer.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithostratigraphyLayer.UpdatedById, nameof(lithostratigraphyLayer.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(lithostratigraphyLayer.Stratigraphy, nameof(lithostratigraphyLayer.Stratigraphy).ShouldNotBeNullMessage());
        Assert.AreEqual(15303501, lithostratigraphyLayer.LithostratigraphyId, nameof(lithostratigraphyLayer.LithostratigraphyId));
        Assert.IsNull(lithostratigraphyLayer.Lithostratigraphy, nameof(lithostratigraphyLayer.Lithostratigraphy).ShouldBeNullMessage());
        Assert.AreEqual(0.1, lithostratigraphyLayer.FromDepth, nameof(lithostratigraphyLayer.FromDepth));
        Assert.AreEqual(10, lithostratigraphyLayer.ToDepth, nameof(lithostratigraphyLayer.ToDepth));

        // Assert borehole's completions
        Assert.AreEqual(2, borehole.Completions.Count, nameof(borehole.Completions.Count));
        var completion = borehole.Completions.First();
        Assert.IsNotNull(completion.Created, nameof(completion.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(completion.CreatedById, nameof(completion.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(completion.Updated, nameof(completion.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(completion.UpdatedById, nameof(completion.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(completion.Borehole, nameof(completion.Borehole).ShouldNotBeNullMessage());
        Assert.AreEqual("Handcrafted Rubber Chair", completion.Name, nameof(completion.Name));
        Assert.AreEqual(16000000, completion.KindId, nameof(completion.KindId));
        Assert.IsNull(completion.Kind, nameof(completion.Kind).ShouldBeNullMessage());
        Assert.AreEqual("Ratione ut non in recusandae labore.", completion.Notes, nameof(completion.Notes));
        Assert.AreEqual(DateOnly.Parse("2021-01-24", CultureInfo.InvariantCulture), completion.AbandonDate, nameof(completion.AbandonDate));

        // Assert casing ids of instrumentations, backfills and observations
        var casingIds = borehole.Completions.Where(c => c.Casings != null).SelectMany(c => c.Casings!).Select(c => c.Id).ToList();
        var instrumentationCasingIds = borehole.Completions.Where(c => c.Instrumentations != null).SelectMany(c => c.Instrumentations!).Where(i => i.CasingId.HasValue).Select(i => (int)i.CasingId).ToList();
        var backfillCasingIds = borehole.Completions.Where(c => c.Backfills != null).SelectMany(c => c.Backfills!).Where(i => i.CasingId.HasValue).Select(i => (int)i.CasingId).ToList();
        var observationCasingIds = borehole.Observations.Where(i => i.CasingId.HasValue).Select(i => (int)i.CasingId).ToList();
        Assert.IsTrue(instrumentationCasingIds.All(c => casingIds.Contains(c)), $"{nameof(instrumentationCasingIds)} in {nameof(casingIds)}");
        Assert.IsTrue(backfillCasingIds.All(c => casingIds.Contains(c)), $"{nameof(backfillCasingIds)} in {nameof(casingIds)}");
        Assert.IsTrue(observationCasingIds.All(c => casingIds.Contains(c)), $"{nameof(observationCasingIds)} in {nameof(casingIds)}");

        // Assert completion's instrumentations
        Assert.AreEqual(1, completion.Instrumentations.Count, nameof(completion.Instrumentations.Count));
        var instrumentation = completion.Instrumentations.First();
        Assert.IsNotNull(instrumentation.Created, nameof(instrumentation.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(instrumentation.CreatedById, nameof(instrumentation.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(instrumentation.Updated, nameof(instrumentation.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(instrumentation.UpdatedById, nameof(instrumentation.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(instrumentation.Completion, nameof(instrumentation.Completion).ShouldNotBeNullMessage());
        Assert.AreEqual(70, instrumentation.FromDepth, nameof(instrumentation.FromDepth));
        Assert.AreEqual(80, instrumentation.ToDepth, nameof(instrumentation.ToDepth));
        Assert.AreEqual("Explorer", instrumentation.Name, nameof(instrumentation.Name));
        Assert.AreEqual(25000201, instrumentation.KindId, nameof(instrumentation.KindId));
        Assert.IsNull(instrumentation.Kind, nameof(instrumentation.Kind).ShouldBeNullMessage());
        Assert.AreEqual(25000213, instrumentation.StatusId, nameof(instrumentation.StatusId));
        Assert.IsNull(instrumentation.Status, nameof(instrumentation.Status).ShouldBeNullMessage());
        Assert.IsFalse(instrumentation.IsOpenBorehole, nameof(instrumentation.IsOpenBorehole));
        Assert.IsNotNull(instrumentation.Casing, nameof(instrumentation.Casing).ShouldNotBeNullMessage());
        Assert.AreEqual("copy Field bandwidth Burg", instrumentation.Notes, nameof(instrumentation.Notes));

        // Assert completion's backfills
        Assert.AreEqual(1, completion.Backfills.Count, nameof(completion.Backfills.Count));
        var backfill = completion.Backfills.First();
        Assert.IsNotNull(backfill.Created, nameof(backfill.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(backfill.CreatedById, nameof(backfill.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(backfill.Updated, nameof(backfill.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(backfill.UpdatedById, nameof(backfill.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(backfill.Completion, nameof(backfill.Completion).ShouldNotBeNullMessage());
        Assert.AreEqual(70, backfill.FromDepth, nameof(backfill.FromDepth));
        Assert.AreEqual(80, backfill.ToDepth, nameof(backfill.ToDepth));
        Assert.AreEqual(25000300, backfill.KindId, nameof(backfill.KindId));
        Assert.IsNull(backfill.Kind, nameof(backfill.Kind).ShouldBeNullMessage());
        Assert.AreEqual(25000306, backfill.MaterialId, nameof(backfill.MaterialId));
        Assert.IsNull(backfill.Material, nameof(backfill.Material).ShouldBeNullMessage());
        Assert.IsFalse(backfill.IsOpenBorehole, nameof(backfill.IsOpenBorehole));
        Assert.IsNotNull(backfill.Casing, nameof(backfill.Casing).ShouldNotBeNullMessage());
        Assert.AreEqual("Licensed Plastic Soap Managed withdrawal Tools & Industrial", backfill.Notes, nameof(backfill.Notes));

        // Assert completion's casings
        Assert.AreEqual(1, completion.Casings.Count, nameof(completion.Casings.Count));
        var casing = completion.Casings.First();
        Assert.IsNotNull(casing.Created, nameof(casing.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(casing.CreatedById, nameof(casing.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(casing.Updated, nameof(casing.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(casing.UpdatedById, nameof(casing.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(casing.Completion, nameof(casing.Completion).ShouldNotBeNullMessage());
        Assert.AreEqual("Rustic", casing.Name, nameof(casing.Name));
        Assert.AreEqual(DateOnly.Parse("2021-03-24", CultureInfo.InvariantCulture), casing.DateStart, nameof(casing.DateStart));
        Assert.AreEqual(DateOnly.Parse("2021-12-12", CultureInfo.InvariantCulture), casing.DateFinish, nameof(casing.DateFinish));
        Assert.AreEqual("matrices Managed withdrawal Tools & Industrial", casing.Notes, nameof(casing.Notes));

        // Assert casing's casingelements
        Assert.AreEqual(2, casing.CasingElements.Count, nameof(casing.CasingElements.Count));
        var casingElement = casing.CasingElements.First();
        Assert.IsNotNull(casingElement.Created, nameof(casingElement.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(casingElement.CreatedById, nameof(casingElement.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(casingElement.Updated, nameof(casingElement.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(casingElement.UpdatedById, nameof(casingElement.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(casingElement.Casing, nameof(casingElement.Casing).ShouldNotBeNullMessage());
        Assert.AreEqual(0.1, casingElement.FromDepth, nameof(casingElement.FromDepth));
        Assert.AreEqual(10, casingElement.ToDepth, nameof(casingElement.ToDepth));
        Assert.AreEqual(25000116, casingElement.KindId, nameof(casingElement.KindId));
        Assert.IsNull(casingElement.Kind, nameof(casingElement.Kind).ShouldBeNullMessage());
        Assert.AreEqual(25000114, casingElement.MaterialId, nameof(casingElement.MaterialId));
        Assert.IsNull(casingElement.Material, nameof(casingElement.Material).ShouldBeNullMessage());
        Assert.AreEqual(7.91766288360472, casingElement.InnerDiameter, nameof(casingElement.InnerDiameter));
        Assert.AreEqual(4.857009269696199, casingElement.OuterDiameter, nameof(casingElement.OuterDiameter));

        // Assert borehole's sections
        Assert.AreEqual(2, borehole.Sections.Count, nameof(borehole.Sections.Count));
        var section = borehole.Sections.First();
        Assert.IsNotNull(section.Created, nameof(section.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(section.CreatedById, nameof(section.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(section.Updated, nameof(section.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(section.UpdatedById, nameof(section.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(section.Borehole, nameof(section.Borehole).ShouldNotBeNullMessage());
        Assert.AreEqual("Gourde", section.Name, nameof(section.Name));

        // Assert section's sectionelements
        Assert.AreEqual(2, section.SectionElements.Count, nameof(section.SectionElements.Count));
        var sectionElement = section.SectionElements.First();
        Assert.IsNotNull(sectionElement.Created, nameof(sectionElement.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(sectionElement.CreatedById, nameof(sectionElement.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(sectionElement.Updated, nameof(sectionElement.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(sectionElement.UpdatedById, nameof(sectionElement.UpdatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(sectionElement.Section, nameof(sectionElement.Section).ShouldNotBeNullMessage());
        Assert.AreEqual(60, sectionElement.FromDepth, nameof(sectionElement.FromDepth));
        Assert.AreEqual(143, sectionElement.ToDepth, nameof(sectionElement.ToDepth));
        Assert.AreEqual(0, sectionElement.Order, nameof(sectionElement.Order));
        Assert.AreEqual(22107004, sectionElement.DrillingMethodId, nameof(sectionElement.DrillingMethodId));
        Assert.AreEqual(DateOnly.Parse("2021-04-06", CultureInfo.InvariantCulture), sectionElement.DrillingStartDate, nameof(sectionElement.DrillingStartDate));
        Assert.AreEqual(DateOnly.Parse("2021-05-31", CultureInfo.InvariantCulture), sectionElement.DrillingEndDate, nameof(sectionElement.DrillingEndDate));
        Assert.AreEqual(22102002, sectionElement.CuttingsId, nameof(sectionElement.CuttingsId));
        Assert.AreEqual(8.990221083625322, sectionElement.DrillingDiameter, nameof(sectionElement.DrillingDiameter));
        Assert.AreEqual(18.406672318655378, sectionElement.DrillingCoreDiameter, nameof(sectionElement.DrillingCoreDiameter));
        Assert.AreEqual(22109003, sectionElement.DrillingMudTypeId, nameof(sectionElement.DrillingMudTypeId));
        Assert.AreEqual(22109020, sectionElement.DrillingMudSubtypeId, nameof(sectionElement.DrillingMudSubtypeId));

        // Assert borehole's observations
        Assert.AreEqual(6, borehole.Observations.Count, nameof(borehole.Observations.Count));

        // Assert observation ObservationType.None (0)
        var observation = borehole.Observations.First(x => x.FromDepthM == 1900.0);
        Assert.IsNotNull(observation.Created, nameof(observation.Created).ShouldNotBeNullMessage());
        Assert.IsNotNull(observation.CreatedById, nameof(observation.CreatedById).ShouldNotBeNullMessage());
        Assert.IsNotNull(observation.Updated, nameof(observation.Updated).ShouldNotBeNullMessage());
        Assert.IsNotNull(observation.UpdatedById, nameof(observation.UpdatedById).ShouldNotBeNullMessage());
        Assert.AreEqual((ObservationType)0, observation.Type, nameof(observation.Type));
        Assert.AreEqual(DateTime.Parse("2021-10-05T17:41:48.389173Z", CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal), observation.StartTime, nameof(observation.StartTime));
        Assert.AreEqual(DateTime.Parse("2021-09-21T20:42:21.785577Z", CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal), observation.EndTime, nameof(observation.EndTime));
        Assert.AreEqual(1380.508568643829, observation.Duration, nameof(observation.Duration));
        Assert.AreEqual(1900.0, observation.FromDepthM, nameof(observation.FromDepthM));
        Assert.AreEqual(2227.610979433456, observation.ToDepthM, nameof(observation.ToDepthM));
        Assert.AreEqual(3136.3928836828063, observation.FromDepthMasl, nameof(observation.FromDepthMasl));
        Assert.AreEqual(4047.543691819787, observation.ToDepthMasl, nameof(observation.ToDepthMasl));
        Assert.IsTrue(observation.IsOpenBorehole, nameof(observation.IsOpenBorehole));
        Assert.IsNotNull(observation.Casing, nameof(observation.Casing).ShouldNotBeNullMessage());
        Assert.AreEqual("Quis repellendus nihil et ipsam ut ad eius.", observation.Comment, nameof(observation.Comment));
        Assert.AreEqual(15203156, observation.ReliabilityId, nameof(observation.ReliabilityId));
        Assert.IsNull(observation.Reliability, nameof(observation.Reliability).ShouldBeNullMessage());
        Assert.IsNotNull(observation.Borehole, nameof(observation.Borehole).ShouldNotBeNullMessage());

        // Assert observation ObservationType.Wateringress (1)
        var waterIngress = (WaterIngress)borehole.Observations.First(x => x.Type == ObservationType.WaterIngress);
        Assert.IsNotNull(waterIngress.ConditionsId, nameof(waterIngress.ConditionsId).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, waterIngress.ConditionsId, nameof(waterIngress.ConditionsId));
        Assert.IsNotNull(waterIngress.QuantityId, nameof(waterIngress.QuantityId).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, waterIngress.QuantityId, nameof(waterIngress.QuantityId));

        // Assert observation ObservationType.GroundwaterLevelMeasurement (2)
        var groundwaterLevelMeasurement = (GroundwaterLevelMeasurement)borehole.Observations.First(x => x.Type == ObservationType.GroundwaterLevelMeasurement);
        Assert.IsNotNull(groundwaterLevelMeasurement.KindId, nameof(groundwaterLevelMeasurement.KindId).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, groundwaterLevelMeasurement.KindId, nameof(groundwaterLevelMeasurement.KindId));

        // Assert observation ObservationType.Hydrotest (3)
        var hydrotest = (Hydrotest)borehole.Observations.First(x => x.Type == ObservationType.Hydrotest);
        Assert.IsNotNull(hydrotest.KindCodelistIds, nameof(hydrotest.KindCodelistIds).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, hydrotest.KindCodelistIds.Count, nameof(hydrotest.KindCodelistIds));
        Assert.IsNotNull(hydrotest.FlowDirectionCodelistIds, nameof(hydrotest.FlowDirectionCodelistIds).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, hydrotest.FlowDirectionCodelistIds.Count, nameof(hydrotest.FlowDirectionCodelistIds));
        Assert.IsNotNull(hydrotest.EvaluationMethodCodelistIds, nameof(hydrotest.EvaluationMethodCodelistIds).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, hydrotest.EvaluationMethodCodelistIds.Count, nameof(hydrotest.EvaluationMethodCodelistIds));
        Assert.IsNotNull(hydrotest.HydrotestResults, nameof(hydrotest.HydrotestResults).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, hydrotest.HydrotestResults.Count, nameof(hydrotest.HydrotestResults));

        // Assert observation ObservationType.FieldMeasurement (4)
        var fieldMeasurement = (FieldMeasurement)borehole.Observations.First(x => x.Type == ObservationType.FieldMeasurement);
        Assert.IsNotNull(fieldMeasurement.FieldMeasurementResults, nameof(fieldMeasurement.FieldMeasurementResults).ShouldNotBeNullMessage());
        Assert.AreNotEqual(0, fieldMeasurement.FieldMeasurementResults.Count, nameof(fieldMeasurement.FieldMeasurementResults));
    }

    [TestMethod]
    public async Task UploadZipShouldSaveDatasetFromJsonInsideAsync()
    {
        // Create a ZIP archive
        var boreholeZipFile = await GetZipFileFromExistingFileAsync("json_import_valid.json");

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);
    }

    [TestMethod]
    public async Task UploadZipWithInvalidJsonReturnValidationErrorsAsync()
    {
        // Create a ZIP archive with Json file containing duplicates
        FormFile boreholeZipFile = await GetZipFileFromExistingFileAsync("json_import_duplicated_by_location.json");

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole0"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole1"]);
    }

    [TestMethod]
    public async Task UploadZipWithoutJsonReturnsBadRequestAsync()
    {
        // Create a ZIP archive without a JSON file
        var boreholeZipFile = await GetZipFileFromExistingFileAsync("borehole_and_location_data.csv");

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);
        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);
        Assert.AreEqual("ZIP file does not contain a JSON file.", result.Value);
    }

    [TestMethod]
    public async Task UploadZipWithoutAttachmensButFilesDefinedInJsonReturnsProblemDetailsAsync()
    {
        var zipPath = "borehole_export_with_missing_files.zip";
        var boreholeZipFile = GetFormFileByExistingFile(zipPath);

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(3, problemDetails.Errors.Count);
        CollectionAssert.AreEquivalent(new[] { "Attachment with the name <7397a759-9160-48d4-8ffb-7fe1ed42e8fd.png_Screenshot 2024-12-10 145252.png> is referenced in JSON file but was not not found in ZIP archive.", }, problemDetails.Errors["Attachment1"]);
        CollectionAssert.AreEquivalent(new[] { "Attachment with the name <76ba90dc-76f7-43aa-9ff7-053de65f6e74.png_Screenshot 2024-12-20 084417.png> is referenced in JSON file but was not not found in ZIP archive.", }, problemDetails.Errors["Attachment2"]);
        CollectionAssert.AreEquivalent(new[] { "Attachment with the name <ab0dc122-e0fe-4fa5-bbf7-348c94cec0c2.png_logos.png> is referenced in JSON file but was not not found in ZIP archive.", }, problemDetails.Errors["Attachment3"]);
    }

    [TestMethod]
    public async Task UploadZipShouldSaveDatasetAndAttachmentsAsync()
    {
        var zipPath = "boreholes_with_attachments.zip";
        var boreholeZipFile = GetFormFileByExistingFile(zipPath);

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);
        var uploadedBoreholesWithAttachment = await context.BoreholesWithIncludes.Where(b => b.OriginalName.StartsWith("Carmen Catnip")).ToListAsync();
        Assert.AreEqual(uploadedBoreholesWithAttachment.SelectMany(b => b.Files!).Count(), 3);

        var firstBoreholes = uploadedBoreholesWithAttachment.Find(b => b.OriginalName == "Carmen Catnip Cheese");
        var secondBoreholes = uploadedBoreholesWithAttachment.Find(b => b.OriginalName == "Carmen Catnip Fondue");
        Assert.AreEqual(firstBoreholes.Files.Count, 2);
        Assert.AreEqual(secondBoreholes.Files.Single().Name, "logos.png");
    }

    [TestMethod]
    public async Task UploadZipForInvalidUserShouldSaveDatasetAndAttachmentsAsync()
    {
        var invalidUser = await context.Users.FirstOrDefaultAsync(u => u.Id == 123456);
        Assert.IsNull(invalidUser);

        var zipPath = "boreholes_with_attachments_invalid_user.zip";
        var boreholeZipFile = GetFormFileByExistingFile(zipPath);

        ActionResult<int> response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeZipFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);
        var uploadedBoreholesWithAttachment = await context.BoreholesWithIncludes.Where(b => b.OriginalName == "Redhold Namfix").ToListAsync();
        Assert.AreEqual(1, uploadedBoreholesWithAttachment.Count);

        var borehole = uploadedBoreholesWithAttachment.Single();
        Assert.AreEqual(1, borehole.Files.Count);
        Assert.AreEqual("boreholes.png", borehole.Files.Single().Name);
    }

    [TestMethod]
    public async Task UploadJsonWithNoJsonFileShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("not_a_json_file.csv");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid or empty JSON file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadJsonWithInvalidCasingIdsShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_invalid_casing_ids.json");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(3, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Some {nameof(ICasingReference.CasingId)} in {nameof(Borehole.Observations)}/{nameof(Completion.Backfills)}/{nameof(Completion.Instrumentations)} do not exist in the borehole's casings.", }, problemDetails.Errors["Borehole0"]);
        CollectionAssert.AreEquivalent(new[] { $"Some {nameof(ICasingReference.CasingId)} in {nameof(Borehole.Observations)}/{nameof(Completion.Backfills)}/{nameof(Completion.Instrumentations)} do not exist in the borehole's casings.", }, problemDetails.Errors["Borehole1"]);
        CollectionAssert.AreEquivalent(new[] { $"Some {nameof(ICasingReference.CasingId)} in {nameof(Borehole.Observations)}/{nameof(Completion.Backfills)}/{nameof(Completion.Instrumentations)} do not exist in the borehole's casings.", }, problemDetails.Errors["Borehole2"]);
    }

    [TestMethod]
    public async Task UploadJsonWithDuplicateBoreholesByLocationShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_duplicated_by_location.json");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole0"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Borehole1"]);
    }

    [TestMethod]
    public async Task UploadJsonWithDuplicatesExistingBoreholeShouldReturnError()
    {
        var boreholeJsonFile = GetFormFileByExistingFile("json_import_duplicates_existing.json");

        ActionResult<int> response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeJsonFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(1, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} already exists in database.", }, problemDetails.Errors["Borehole0"]);
    }
 */
    [TestMethod]
    public async Task UploadShouldSaveDataToDatabaseAsync()
    {
        // Add new borehole identifier to test dynamic ID import.
        context.Codelists.Add(new Codelist { Id = TestCodelistId, Schema = "borehole_identifier", Code = "new code", En = "Random New Id", Conf = null });
        await context.SaveChangesAsync().ConfigureAwait(false);

        httpClientFactoryMock
            .Setup(cf => cf.CreateClient(It.IsAny<string>()))
            .Returns(() => new HttpClient())
            .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "Unit_Test_6").ConfigureAwait(false);
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_6_a", borehole.Name);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(new DateTime(2024, 06, 15, 0, 0, 0, DateTimeKind.Utc), borehole.RestrictionUntil);
        Assert.AreEqual(2474.472693, borehole.TotalDepth);
        Assert.AreEqual("Projekt 6", borehole.ProjectName);
        Assert.AreEqual(5, borehole.BoreholeCodelists.Count);
        Assert.AreEqual("Id_16", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000003).Value);
        Assert.AreEqual("AUTOSTEED", borehole.BoreholeCodelists.Single(x => x.CodelistId == 100000011).Value);
        Assert.AreEqual("121314", borehole.BoreholeCodelists.Single(x => x.CodelistId == TestCodelistId).Value);
        Assert.AreEqual("Bern", borehole.Canton);
        Assert.AreEqual("Schweiz", borehole.Country);
        Assert.AreEqual("Thun", borehole.Municipality);
        Assert.AreEqual(20113004, borehole.LocationPrecisionId);
        Assert.AreEqual(20114005, borehole.ElevationPrecisionId);
        Assert.AreEqual(20101001, borehole.TypeId);
        Assert.AreEqual(827.8441205, borehole.TopBedrockFreshMd);
        Assert.AreEqual(759.7574008, borehole.TopBedrockWeatheredMd);
        Assert.AreEqual(WorkflowStatus.Draft, borehole.Workflow.Status);

        Assert.AreEqual("POINT (2613116 1179127)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadShouldSaveMinimalDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(6, okResult.Value);

        // Assert imported values
        var borehole = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "Unit_Test_2").ConfigureAwait(false);
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual(null, borehole.Name);
        Assert.AreEqual(null, borehole.IsPublic);
        Assert.AreEqual(null, borehole.RestrictionUntil);
        Assert.AreEqual(null, borehole.TotalDepth);
        Assert.AreEqual(null, borehole.ProjectName);
        Assert.AreEqual(0, borehole.BoreholeCodelists.Count);
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000010 1000010)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadShouldSavePrecisionDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("precision_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(7, okResult.Value);

        // Assert imported values
        var boreholeLV95 = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "Unit_Test_2").ConfigureAwait(false);
        Assert.AreEqual(ReferenceSystem.LV95, boreholeLV95.OriginalReferenceSystem);
        Assert.AreEqual(2000010.12, boreholeLV95.LocationX);
        Assert.AreEqual(1000010.1, boreholeLV95.LocationY);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationX);
        Assert.AreEqual(1, boreholeLV95.PrecisionLocationY);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationXLV03);
        Assert.AreEqual(2, boreholeLV95.PrecisionLocationYLV03);

        var boreholeLV03 = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "Unit_Test_6").ConfigureAwait(false);
        Assert.AreEqual(ReferenceSystem.LV03, boreholeLV03.OriginalReferenceSystem.Value);
        Assert.AreEqual(20050.12, boreholeLV03.LocationXLV03);
        Assert.AreEqual(10050.12345, boreholeLV03.LocationYLV03);
        Assert.AreEqual(2, boreholeLV03.PrecisionLocationXLV03);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationYLV03);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationX);
        Assert.AreEqual(5, boreholeLV03.PrecisionLocationY);

        var boreholeWithZeros = await context.BoreholesWithIncludes.SingleAsync(b => b.OriginalName == "Unit_Test_7").ConfigureAwait(false);
        Assert.AreEqual(ReferenceSystem.LV03, boreholeWithZeros.OriginalReferenceSystem.Value);
        Assert.AreEqual(20060.000, boreholeWithZeros.LocationXLV03);
        Assert.AreEqual(10060.0000, boreholeWithZeros.LocationYLV03);
        Assert.AreEqual(3, boreholeWithZeros.PrecisionLocationXLV03);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationYLV03);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationX);
        Assert.AreEqual(4, boreholeWithZeros.PrecisionLocationY);
    }

    [TestMethod]
    public async Task UploadShouldSaveSpecialCharsDatasetAsync()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("special_chars_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = await context.Boreholes.OrderByDescending(b => b.Id).FirstOrDefaultAsync();
        Assert.AreEqual(1, borehole.WorkgroupId);
        Assert.AreEqual("Unit_Test_special_chars_1", borehole.OriginalName);
        Assert.AreEqual("„ÖÄÜöäü-*#%&7{}[]()='~^><\\@¦+Š", borehole.ProjectName);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadWithMissingCoordinatesAsync()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("no_coordinates_provided_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
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

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = await context.Boreholes.SingleAsync(b => b.OriginalName != null && b.OriginalName.Contains("LV95 - All coordinates set")).ConfigureAwait(false);
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

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = await context.Boreholes.SingleAsync(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - All coordinates set")).ConfigureAwait(false);
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

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = await context.Boreholes.SingleAsync(b => b.OriginalName != null && b.OriginalName.Contains("LV03 - LV03 x out of range")).ConfigureAwait(false);
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

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid or empty CSV file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadInvalidFileTypeBoreholeCsvShouldReturnError()
    {
        var invalidFileTypeBoreholeFile = GetFormFileByContent(fileContent: "This is the content of the file.", fileName: "invalid_file_type.txt");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, invalidFileTypeBoreholeFile);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid or empty CSV file uploaded.", badRequestResult.Value);
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
        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, null);

        ActionResultAssert.IsBadRequest(response.Result);
        BadRequestObjectResult badRequestResult = (BadRequestObjectResult)response.Result!;
        Assert.AreEqual("Invalid or empty CSV file uploaded.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task UploadNoDataButRequiredHeadersSetShouldUploadNoBorehole()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("no_data_but_required_headers.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(0, okResult.Value);
    }

    [TestMethod]
    public async Task UploadMultipleRowsMissingRequiredFieldsShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("multiple_rows_missing_required_attributes_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
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

    private static ValidationProblemDetails GetProblemDetailsFromResponse(ActionResult<int> response)
    {
        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        ObjectResult result = (ObjectResult)response.Result!;
        Assert.IsInstanceOfType(result.Value, typeof(ValidationProblemDetails));
        ValidationProblemDetails problemDetails = (ValidationProblemDetails)result.Value!;
        return problemDetails;
    }

    [TestMethod]
    public async Task UploadRequiredHeadersMissingShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("missing_required_headers_testdata.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        Assert.IsInstanceOfType(response.Result, typeof(ObjectResult));
        var result = (ObjectResult)response.Result!;
        ActionResultAssert.IsBadRequest(result);

        ProblemDetails problemDetails = (ProblemDetails)result.Value!;
        Assert.AreEqual(3, Regex.Matches(problemDetails.Detail!, "Header with name ").Count);
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_x'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'Location_y'[0] was not found.");
        StringAssert.Contains(problemDetails.Detail, "Header with name 'OriginalName'[0] was not found.");
    }

    [TestMethod]
    public async Task UploadDuplicateBoreholesInFileShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInFile.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(2, problemDetails.Errors.Count);

        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row1"]);
        CollectionAssert.AreEquivalent(new[] { $"Borehole with same Coordinates (+/- 2m) and same {nameof(Borehole.TotalDepth)} is provided multiple times.", }, problemDetails.Errors["Row2"]);
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
        await context.SaveChangesAsync().ConfigureAwait(false);

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDb.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
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

        var maxWorkgroudId = await context.Workgroups.MaxAsync(w => w.Id).ConfigureAwait(false);
        var minWorkgroudId = await context.Workgroups.MinAsync(w => w.Id).ConfigureAwait(false);

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
        await context.SaveChangesAsync().ConfigureAwait(false);

        var boreholeCsvFile = GetFormFileByExistingFile("duplicateBoreholesInDbButDifferentWorkgroup.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: minWorkgroudId, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(2, okResult.Value);
    }

    [TestMethod]
    public async Task UploadWithMaxValidationErrorsExceededShouldReturnError()
    {
        var boreholeCsvFile = GetFormFileByExistingFile("maxValidationErrorsExceeded.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ValidationProblemDetails problemDetails = GetProblemDetailsFromResponse(response);
        Assert.AreEqual(1000, problemDetails.Errors.Count);
    }

    [TestMethod]
    public async Task UploadShouldIgnoreLocationFields()
    {
        httpClientFactoryMock
           .Setup(cf => cf.CreateClient(It.IsAny<string>()))
           .Returns(() => new HttpClient())
           .Verifiable();

        var boreholeCsvFile = GetFormFileByExistingFile("borehole_and_location_data.csv");

        ActionResult<int> response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);

        ActionResultAssert.IsOk(response.Result);
        OkObjectResult okResult = (OkObjectResult)response.Result!;
        Assert.AreEqual(1, okResult.Value);

        // Assert imported values
        var borehole = await context.Boreholes.SingleAsync(b => b.OriginalName == "ACORNFLEA").ConfigureAwait(false);
        Assert.AreEqual(null, borehole.Canton);
        Assert.AreEqual(null, borehole.Country);
        Assert.AreEqual(null, borehole.Municipality);
        Assert.AreEqual("POINT (2000000 1000000)", borehole.Geometry.ToString());
    }

    [TestMethod]
    public async Task UploadCsvWorkgroupPermissionMissing()
    {
        boreholePermissionServiceMock.Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<Role>())).ReturnsAsync(false);
        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        var response = await controller.UploadCsvFileAsync(workgroupId: 1, boreholeCsvFile);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    /*
    [TestMethod]
    public async Task UploadJsonWorkgroupPermissionMissing()
    {
        boreholePermissionServiceMock.Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<Role>())).ReturnsAsync(false);
        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        var response = await controller.UploadJsonFileAsync(workgroupId: 1, boreholeCsvFile);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    [TestMethod]
    public async Task UploadZipWorkgroupPermissionMissing()
    {
        boreholePermissionServiceMock.Setup(x => x.HasUserRoleOnWorkgroupAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<Role>())).ReturnsAsync(false);
        var boreholeCsvFile = GetFormFileByExistingFile("minimal_testdata.csv");

        var response = await controller.UploadZipFileAsync(workgroupId: 1, boreholeCsvFile);
        ActionResultAssert.IsUnauthorized(response.Result);
    }

    private static async Task<FormFile> GetZipFileFromExistingFileAsync(string fileName)
    {
        var zipPath = "archive.zip";

        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                var csvFile = archive.CreateEntry(fileName);

                using (var entryStream = csvFile.Open())
                using (var fileStream = System.IO.File.OpenRead(fileName))
                {
                    await fileStream.CopyToAsync(entryStream);
                }
            }

            await System.IO.File.WriteAllBytesAsync(zipPath, memoryStream.ToArray());
        }

        var boreholeZipFile = GetFormFileByExistingFile(zipPath);
        return boreholeZipFile;
    }
    */
}
