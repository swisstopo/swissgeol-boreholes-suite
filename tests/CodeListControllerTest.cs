using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        var configurationMock = new Mock<IConfiguration>();
        configurationMock
            .Setup(c => c.GetSection("ConnectionStrings")["BdmsContext"])
            .Returns(ContextFactory.ConnectionString);
        controller = new CodeListController(ContextFactory.CreateContext(), configurationMock.Object, new Mock<ILogger<CodeListController>>().Object);
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
        Assert.AreEqual(2472, codeLists.Count());
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
        Assert.AreEqual(137, codeLists.Count());
        var codeListToTest = codeLists.Single(c => c.Id == 15001070);
        Assert.AreEqual(15001070, codeListToTest.Id);
        Assert.AreEqual(15001070, codeListToTest.Geolcode);
        Assert.AreEqual("{\"color\":[128,207,216]}", codeListToTest.Conf);
        Assert.AreEqual(false, codeListToTest.IsDefault);
        Assert.AreEqual("custom.chronostratigraphy_top_bedrock", codeListToTest.Schema);
        Assert.AreEqual("Mittlerer Jura", codeListToTest.De);
        Assert.AreEqual("Middle Jurassic", codeListToTest.En);
        Assert.AreEqual("Jurassique moyen", codeListToTest.Fr);
        Assert.AreEqual("Giurassico Medio", codeListToTest.It);
        Assert.AreEqual(700, codeListToTest.Order);
        Assert.AreEqual("jm", codeListToTest.Code);
        Assert.AreEqual(new LTree("15001001.15001049.15001065.15001070"), codeListToTest.Path);
    }

    [TestMethod]
    public async Task GetHydrotestCodesByTestKind()
    {
        var codeListsInfiltrationEssay = await controller.GetAsync("", "15203179");
        Assert.AreEqual(6, codeListsInfiltrationEssay.Count());
        Assert.IsTrue(codeListsInfiltrationEssay.All(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema
                                                       || c.Schema == HydrogeologySchemas.EvaluationMethodSchema
                                                       || c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema));

        var codeListsPumpEssay = await controller.GetAsync("", "15203170");
        Assert.AreEqual(13, codeListsPumpEssay.Count());
        Assert.IsTrue(codeListsPumpEssay.All(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema
                                                || c.Schema == HydrogeologySchemas.EvaluationMethodSchema
                                                || c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema));
    }

    [TestMethod]
    public async Task GetHydrotestCodesByInexistantTestKind()
    {
        var codeListsInfiltrationEssay = await controller.GetAsync("", "6715779");
        Assert.AreEqual(0, codeListsInfiltrationEssay.Count());
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

    [TestMethod]
    public async Task GetCsvExport()
    {
        var httpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext = httpContext;

        var response = await controller.DownloadCsvAsync(CancellationToken.None).ConfigureAwait(false);
        Assert.IsInstanceOfType(response, typeof(ContentResult));

        Assert.AreEqual("text/csv; charset=utf-8", response.ContentType);
        Assert.AreEqual("attachment; filename=codelist_export.csv", httpContext.Response.Headers["Content-Disposition"].ToString());

        var expectedHeader = "id_cli,schema_cli,code_cli,text_cli_en,description_cli_en,text_cli_de,description_cli_de,text_cli_fr,description_cli_fr,text_cli_it,description_cli_it,text_cli_ro,description_cli_ro";

        Assert.AreEqual(expectedHeader, response.Content.Split('\n')[0]);
        Assert.AreEqual(2474, response.Content.Split('\n').Length);
    }
}
