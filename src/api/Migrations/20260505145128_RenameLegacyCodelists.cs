using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameLegacyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist SET schema_cli = 'drilling_purpose'       WHERE schema_cli = 'extended.purpose';
            UPDATE bdms.codelist SET schema_cli = 'borehole_status'        WHERE schema_cli = 'extended.status';
            UPDATE bdms.codelist SET schema_cli = 'drilling_method'        WHERE schema_cli = 'extended.drilling_method';
            UPDATE bdms.codelist SET schema_cli = 'borehole_cuttings_core' WHERE schema_cli = 'custom.cuttings';
        ");
    }
}
