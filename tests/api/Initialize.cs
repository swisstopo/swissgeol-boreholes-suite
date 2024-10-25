using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public sealed class Initialize
{
    [AssemblyInitialize]
    public static void AssemblyInitialize(TestContext testContext)
    {
        using var context = ContextFactory.CreateContext();
        context.Database.Migrate();

        context.EnsureSeeded();
    }
}
