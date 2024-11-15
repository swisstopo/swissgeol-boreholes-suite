using BDMS.Models;

namespace BDMS.ExternSync.Test;

/// <summary>
/// <see cref="SyncContext"/> extension methods."/>
/// </summary>
internal static class SyncContextExtensions
{
    internal static async Task SeedUserTestDataAsync(this SyncContext syncContext)
    {
        var (source, target) = (syncContext.Source, syncContext.Target);

        source.Users.Add(new User { Id = 1, FirstName = "John", LastName = "Doe", Name = "John Doe", SubjectId = "doe123" });
        source.Users.Add(new User { Id = 2, FirstName = "Jane", LastName = "Doe", Name = "Jane Doe", SubjectId = "doe456" });
        source.Users.Add(new User { Id = 3, FirstName = "Alice", LastName = "Smith", Name = "Alice Smith", SubjectId = "smith789" });
        source.Users.Add(new User { Id = 4, FirstName = "Bob", LastName = "Smith", Name = "Bob Smith", SubjectId = "smith101" });
        await source.SaveChangesAsync().ConfigureAwait(false);

        target.Users.Add(new User { Id = 1, FirstName = "Charlie", LastName = "Brown", Name = "Charlie Brown", SubjectId = "brown123" });
        await target.SaveChangesAsync().ConfigureAwait(false);
    }
}
