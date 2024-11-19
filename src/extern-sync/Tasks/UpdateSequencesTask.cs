using Microsoft.Extensions.Logging;
using Npgsql;
using static BDMS.ExternSync.SyncContextConstants;

namespace BDMS.ExternSync.Tasks;

/// <summary>
/// Sets the sequences in the target database.
/// </summary>
/// <remarks>
/// IMPORTANT! This class does not yet implement the actual behavior. It only
/// contains sample code to verify the testing and integration concepts.
/// </remarks>
public class UpdateSequencesTask(ISyncContext syncContext, ILogger<UpdateSequencesTask> logger) : SyncTask(syncContext, logger)
{
    private const int MinValue = 20000;
    private const string SequenceName = "users_id_usr_seq";
    private const string GetSequenceLastValueSql = $"SELECT last_value FROM {BoreholesDatabaseSchemaName}.{SequenceName};";
    private const string SetSequenceValueQuery = $"SELECT setval('{BoreholesDatabaseSchemaName}.{SequenceName}', ($1));";

    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        var targetDbConnection = await Target.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        using var selectCommand = new NpgsqlCommand(GetSequenceLastValueSql, targetDbConnection);

        var lastValue = await selectCommand.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false) as long? ?? -1;
        Logger.LogInformation("{SchemaName}.{SequenceName} last_value: <{LastValue}>", BoreholesDatabaseSchemaName, SequenceName, lastValue);

        if (lastValue == -1)
        {
            Logger.LogError("Error while reading sequence {SchemaName}.{SequenceName}.", BoreholesDatabaseSchemaName, SequenceName);
        }
        else if (lastValue < MinValue)
        {
            using var alterCommand = new NpgsqlCommand(SetSequenceValueQuery, targetDbConnection);
            alterCommand.Parameters.AddWithValue(MinValue);

            await alterCommand.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);

            Logger.LogInformation("Sequence {SchemaName}.{SequenceName} has been set to {MinValue}.", BoreholesDatabaseSchemaName, SequenceName, MinValue);
        }
        else
        {
            Logger.LogInformation("Sequence for {SchemaName}.{SequenceName} has already been set.", BoreholesDatabaseSchemaName, SequenceName);
        }
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken) =>
        await Task.FromResult(true).ConfigureAwait(false);
}
