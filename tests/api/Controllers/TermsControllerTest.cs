using BDMS.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using static BDMS.Helpers;

namespace BDMS.Controllers;

[TestClass]
public class TermsControllerTest
{
    private readonly Mock<ILogger<TermsController>> loggerMock = new();
    private BdmsContext context;
    private TermsController controller;

    [TestInitialize]
    public async Task TestInitialize()
    {
        context = ContextFactory.GetTestContext();
        controller = new TermsController(context, loggerMock.Object) { ControllerContext = GetControllerContextAdmin() };

        // Start from a known-empty state; the surrounding transaction is rolled back on cleanup.
        context.Terms.RemoveRange(context.Terms);
        await context.SaveChangesAsync();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    public async Task GetReturnsPublishedTerm()
    {
        await AddTermAsync(isDraft: true, expiration: null, textEn: "Draft");
        await AddTermAsync(isDraft: false, expiration: DateTime.UtcNow, textEn: "Expired");
        var published = await AddTermAsync(isDraft: false, expiration: null, textEn: "Published");
        var response = await controller.GetAsync();
        var term = ActionResultAssert.IsOkObjectResult<Term>(response.Result);
        Assert.AreEqual(published.Id, term.Id);
        Assert.AreEqual("Published", term.TextEn);
    }

    [TestMethod]
    public async Task GetReturnsNullWhenNoPublishedTerm()
    {
        await AddTermAsync(isDraft: true, expiration: null, textEn: "Only a draft");
        var response = await controller.GetAsync();
        ActionResultAssert.IsOk(response.Result);
        Assert.IsNull(((OkObjectResult)response.Result!).Value);
    }

    [TestMethod]
    public async Task GetDraftReturnsDraftWhenItExists()
    {
        await AddTermAsync(isDraft: false, expiration: null, textEn: "Published");
        var draft = await AddTermAsync(isDraft: true, expiration: null, textEn: "Draft");
        var response = await controller.GetDraftAsync();
        var term = ActionResultAssert.IsOkObjectResult<Term>(response.Result);
        Assert.AreEqual(draft.Id, term.Id);
        Assert.IsTrue(term.IsDraft);
    }

    [TestMethod]
    public async Task GetDraftFallsBackToPublishedWhenNoDraft()
    {
        var published = await AddTermAsync(isDraft: false, expiration: null, textEn: "Published");
        var response = await controller.GetDraftAsync();
        var term = ActionResultAssert.IsOkObjectResult<Term>(response.Result);
        Assert.AreEqual(published.Id, term.Id);
        Assert.IsFalse(term.IsDraft);
    }

    [TestMethod]
    public async Task GetDraftReturnsNullWhenNoTerms()
    {
        var response = await controller.GetDraftAsync();
        ActionResultAssert.IsOk(response.Result);
        Assert.IsNull(((OkObjectResult)response.Result!).Value);
    }

    [TestMethod]
    public async Task SaveDraftCreatesDraftWhenNoneExists()
    {
        var response = await controller.SaveDraftAsync(new Term { TextEn = "Hello", TextDe = "Hallo" });
        var term = ActionResultAssert.IsOkObjectResult<Term>(response);
        Assert.IsTrue(term.IsDraft);
        Assert.AreEqual("Hello", term.TextEn);
        Assert.AreEqual("Hallo", term.TextDe);
        Assert.AreEqual(1, await context.Terms.CountAsync(t => t.IsDraft));
    }

    [TestMethod]
    public async Task SaveDraftUpdatesExistingDraft()
    {
        var draft = await AddTermAsync(isDraft: true, expiration: null, textEn: "Old");
        var response = await controller.SaveDraftAsync(new Term { TextEn = "New", TextFr = "Nouveau" });
        var term = ActionResultAssert.IsOkObjectResult<Term>(response);
        Assert.AreEqual(draft.Id, term.Id);
        Assert.AreEqual("New", term.TextEn);
        Assert.AreEqual("Nouveau", term.TextFr);
        Assert.AreEqual(1, await context.Terms.CountAsync(t => t.IsDraft));
    }

    [TestMethod]
    public async Task SaveDraftOverwritesAllLanguagesUsingEmptyStrings()
    {
        await controller.SaveDraftAsync(
            new Term { TextEn = "English", TextDe = "Deutsch", TextFr = "Francais", TextIt = "Italiano", TextRo = "Rumantsch" });
        var response = await controller.SaveDraftAsync(new Term { TextEn = "Only English" });
        var term = ActionResultAssert.IsOkObjectResult<Term>(response);
        Assert.AreEqual("Only English", term.TextEn);
        Assert.AreEqual(string.Empty, term.TextDe, "Languages not provided are stored as an empty string.");
        Assert.AreEqual(string.Empty, term.TextFr);
        Assert.AreEqual(string.Empty, term.TextIt);
        Assert.AreEqual(string.Empty, term.TextRo);
        Assert.AreEqual(1, await context.Terms.CountAsync(t => t.IsDraft));
    }

    [TestMethod]
    public async Task SaveDraftWithoutEnglishCreatesDraftWithEmptyEnglish()
    {
        var response = await controller.SaveDraftAsync(new Term { TextIt = "Italiano" });
        var term = ActionResultAssert.IsOkObjectResult<Term>(response);
        Assert.IsTrue(term.IsDraft);
        Assert.AreEqual("Italiano", term.TextIt);
        Assert.AreEqual(string.Empty, term.TextEn, "English defaults to an empty string to satisfy the NOT NULL column.");
    }

    [TestMethod]
    public async Task PublishExpiresPreviousAndPromotesDraft()
    {
        var previouslyPublished = await AddTermAsync(isDraft: false, expiration: null, textEn: "Old published");
        var draft = await AddTermAsync(isDraft: true, expiration: null, textEn: "New draft");

        var response = await controller.PublishAsync();
        var published = ActionResultAssert.IsOkObjectResult<Term>(response);
        Assert.AreEqual(draft.Id, published.Id);
        Assert.IsFalse(published.IsDraft);

        var expired = await context.Terms.AsNoTracking().SingleAsync(t => t.Id == previouslyPublished.Id);
        Assert.IsNotNull(expired.Expiration, "The previously published term should be expired.");
        Assert.AreEqual(1, await context.Terms.CountAsync(t => !t.IsDraft && t.Expiration == null));
        Assert.AreEqual(0, await context.Terms.CountAsync(t => t.IsDraft));
    }

    [TestMethod]
    public async Task PublishWithoutDraftReturnsBadRequest()
    {
        await AddTermAsync(isDraft: false, expiration: null, textEn: "Published");
        var response = await controller.PublishAsync();
        ActionResultAssert.IsBadRequest(response);
    }

    private async Task<Term> AddTermAsync(bool isDraft, DateTime? expiration, string textEn)
    {
        var term = new Term
        {
            IsDraft = isDraft,
            Expiration = expiration,
            Creation = DateTime.UtcNow,
            TextEn = textEn,
        };

        await context.Terms.AddAsync(term);
        await context.SaveChangesAsync();
        return term;
    }
}
