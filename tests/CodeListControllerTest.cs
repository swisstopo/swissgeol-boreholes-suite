using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        Assert.AreEqual(2403, codeLists.Count());
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
        Assert.AreEqual(false, codeListToTest.IsDefault);
        Assert.AreEqual("custom.chronostratigraphy_top_bedrock", codeListToTest.Schema);
        Assert.AreEqual("Mittlerer Jura undifferenziert", codeListToTest.De);
        Assert.AreEqual("Middle Jurassic undifferenciated", codeListToTest.En);
        Assert.AreEqual("Jurassique moyen indifférencié", codeListToTest.Fr);
        Assert.AreEqual("Giurassico medio indifferenziato", codeListToTest.It);
        Assert.AreEqual(142, codeListToTest.Order);
        Assert.AreEqual("jmu", codeListToTest.Code);
        Assert.AreEqual(new LTree("15001001.15001049.15001065.15001070.15001168"), codeListToTest.Path);
    }

    [TestMethod]
    public async Task EditCodelistWithMinimalCodelist()
    {
        var id = 1010;
        var originalCodeList = new Codelist
        {
            Id = id,
            Geolcode = id,
            Schema = "borehole_form",
            De = "Ansatzhöhe Z [müM]",
            Code = "elevation_z",
            En = "Elevation Z [masl]",
            Fr = "Altitude Z [MsM]",
            It = "altitudine (quota)",
            DescriptionEn = "",
            DescriptionDe = "",
            DescriptionFr = "",
            DescriptionIt = "",
            DescriptionRo = "",
            Order = 11,
            Conf = null,
            IsDefault = false,
        };

        var codeList = new Codelist
        {
            Id = id,
            De = "Neuer deutscher Text",
            Code = "elevation_z",
            En = "New english text",
            DescriptionEn = "",
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual("Ansatzhöhe Z [müM]", codeListToEdit.De);
        Assert.AreEqual("Elevation Z [masl]", codeListToEdit.En);
        Assert.AreEqual("elevation_z", codeListToEdit.Code);
        Assert.AreEqual("Altitude Z [MsM]", codeListToEdit.Fr);
        Assert.AreEqual("", codeListToEdit.DescriptionEn);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates
        var updatedContext = ContextFactory.CreateContext();
        var updatedCodelist = updatedContext.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("Neuer deutscher Text", updatedCodelist.De);
        Assert.AreEqual("New english text", updatedCodelist.En);
        Assert.AreEqual("elevation_z", updatedCodelist.Code);

        // Emtpy values are deleted
        Assert.AreEqual(null, updatedCodelist.Fr);
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
            IsDefault = false,
            DescriptionDe = "",
            DescriptionEn = "",
            DescriptionFr = "",
            DescriptionIt = "",
            DescriptionRo = null,
            Geolcode = 1020,
            Order = 21,
            Schema = "borehole_form",
            De = "Bohrgut",
            En = "Cuttings",
            Fr = "Matière forée ",
            It = "materiale perforato",
            Ro = null,
        };

        var codeList = new Codelist
        {
            Id = id,
            Code = "cuttings",
            Conf = null,
            IsDefault = true,
            DescriptionDe = "",
            DescriptionEn = "",
            DescriptionFr = "",
            DescriptionIt = "",
            DescriptionRo = null,
            Geolcode = 222,
            Order = 21,
            Schema = "schema_borehole_form",
            De = "Bohrgut",
            En = "Cuttings",
            Fr = "Matière forée ",
            It = "materiale perforato",
            Ro = null,
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual("cuttings", codeListToEdit.Code);
        Assert.AreEqual(null, codeListToEdit.Conf);
        Assert.AreEqual(false, codeListToEdit.IsDefault);
        Assert.AreEqual("", codeListToEdit.DescriptionEn);
        Assert.AreEqual("", codeListToEdit.DescriptionFr);
        Assert.AreEqual("", codeListToEdit.DescriptionIt);
        Assert.AreEqual("", codeListToEdit.DescriptionDe);
        Assert.AreEqual(null, codeListToEdit.DescriptionRo);
        Assert.AreEqual(1020, codeListToEdit.Geolcode);
        Assert.AreEqual(21, codeListToEdit.Order);
        Assert.AreEqual("borehole_form", codeListToEdit.Schema);
        Assert.AreEqual("Bohrgut", codeListToEdit.De);
        Assert.AreEqual("Cuttings", codeListToEdit.En);
        Assert.AreEqual("Matière forée ", codeListToEdit.Fr);
        Assert.AreEqual("materiale perforato", codeListToEdit.It);
        Assert.AreEqual(null, codeListToEdit.Ro);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        var okResult = response as OkObjectResult;
        Assert.AreEqual(200, okResult.StatusCode);

        // Assert Updates and unchanged values
        var updatedContext = ContextFactory.CreateContext();
        var updatedCodelist = updatedContext.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("cuttings", updatedCodelist.Code);
        Assert.AreEqual(null, updatedCodelist.Conf);
        Assert.AreEqual(true, updatedCodelist.IsDefault);
        Assert.AreEqual("", updatedCodelist.DescriptionEn);
        Assert.AreEqual("", updatedCodelist.DescriptionFr);
        Assert.AreEqual("", updatedCodelist.DescriptionIt);
        Assert.AreEqual("", updatedCodelist.DescriptionDe);
        Assert.AreEqual(null, updatedCodelist.DescriptionRo);
        Assert.AreEqual(222, updatedCodelist.Geolcode);
        Assert.AreEqual(21, updatedCodelist.Order);
        Assert.AreEqual("schema_borehole_form", updatedCodelist.Schema);
        Assert.AreEqual("Bohrgut", updatedCodelist.De);
        Assert.AreEqual("Cuttings", updatedCodelist.En);
        Assert.AreEqual("Matière forée ", updatedCodelist.Fr);
        Assert.AreEqual("materiale perforato", updatedCodelist.It);
        Assert.AreEqual(null, updatedCodelist.Ro);

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
            De = "",
            Code = "",
            En = "",
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
