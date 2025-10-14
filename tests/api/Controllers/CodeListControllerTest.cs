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
        Assert.AreEqual(5696, codeLists.Count());
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
        var codeListToTest = codeLists.Single(c => c.Id == 100_002_860);
        Assert.AreEqual(100_002_860, codeListToTest.Id);
        Assert.AreEqual(15001005, codeListToTest.Geolcode);
        Assert.AreEqual("{\"color\":[255,239,175]}", codeListToTest.Conf);
        Assert.AreEqual(false, codeListToTest.IsDefault);
        Assert.AreEqual("chronostratigraphy", codeListToTest.Schema);
        Assert.AreEqual("Pleistozän", codeListToTest.De);
        Assert.AreEqual("Pleistocene", codeListToTest.En);
        Assert.AreEqual("Pléistocène", codeListToTest.Fr);
        Assert.AreEqual("Pleistocene", codeListToTest.It);
        Assert.AreEqual(50, codeListToTest.Order);
        Assert.AreEqual("", codeListToTest.Code);
        Assert.AreEqual(new LTree("15001001.15001002.15001003.15001005"), codeListToTest.Path);
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
        var id = 9004;
        var originalCodeList = new Codelist
        {
            Id = id,
            Code = "5",
            Conf = null,
            Geolcode = 9004,
            Order = 5,
            Schema = "description_quality",
            De = "sehr gut",
            En = "very good",
            Fr = "très bonne",
            It = "molto buono",
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
        Assert.AreEqual("5", codeListToEdit.Code);
        Assert.AreEqual(null, codeListToEdit.Conf);
        Assert.AreEqual(9004, codeListToEdit.Geolcode);
        Assert.AreEqual(5, codeListToEdit.Order);
        Assert.AreEqual("description_quality", codeListToEdit.Schema);
        Assert.AreEqual("sehr gut", codeListToEdit.De);
        Assert.AreEqual("very good", codeListToEdit.En);
        Assert.AreEqual("très bonne", codeListToEdit.Fr);
        Assert.AreEqual("molto buono", codeListToEdit.It);
        Assert.AreEqual(null, codeListToEdit.Ro);

        // Upate CodeList
        var response = await controller.EditAsync(codeList);
        ActionResultAssert.IsOk(response);

        // Assert Updates and unchanged values
        var updatedCodelist = context.Codelists.Single(c => c.Id == id);

        Assert.AreEqual("5", updatedCodelist.Code);
        Assert.AreEqual(null, updatedCodelist.Conf);
        Assert.AreEqual(9004, updatedCodelist.Geolcode);
        Assert.AreEqual(5, updatedCodelist.Order);
        Assert.AreEqual("new_schema_name", updatedCodelist.Schema);
        Assert.AreEqual("sehr gut", updatedCodelist.De);
        Assert.AreEqual("very good", updatedCodelist.En);
        Assert.AreEqual("très bonne", updatedCodelist.Fr);
        Assert.AreEqual("molto buono", updatedCodelist.It);
        Assert.AreEqual(null, updatedCodelist.Ro);
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
        Assert.AreEqual(5698, response.Content.Split('\n').Length);
    }
}
