using BDMS.Controllers;
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
}
