using Microsoft.Extensions.Configuration;

namespace BDMS.ExternSync;

/// <summary>
/// <see cref="TestSyncContext"/> helper methods.
/// </summary>
internal static class TestSyncContextHelpers
{
    internal static IConfiguration GetDefaultConfiguration() => CreateConfiguration("Default", "sub_admin", true);

    internal static IConfiguration CreateConfiguration(string targetDefaultWorkgroupName, string targetDefaultUserName, bool migrateTargetDatabase) =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
        {
            { SyncContextConstants.TargetDefaultWorkgroupNameEnvName, targetDefaultWorkgroupName },
            { SyncContextConstants.TargetDefaultUserSubEnvName, targetDefaultUserName },
            { SyncContextConstants.MigrateTargetDatabaseEnvName, migrateTargetDatabase.ToString() },
        }).Build();
}
