using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class BoreholeControllerTest
{
    private const int DefaultWorkgroupId = 1;
    private int boreholeId;

    private BdmsContext context;
    private BoreholeController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var boreholeLockServiceMock = new Mock<IBoreholeLockService>(MockBehavior.Strict);
        boreholeLockServiceMock
            .Setup(x => x.IsBoreholeLockedAsync(It.IsAny<int?>(), It.IsAny<string?>()))
            .ReturnsAsync(false);
        controller = new BoreholeController(context, new Mock<ILogger<BoreholeController>>().Object, boreholeLockServiceMock.Object) { ControllerContext = GetControllerContextAdmin() };

        boreholeId = GetBoreholeIdToCopy();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task EditBoreholeWithCompleteBorehole()
    {
        var id = 1_000_257;

        var newBorehole = new Borehole
        {
            Id = id,
            CreatedById = 4,
            UpdatedById = 4,
            Locked = null,
            LockedById = null,
            WorkgroupId = 1,
            IsPublic = true,
            TypeId = 20101003,
            LocationX = 2600000.0,
            PrecisionLocationX = 5,
            LocationY = 1200000.0,
            PrecisionLocationY = 5,
            LocationXLV03 = 600000.0,
            PrecisionLocationXLV03 = 5,
            LocationYLV03 = 200000.0,
            PrecisionLocationYLV03 = 5,
            OriginalReferenceSystem = ReferenceSystem.LV95,
            ElevationZ = 450.5,
            HrsId = 20106001,
            TotalDepth = 100.0,
            RestrictionId = 20111003,
            RestrictionUntil = DateTime.UtcNow.AddYears(1),
            NationalInterest = false,
            OriginalName = "BH-257",
            AlternateName = "Borehole 257",
            LocationPrecisionId = 20113002,
            ElevationPrecisionId = null,
            ProjectName = "Project Alpha",
            Country = "CH",
            Canton = "ZH",
            Municipality = "Zurich",
            PurposeId = 22103002,
            StatusId = 22104001,
            QtDepthId = 22108005,
            TopBedrockFreshMd = 10.5,
            TopBedrockWeatheredMd = 8.0,
            HasGroundwater = true,
            Geometry = null,
            Remarks = "Test borehole for project",
            LithologyTopBedrockId = 15104934,
            LithostratigraphyId = 15300259,
            ChronostratigraphyId = 15001141,
            ReferenceElevation = 500.0,
            QtReferenceElevationId = 20114002,
            ReferenceElevationTypeId = 20117003,
        };

        var boreholeToEdit = context.Boreholes.Single(c => c.Id == id);
        Assert.AreEqual(1, boreholeToEdit.Stratigraphies.Count);
        Assert.AreEqual(0, boreholeToEdit.Workflows.Count);
        Assert.AreEqual(0, boreholeToEdit.BoreholeFiles.Count);
        Assert.AreEqual(0, boreholeToEdit.BoreholeGeometry.Count);
        Assert.AreEqual(0, boreholeToEdit.Completions.Count);
        Assert.AreEqual(0, boreholeToEdit.Observations.Count); // Hydrogeology observations
        Assert.AreEqual(0, boreholeToEdit.Sections.Count);

        Assert.AreEqual(2, boreholeToEdit.CreatedById);
        Assert.AreEqual(5, boreholeToEdit.UpdatedById);

        // Update Borehole
        var response = await controller.EditAsync(newBorehole);
        ActionResultAssert.IsOk(response.Result);

        // Assert Updates and unchanged values
        var updatedBorehole = ActionResultAssert.IsOkObjectResult<Borehole>(response.Result);

        Assert.AreEqual(4, updatedBorehole.CreatedById);
        Assert.AreEqual(1, updatedBorehole.UpdatedById); // updatedById should be overwritten by the test user id.
        Assert.AreEqual(newBorehole.WorkgroupId, updatedBorehole.WorkgroupId);
        Assert.AreEqual(newBorehole.IsPublic, updatedBorehole.IsPublic);
        Assert.AreEqual(newBorehole.TypeId, updatedBorehole.TypeId);
        Assert.AreEqual(newBorehole.LocationX, updatedBorehole.LocationX);
        Assert.AreEqual(newBorehole.PrecisionLocationX, updatedBorehole.PrecisionLocationX);
        Assert.AreEqual(newBorehole.LocationY, updatedBorehole.LocationY);
        Assert.AreEqual(newBorehole.PrecisionLocationY, updatedBorehole.PrecisionLocationY);
        Assert.AreEqual(newBorehole.LocationXLV03, updatedBorehole.LocationXLV03);
        Assert.AreEqual(newBorehole.PrecisionLocationXLV03, updatedBorehole.PrecisionLocationXLV03);
        Assert.AreEqual(newBorehole.LocationYLV03, updatedBorehole.LocationYLV03);
        Assert.AreEqual(newBorehole.PrecisionLocationYLV03, updatedBorehole.PrecisionLocationYLV03);
        Assert.AreEqual(newBorehole.ElevationZ, updatedBorehole.ElevationZ);
        Assert.AreEqual(newBorehole.HrsId, updatedBorehole.HrsId);
        Assert.AreEqual(newBorehole.TotalDepth, updatedBorehole.TotalDepth);
        Assert.AreEqual(newBorehole.RestrictionId, updatedBorehole.RestrictionId);
        Assert.AreEqual(newBorehole.RestrictionUntil.ToString(), updatedBorehole.RestrictionUntil.ToString());
        Assert.AreEqual(newBorehole.NationalInterest, updatedBorehole.NationalInterest);
        Assert.AreEqual(newBorehole.OriginalName, updatedBorehole.OriginalName);
        Assert.AreEqual(newBorehole.AlternateName, updatedBorehole.AlternateName);
        Assert.AreEqual(newBorehole.LocationPrecisionId, updatedBorehole.LocationPrecisionId);
        Assert.AreEqual(newBorehole.ElevationPrecisionId, updatedBorehole.ElevationPrecisionId);
        Assert.AreEqual(newBorehole.ProjectName, updatedBorehole.ProjectName);
        Assert.AreEqual(newBorehole.Country, updatedBorehole.Country);
        Assert.AreEqual(newBorehole.Canton, updatedBorehole.Canton);
        Assert.AreEqual(newBorehole.Municipality, updatedBorehole.Municipality);
        Assert.AreEqual(newBorehole.PurposeId, updatedBorehole.PurposeId);
        Assert.AreEqual(newBorehole.StatusId, updatedBorehole.StatusId);
        Assert.AreEqual(newBorehole.QtDepthId, updatedBorehole.QtDepthId);
        Assert.AreEqual(newBorehole.TopBedrockFreshMd, updatedBorehole.TopBedrockFreshMd);
        Assert.AreEqual(newBorehole.TopBedrockWeatheredMd, updatedBorehole.TopBedrockWeatheredMd);
        Assert.AreEqual(newBorehole.HasGroundwater, updatedBorehole.HasGroundwater);
        Assert.AreEqual(newBorehole.Remarks, updatedBorehole.Remarks);
        Assert.AreEqual(newBorehole.LithologyTopBedrockId, updatedBorehole.LithologyTopBedrockId);
        Assert.AreEqual(newBorehole.LithostratigraphyId, updatedBorehole.LithostratigraphyId);
        Assert.AreEqual(newBorehole.ChronostratigraphyId, updatedBorehole.ChronostratigraphyId);
        Assert.AreEqual(newBorehole.ReferenceElevation, updatedBorehole.ReferenceElevation);
        Assert.AreEqual(newBorehole.QtReferenceElevationId, updatedBorehole.QtReferenceElevationId);
        Assert.AreEqual(newBorehole.ReferenceElevationTypeId, updatedBorehole.ReferenceElevationTypeId);

        // Stratigraphies and workflows remain unchanged
        Assert.AreEqual(1, updatedBorehole.Stratigraphies.Count);
        Assert.AreEqual(0, updatedBorehole.Workflows.Count);
        Assert.AreEqual(0, updatedBorehole.BoreholeFiles.Count);
        Assert.AreEqual(0, updatedBorehole.BoreholeGeometry.Count);
        Assert.AreEqual(0, updatedBorehole.Completions.Count);
        Assert.AreEqual(0, updatedBorehole.Observations.Count);
        Assert.AreEqual(0, updatedBorehole.Sections.Count);
    }

    [TestMethod]
    public async Task EditWithInexistentIdReturnsNotFound()
    {
        var id = 9111794;
        var borehole = new Borehole
        {
            Id = id,
        };

        // Upate Borehole
        var response = await controller.EditAsync(borehole);
        ActionResultAssert.IsNotFound(response.Result);
    }

    [TestMethod]
    public async Task EditWithoutBoreholeReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response.Result);
    }

    [TestMethod]
    public async Task EditWithWrongCodelistCodesReturnsInternalServerError()
    {
        var borehole = new Borehole
        {
            Id = 1_000_256,
            PurposeId = 99999, // Id violating constraint
        };

        var response = await controller.EditAsync(borehole);
        ActionResultAssert.IsInternalServerError(response.Result);
    }

    [TestMethod]
    public async Task Copy()
    {
        var originalBorehole = GetBorehole(boreholeId);

        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);

        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
        var copiedBorehole = GetBorehole((int)copiedBoreholeId);

        Assert.AreEqual($"{originalBorehole.OriginalName} (Copy)", copiedBorehole.OriginalName);
        Assert.AreEqual(originalBorehole.CreatedBy.SubjectId, copiedBorehole.CreatedBy.SubjectId);
        Assert.AreEqual(originalBorehole.UpdatedBy.SubjectId, copiedBorehole.UpdatedBy.SubjectId);
        Assert.AreEqual(DefaultWorkgroupId, copiedBorehole.Workgroup.Id);
        Assert.AreEqual(1, copiedBorehole.Workflows.Count);
        Assert.AreEqual(Role.Editor, copiedBorehole.Workflows.First().Role);
        Assert.AreSame(originalBorehole.Type, copiedBorehole.Type);
        Assert.AreEqual(originalBorehole.Country, copiedBorehole.Country);
        Assert.AreEqual(originalBorehole.Canton, copiedBorehole.Canton);
        Assert.AreEqual(originalBorehole.Municipality, copiedBorehole.Municipality);

        var originalStratigraphy = originalBorehole.Stratigraphies.First();
        var copiedstratigraphy = copiedBorehole.Stratigraphies.First();
        Assert.AreNotEqual(originalBorehole.Id, copiedBorehole.Id);
        Assert.AreNotSame(originalBorehole.Stratigraphies, copiedBorehole.Stratigraphies);
        Assert.AreNotEqual(originalStratigraphy.Id, copiedstratigraphy.Id);
        Assert.AreNotSame(originalStratigraphy.Layers, copiedstratigraphy.Layers);
        Assert.AreNotEqual(originalStratigraphy.Layers.First().Id, copiedstratigraphy.Layers.First().Id);

        Assert.AreEqual(originalStratigraphy.LithologicalDescriptions.Count, copiedstratigraphy.LithologicalDescriptions.Count);
        for (int i = 0; i < originalStratigraphy.LithologicalDescriptions.Count; i++)
        {
            var originalDescription = originalStratigraphy.LithologicalDescriptions.ElementAt(i);
            var copiedDescription = copiedstratigraphy.LithologicalDescriptions.Single(d => d.Description == originalDescription.Description);

            Assert.AreNotEqual(originalDescription.Id, copiedDescription.Id);
            Assert.AreEqual(originalDescription.Description, copiedDescription.Description);
            Assert.AreEqual(originalDescription.CreatedBy.SubjectId, copiedDescription.CreatedBy.SubjectId);
            Assert.AreEqual(originalDescription.UpdatedBy.SubjectId, copiedDescription.UpdatedBy.SubjectId);
            Assert.AreEqual(originalDescription.Created, copiedDescription.Created);
            Assert.AreEqual(originalDescription.Updated, copiedDescription.Updated);
        }

        Assert.AreEqual(originalStratigraphy.FaciesDescriptions.Count, copiedstratigraphy.FaciesDescriptions.Count);
        for (int i = 0; i < originalStratigraphy.FaciesDescriptions.Count; i++)
        {
            var originalDescription = originalStratigraphy.FaciesDescriptions.ElementAt(i);
            var copiedDescription = copiedstratigraphy.FaciesDescriptions.Single(d => d.Description == originalDescription.Description);

            Assert.AreNotEqual(originalDescription.Id, copiedDescription.Id);
            Assert.AreEqual(originalDescription.Description, copiedDescription.Description);
            Assert.AreEqual(originalDescription.CreatedBy.SubjectId, copiedDescription.CreatedBy.SubjectId);
            Assert.AreEqual(originalDescription.UpdatedBy.SubjectId, copiedDescription.UpdatedBy.SubjectId);
            Assert.AreEqual(originalDescription.Created, copiedDescription.Created);
            Assert.AreEqual(originalDescription.Updated, copiedDescription.Updated);
        }

        Assert.AreNotSame(originalStratigraphy.ChronostratigraphyLayers, copiedstratigraphy.ChronostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.ChronostratigraphyLayers.First().Id, copiedstratigraphy.ChronostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.ChronostratigraphyLayers.OrderBy(c => c.Id).First().ChronostratigraphyId, copiedstratigraphy.ChronostratigraphyLayers.OrderBy(c => c.Id).First().ChronostratigraphyId);

        Assert.AreNotSame(originalStratigraphy.LithostratigraphyLayers, copiedstratigraphy.LithostratigraphyLayers);
        Assert.AreNotEqual(originalStratigraphy.LithostratigraphyLayers.First().Id, copiedstratigraphy.LithostratigraphyLayers.First().Id);
        Assert.AreEqual(originalStratigraphy.LithostratigraphyLayers.OrderBy(l => l.Id).First().LithostratigraphyId, copiedstratigraphy.LithostratigraphyLayers.OrderBy(l => l.Id).First().LithostratigraphyId);

        Assert.AreNotSame(originalBorehole.BoreholeFiles, copiedBorehole.BoreholeFiles);
        Assert.AreNotEqual(originalBorehole.BoreholeFiles.First().BoreholeId, copiedBorehole.BoreholeFiles.First().BoreholeId);
        Assert.AreEqual(originalBorehole.BoreholeFiles.First().FileId, copiedBorehole.BoreholeFiles.First().FileId);
        Assert.AreEqual(originalBorehole.BoreholeFiles.First().Description, copiedBorehole.BoreholeFiles.First().Description);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerColorCodes, copiedstratigraphy.Layers.First().LayerColorCodes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerColorCodes.Count, copiedstratigraphy.Layers.First().LayerColorCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerGrainShapeCodes, copiedstratigraphy.Layers.First().LayerGrainShapeCodes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerGrainShapeCodes.Count, copiedstratigraphy.Layers.First().LayerGrainShapeCodes.Count);

        Assert.AreNotSame(originalStratigraphy.Layers.First().LayerUscs3Codes, copiedstratigraphy.Layers.First().LayerUscs3Codes);
        Assert.AreEqual(originalStratigraphy.Layers.First().LayerUscs3Codes.Count, copiedstratigraphy.Layers.First().LayerUscs3Codes.Count);

        var originalCompletion = originalBorehole.Completions.First();
        var copiedCompletion = copiedBorehole.Completions.First();

        Assert.AreNotEqual(originalCompletion.Id, copiedCompletion.Id);
        Assert.AreNotSame(originalCompletion.Casings, copiedCompletion.Casings);
        Assert.AreNotEqual(originalCompletion.Casings.First().Id, copiedCompletion.Casings.First().Id);
        Assert.AreEqual(originalCompletion.Casings.First().Notes, copiedCompletion.Casings.First().Notes);

        Assert.AreNotSame(originalCompletion.Backfills, copiedCompletion.Backfills);
        Assert.AreNotEqual(originalCompletion.Backfills.First().Id, copiedCompletion.Backfills.First().Id);
        Assert.AreEqual(originalCompletion.Backfills.First().Created, copiedCompletion.Backfills.First().Created);

        Assert.AreNotSame(originalCompletion.Instrumentations, copiedCompletion.Instrumentations);
        Assert.AreNotEqual(originalCompletion.Instrumentations.First().Id, copiedCompletion.Instrumentations.First().Id);
        Assert.AreEqual(originalCompletion.Instrumentations.First().Status, copiedCompletion.Instrumentations.First().Status);

        Assert.AreNotEqual(originalCompletion.Casings.First().CasingElements.First().Id, copiedCompletion.Casings.First().CasingElements.First().Id);
        Assert.AreEqual(originalCompletion.Casings.First().CasingElements.OrderBy(c => c.Id).First().OuterDiameter, copiedCompletion.Casings.First().CasingElements.OrderBy(c => c.Id).First().OuterDiameter);

        var originalWaterIngress = originalBorehole.Observations.OfType<WaterIngress>().First();
        var copiedWaterIngress = copiedBorehole.Observations.OfType<WaterIngress>().First();

        Assert.AreNotEqual(originalWaterIngress.Id, copiedWaterIngress.Id);
        Assert.AreEqual(originalWaterIngress.IsOpenBorehole, copiedWaterIngress.IsOpenBorehole);

        var originalFieldMeasurement = originalBorehole.Observations.OfType<FieldMeasurement>().First();
        var copiedFieldMeasurement = copiedBorehole.Observations.OfType<FieldMeasurement>().First();

        Assert.AreNotEqual(originalFieldMeasurement.Id, copiedFieldMeasurement.Id);
        Assert.AreNotSame(originalFieldMeasurement.FieldMeasurementResults, copiedFieldMeasurement.FieldMeasurementResults);
        Assert.AreNotEqual(originalFieldMeasurement.FieldMeasurementResults.First().Id, copiedFieldMeasurement.FieldMeasurementResults.First().Id);
        Assert.AreEqual(originalFieldMeasurement.FieldMeasurementResults.First().Value, copiedFieldMeasurement.FieldMeasurementResults.First().Value);

        var originalSection = originalBorehole.Sections.First();
        var copiedSection = copiedBorehole.Sections.First();

        Assert.AreNotEqual(originalSection.Id, copiedSection.Id);
        Assert.AreNotSame(originalSection.SectionElements, copiedSection.SectionElements);
        Assert.AreNotEqual(originalSection.SectionElements.First().Id, copiedSection.SectionElements.First().Id);
        Assert.AreEqual(originalSection.SectionElements.First().FromDepth, copiedSection.SectionElements.First().FromDepth);

        var originalBoreholeGeometry = originalBorehole.BoreholeGeometry.Last();
        var copiedBoreholeGeometry = copiedBorehole.BoreholeGeometry.Last();

        Assert.AreNotEqual(originalBoreholeGeometry.Id, copiedBoreholeGeometry.Id);
        Assert.AreEqual(originalBoreholeGeometry.X, copiedBoreholeGeometry.X);
    }

    private Borehole GetBorehole(int id)
    {
        return GetBoreholesWithIncludes(context.Boreholes).Single(b => b.Id == id);
    }

    // Get the id of a borehole with certain conditions.
    private int GetBoreholeIdToCopy()
    {
        List<Borehole> boreholes = GetBoreholesWithIncludes(context.Boreholes).ToList();

        foreach (var bh in boreholes)
        {
           context.Entry(bh)
                .Collection(b => b.Observations)
                .Query()
                .OfType<FieldMeasurement>()
                .Include(f => f.FieldMeasurementResults)
                .Load();
        }

        var borehole = boreholes
            .Where(b =>
                b.Stratigraphies != null &&
                b.Stratigraphies.Any() &&
                b.Stratigraphies.First().Layers != null &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerColorCodes != null && x.LayerColorCodes.Any()) &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerGrainShapeCodes != null && x.LayerGrainShapeCodes.Any()) &&
                b.Stratigraphies.First().Layers.Any(x => x.LayerUscs3Codes != null && x.LayerUscs3Codes.Any()) &&
                b.Stratigraphies.First().LithologicalDescriptions != null &&
                b.Stratigraphies.First().FaciesDescriptions != null &&
                b.Stratigraphies.First().ChronostratigraphyLayers != null &&
                b.Stratigraphies.First().LithostratigraphyLayers != null &&
                b.Completions.First() != null &&
                b.Completions.First().Casings.First() != null &&
                b.Completions.First().Casings.First().CasingElements.First() != null &&
                b.Observations.First() != null &&
                b.Observations.OfType<WaterIngress>().Any() &&
                b.Observations.OfType<FieldMeasurement>().Any(fm => fm.FieldMeasurementResults.Count != 0) &&
                b.Sections.First() != null &&
                b.Sections.First().SectionElements.First() != null &&
                b.BoreholeGeometry.Any() &&
                b.BoreholeFiles.First().File != null &&
                b.Canton != null &&
                b.Stratigraphies.First().ChronostratigraphyLayers.First().ChronostratigraphyId != null)
            .FirstOrDefault();

        Assert.IsNotNull(borehole != null, "Precondition: No borehole for conditions found.");

        return borehole.Id;
    }

    [TestMethod]
    public async Task CopyInvalidBoreholeId()
    {
        var result = await controller.CopyAsync(0, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsNotFound(result.Result);
    }

    [TestMethod]
    public async Task CopyInvalidWorkgroupId()
    {
        var result = await controller.CopyAsync(boreholeId, workgroupId: 0).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyMissingWorkgroupPermission()
    {
        var result = await controller.CopyAsync(boreholeId, workgroupId: 2).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUnknownUser()
    {
        controller.HttpContext.SetClaimsPrincipal("NON-EXISTENT-NAME", PolicyNames.Admin);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsUnauthorized(result.Result);
    }

    [TestMethod]
    public async Task CopyWithUserNotSet()
    {
        controller.ControllerContext.HttpContext.User = null;
        await Assert.ThrowsExceptionAsync<InvalidOperationException>(async () =>
        {
            await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        });
    }

    [TestMethod]
    public async Task CopyWithNonAdminUser()
    {
        controller.HttpContext.SetClaimsPrincipal("sub_editor", PolicyNames.Viewer);
        var result = await controller.CopyAsync(boreholeId, workgroupId: DefaultWorkgroupId).ConfigureAwait(false);
        ActionResultAssert.IsOk(result.Result);
        var copiedBoreholeId = ((OkObjectResult?)result.Result)?.Value;
        Assert.IsNotNull(copiedBoreholeId);
        Assert.IsInstanceOfType(copiedBoreholeId, typeof(int));
    }
}
