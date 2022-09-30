using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BDMS;

/// <summary>
/// The EF database context containing data for the BDMS application.
/// </summary>
public class BdmsContext : DbContext
{
    public DbSet<Codelist> Codelists { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkgroupRole> UserWorkgroupRoles { get; set; }
    public DbSet<Workgroup> Workgroups { get; set; }

    public BdmsContext(DbContextOptions options)
        : base(options)
    {
        NpgsqlConnection.GlobalTypeMapper.MapEnum<Role>();
    }

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("bdms");
        modelBuilder.Entity<UserWorkgroupRole>().HasKey(k => new { k.UserId, k.WorkgroupId, k.Role });
    }
}
