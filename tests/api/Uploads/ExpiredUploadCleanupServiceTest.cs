using Amazon.S3;
using Amazon.S3.Model;
using BDMS.Uploads.S3;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace BDMS.Uploads;

/// <summary>
/// How the sweep of abandoned uploads copes with a store that fails, which nothing a user does
/// ever shows: a sweep that stops removes nothing from then on, and says so nowhere.
/// </summary>
[TestClass]
public class ExpiredUploadCleanupServiceTest
{
    /// <summary>
    /// A store whose cloud storage fails with <paramref name="failure"/> the moment it is asked what
    /// it holds, which is the first thing a sweep asks of it.
    /// </summary>
    private static (S3TusStore Store, Mock<IS3PaginatorFactory> Listing) StoreFailingWith(Exception failure)
    {
        var listing = new Mock<IS3PaginatorFactory>();
        listing.Setup(p => p.ListObjectsV2(It.IsAny<ListObjectsV2Request>())).Throws(failure);

        var storage = new Mock<IAmazonS3>();
        storage.Setup(s => s.Paginators).Returns(listing.Object);

        return (new S3TusStore(NullLoggerFactory.Instance, storage.Object, S3TusStore.CreateConfiguration("uploads")), listing);
    }

    private static void VerifyAsked(Mock<IS3PaginatorFactory> listing, Times times, string failMessage) =>
        listing.Verify(p => p.ListObjectsV2(It.IsAny<ListObjectsV2Request>()), times, failMessage);

    /// <summary>
    /// A storage client that gives up on a request throws the exception a shutdown does. Taken for
    /// one, it would stop the sweep for as long as the application runs, so a sweep nobody asked to
    /// stop goes on to the next store instead.
    /// </summary>
    [TestMethod]
    public async Task ASweepGoesOnPastAStoreWhoseStorageGaveUp()
    {
        var (givingUp, givingUpListing) = StoreFailingWith(new TaskCanceledException("The request timed out."));
        var (next, nextListing) = StoreFailingWith(new AmazonS3Exception("The bucket cannot be listed."));
        var sweep = new ExpiredUploadCleanupService(NullLogger<ExpiredUploadCleanupService>.Instance, [givingUp, next]);

        await sweep.SweepAsync(CancellationToken.None);

        VerifyAsked(givingUpListing, Times.Once(), "The store was never asked what it holds, so its failure says nothing.");
        VerifyAsked(nextListing, Times.Once(), "The store after the one whose storage gave up was never swept.");
    }

    [TestMethod]
    public async Task ASweepGoesOnPastAStoreThatFails()
    {
        var (failing, failingListing) = StoreFailingWith(new AmazonS3Exception("The bucket cannot be listed."));
        var (next, nextListing) = StoreFailingWith(new AmazonS3Exception("The bucket cannot be listed."));
        var sweep = new ExpiredUploadCleanupService(NullLogger<ExpiredUploadCleanupService>.Instance, [failing, next]);

        await sweep.SweepAsync(CancellationToken.None);

        VerifyAsked(failingListing, Times.Once(), "The store was never asked what it holds, so its failure says nothing.");
        VerifyAsked(nextListing, Times.Once(), "The store after the one that failed was never swept.");
    }

    [TestMethod]
    public async Task ASweepStopsWhenTheHostShutsDown()
    {
        using var shutdown = new CancellationTokenSource();
        await shutdown.CancelAsync();

        var (stopping, stoppingListing) = StoreFailingWith(new OperationCanceledException(shutdown.Token));
        var (next, nextListing) = StoreFailingWith(new AmazonS3Exception("The bucket cannot be listed."));
        var sweep = new ExpiredUploadCleanupService(NullLogger<ExpiredUploadCleanupService>.Instance, [stopping, next]);

        await Assert.ThrowsExactlyAsync<OperationCanceledException>(async () => await sweep.SweepAsync(shutdown.Token));

        VerifyAsked(stoppingListing, Times.Once(), "The store was never asked what it holds, so the shutdown says nothing.");
        VerifyAsked(nextListing, Times.Never(), "The sweep went on after the host asked it to stop.");
    }
}
