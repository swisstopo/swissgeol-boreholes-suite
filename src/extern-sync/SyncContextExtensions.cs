using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Collections;
using System.Data;
using System.Data.Common;
using System.Globalization;
using System.Reflection;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> extension methods.
/// </summary>
public static class SyncContextExtensions
{
    /// <summary>
    /// Gets and opens the <see cref="NpgsqlConnection"/> for the specified <paramref name="context"/>.
    /// </summary>
    internal static async Task<NpgsqlConnection> GetAndOpenDbConnectionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var dbConnection = (NpgsqlConnection)context.Database.GetDbConnection();
        if (dbConnection.State != ConnectionState.Open)
        {
            await dbConnection.OpenAsync(cancellationToken).ConfigureAwait(false);
        }

        return dbConnection;
    }

    /// <summary>
    /// Gets the database schema version for the specified <paramref name="context"/>.
    /// </summary>
    internal static async Task<string?> GetDbSchemaVersionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var migrations = await context.Database.GetAppliedMigrationsAsync(cancellationToken).ConfigureAwait(false);
        return migrations.LastOrDefault();
    }

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>.
    /// </summary>
    internal static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, BdmsContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>.
    /// </summary>
    internal static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(connectionString, BdmsContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Filters the given <paramref name="boreholes"/> and returns only those with publication status published.
    /// </summary>
    internal static IEnumerable<Borehole> WithPublicationStatusPublished(this IEnumerable<Borehole> boreholes)
    {
        foreach (var borehole in boreholes.Where(b => b.IsPublicationStatusPublished()))
        {
            yield return borehole;
        }
    }

    /// <summary>
    /// Checks whether the given <paramref name="borehole"/> is in publication status published.
    /// </summary>
    /// <remarks>
    /// A <see cref="Borehole"/> is in publication status published if the most recent <see cref="Workflow"/> (the one
    /// with the highest <see cref="Workflow.Id"/>) is in <see cref="Role.Publisher"/> and both <see cref="Workflow.Started"/>
    /// and <see cref="Workflow.Finished"/> are not <c>Null</c>.
    /// </remarks>
    internal static bool IsPublicationStatusPublished(this Borehole borehole)
    {
        var latestWorkflowEntry = borehole.Workflows.OrderByDescending(b => b.Id).FirstOrDefault();

        return latestWorkflowEntry?.Role == Role.Publisher &&
            latestWorkflowEntry.Started.HasValue &&
            latestWorkflowEntry.Finished.HasValue;
    }

    /// <summary>
    /// Removes duplicated <see cref="Borehole"/>s from <paramref name="boreholes"/> which already exists in
    /// <paramref name="existingBoreholes"/>. To determine if a <see cref="Borehole"/> is duplicated, the coordinates
    /// and depth get checked against <see cref="BoreholeExtensions.IsWithinPredefinedTolerance(Borehole, IEnumerable{Borehole})"/>.
    /// </summary>
    internal static IEnumerable<Borehole> RemoveDuplicates(this IEnumerable<Borehole> boreholes, IList<Borehole> existingBoreholes)
    {
        foreach (var borehole in boreholes.Where(b => !b.IsWithinPredefinedTolerance(existingBoreholes)))
        {
            yield return borehole;
        }
    }

    /// <summary>
    /// Recursively marks the given <paramref name="items"/> and all their dependencies as new.
    /// </summary>
    internal static void MarkAsNew(this IEnumerable<IIdentifyable> items)
    {
        foreach (var item in items)
        {
            item.ProcessRecursive(identifyable => identifyable.Id = 0, []);
        }
    }

    /// <summary>
    /// Recursively traverses the given <paramref name="item"/> and all its properties and
    /// collections of type <typeparamref name="T"/> and executes <paramref name="action"/> on every object.
    /// </summary>
    /// <typeparam name="T">The type which should be traversed recursively.</typeparam>
    /// <param name="item">The item to be processed recursively.</param>
    /// <param name="action">The action to be executed on every <typeparamref name="T"/> object.</param>
    /// <param name="visited">An empty <see cref="HashSet{T}"/> which is used to track the visited items
    /// in order to avoid infinite loops.</param>
    /// <returns>The updated <paramref name="item"/>.</returns>
    internal static T ProcessRecursive<T>(this T item, Action<T> action, HashSet<T> visited)
        where T : class
    {
        if (item == null || visited.Contains(item)) return item!;

        visited.Add(item);

        action(item);

        foreach (var property in item.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!property.CanRead) continue;

            var propertyValue = property.GetValue(item);
            if (propertyValue == null) continue;

            if (property.PropertyType.GetInterfaces().Contains(typeof(T)))
            {
                // If property itself implements T
                ProcessRecursive((T)propertyValue, action, visited);
            }
            else if (typeof(IEnumerable).IsAssignableFrom(property.PropertyType))
            {
                foreach (var collectionItem in ((IEnumerable)propertyValue).OfType<T>())
                {
                    // If the property is an IEnumerable of T objects
                    ProcessRecursive(collectionItem, action, visited);
                }
            }
        }

        return item;
    }

    /// <summary>
    /// Sets the publication status for this <paramref name="borehole"/> to 'published'.
    /// </summary>
    /// <remarks>
    /// Please note that all previous <see cref="Workflow"/> entries/ the entire history gets cleared!
    /// This may not be the desired behavior for every use case but fits the requirements when syncing
    /// <see cref="Borehole"/>s from a context to another in this project.
    /// </remarks>
    /// <param name="borehole">The <see cref="Borehole"/> to set the publication status 'published' on.</param>
    /// <returns>The updated <see cref="Borehole"/>.</returns>
    internal static Borehole SetBoreholePublicationStatusPublished(this Borehole borehole)
    {
        // Remove all previous workflow entries/history.
        borehole.Workflows.Clear();

        for (int i = 1; i <= (int)Role.Publisher; i++)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)i,
                Started = DateTime.Now.ToUniversalTime(),
                Finished = DateTime.Now.ToUniversalTime(),
            });
        }

        return borehole;
    }

    /// <summary>
    /// Recursively updates <see cref="IChangeTracking"/> information for all the given
    /// <paramref name="items"/> with the specified <paramref name="user"/>.
    /// </summary>
    internal static void UpdateChangeTracking(this IEnumerable<IChangeTracking> items, User user)
    {
        foreach (var item in items)
        {
            item.ProcessRecursive(i => i.UpdateChangeTracking(user), []);
        }
    }

    /// <summary>
    /// Updates <see cref="IChangeTracking"/> information for the given
    /// <paramref name="item"/> with the specified <paramref name="user"/>.
    /// </summary>
    internal static void UpdateChangeTracking(this IChangeTracking item, User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        item.Created = DateTime.Now.ToUniversalTime();
        item.CreatedBy = null;
        item.CreatedById = user.Id;
        item.Updated = DateTime.Now.ToUniversalTime();
        item.UpdatedBy = null;
        item.UpdatedById = user.Id;
    }

    /// <summary>
    /// Clears all the backreferences (circular references) from the given <paramref name="boreholes"/>
    /// which may lead to unexpected results when copying a <see cref="Borehole"/> from one
    /// <see cref="BdmsContext"/> to another.
    /// </summary>
    internal static IEnumerable<Borehole> ClearNavigationProperties(this IEnumerable<Borehole> boreholes)
    {
        foreach (var borehole in boreholes)
        {
            yield return borehole.ClearNavigationProperties();
        }
    }

    private static Borehole ClearNavigationProperties(this Borehole borehole)
    {
        foreach (var file in borehole.BoreholeFiles?.Select(boreholeFile => boreholeFile.File) ?? [])
        {
            file.Boreholes.Clear();
            file.BoreholeFiles.Clear();
        }

        borehole.Observations?.ClearNavigationProperties();

        foreach (var completion in borehole.Completions)
        {
            completion.Backfills?.ClearNavigationProperties();
            completion.Instrumentations?.ClearNavigationProperties();
            completion.Casings?.ClearNavigationProperties();
        }

        return borehole;
    }

    private static void ClearNavigationProperties(this IEnumerable<Casing> casings)
    {
        foreach (var casing in casings)
        {
            casing.ClearNavigationProperties();
        }
    }

    private static void ClearNavigationProperties(this IEnumerable<ICasingReference> casingsReferences)
    {
        foreach (var casingReference in casingsReferences)
        {
            casingReference.Casing?.ClearNavigationProperties();
        }
    }

    private static void ClearNavigationProperties(this Casing casing)
    {
        casing.Backfills?.Clear();
        casing.Observations?.Clear();
        casing.Instrumentations?.Clear();
        casing.Completion = null;
    }

    /// <summary>
    /// Recursively updates all the <see cref="IUserAttached{TUser, TUserId}"/> <paramref name="items"/> with the given <paramref name="user"/>.
    /// </summary>
    internal static void UpdateAttachedUser(this IEnumerable<IUserAttached<User, int>> items, User user) =>
        items.UpdateAttachedUser(user, user.Id);

    /// <summary>
    /// Recursively updates all the <see cref="IUserAttached{TUser, TUserId}"/> <paramref name="items"/> with the given <paramref name="user"/>.
    /// </summary>
    internal static void UpdateAttachedUser(this IEnumerable<IUserAttached<User?, int?>> items, User user) =>
        items.UpdateAttachedUser(user, user.Id);

    /// <summary>
    /// Recursively updates all the <see cref="IUserAttached{TUser, TUserId}"/> <paramref name="items"/> with the given
    /// <paramref name="user"/> and <paramref name="userId"/>.
    /// </summary>
    private static void UpdateAttachedUser<TUser, TUserId>(this IEnumerable<IUserAttached<TUser, TUserId>> items, TUser user, int userId)
        where TUser : new()
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(userId);

        void UpdateUserAttachedItem(IUserAttached<TUser, TUserId> userAttachedItem)
        {
            var targetUserIdType = Nullable.GetUnderlyingType(typeof(TUserId)) ?? typeof(TUserId);
            var convertedUserId = (TUserId)Convert.ChangeType(userId, targetUserIdType, CultureInfo.InvariantCulture);

            userAttachedItem.User = default!;
            userAttachedItem.UserId = convertedUserId;
        }

        foreach (var item in items)
        {
            item.ProcessRecursive(UpdateUserAttachedItem, []);
        }
    }
}
