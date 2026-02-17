using BDMS.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security.Claims;
using static BDMS.BdmsContextConstants;

namespace BDMS;

/// <summary>
/// The EF database context containing data for the BDMS application.
/// </summary>
public class BdmsContext : DbContext
{
    public DbSet<Borehole> Boreholes { get; set; }

    /// <summary>
    /// Gets a query including all the data which represents a complete <see cref="Borehole"/>.
    /// In the first place, this extension method is meant to be used to export
    /// or copy an entire <see cref="Borehole"/> with all its dependencies.
    /// </summary>
    public IQueryable<Borehole> BoreholesWithIncludes
        => Boreholes
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyRockConditionCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyUscsTypeCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyTextureMetaCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentUnconOrganicCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentUnconDebrisCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionGrainShapeCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionGrainAngularityCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionLithologyUnconDebrisCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentConParticleCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentConMineralCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionStructureSynGenCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionStructurePostGenCodes)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.LithologicalDescriptions)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.FaciesDescriptions)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.ChronostratigraphyLayers)
        .Include(b => b.Stratigraphies).ThenInclude(s => s.LithostratigraphyLayers)
        .Include(b => b.Completions).ThenInclude(c => c.Casings).ThenInclude(c => c.CasingElements)
        .Include(b => b.Completions).ThenInclude(c => c.Instrumentations)
        .Include(b => b.Completions).ThenInclude(c => c.Backfills)
        .Include(b => b.Sections).ThenInclude(s => s.SectionElements)
        .Include(b => b.Observations).ThenInclude(o => (o as FieldMeasurement)!.FieldMeasurementResults)
        .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestResults)
        .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestEvaluationMethodCodes)
        .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestFlowDirectionCodes)
        .Include(b => b.Observations).ThenInclude(o => (o as Hydrotest)!.HydrotestKindCodes)
        .Include(b => b.BoreholeCodelists)
        .Include(b => b.Workflow).ThenInclude(w => w.Changes)
        .Include(b => b.Workflow).ThenInclude(w => w.ReviewedTabs)
        .Include(b => b.Workflow).ThenInclude(w => w.PublishedTabs)
        .Include(b => b.Workflow).ThenInclude(w => w.Assignee)
        .Include(b => b.BoreholeFiles).ThenInclude(f => f.File)
        .Include(b => b.Photos)
        .Include(b => b.Documents)
        .Include(b => b.LogRuns).ThenInclude(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes)
        .Include(b => b.BoreholeGeometry)
        .Include(b => b.Workgroup)
        .Include(b => b.UpdatedBy);

    public DbSet<Codelist> Codelists { get; set; }

    public DbSet<Config> Configs { get; set; }

    public DbSet<Models.File> Files { get; set; }

    public DbSet<Lithology> Lithologies { get; set; }

    /// <summary>
    /// Extends the provided <see cref="IQueryable"/> of type <see cref="Lithology"/> with all includes.
    /// </summary>
    public IQueryable<Lithology> LithologiesWithIncludes
        => Lithologies
        .Include(l => l.LithologyRockConditionCodes)
        .Include(l => l.RockConditionCodelists)
        .Include(l => l.LithologyTextureMetaCodes)
        .Include(l => l.TextureMetaCodelists)
        .Include(l => l.LithologyUscsTypeCodes)
        .Include(l => l.UscsTypeCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionComponentUnconOrganicCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.ComponentUnconOrganicCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionComponentUnconDebrisCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.ComponentUnconDebrisCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionGrainShapeCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.GrainShapeCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionGrainAngularityCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.GrainAngularityCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionLithologyUnconDebrisCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyUnconDebrisCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionComponentConParticleCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.ComponentConParticleCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionComponentConMineralCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.ComponentConMineralCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionStructureSynGenCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.StructureSynGenCodelists)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.LithologyDescriptionStructurePostGenCodes)
        .Include(l => l.LithologyDescriptions)
        .ThenInclude(ld => ld.StructurePostGenCodelists);

    /// <summary>
    /// Extends the provided <see cref="IQueryable"/> of type <see cref="Lithology"/> with all includes,
    /// then projects each entity, mapping many-to-many join table IDs for all <see cref="Codelist"/> collections into lists of IDs.
    /// </summary>
    public IQueryable<Lithology> LithologiesWithProjection
        => LithologiesWithIncludes
        .AsNoTracking()
        .Select(l => new Lithology
        {
            Id = l.Id,
            StratigraphyId = l.StratigraphyId,
            CreatedById = l.CreatedById,
            Created = l.Created,
            UpdatedById = l.UpdatedById,
            Updated = l.Updated,
            FromDepth = l.FromDepth,
            ToDepth = l.ToDepth,
            IsUnconsolidated = l.IsUnconsolidated,
            HasBedding = l.HasBedding,
            Share = l.Share,
            AlterationDegreeId = l.AlterationDegreeId,
            AlterationDegree = l.AlterationDegree,
            Notes = l.Notes,
            CompactnessId = l.CompactnessId,
            CohesionId = l.CohesionId,
            Cohesion = l.Cohesion,
            HumidityId = l.HumidityId,
            Humidity = l.Humidity,
            ConsistencyId = l.ConsistencyId,
            Consistency = l.Consistency,
            PlasticityId = l.PlasticityId,
            Plasticity = l.Plasticity,
            UscsDeterminationId = l.UscsDeterminationId,
            UscsDetermination = l.UscsDetermination,

            UscsTypeCodelistIds = l.LithologyUscsTypeCodes == null ? new List<int>() : l.LithologyUscsTypeCodes.Select(code => code.CodelistId).ToList(),
            RockConditionCodelistIds = l.LithologyRockConditionCodes == null ? new List<int>() : l.LithologyRockConditionCodes.Select(code => code.CodelistId).ToList(),
            TextureMetaCodelistIds = l.LithologyTextureMetaCodes == null ? new List<int>() : l.LithologyTextureMetaCodes.Select(code => code.CodelistId).ToList(),

            LithologyDescriptions = l.LithologyDescriptions == null ? new List<LithologyDescription>() : l.LithologyDescriptions.Select(ld => new LithologyDescription
            {
                Id = ld.Id,
                LithologyId = ld.LithologyId,
                CreatedById = ld.CreatedById,
                Created = ld.Created,
                UpdatedById = ld.UpdatedById,
                Updated = ld.Updated,
                IsFirst = ld.IsFirst,
                ColorPrimaryId = ld.ColorPrimaryId,
                ColorSecondaryId = ld.ColorSecondaryId,
                LithologyUnconMainId = ld.LithologyUnconMainId,
                LithologyUncon2Id = ld.LithologyUncon2Id,
                LithologyUncon3Id = ld.LithologyUncon3Id,
                LithologyUncon4Id = ld.LithologyUncon4Id,
                LithologyUncon5Id = ld.LithologyUncon5Id,
                LithologyUncon6Id = ld.LithologyUncon6Id,
                HasStriae = ld.HasStriae,
                LithologyConId = ld.LithologyConId,
                GrainSizeId = ld.GrainSizeId,
                GrainAngularityId = ld.GrainAngularityId,
                GradationId = ld.GradationId,
                CementationId = ld.CementationId,

                ComponentUnconOrganicCodelistIds = ld.LithologyDescriptionComponentUnconOrganicCodes == null ? new List<int>() : ld.LithologyDescriptionComponentUnconOrganicCodes.Select(code => code.CodelistId).ToList(),
                ComponentUnconDebrisCodelistIds = ld.LithologyDescriptionComponentUnconDebrisCodes == null ? new List<int>() : ld.LithologyDescriptionComponentUnconDebrisCodes.Select(code => code.CodelistId).ToList(),
                GrainShapeCodelistIds = ld.LithologyDescriptionGrainShapeCodes == null ? new List<int>() : ld.LithologyDescriptionGrainShapeCodes.Select(code => code.CodelistId).ToList(),
                GrainAngularityCodelistIds = ld.LithologyDescriptionGrainAngularityCodes == null ? new List<int>() : ld.LithologyDescriptionGrainAngularityCodes.Select(code => code.CodelistId).ToList(),
                LithologyUnconDebrisCodelistIds = ld.LithologyDescriptionLithologyUnconDebrisCodes == null ? new List<int>() : ld.LithologyDescriptionLithologyUnconDebrisCodes.Select(code => code.CodelistId).ToList(),
                ComponentConParticleCodelistIds = ld.LithologyDescriptionComponentConParticleCodes == null ? new List<int>() : ld.LithologyDescriptionComponentConParticleCodes.Select(code => code.CodelistId).ToList(),
                ComponentConMineralCodelistIds = ld.LithologyDescriptionComponentConMineralCodes == null ? new List<int>() : ld.LithologyDescriptionComponentConMineralCodes.Select(code => code.CodelistId).ToList(),
                StructureSynGenCodelistIds = ld.LithologyDescriptionStructureSynGenCodes == null ? new List<int>() : ld.LithologyDescriptionStructureSynGenCodes.Select(code => code.CodelistId).ToList(),
                StructurePostGenCodelistIds = ld.LithologyDescriptionStructurePostGenCodes == null ? new List<int>() : ld.LithologyDescriptionStructurePostGenCodes.Select(code => code.CodelistId).ToList(),

                LithologyDescriptionComponentUnconOrganicCodes = ld.LithologyDescriptionComponentUnconOrganicCodes,
                LithologyDescriptionComponentUnconDebrisCodes = ld.LithologyDescriptionComponentUnconDebrisCodes,
                LithologyDescriptionGrainShapeCodes = ld.LithologyDescriptionGrainShapeCodes,
                LithologyDescriptionGrainAngularityCodes = ld.LithologyDescriptionGrainAngularityCodes,
                LithologyDescriptionLithologyUnconDebrisCodes = ld.LithologyDescriptionLithologyUnconDebrisCodes,
                LithologyDescriptionComponentConParticleCodes = ld.LithologyDescriptionComponentConParticleCodes,
                LithologyDescriptionComponentConMineralCodes = ld.LithologyDescriptionComponentConMineralCodes,
                LithologyDescriptionStructureSynGenCodes = ld.LithologyDescriptionStructureSynGenCodes,
                LithologyDescriptionStructurePostGenCodes = ld.LithologyDescriptionStructurePostGenCodes,

                ComponentUnconOrganicCodelists = null,
                ComponentUnconDebrisCodelists = null,
                GrainShapeCodelists = null,
                GrainAngularityCodelists = null,
                LithologyUnconDebrisCodelists = null,
                ComponentConParticleCodelists = null,
                ComponentConMineralCodelists = null,
                StructureSynGenCodelists = null,
                StructurePostGenCodelists = null,
            }).ToList(),

            UscsTypeCodelists = null,
            RockConditionCodelists = null,
            TextureMetaCodelists = null,
        });

    public DbSet<LithologyDescription> LithologyDescriptions { get; set; }

    public DbSet<Layer> Layers { get; set; }

    /// <summary>
    /// Extends the provided <see cref="IQueryable"/> of type <see cref="Layer"/> with all includes.
    /// </summary>
    public IQueryable<Layer> LayersWithIncludes
        => Layers
        .Include(l => l.DescriptionQuality)
        .Include(l => l.Lithology)
        .Include(l => l.Plasticity)
        .Include(l => l.Consistance)
        .Include(l => l.Alteration)
        .Include(l => l.Compactness)
        .Include(l => l.GrainSize1)
        .Include(l => l.GrainSize2)
        .Include(l => l.Cohesion)
        .Include(l => l.Uscs1)
        .Include(l => l.Uscs2)
        .Include(l => l.UscsDetermination)
        .Include(l => l.Lithostratigraphy)
        .Include(l => l.Humidity)
        .Include(l => l.Gradation)
        .Include(l => l.LithologyTopBedrock)
        .Include(l => l.LayerColorCodes)
        .Include(l => l.ColorCodelists)
        .Include(l => l.LayerGrainShapeCodes)
        .Include(l => l.GrainShapeCodelists)
        .Include(l => l.LayerDebrisCodes)
        .Include(l => l.DebrisCodelists)
        .Include(l => l.LayerGrainAngularityCodes)
        .Include(l => l.GrainAngularityCodelists)
        .Include(l => l.LayerUscs3Codes)
        .Include(l => l.Uscs3Codelists)
        .Include(l => l.LayerOrganicComponentCodes)
        .Include(l => l.OrganicComponentCodelists);

    public DbSet<Stratigraphy> Stratigraphies { get; set; }

    public DbSet<StratigraphyV2> StratigraphiesV2 { get; set; }

    public IQueryable<StratigraphyV2> StratigraphiesV2WithIncludes
        => StratigraphiesV2
        .Include(s => s.CreatedBy)
        .Include(s => s.UpdatedBy)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyRockConditionCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyUscsTypeCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyTextureMetaCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentUnconOrganicCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentUnconDebrisCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionGrainShapeCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionGrainAngularityCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionLithologyUnconDebrisCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentConParticleCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionComponentConMineralCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionStructureSynGenCodes)
        .Include(s => s.Lithologies).ThenInclude(l => l.LithologyDescriptions).ThenInclude(ld => ld.LithologyDescriptionStructurePostGenCodes)
        .Include(s => s.LithologicalDescriptions)
        .Include(s => s.FaciesDescriptions)
        .Include(s => s.ChronostratigraphyLayers)
        .Include(s => s.LithostratigraphyLayers);

    public DbSet<Term> Terms { get; set; }

    public DbSet<User> Users { get; set; }

    public IQueryable<User> UsersWithIncludes
        => Users
        .Include(u => u.WorkgroupRoles).ThenInclude(wr => wr.Workgroup)
        .Include(u => u.TermsAccepted).ThenInclude(ta => ta.Term);

    public DbSet<UserWorkgroupRole> UserWorkgroupRoles { get; set; }

    public DbSet<Workflow> Workflows { get; set; }

    public IQueryable<Workflow> WorkflowWithIncludes
        => Workflows
        .Include(w => w.Changes).ThenInclude(wc => wc.CreatedBy)
        .Include(w => w.Changes).ThenInclude(wc => wc.Assignee)
        .Include(w => w.Assignee)
        .Include(w => w.ReviewedTabs)
        .Include(w => w.PublishedTabs);

    public DbSet<WorkflowChange> WorkflowChanges { get; set; }

    public DbSet<Workgroup> Workgroups { get; set; }

    public IQueryable<Workgroup> WorkgroupsWithIncludes => Workgroups.Include(w => w.Boreholes);

    public DbSet<BoreholeFile> BoreholeFiles { get; set; }

    public DbSet<LithologicalDescription> LithologicalDescriptions { get; set; }

    public DbSet<FaciesDescription> FaciesDescriptions { get; set; }

    public IQueryable<FaciesDescription> FaciesDescriptionsWithIncludes => FaciesDescriptions.Include(fd => fd.Facies);

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

    public DbSet<BoreholeCodelist> BoreholeCodelists { get; set; }

    public DbSet<Photo> Photos { get; set; }

    public DbSet<Document> Documents { get; set; }

    public DbSet<LogRun> LogRuns { get; set; }

    public DbSet<LogFile> LogFiles { get; set; }

    public IQueryable<LogRun> LogRunsWithIncludes
        => LogRuns
        .Include(lr => lr.LogFiles).ThenInclude(lf => lf.LogFileToolTypeCodes).ThenInclude(tc => tc.Codelist)
        .Include(lr => lr.ConveyanceMethod)
        .Include(lr => lr.BoreholeStatus)
        .Select(lr => new LogRun
        {
            Id = lr.Id,
            CreatedById = lr.CreatedById,
            Created = lr.Created,
            UpdatedById = lr.UpdatedById,
            Updated = lr.Updated,
            BoreholeId = lr.BoreholeId,
            FromDepth = lr.FromDepth,
            ToDepth = lr.ToDepth,
            RunNumber = lr.RunNumber,
            BitSize = lr.BitSize,
            RunDate = lr.RunDate,
            ServiceCo = lr.ServiceCo,
            Comment = lr.Comment,
            ConveyanceMethodId = lr.ConveyanceMethodId,
            ConveyanceMethod = lr.ConveyanceMethod,
            BoreholeStatusId = lr.BoreholeStatusId,
            BoreholeStatus = lr.BoreholeStatus,

            LogFiles = lr.LogFiles == null ? new List<LogFile>() : lr.LogFiles.Select(lf => new LogFile
            {
                Id = lf.Id,
                LogRunId = lf.LogRunId,
                CreatedById = lf.CreatedById,
                Created = lf.Created,
                UpdatedById = lf.UpdatedById,
                Updated = lf.Updated,
                Name = lf.Name,
                DataPackageId = lf.DataPackageId,
                DepthTypeId = lf.DepthTypeId,
                PassTypeId = lf.PassTypeId,
                DeliveryDate = lf.DeliveryDate,
                NameUuid = lf.NameUuid,
                Public = lf.Public,
                Pass = lf.Pass,
                ToolTypeCodelistIds = lf.LogFileToolTypeCodes == null ?
                    new List<int>() :
                    lf.LogFileToolTypeCodes.Select(tc => tc.CodelistId).ToList(),
                ToolTypeCodelists = null,
            }).ToList(),
        });

    public BdmsContext(DbContextOptions options)
        : base(options)
    {
#pragma warning disable CS0618 // Type or member is obsolete, however they do not plan on removing it any time soon.
        // TODO: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/851
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
        modelBuilder.HasDefaultSchema(BoreholesDatabaseSchemaName);
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

        modelBuilder.Entity<Borehole>().HasOne(l => l.ChronostratigraphyTopBedrock).WithMany().HasForeignKey(l => l.ChronostratigraphyTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Type).WithMany().HasForeignKey(l => l.TypeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Hrs).WithMany().HasForeignKey(l => l.HrsId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LithologyTopBedrock).WithMany().HasForeignKey(l => l.LithologyTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LithostratigraphyTopBedrock).WithMany().HasForeignKey(l => l.LithostratigraphyTopBedrockId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.Purpose).WithMany().HasForeignKey(l => l.PurposeId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.DepthPrecision).WithMany().HasForeignKey(l => l.DepthPrecisionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.ElevationPrecision).WithMany().HasForeignKey(l => l.ElevationPrecisionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.LocationPrecision).WithMany().HasForeignKey(l => l.LocationPrecisionId);
        modelBuilder.Entity<Borehole>().HasOne(l => l.ReferenceElevationPrecision).WithMany().HasForeignKey(l => l.ReferenceElevationPrecisionId);
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
        modelBuilder.Entity<Codelist>().Property(b => b.Conf).HasColumnType("json");

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

        modelBuilder.Entity<Workflow>().HasOne(w => w.Borehole).WithOne(b => b.Workflow).HasForeignKey<Workflow>(w => w.BoreholeId);
        modelBuilder.Entity<Workflow>().HasOne(w => w.ReviewedTabs).WithOne().HasForeignKey<Workflow>(w => w.ReviewedTabsId);
        modelBuilder.Entity<Workflow>().HasOne(w => w.PublishedTabs).WithOne().HasForeignKey<Workflow>(w => w.PublishedTabsId);

        modelBuilder.Entity<WorkflowChange>()
            .HasOne(c => c.Workflow)
            .WithMany(w => w.Changes)
            .HasForeignKey(c => c.WorkflowId);

        modelBuilder.Entity<TabStatus>().Property(ts => ts.Location).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Sections).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Geometry).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Lithology).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Chronostratigraphy).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Lithostratigraphy).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Casing).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Instrumentation).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Backfill).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.WaterIngress).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.GroundwaterLevelMeasurement).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.FieldMeasurement).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Hydrotest).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Profiles).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Photos).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Documents).HasDefaultValue(false);
        modelBuilder.Entity<TabStatus>().Property(ts => ts.Log).HasDefaultValue(false);

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

        modelBuilder.Entity<Lithology>().Property(ts => ts.HasBedding).HasDefaultValue(false);
        modelBuilder.Entity<LithologyDescription>().Property(ts => ts.IsFirst).HasDefaultValue(true);
        modelBuilder.Entity<LithologyDescription>().Property(ts => ts.HasStriae).HasDefaultValue(false);

        // Join table for lithology description and codelists with schema name 'component_con_particle'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.ComponentConParticleCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionComponentConParticleCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionComponentConParticleCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionComponentConParticleCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'component_con_mineral'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.ComponentConMineralCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionComponentConMineralCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionComponentConMineralCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionComponentConMineralCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'organic_components'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.ComponentUnconOrganicCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionComponentUnconOrganicCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionComponentUnconOrganicCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionComponentUnconOrganicCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'debris'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.ComponentUnconDebrisCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionComponentUnconDebrisCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionComponentUnconDebrisCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionComponentUnconDebrisCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'grain_shape'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.GrainShapeCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionGrainShapeCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionGrainShapeCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionGrainShapeCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'grain_angularity'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.GrainAngularityCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionGrainAngularityCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionGrainAngularityCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionGrainAngularityCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'lithology_uncon_coarse'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.LithologyUnconDebrisCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionLithologyUnconDebrisCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionLithologyUnconDebrisCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionLithologyUnconDebrisCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'structure_syn_gen'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.StructureSynGenCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionStructureSynGenCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionStructureSynGenCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionStructureSynGenCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology description and codelists with schema name 'structure_post_gen'
        modelBuilder.Entity<LithologyDescription>()
            .HasMany(l => l.StructurePostGenCodelists)
            .WithMany()
            .UsingEntity<LithologyDescriptionStructurePostGenCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyDescriptionStructurePostGenCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.LithologyDescription)
                    .WithMany(b => b.LithologyDescriptionStructurePostGenCodes)
                    .HasForeignKey(l => l.LithologyDescriptionId),
                j => j.HasKey(lc => new { lc.LithologyDescriptionId, lc.CodelistId }));

        // Join table for lithology and codelists with schema name 'rock_condition'
        modelBuilder.Entity<Lithology>()
            .HasMany(l => l.RockConditionCodelists)
            .WithMany()
            .UsingEntity<LithologyRockConditionCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyRockConditionCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Lithology)
                    .WithMany(b => b.LithologyRockConditionCodes)
                    .HasForeignKey(l => l.LithologyId),
                j => j.HasKey(lc => new { lc.LithologyId, lc.CodelistId }));

        // Join table for lithology and codelists with schema name 'lithology_uscs_type'
        modelBuilder.Entity<Lithology>()
            .HasMany(l => l.UscsTypeCodelists)
            .WithMany()
            .UsingEntity<LithologyUscsTypeCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyUscsTypeCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Lithology)
                    .WithMany(b => b.LithologyUscsTypeCodes)
                    .HasForeignKey(l => l.LithologyId),
                j => j.HasKey(lc => new { lc.LithologyId, lc.CodelistId }));

        // Join table for lithology and codelists with schema name 'lithology_texture_meta'
        modelBuilder.Entity<Lithology>()
            .HasMany(l => l.TextureMetaCodelists)
            .WithMany()
            .UsingEntity<LithologyTextureMetaCodes>(
                j => j
                    .HasOne(lc => lc.Codelist)
                    .WithMany(c => c.LithologyTextureMetaCodes)
                    .HasForeignKey(lc => lc.CodelistId),
                j => j
                    .HasOne(lc => lc.Lithology)
                    .WithMany(b => b.LithologyTextureMetaCodes)
                    .HasForeignKey(l => l.LithologyId),
                j => j.HasKey(lc => new { lc.LithologyId, lc.CodelistId }));

        // Join table for log file and codelists with schema name 'log_tool_type'.
        modelBuilder.Entity<LogFile>()
            .Property(lf => lf.Name)
            .IsRequired();
        modelBuilder.Entity<LogFile>()
            .Property(lf => lf.NameUuid)
            .IsRequired();
        modelBuilder.Entity<LogFile>()
            .HasMany(l => l.ToolTypeCodelists)
            .WithMany()
            .UsingEntity<LogFileToolTypeCodes>(
                j => j
                    .HasOne(hc => hc.Codelist)
                    .WithMany(c => c.LogFileToolTypeCodes)
                    .HasForeignKey(hc => hc.CodelistId),
                j => j
                    .HasOne(hc => hc.LogFile)
                    .WithMany(h => h.LogFileToolTypeCodes)
                    .HasForeignKey(hc => hc.LogFileId),
                j => j.HasKey(hc => new { hc.LogFileId, hc.CodelistId }));
    }
}
