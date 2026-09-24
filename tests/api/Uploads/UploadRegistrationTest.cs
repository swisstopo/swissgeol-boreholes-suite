using BDMS.Uploads.S3;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BDMS.Uploads;

/// <summary>
/// What the application is wired with, which nothing else shows: a store resolved under a key
/// nobody registered fails at the moment a user uploads, and a store nobody sweeps fails nowhere
/// at all.
/// </summary>
[TestClass]
public class UploadRegistrationTest
{
    private static BdmsWebApplicationFactory factory;

    [ClassInitialize]
    public static void ClassInitialize(TestContext testContext) => factory = new BdmsWebApplicationFactory();

    [ClassCleanup(ClassCleanupBehavior.EndOfClass)]
    public static void ClassCleanup() => factory?.Dispose();

    /// <summary>
    /// Each bucket gets a store of its own, holding the bucket the feature resolving it stores in.
    /// One store serving two buckets would write a profile into the log file bucket, which nothing
    /// downstream would notice until the download failed.
    /// </summary>
    [TestMethod]
    public void EveryBucketHasItsOwnStore()
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Development.json").Build();

        var logFiles = factory.Services.GetRequiredKeyedService<S3TusStore>(UploadBuckets.LogFiles);
        var profiles = factory.Services.GetRequiredKeyedService<S3TusStore>(UploadBuckets.Profiles);

        Assert.AreNotSame(logFiles, profiles);
        Assert.AreEqual(configuration["S3:LOGFILES_BUCKET_NAME"].ToLowerInvariant(), logFiles.BucketName);
        Assert.AreEqual(configuration["S3:BUCKET_NAME"].ToLowerInvariant(), profiles.BucketName);
    }

    /// <summary>
    /// A bucket nobody configured stops the application as it starts, and says which setting is
    /// missing. A store built around a name that is not there fails at the first upload instead,
    /// with a message naming neither the setting nor the bucket, which leaves the operator who is
    /// the only one who can supply it with nothing to go on.
    /// </summary>
    [TestMethod]
    public void AMissingBucketNamesTheSettingThatIsMissing()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["S3:LOGFILES_BUCKET_NAME"] = "logfiles" })
            .Build();

        var exception = Assert.ThrowsExactly<InvalidOperationException>(
            () => new ServiceCollection().AddResumableUploads(configuration));

        StringAssert.Contains(exception.Message, "S3:BUCKET_NAME");
    }

    /// <summary>
    /// The sweep reaches every store. One it does not know about keeps the parts of the uploads
    /// that were abandoned in it for as long as the application runs, and is billed for them.
    /// </summary>
    [TestMethod]
    public void TheSweepIsGivenEveryStore()
    {
        var stores = factory.Services.GetKeyedServices<S3TusStore>(KeyedService.AnyKey).ToList();
        var sweeper = factory.Services.GetServices<IHostedService>().OfType<ExpiredUploadCleanupService>().Single();

        Assert.IsTrue(stores.Count > 1, "There is only one store, so this says nothing about a sweep of several.");
        Assert.AreEqual(stores.Count, sweeper.StoreCount);
    }
}
