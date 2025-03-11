using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using System.Data.Common;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> extension methods.
/// </summary>
public static class SyncContextExtensions
{
    /// <summary>
    /// Gets and opens the <see cref="NpgsqlConnection"/> for the specified <paramref name="context"/>.
    /// </summary>
    public static async Task<NpgsqlConnection> GetAndOpenDbConnectionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
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
    public static async Task<string?> GetDbSchemaVersionAsync(this BdmsContext context, CancellationToken cancellationToken = default)
    {
        var migrations = await context.Database.GetAppliedMigrationsAsync(cancellationToken).ConfigureAwait(false);
        return migrations.LastOrDefault();
    }

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, BdmsContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>.
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
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
    internal static bool IsPublicationStatusPublished(this Borehole borehole)
    {
        return borehole.Workflows.OrderByDescending(b => b.Id)
            .FirstOrDefault(w => w.Role == Role.Publisher && w.Finished != null) != null;
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
    /// Sets the publication <paramref name="status"/> for the given <see cref="Borehole"/>.
    /// Please note that all previous <see cref="Workflow"/> entries/histroy gets cleared!
    /// This may not be the desired behavior for every use case but complies with the requirements
    /// when syncing <see cref="Borehole"/>s from a context to another in this project.
    /// </summary>
    /// <param name="borehole">The <see cref="Borehole"/> to set the publication status on.</param>
    /// <param name="status">The <see cref="Role"/>/Status to be set. <see cref="Role.View"/>
    /// is not a valid publication status.</param>
    /// <exception cref="NotSupportedException">If the <paramref name="status"/> is not supported.</exception>
    internal static Borehole SetBoreholePublicationStatus(this Borehole borehole, Role status)
    {
        ArgumentNullException.ThrowIfNull(borehole);

        if (status == Role.View)
        {
            throw new NotSupportedException($"The given status <{status}> is not supported.");
        }

        // Remove all previous workflow entries/history.
        borehole.Workflows.Clear();

        for (int i = 1; i <= (int)status; i++)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)i,
                Started = DateTime.Now.ToUniversalTime(),
                Finished = DateTime.Now.ToUniversalTime(),
            });
        }

        // For all states except 'published', the next state is already
        // created (but without started and finished dates).
        if (status != Role.Publisher)
        {
            borehole.Workflows.Add(new Workflow
            {
                Role = (Role)(int)status + 1,
                Started = null,
                Finished = null,
            });
        }

        return borehole;
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
            HashSet<IUserAttached<TUser, TUserId>> visitedItems = [];
            item.ProcessRecursive(UpdateUserAttachedItem, visitedItems);
        }
    }
}
