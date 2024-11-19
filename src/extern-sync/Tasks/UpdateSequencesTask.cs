﻿using Microsoft.Extensions.Logging;
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
    private const int minValue = 20000;
    private const string sequenceName = "users_id_usr_seq";
    private const string getSequenceLastValueQuery = $"SELECT last_value FROM {BoreholesDatabaseSchemaName}.{sequenceName};";
    private const string setSequenceValueQuery = $"SELECT setval('{BoreholesDatabaseSchemaName}.{sequenceName}', ($1));";

    /// <inheritdoc/>
    protected override async Task RunTaskAsync(CancellationToken cancellationToken)
    {
        var targetDbConnection = await Target.GetDbConnectionAsync(cancellationToken).ConfigureAwait(false);
        using var selectCommand = new NpgsqlCommand(getSequenceLastValueQuery, targetDbConnection);

        var lastValue = await selectCommand.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false) as long? ?? -1;
        Logger.LogInformation("{SchemaName}.{SequenceName} last_value: <{LastValue}>", BoreholesDatabaseSchemaName, sequenceName, lastValue);

        if (lastValue == -1)
        {
            Logger.LogError("Error while reading sequence {SchemaName}.{SequenceName}.", BoreholesDatabaseSchemaName, sequenceName);
        }
        else if (lastValue < minValue)
        {
            using var alterCommand = new NpgsqlCommand(setSequenceValueQuery, targetDbConnection);
            alterCommand.Parameters.AddWithValue(minValue);

            await alterCommand.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);

            Logger.LogInformation("Sequence {SchemaName}.{SequenceName} has been set to {MinValue}.", BoreholesDatabaseSchemaName, sequenceName, minValue);
        }
        else
        {
            Logger.LogInformation("Sequence for {SchemaName}.{SequenceName} has already been set.", BoreholesDatabaseSchemaName, sequenceName);
        }
    }

    /// <inheritdoc/>
    protected override async Task ValidateTaskAsync(CancellationToken cancellationToken) =>
        await Task.FromResult(true).ConfigureAwait(false);
}
