using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BDMS;

/// <summary>
/// The EF database context containing data for the BDMS application.
/// </summary>
public class BdmsContext : DbContext
{
    public DbSet<Borehole> Boreholes { get; set; }
    public DbSet<UserEvent> BoringEvents { get; set; }
    public DbSet<Canton> Cantons { get; set; }
    public DbSet<Codelist> Codelists { get; set; }
    public DbSet<Config> Configs { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Models.File> Files { get; set; }
    public DbSet<Layer> Layers { get; set; }
    public DbSet<Municipality> Municipalities { get; set; }
    public DbSet<Stratigraphy> Stratigraphies { get; set; }
    public DbSet<Term> Terms { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkgroupRole> UserWorkgroupRoles { get; set; }
    public DbSet<Workflow> Workflows { get; set; }
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
