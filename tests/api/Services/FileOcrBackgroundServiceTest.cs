using BDMS.Models;

namespace BDMS.Services;

[TestClass]
public class FileOcrBackgroundServiceTest
{
    private BdmsContext context = null!;

    [TestInitialize]
    public void TestInitialize() => context = ContextFactory.GetTestContext();

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    /// <summary>
    /// A row with no object is never handed to OCR. The catch-up selects on status alone, so a row
    /// that reached an eligible status too early would be sent to the OCR service with no file to
    /// name, and the user's document would be marked failed before it had even been uploaded.
    /// </summary>
    [TestMethod]
    public async Task AProfileWithoutAnObjectIsNotPendingOcr()
    {
        var boreholeId = context.Boreholes.Min(b => b.Id);
        var awaiting = new Profile
        {
            BoreholeId = boreholeId,
            Name = "awaited.pdf",
            NameUuid = null,
            Type = "application/pdf",

            // Deliberately the value that would be selected, so the guard is what excludes it.
            OcrStatus = OcrStatus.Created,
        };

        // A row that differs from the one above only in having an object, so a query that returns
        // nothing at all cannot pass this test.
        var stored = new Profile
        {
            BoreholeId = boreholeId,
            Name = "stored.pdf",
            NameUuid = $"{Guid.NewGuid()}.pdf",
            Type = "application/pdf",
            OcrStatus = OcrStatus.Created,
        };

        context.Profiles.AddRange(awaiting, stored);
        await context.SaveChangesAsync();

        var pending = await FileOcrBackgroundService.PendingProfileIdsAsync(context, CancellationToken.None);

        Assert.IsTrue(pending.Contains(stored.Id), "A row with an object and an eligible status is waiting for OCR.");
        Assert.IsFalse(pending.Contains(awaiting.Id), "A row with no object is not waiting for OCR, whatever its status says.");
    }

    /// <summary>
    /// A profile that has run to a terminal status is left alone, so a restart does not OCR the
    /// whole archive again.
    /// </summary>
    [TestMethod]
    public async Task AProfileInATerminalStatusIsNotPendingOcr()
    {
        var boreholeId = context.Boreholes.Min(b => b.Id);
        var finished = new Profile
        {
            BoreholeId = boreholeId,
            Name = "finished.pdf",
            NameUuid = $"{Guid.NewGuid()}.pdf",
            Type = "application/pdf",
            OcrStatus = OcrStatus.Success,
        };

        var interrupted = new Profile
        {
            BoreholeId = boreholeId,
            Name = "interrupted.pdf",
            NameUuid = $"{Guid.NewGuid()}.pdf",
            Type = "application/pdf",
            OcrStatus = OcrStatus.Processing,
        };

        context.Profiles.AddRange(finished, interrupted);
        await context.SaveChangesAsync();

        var pending = await FileOcrBackgroundService.PendingProfileIdsAsync(context, CancellationToken.None);

        Assert.IsTrue(pending.Contains(interrupted.Id), "A run a previous process left mid-flight is picked up again.");
        Assert.IsFalse(pending.Contains(finished.Id), "A finished run is not repeated.");
    }
}
