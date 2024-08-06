﻿using BDMS.Models;
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
    public DbSet<Codelist> Codelists { get; set; }
    public DbSet<Config> Configs { get; set; }
    public DbSet<Models.File> Files { get; set; }
    public DbSet<Layer> Layers { get; set; }
    public DbSet<Stratigraphy> Stratigraphies { get; set; }
    public DbSet<Term> Terms { get; set; }
    public DbSet<User> Users { get; set; }
    public IQueryable<User> UsersWithIncludes => Users
        .Include(u => u.WorkgroupRoles)
        .ThenInclude(wr => wr.Workgroup)
        .Include(u => u.TermsAccepted)
        .ThenInclude(ta => ta.Term);
    public DbSet<UserWorkgroupRole> UserWorkgroupRoles { get; set; }
    public DbSet<Workflow> Workflows { get; set; }
    public DbSet<Workgroup> Workgroups { get; set; }
    public DbSet<BoreholeFile> BoreholeFiles { get; set; }
    public DbSet<LithologicalDescription> LithologicalDescriptions { get; set; }
    public DbSet<FaciesDescription> FaciesDescriptions { get; set; }
    public DbSet<ChronostratigraphyLayer> ChronostratigraphyLayers { get; set; }
    public DbSet<LithostratigraphyLayer> LithostratigraphyLayers { get; set; }
    public DbSet<Observation> Observations { get; set; }
    public DbSet<WaterIngress> WaterIngresses { get; set; }
    public DbSet<Hydrotest> Hydrotests { get; set; }
    public DbSet<HydrotestResult> HydrotestResults { get; set; }
    public DbSet<GroundwaterLevelMeasurement> GroundwaterLevelMeasurements { get; set; }
    public DbSet<FieldMeasurement> FieldMeasurements { get; set; }
    public DbSet<FieldMeasurementResult> FieldMeasurementResults { get; set; }
    public DbSet<Completion> Completions { get; set; }
    public DbSet<Instrumentation> Instrumentations { get; set; }
    public DbSet<Backfill> Backfills { get; set; }
    public DbSet<Casing> Casings { get; set; }
    public DbSet<CasingElement> CasingElements { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<SectionElement> SectionElements { get; set; }
    public DbSet<BoreholeGeometryElement> BoreholeGeometry { get; set; }

    public BdmsContext(DbContextOptions options)
        : base(options)
    {
#pragma warning disable CS0618 // Type or member is obsolete, however they do not plan on removing it any time soon.
        // TODO: https://github.com/geoadmin/suite-bdms/issues/851
        NpgsqlConnection.GlobalTypeMapper.MapEnum<Role>();
#pragma warning restore CS0618 // Type or member is obsolete, however they do not plan on removing it any time soon.
    }

    /// <summary>
    /// Update the change information of <see cref="IChangeTracking"/> entities and call <see cref="DbContext.SaveChangesAsync(CancellationToken)" />.
    /// </summary>
    public async Task<int> UpdateChangeInformationAndSaveChangesAsync(HttpContext httpContext)
    {
        var subjectId = httpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var entities = ChangeTracker.Entries<IChangeTracking>();
        var user = await Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.SubjectId == subjectId)
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
        modelBuilder.Entity<TermsAccepted>().HasKey(k => new { k.UserId, k.TermId });

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
        modelBuilder.Entity<Borehole>().HasOne(l => l.Type).WithMany().HasForeignKey(l => l.TypeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Hrs).WithMany().HasForeignKey(l => l.HrsId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LithologyTopBedrock).WithMany().HasForeignKey(l => l.LithologyTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Lithostratigraphy).WithMany().HasForeignKey(l => l.LithostratigraphyId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Purpose).WithMany().HasForeignKey(l => l.PurposeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtDepth).WithMany().HasForeignKey(l => l.QtDepthId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.ElevationPrecision).WithMany().HasForeignKey(l => l.ElevationPrecisionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LocationPrecision).WithMany().HasForeignKey(l => l.LocationPrecisionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.QtReferenceElevation).WithMany().HasForeignKey(l => l.QtReferenceElevationId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.ReferenceElevationType).WithMany().HasForeignKey(l => l.ReferenceElevationTypeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Restriction).WithMany().HasForeignKey(l => l.RestrictionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Status).WithMany().HasForeignKey(l => l.StatusId);

        // Join table for layer and codelists with schema name 'color'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.ColorCodelists)
            .WithMany()
            .UsingEntity<LayerColorCode>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerColorCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerColorCodes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        // Join table for layer and codelists with schema name 'debris'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.DebrisCodelists)
            .WithMany()
            .UsingEntity<LayerDebrisCode>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerDebrisCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerDebrisCodes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        // Join table for layer and codelists with schema name 'grain_shape'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.GrainShapeCodelists)
            .WithMany()
            .UsingEntity<LayerGrainShapeCode>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerGrainShapeCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerGrainShapeCodes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        // Join table for layer and codelists with schema name 'grain_angularity'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.GrainAngularityCodelists)
            .WithMany()
            .UsingEntity<LayerGrainAngularityCode>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerGrainAngularityCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerGrainAngularityCodes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        // Join table for layer and codelists with schema name 'organic_components'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.OrganicComponentCodelists)
            .WithMany()
            .UsingEntity<LayerOrganicComponentCode>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerOrganicComponentCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerOrganicComponentCodes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        // Join table for layer and codelists with schema name 'uscs3'
        modelBuilder.Entity<Layer>()
            .HasMany(l => l.Uscs3Codelists)
            .WithMany()
            .UsingEntity<LayerUscs3Code>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LayerUscs3Codes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Layer)
                    .WithMany(b => b.LayerUscs3Codes)
                    .HasForeignKey(l => l.LayerId),
                j => j.HasKey(lc => new { lc.LayerId, lc.CodelistId }));

        modelBuilder.Entity<Layer>().HasOne(l => l.Alteration).WithMany().HasForeignKey(l => l.AlterationId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Cohesion).WithMany().HasForeignKey(l => l.CohesionId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Compactness).WithMany().HasForeignKey(l => l.CompactnessId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Consistance).WithMany().HasForeignKey(l => l.ConsistanceId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Gradation).WithMany().HasForeignKey(l => l.GradationId);
        modelBuilder.Entity<Layer>().HasOne(l => l.GrainSize1).WithMany().HasForeignKey(l => l.GrainSize1Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.GrainSize2).WithMany().HasForeignKey(l => l.GrainSize2Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.Humidity).WithMany().HasForeignKey(l => l.HumidityId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Lithology).WithMany().HasForeignKey(l => l.LithologyId);
        modelBuilder.Entity<Layer>().HasOne(l => l.LithologyTopBedrock).WithMany().HasForeignKey(l => l.LithologyTopBedrockId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Lithostratigraphy).WithMany().HasForeignKey(l => l.LithostratigraphyId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Plasticity).WithMany().HasForeignKey(l => l.PlasticityId);
        modelBuilder.Entity<Layer>().HasOne(l => l.DescriptionQuality).WithMany().HasForeignKey(l => l.DescriptionQualityId);
        modelBuilder.Entity<Layer>().HasOne(l => l.Uscs1).WithMany().HasForeignKey(l => l.Uscs1Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.Uscs2).WithMany().HasForeignKey(l => l.Uscs2Id);
        modelBuilder.Entity<Layer>().HasOne(l => l.UscsDetermination).WithMany().HasForeignKey(l => l.UscsDeterminationId);

        modelBuilder.Entity<Codelist>().Ignore(c => c.Layers);
        modelBuilder.Entity<Codelist>().Ignore(c => c.Hydrotests);

        modelBuilder.Entity<WaterIngress>().ToTable("water_ingress").HasBaseType<Observation>();

        modelBuilder.Entity<Hydrotest>().ToTable("hydrotest").HasBaseType<Observation>();

        // Join table for hydrotest and codelists with schema name 'hydrotest_kind'
        modelBuilder.Entity<Hydrotest>()
            .HasMany(l => l.KindCodelists)
            .WithMany()
            .UsingEntity<HydrotestKindCode>(
                j => j
                    .HasOne(hc => hc.Codelist)
                    .WithMany(c => c.HydrotestKindCodes)
                    .HasForeignKey(hc => hc.CodelistId),
                j => j
                    .HasOne(hc => hc.Hydrotest)
                    .WithMany(h => h.HydrotestKindCodes)
                    .HasForeignKey(hc => hc.HydrotestId),
                j => j.HasKey(hc => new { hc.HydrotestId, hc.CodelistId }));

        // Join table for hydrotest and codelists with schema name 'hydrotest_flowdirection'
        modelBuilder.Entity<Hydrotest>()
            .HasMany(l => l.FlowDirectionCodelists)
            .WithMany()
            .UsingEntity<HydrotestFlowDirectionCode>(
                j => j
                    .HasOne(hc => hc.Codelist)
                    .WithMany(c => c.HydrotestFlowDirectionCodes)
                    .HasForeignKey(hc => hc.CodelistId),
                j => j
                    .HasOne(hc => hc.Hydrotest)
                    .WithMany(h => h.HydrotestFlowDirectionCodes)
                    .HasForeignKey(hc => hc.HydrotestId),
                j => j.HasKey(hc => new { hc.HydrotestId, hc.CodelistId }));

        // Join table for hydrotest and codelists with schema name 'hydrotest_evaluationmethod'.
        modelBuilder.Entity<Hydrotest>()
            .HasMany(l => l.EvaluationMethodCodelists)
            .WithMany()
            .UsingEntity<HydrotestEvaluationMethodCode>(
                j => j
                    .HasOne(hc => hc.Codelist)
                    .WithMany(c => c.HydrotestEvaluationMethodCodes)
                    .HasForeignKey(hc => hc.CodelistId),
                j => j
                    .HasOne(hc => hc.Hydrotest)
                    .WithMany(h => h.HydrotestEvaluationMethodCodes)
                    .HasForeignKey(hc => hc.HydrotestId),
                j => j.HasKey(hc => new { hc.HydrotestId, hc.CodelistId }));

        modelBuilder.Entity<GroundwaterLevelMeasurement>().ToTable("groundwater_level_measurement").HasBaseType<Observation>();

        modelBuilder.Entity<FieldMeasurement>().ToTable("field_measurement").HasBaseType<Observation>();

        // Configure delete behavior for all non-nullable foreign keys for Codelists.
        modelBuilder.Entity<CasingElement>()
            .HasOne(ce => ce.Kind)
            .WithMany()
            .HasForeignKey(ce => ce.KindId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Completion>()
            .HasOne(c => c.Kind)
            .WithMany()
            .HasForeignKey(c => c.KindId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Observation>()
            .HasOne(o => o.Reliability)
            .WithMany()
            .HasForeignKey(o => o.ReliabilityId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<WaterIngress>()
            .HasOne(w => w.Quantity)
            .WithMany()
            .HasForeignKey(w => w.QuantityId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<GroundwaterLevelMeasurement>()
            .HasOne(g => g.Kind)
            .WithMany()
            .HasForeignKey(g => g.KindId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<FieldMeasurementResult>()
            .HasOne(f => f.Parameter)
            .WithMany()
            .HasForeignKey(f => f.ParameterId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<FieldMeasurementResult>()
            .HasOne(f => f.SampleType)
            .WithMany()
            .HasForeignKey(f => f.SampleTypeId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<HydrotestResult>()
            .HasOne(h => h.Parameter)
            .WithMany()
            .HasForeignKey(h => h.ParameterId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
