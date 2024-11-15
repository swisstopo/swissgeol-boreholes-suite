using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data.Common;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="SyncContext"/> helper methods."/>
/// </summary>
public static class SyncContextHelpers
{
    /// <summary>
    /// The name of the source <see cref="BdmsContext"/>.
    /// </summary>
    /// <remarks>
    /// This identifier is used to register multiple <see cref="NpgsqlConnection"/>
    /// services with different connection strings.
    /// </remarks>
    public const string SourceBdmsContextName = "SourceBdmsContext";

    /// <summary>
    /// The name of the target <see cref="BdmsContext"/>.
    /// </summary>
    /// <remarks>
    /// This identifier is used to register multiple <see cref="NpgsqlConnection"/>
    /// services with different connection strings.
    /// </remarks>
    public const string TargetBdmsContextName = "TargetBdmsContext";

    /// <summary>
    /// The name of the boreholes database.
    /// </summary>
    public const string BoreholesDatabaseName = "bdms";

    /// <summary>
    /// The name of the boreholes database schema.
    /// </summary>
    public const string BoreholesDatabaseSchemaName = "bdms";

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="dbConnection"/>
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(DbConnection dbConnection) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(dbConnection, SyncContextExtensions.SetDbContextOptions).Options;

    /// <summary>
    /// Gets the <see cref="DbContextOptions{BdmsContext}"/> for the specified <paramref name="connectionString"/>
    /// </summary>
    public static DbContextOptions<BdmsContext> GetDbContextOptions(string connectionString) =>
        new DbContextOptionsBuilder<BdmsContext>().UseNpgsql(connectionString, SyncContextExtensions.SetDbContextOptions).Options;
}
