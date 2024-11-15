using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Synchronizes users from the source database to the target database.
/// </summary>
/// <remarks>
/// IMPORTANT! This class does not yet implement the actual behavior. It only
/// contains sample code to verify the testing and integration concepts.
/// </remarks>
public class SynchronizeUsers(ISyncContext syncContext, ILogger<SynchronizeUsers> logger) : SyncTask(syncContext, logger)
{
    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        var sourceUsers = await Source.Users.ToListAsync(cancellationToken).ConfigureAwait(false);
        var targetUsers = await Target.Users.ToListAsync(cancellationToken).ConfigureAwait(false);

        var usersToInsert = sourceUsers
            .Where(sourceUser => targetUsers.All(targetUser => targetUser.Id != sourceUser.Id))
            .ToList();

        Target.Users.AddRange(usersToInsert);

        await Target.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken)
    {
        // Ensure that the number of users in the source and target databases is the same
        var sourceUserCount = await Source.Users.CountAsync(cancellationToken).ConfigureAwait(false);
        var targetUserCount = await Target.Users.CountAsync(cancellationToken).ConfigureAwait(false);

        if (sourceUserCount != targetUserCount)
        {
            throw new InvalidOperationException(
                $"The number of users in the source and target databases is different\n" +
                $"Source: {sourceUserCount}, Target: {targetUserCount}");
        }
    }
}
