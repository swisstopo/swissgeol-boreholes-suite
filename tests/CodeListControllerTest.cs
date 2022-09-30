using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS;

[TestClass]
public class CodeListControllerTest
{
    private BdmsContext context;
    private CodeListController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new CodeListController(ContextFactory.CreateContext(), new Mock<ILogger<CodeListController>>().Object);
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var codeLists = await controller.GetAsync();
        Assert.AreEqual(2437, codeLists.Count());
    }

    [TestMethod]
    public async Task GetEntriesByInexistantSchema()
    {
        var codeLists = await controller.GetAsync("not-a-valid-name");
        Assert.AreEqual(0, codeLists.Count());
    }

    [TestMethod]
    public async Task GetEntriesBySchema()
    {
        var codeLists = await controller.GetAsync("custom.chronostratigraphy_top_bedrock");
        Assert.AreEqual(149, codeLists.Count());
        var codeListToTest = codeLists.Single(c => c.Id == 15001168);
        Assert.AreEqual(15001168, codeListToTest.Id);
        Assert.AreEqual(15001168, codeListToTest.Geolcode);
        Assert.AreEqual(null, codeListToTest.Conf);
        Assert.AreEqual(false, codeListToTest.Default);
        Assert.AreEqual("custom.chronostratigraphy_top_bedrock", codeListToTest.Schema);
        Assert.AreEqual("Mittlerer Jura undifferenziert", codeListToTest.TextDe);
        Assert.AreEqual("Middle Jurassic undifferenciated", codeListToTest.TextEn);
        Assert.AreEqual("Jurassique moyen indifférencié", codeListToTest.TextFr);
        Assert.AreEqual("Giurassico medio indifferenziato", codeListToTest.TextIt);
        Assert.AreEqual(142, codeListToTest.Order);
        Assert.AreEqual("jmu", codeListToTest.Code);
    }

    [TestMethod]
    public async Task EditCodelistWithMinimalCodelist()
    {
        var id = 1010;
        var originalCodeList = new Codelist
        {
            Id = id,
            TextDe = "Ansatzhöhe Z [müM]",
            Code = "elevation_z",
            TextEn = "Elevation Z [masl]",
            TextFr = "Altitude Z [MsM]",
            DescriptionEn = "",
        };

        var codeList = new Codelist
        {
            Id = id,
            TextDe = "Neuer deutscher Text",
            Code = "elevation_z",
            TextEn = "New english text",
            DescriptionEn = "",
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual("Ansatzhöhe Z [müM]", codeListToEdit.TextDe);
        Assert.AreEqual("Elevation Z [masl]", codeListToEdit.TextEn);
        Assert.AreEqual("elevation_z", codeListToEdit.Code);
        Assert.AreEqual("Altitude Z [MsM]", codeListToEdit.TextFr);
        Assert.AreEqual("", codeListToEdit.DescriptionEn);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates
        var updatedContext = ContextFactory.CreateContext();
        var updatedCodelist = updatedContext.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("Neuer deutscher Text", updatedCodelist.TextDe);
        Assert.AreEqual("New english text", updatedCodelist.TextEn);
        Assert.AreEqual("elevation_z", updatedCodelist.Code);

        // Emtpy values are deleted
        Assert.AreEqual(null, updatedCodelist.TextFr);
        Assert.AreEqual("", updatedCodelist.DescriptionEn);

        // Reset edits
        _ = await controller.EditAsync(originalCodeList);
    }

    [TestMethod]
    public async Task EditCodelistWithCompleteCodelist()
    {
        var id = 1020;
        var originalCodeList = new Codelist
        {
            Id = id,
            Code = "cuttings",
            Conf = null,
            Default = false,
            DescriptionDe = "",
            DescriptionEn = "",
            DescriptionFr = "",
            DescriptionIt = "",
            DescriptionRo = null,
            Geolcode = 1020,
            Order = 21,
            Schema = "borehole_form",
            TextDe = "Bohrgut",
            TextEn = "Cuttings",
            TextFr = "Matière forée ",
            TextIt = "materiale perforato",
            TextRo = null,
        };

        var codeList = new Codelist
        {
            Id = id,
            Code = "cuttings",
            Conf = null,
            Default = true,
            DescriptionDe = "",
            DescriptionEn = "",
            DescriptionFr = "",
            DescriptionIt = "",
            DescriptionRo = null,
            Geolcode = 222,
            Order = 21,
            Schema = "schema_borehole_form",
            TextDe = "Bohrgut",
            TextEn = "Cuttings",
            TextFr = "Matière forée ",
            TextIt = "materiale perforato",
            TextRo = null,
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual("cuttings", codeListToEdit.Code);
        Assert.AreEqual(null, codeListToEdit.Conf);
        Assert.AreEqual(false, codeListToEdit.Default);
        Assert.AreEqual("", codeListToEdit.DescriptionEn);
        Assert.AreEqual("", codeListToEdit.DescriptionFr);
        Assert.AreEqual("", codeListToEdit.DescriptionIt);
        Assert.AreEqual("", codeListToEdit.DescriptionDe);
        Assert.AreEqual(null, codeListToEdit.DescriptionRo);
        Assert.AreEqual(1020, codeListToEdit.Geolcode);
        Assert.AreEqual(21, codeListToEdit.Order);
        Assert.AreEqual("borehole_form", codeListToEdit.Schema);
        Assert.AreEqual("Bohrgut", codeListToEdit.TextDe);
        Assert.AreEqual("Cuttings", codeListToEdit.TextEn);
        Assert.AreEqual("Matière forée ", codeListToEdit.TextFr);
        Assert.AreEqual("materiale perforato", codeListToEdit.TextIt);
        Assert.AreEqual(null, codeListToEdit.TextRo);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates and unchanged values
        var updatedContext = ContextFactory.CreateContext();
        var updatedCodelist = updatedContext.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("cuttings", updatedCodelist.Code);
        Assert.AreEqual(null, updatedCodelist.Conf);
        Assert.AreEqual(true, updatedCodelist.Default);
        Assert.AreEqual("", updatedCodelist.DescriptionEn);
        Assert.AreEqual("", updatedCodelist.DescriptionFr);
        Assert.AreEqual("", updatedCodelist.DescriptionIt);
        Assert.AreEqual("", updatedCodelist.DescriptionDe);
        Assert.AreEqual(null, updatedCodelist.DescriptionRo);
        Assert.AreEqual(222, updatedCodelist.Geolcode);
        Assert.AreEqual(21, updatedCodelist.Order);
        Assert.AreEqual("schema_borehole_form", updatedCodelist.Schema);
        Assert.AreEqual("Bohrgut", updatedCodelist.TextDe);
        Assert.AreEqual("Cuttings", updatedCodelist.TextEn);
        Assert.AreEqual("Matière forée ", updatedCodelist.TextFr);
        Assert.AreEqual("materiale perforato", updatedCodelist.TextIt);
        Assert.AreEqual(null, updatedCodelist.TextRo);

        // Reset edits
        _ = await controller.EditAsync(originalCodeList);
    }

    [TestMethod]
    public async Task EditWithInexistantIdReturnsNotFound()
    {
        var id = 9487794;
        var codeList = new Codelist
        {
            Id = id,
            TextDe = "",
            Code = "",
            TextEn = "",
            DescriptionEn = "",
        };

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        var notFoundResult = response as NotFoundResult;
        Assert.AreEqual(404, notFoundResult.StatusCode);
    }

    [TestMethod]
    public async Task EditWithoutCodelistReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        var badRequestResult = response as BadRequestObjectResult;
        Assert.AreEqual(400, badRequestResult.StatusCode);
    }
}
