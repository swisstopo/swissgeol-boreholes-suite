﻿using BDMS.ExternSync;
using BDMS.ExternSync.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;
using static BDMS.ExternSync.SyncContextConstants;

using var app = Host.CreateDefaultBuilder(args).ConfigureServices((context, services) =>
{
    // Register source and target database contexts
    string GetConnectionString(string name) =>
        context.Configuration.GetConnectionString(name) ?? throw new InvalidOperationException($"Connection string <{name}> not found.");

    services.AddNpgsqlDataSource(GetConnectionString(SourceBdmsContextName), dataSourceBuilder => dataSourceBuilder.UseNetTopologySuite(), serviceKey: SourceBdmsContextName);
    services.AddNpgsqlDataSource(GetConnectionString(TargetBdmsContextName), dataSourceBuilder => dataSourceBuilder.UseNetTopologySuite(), serviceKey: TargetBdmsContextName);
    services.AddTransient<ISyncContext, SyncContext>();

    // Register tasks. The order specified here is the order in which they will be executed.
    services.AddScoped<ISyncTask, CollectInformationTask>();
    services.AddScoped<ISyncTask, CheckDatabaseStateTask>();
    services.AddScoped<ISyncTask, SyncBoreholesTask>();

    // Register task manager
    services.AddScoped<SyncTaskManager>();
})
.Build();

// Execute tasks
using var scope = app.Services.CreateScope();
using var cancellationTokenSource = new CancellationTokenSource();

await scope.ServiceProvider.GetRequiredService<SyncTaskManager>()
    .ExecuteTasksAsync(cancellationTokenSource.Token)
    .ConfigureAwait(false);
