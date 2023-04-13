using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security.Claims;

namespace BDMS;

/// <summary>
/// The EF database context containing data for the BDMS application.
/// </summary>
public class BdmsContext : DbContext
{
    public DbSet<Borehole> Boreholes { get; set; }
    public DbSet<UserEvent> BoringEvents { get; set; }
    public DbSet<Codelist> Codelists { get; set; }
    public DbSet<Config> Configs { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Models.File> Files { get; set; }
    public DbSet<Layer> Layers { get; set; }
    public DbSet<Stratigraphy> Stratigraphies { get; set; }
    public DbSet<Term> Terms { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkgroupRole> UserWorkgroupRoles { get; set; }
    public DbSet<Workflow> Workflows { get; set; }
    public DbSet<Workgroup> Workgroups { get; set; }
    public DbSet<BoreholeFile> BoreholeFiles { get; set; }
    public DbSet<LithologicalDescription> LithologicalDescriptions { get; set; }
    public DbSet<FaciesDescription> FaciesDescriptions { get; set; }
    public DbSet<ChronostratigraphyLayer> ChronostratigraphyLayers { get; set; }
    public DbSet<Observation> Observations { get; set; }
    public DbSet<WaterIngress> WaterIngresses { get; set; }

    public BdmsContext(DbContextOptions options)
        : base(options)
    {
        NpgsqlConnection.GlobalTypeMapper.MapEnum<Role>();
    }

    /// <summary>
    /// Update the change information of <see cref="IChangeTracking"/> entities and call <see cref="DbContext.SaveChangesAsync(CancellationToken)" />.
    /// </summary>
    public async Task<int> UpdateChangeInformationAndSaveChangesAsync(HttpContext httpContext)
    {
        var userName = httpContext?.User.FindFirst(ClaimTypes.Name)?.Value;

        var entities = ChangeTracker.Entries<IChangeTracking>();
        var user = await Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Name == userName)
            .ConfigureAwait(false);

        foreach (var entity in entities)
        {
            if (entity.State == EntityState.Added)
            {
                entity.Entity.Created = DateTime.Now.ToUniversalTime();
                entity.Entity.CreatedById = user?.Id;
                entity.Entity.Updated = DateTime.Now.ToUniversalTime();
                entity.Entity.UpdatedById = user?.Id;
            }
            else if (entity.State == EntityState.Modified)
            {
                entity.Entity.Updated = DateTime.Now.ToUniversalTime();
                entity.Entity.UpdatedById = user?.Id;
            }
        }

        return await SaveChangesAsync().ConfigureAwait(false);
    }

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("bdms");
        modelBuilder.Entity<UserWorkgroupRole>().HasKey(k => new { k.UserId, k.WorkgroupId, k.Role });

        modelBuilder.Entity<Borehole>()
                .HasMany(b => b.Files)
                .WithMany(f => f.Boreholes)
                .UsingEntity<BoreholeFile>(
                    j => j
                        .HasOne(bf => bf.File)
                        .WithMany(f => f.BoreholeFiles)
                        .HasForeignKey(bf => bf.FileId),
                    j => j
                        .HasOne(bf => bf.Borehole)
                        .WithMany(b => b.BoreholeFiles)
                        .HasForeignKey(bf => bf.BoreholeId),
                    j => j.HasKey(bf => new { bf.BoreholeId, bf.FileId }));

        modelBuilder.Entity<Borehole>()
            .HasMany(b => b.Codelists)
            .WithMany(f => f.Boreholes)
            .UsingEntity<BoreholeCodelist>(
                j => j
                    .HasOne(bf => bf.Codelist)
                    .WithMany(f => f.BoreholeCodelists)
                    .HasForeignKey(bf => bf.CodelistId),
                j => j
                    .HasOne(bf => bf.Borehole)
                    .WithMany(b => b.BoreholeCodelists)
                    .HasForeignKey(bf => bf.BoreholeId),
                j => j.HasKey(bf => new { bf.BoreholeId, bf.CodelistId }));

        modelBuilder.Entity<Borehole>().HasOne(l => l.Chronostratigraphy).WithMany().HasForeignKey(l => l.ChronostratigraphyId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Cuttings).WithMany().HasForeignKey(l => l.CuttingsId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.DrillingMethod).WithMany().HasForeignKey(l => l.DrillingMethodId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Kind).WithMany().HasForeignKey(l => l.KindId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Hrs).WithMany().HasForeignKey(l => l.HrsId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LithologyTopBedrock).WithMany().HasForeignKey(l => l.LithologyTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Lithostratigraphy).WithMany().HasForeignKey(l => l.LithostratigraphyId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Purpose).WithMany().HasForeignKey(l => l.PurposeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtDepth).WithMany().HasForeignKey(l => l.QtDepthId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtElevation).WithMany().HasForeignKey(l => l.QtElevationId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtInclinationDirection).WithMany().HasForeignKey(l => l.QtInclinationDirectionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtLocation).WithMany().HasForeignKey(l => l.QtLocationId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtTotalDepthTvd).WithMany().HasForeignKey(l => l.QtTotalDepthTvdId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtTopBedrock).WithMany().HasForeignKey(l => l.QtTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtTopBedrockTvd).WithMany().HasForeignKey(l => l.QtTopBedrockTvdId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtReferenceElevation).WithMany().HasForeignKey(l => l.QtReferenceElevationId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.ReferenceElevationType).WithMany().HasForeignKey(l => l.ReferenceElevationTypeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Restriction).WithMany().HasForeignKey(l => l.RestrictionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Status).WithMany().HasForeignKey(l => l.StatusId);

        modelBuilder.Entity<Layer>()
                .HasMany(l => l.Codelists)
                .WithMany(c => c.Layers)
                .UsingEntity<LayerCodelist>(
                    j => j
                        .HasOne(lc => lc.Codelist)
                        .WithMany(c => c.LayerCodelists)
                        .HasForeignKey(lc => lc.CodelistId),
                    j => j
                        .HasOne(lc => lc.Layer)
                        .WithMany(b => b.LayerCodelists)
                        .HasForeignKey(l => l.LayerId),
                    j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        modelBuilder.Entity<Layer>().HasOne(l => l.Alteration).WithMany().HasForeignKey(l => l.AlterationId);
        modelBuilder.Entity<Layer>().HasOne(l => l.CasingKind).WithMany().HasForeignKey(l => l.CasingKindId);
        modelBuilder.Entity<Layer>().HasOne(l => l.CasingMaterial).WithMany().HasForeignKey(l => l.CasingMaterialId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Chronostratigraphy).WithMany().HasForeignKey(l => l.ChronostratigraphyId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Cohesion).WithMany().HasForeignKey(l => l.CohesionId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Compactness).WithMany().HasForeignKey(l => l.CompactnessId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Consistance).WithMany().HasForeignKey(l => l.ConsistanceId);
        modelBuilder.Entity<Layer>().HasOne(l => l.FillKind).WithMany().HasForeignKey(l => l.FillKindId);
        modelBuilder.Entity<Layer>().HasOne(l => l.FillMaterial).WithMany().HasForeignKey(l => l.FillMaterialId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Gradation).WithMany().HasForeignKey(l => l.GradationId);
        modelBuilder.Entity<Layer>().HasOne(l => l.GrainSize1).WithMany().HasForeignKey(l => l.GrainSize1Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.GrainSize2).WithMany().HasForeignKey(l => l.GrainSize2Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.Humidity).WithMany().HasForeignKey(l => l.HumidityId);
        modelBuilder.Entity<Layer>().HasOne(l => l.InstrumentKind).WithMany().HasForeignKey(l => l.InstrumentKindId);
        modelBuilder.Entity<Layer>().HasOne(l => l.InstrumentStatus).WithMany().HasForeignKey(l => l.InstrumentStatusId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Lithology).WithMany().HasForeignKey(l => l.LithologyId);
        modelBuilder.Entity<Layer>().HasOne(l => l.LithologyTopBedrock).WithMany().HasForeignKey(l => l.LithologyTopBedrockId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Lithostratigraphy).WithMany().HasForeignKey(l => l.LithostratigraphyId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Plasticity).WithMany().HasForeignKey(l => l.PlasticityId);
        modelBuilder.Entity<Layer>().HasOne(l => l.QtDescription).WithMany().HasForeignKey(l => l.QtDescriptionId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Uscs1).WithMany().HasForeignKey(l => l.Uscs1Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.Uscs2).WithMany().HasForeignKey(l => l.Uscs2Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.UscsDetermination).WithMany().HasForeignKey(l => l.UscsDeterminationId);
        modelBuilder.Entity<Layer>().HasOne(l => l.InstrumentCasing).WithMany().HasForeignKey(l => l.InstrumentCasingId);

        modelBuilder.Entity<Observation>().ToTable("observation");
        modelBuilder.Entity<WaterIngress>().ToTable("water_ingress").HasBaseType<Observation>();
    }
}
