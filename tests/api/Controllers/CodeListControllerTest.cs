using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace BDMS.Controllers;

[TestClass]
public class CodeListControllerTest
{
    private BdmsContext context;
    private CodeListController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        var configurationMock = new Mock<IConfiguration>();
        configurationMock
            .Setup(c => c.GetSection("ConnectionStrings")["BdmsContext"])
            .Returns(ContextFactory.ConnectionString);
        controller = new CodeListController(context, configurationMock.Object, new Mock<ILogger<CodeListController>>().Object);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var codeLists = await controller.GetAsync();
        Assert.AreEqual(3396, codeLists.Count());
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
        var codeLists = await controller.GetAsync("chronostratigraphy");
        Assert.AreEqual(140, codeLists.Count());
        var codeListToTest = codeLists.Single(c => c.Id == 15001070);
        Assert.AreEqual(15001070, codeListToTest.Id);
        Assert.AreEqual(15001070, codeListToTest.Geolcode);
        Assert.AreEqual("{\"color\":[128,207,216]}", codeListToTest.Conf);
        Assert.AreEqual(false, codeListToTest.IsDefault);
        Assert.AreEqual("chronostratigraphy", codeListToTest.Schema);
        Assert.AreEqual("Mittlerer Jura", codeListToTest.De);
        Assert.AreEqual("Middle Jurassic", codeListToTest.En);
        Assert.AreEqual("Jurassique moyen", codeListToTest.Fr);
        Assert.AreEqual("Giurassico Medio", codeListToTest.It);
        Assert.AreEqual(700, codeListToTest.Order);
        Assert.AreEqual("", codeListToTest.Code);
        Assert.AreEqual(new LTree("15001001.15001049.15001065.15001070"), codeListToTest.Path);
    }

    [TestMethod]
    public async Task GetHydrotestCodesByTestKind()
    {
        var codeListsInfiltrationEssay = await controller.GetAsync("", new int[] { 15203179 });
        Assert.AreEqual(6, codeListsInfiltrationEssay.Count());
        Assert.IsTrue(codeListsInfiltrationEssay.All(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema
                                                       || c.Schema == HydrogeologySchemas.EvaluationMethodSchema
                                                       || c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema));

        var codeListsPumpEssay = await controller.GetAsync("", new int[] { 15203170 });
        Assert.AreEqual(13, codeListsPumpEssay.Count());
        Assert.IsTrue(codeListsPumpEssay.All(c => c.Schema == HydrogeologySchemas.FlowdirectionSchema
                                                || c.Schema == HydrogeologySchemas.EvaluationMethodSchema
                                                || c.Schema == HydrogeologySchemas.HydrotestResultParameterSchema));
    }

    [TestMethod]
    public async Task GetHydrotestCodesByInexistantTestKind()
    {
        var codeListsInfiltrationEssay = await controller.GetAsync("", new int[] { 6715779 });
        Assert.AreEqual(0, codeListsInfiltrationEssay.Count());
    }

    [TestMethod]
    public async Task EditCodelistWithMinimalCodelist()
    {
        var id = 9104;
        var originalCodeList = new Codelist
        {
            Id = id,
            Geolcode = id,
            Schema = "component_uncon_debris",
            De = "Tuff",
            En = "tufa",
            Fr = "tuf",
            It = "tufo",
            Order = 5,
            Conf = null,
            IsDefault = false,
        };

        var codeList = new Codelist
        {
            Id = id,
            De = "Neuer deutscher Text",
            Code = "elevation_z",
            En = "New english text",
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual("Tuff", codeListToEdit.De);
        Assert.AreEqual("tufa", codeListToEdit.En);
        Assert.AreEqual("tuf", codeListToEdit.Fr);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        ActionResultAssert.IsOk(response);

        // Assert Updates
        var updatedCodelist = context.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("Neuer deutscher Text", updatedCodelist.De);
        Assert.AreEqual("New english text", updatedCodelist.En);
        Assert.AreEqual("elevation_z", updatedCodelist.Code);

        // Emtpy values are deleted
        Assert.AreEqual(null, updatedCodelist.Fr);
    }

    [TestMethod]
    public async Task EditCodelistWithCompleteCodelist()
    {
        var id = 100000172;
        var originalCodeList = new Codelist
        {
            Id = id,
            Code = "",
            Conf = null,
            Geolcode = null,
            Order = 10,
            Schema = "alteration_degree",
            De = "frisch",
            En = "fresh",
            Fr = "sain",
            It = "fresco",
            Ro = null,
        };

        var codeList = new Codelist
        {
            Id = id,
            Code = "5",
            Conf = null,
            Geolcode = 9004,
            Order = 5,
            Schema = "new_schema_name",
            De = "sehr gut",
            En = "very good",
            Fr = "très bonne",
            It = "molto buono",
            Ro = null,
        };

        var codeListToEdit = context.Codelists.Single(c => c.Id == id);
        Assert.AreEqual(originalCodeList.Code, codeListToEdit.Code);
        Assert.AreEqual(originalCodeList.Conf, codeListToEdit.Conf);
        Assert.AreEqual(originalCodeList.Geolcode, codeListToEdit.Geolcode);
        Assert.AreEqual(originalCodeList.Order, codeListToEdit.Order);
        Assert.AreEqual(originalCodeList.Schema, codeListToEdit.Schema);
        Assert.AreEqual(originalCodeList.De, codeListToEdit.De);
        Assert.AreEqual(originalCodeList.En, codeListToEdit.En);
        Assert.AreEqual(originalCodeList.Fr, codeListToEdit.Fr);
        Assert.AreEqual(originalCodeList.It, codeListToEdit.It);
        Assert.AreEqual(originalCodeList.Ro, codeListToEdit.Ro);

        // Update CodeList
        var response = await controller.EditAsync(codeList);
        ActionResultAssert.IsOk(response);

        // Assert Updates and unchanged values
        var updatedCodelist = context.Codelists.Single(c => c.Id == id);

        Assert.AreEqual(codeList.Code, updatedCodelist.Code);
        Assert.AreEqual(codeList.Conf, updatedCodelist.Conf);
        Assert.AreEqual(codeList.Geolcode, updatedCodelist.Geolcode);
        Assert.AreEqual(codeList.Order, updatedCodelist.Order);
        Assert.AreEqual(codeList.Schema, updatedCodelist.Schema);
        Assert.AreEqual(codeList.De, updatedCodelist.De);
        Assert.AreEqual(codeList.En, updatedCodelist.En);
        Assert.AreEqual(codeList.Fr, updatedCodelist.Fr);
        Assert.AreEqual(codeList.It, updatedCodelist.It);
        Assert.AreEqual(codeList.Ro, updatedCodelist.Ro);
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
        };

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        ActionResultAssert.IsNotFound(response);
    }

    [TestMethod]
    public async Task EditWithoutCodelistReturnsBadRequest()
    {
        var response = await controller.EditAsync(null);
        ActionResultAssert.IsBadRequest(response);
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

        var expectedHeader = "id_cli,schema_cli,code_cli,text_cli_en,text_cli_de,text_cli_fr,text_cli_it,text_cli_ro";

        Assert.AreEqual(expectedHeader, response.Content.Split('\n')[0]);
        Assert.AreEqual(3398, response.Content.Split('\n').Length);
    }
}
