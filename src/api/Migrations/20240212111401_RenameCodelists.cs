using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist SET schema_cli = 'casing_type' WHERE schema_cli = 'casi200';
            UPDATE bdms.codelist SET schema_cli = 'casing_material' WHERE schema_cli = 'casi201';
            UPDATE bdms.codelist SET schema_cli = 'borehole_cuttings_core' WHERE schema_cli = 'custom.cuttings';
            UPDATE bdms.codelist SET schema_cli = 'drilling_purpose' WHERE schema_cli = 'extended.purpose';
            UPDATE bdms.codelist SET schema_cli = 'borehole_status' WHERE schema_cli = 'extended.status';
            UPDATE bdms.codelist SET schema_cli = 'drilling_method' WHERE schema_cli = 'extended.drilling_method';
            UPDATE bdms.codelist SET schema_cli = 'depth_precision' WHERE schema_cli = 'custom.qt_top_bedrock';
            UPDATE bdms.codelist SET schema_cli = 'inclination_precision' WHERE schema_cli = 'custom.qt_bore_inc_dir';
            UPDATE bdms.codelist SET schema_cli = 'backfill_type' WHERE schema_cli = 'fill100';
            UPDATE bdms.codelist SET schema_cli = 'backfill_material' WHERE schema_cli = 'fill200';");
    }
}
