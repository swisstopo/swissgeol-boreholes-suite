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
            UPDATE bdms.codelist SET schema_cli = 'backfill_type' WHERE schema_cli = 'fill100';
            UPDATE bdms.codelist SET schema_cli = 'backfill_material' WHERE schema_cli = 'fill200';
            UPDATE bdms.codelist SET schema_cli = 'location_precision' WHERE schema_cli = 'qt_location';
            UPDATE bdms.codelist SET schema_cli = 'elevation_precision' WHERE schema_cli = 'qt_elevation';
            UPDATE bdms.codelist SET schema_cli = 'reference_elevation_type' WHERE schema_cli = 'ibore117';
            UPDATE bdms.codelist SET schema_cli = 'instrument_type' WHERE schema_cli = 'inst100';
            UPDATE bdms.codelist SET schema_cli = 'instrument_status' WHERE schema_cli = 'inst101';
            UPDATE bdms.codelist SET schema_cli = 'uscs_type' WHERE schema_cli = 'mcla101';
            UPDATE bdms.codelist SET schema_cli = 'uscs_determination' WHERE schema_cli = 'mcla104';
            UPDATE bdms.codelist SET schema_cli = 'debris' WHERE schema_cli = 'mcla107';
            UPDATE bdms.codelist SET schema_cli = 'plasticity' WHERE schema_cli = 'mlpr101';
            UPDATE bdms.codelist SET schema_cli = 'compactness' WHERE schema_cli = 'mlpr102';
            UPDATE bdms.codelist SET schema_cli = 'consistency' WHERE schema_cli = 'mlpr103';
            UPDATE bdms.codelist SET schema_cli = 'humidity' WHERE schema_cli = 'mlpr105';
            UPDATE bdms.codelist SET schema_cli = 'alteration' WHERE schema_cli = 'mlpr106';
            UPDATE bdms.codelist SET schema_cli = 'organic_components' WHERE schema_cli = 'mlpr108';
            UPDATE bdms.codelist SET schema_cli = 'grain_size' WHERE schema_cli = 'mlpr109';
            UPDATE bdms.codelist SET schema_cli = 'grain_shape' WHERE schema_cli = 'mlpr110';
            UPDATE bdms.codelist SET schema_cli = 'description_quality' WHERE schema_cli = 'qt_description';
            UPDATE bdms.codelist SET schema_cli = 'colour' WHERE schema_cli = 'mlpr112';
            UPDATE bdms.codelist SET schema_cli = 'grain_angularity' WHERE schema_cli = 'mlpr115';
            UPDATE bdms.codelist SET schema_cli = 'cohesion' WHERE schema_cli = 'mlpr116';
            DELETE FROM bdms.codelist WHERE schema_cli = 'casi100';
            DELETE FROM bdms.codelist WHERE schema_cli = 'casi101';");
    }
}
