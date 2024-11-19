using Microsoft.Extensions.DependencyInjection;
using System.Data.Common;
using static BDMS.ExternSync.SyncContextConstants;
using static BDMS.ExternSync.SyncContextExtensions;

namespace BDMS.ExternSync;

public class SyncContext(
    [FromKeyedServices(SourceBdmsContextName)] DbConnection sourceDbConnection,
    [FromKeyedServices(TargetBdmsContextName)] DbConnection targetDbConnection)
    : ISyncContext, IDisposable
{
    private bool disposedValue;

    /// <inheritdoc/>
    public BdmsContext Source { get; } = new BdmsContext(GetDbContextOptions(sourceDbConnection));

    /// <inheritdoc/>
    public BdmsContext Target { get; } = new BdmsContext(GetDbContextOptions(targetDbConnection));

    /// <inheritdoc/>
    protected virtual void Dispose(bool disposing)
    {
        if (!disposedValue && disposing)
        {
            Source.Dispose();
            Target.Dispose();

            disposedValue=true;
        }
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
