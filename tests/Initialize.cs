using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;
public sealed class Initialize
{
    [AssemblyInitialize]
    public static void AssemblyInitialize()
    {
        using var context = ContextFactory.CreateContext();
        context.Database.Migrate();
    }
}
