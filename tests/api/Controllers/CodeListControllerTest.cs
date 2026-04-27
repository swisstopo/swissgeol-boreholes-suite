using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        controller = new CodeListController(context, configurationMock.Object);
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetAllEntriesAsync()
    {
        var codeLists = await controller.GetAsync();
        Assert.AreEqual(3477, codeLists.Count());
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
        Assert.AreEqual(3479, response.Content.Split('\n').Length);
    }
}
