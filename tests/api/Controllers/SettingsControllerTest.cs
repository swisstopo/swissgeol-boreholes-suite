using BDMS.Controllers;
using BDMS.Uploads.S3;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS.Controllers;

[TestClass]
public class SettingsControllerTest
{
    private SettingsController controller;

    [TestInitialize]
    public void TestInitialize()
    {
        var inMemorySettings = new Dictionary<string, string>
        {
            ["GoogleAnalytics:TrackingId"] = "CANNONCANDID",
            ["Auth:Authority"] = "CLASSICMOSES",
            ["Auth:Audience"] = "PAINTEDFOCUS",
            ["Auth:Scopes"] = "SCREAMING-XI",
            ["Auth:AnonymousModeEnabled"] = "true",
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        controller = new SettingsController(configuration);
    }

    [TestMethod]
    public void Get()
    {
        var result = controller.Get();

        Assert.IsNotNull(result);
        Assert.AreEqual("CANNONCANDID", result.GoogleAnalyticsTrackingId);
        Assert.AreEqual("CLASSICMOSES", result.AuthSettings.Authority);
        Assert.AreEqual("PAINTEDFOCUS", result.AuthSettings.Audience);
        Assert.AreEqual("SCREAMING-XI", result.AuthSettings.Scopes);
        Assert.AreEqual(true, result.AuthSettings.AnonymousModeEnabled);
    }

    /// <summary>
    /// The client validates and chunks against these values instead of keeping its own, so they are
    /// pinned here: changing one is a change to what every client is allowed to send.
    /// </summary>
    [TestMethod]
    public void GetReportsTheLimitsTheEndpointsEnforce()
    {
        var result = controller.Get();

        Assert.IsNotNull(result);
        Assert.AreEqual(210_000_000, result.UploadSettings.MaxFileSize);
        Assert.AreEqual(5_000_000_000L, result.UploadSettings.LargeMaxFileSize);
        Assert.AreEqual(6 * 1024 * 1024, result.UploadSettings.ChunkSize);
    }

    /// <summary>
    /// The reported limits are only useful if they are the ones the endpoints actually refuse
    /// uploads by, so they are compared against the constants those endpoints are written with.
    /// </summary>
    [TestMethod]
    public void GetReportsTheSameLimitsTheUploadEndpointsUse()
    {
        var result = controller.Get();

        Assert.IsNotNull(result);
        Assert.AreEqual(PhotoController.MaxFileSize, result.UploadSettings.MaxFileSize);
        Assert.AreEqual(S3TusStore.ChunkSize, result.UploadSettings.ChunkSize);
        Assert.IsTrue(
            result.UploadSettings.ChunkSize < S3TusStore.PartSize,
            "A chunk has to stay below the part size, otherwise a request contributes more than the one part it is cut into.");
    }
}
