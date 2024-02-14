using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RenameMoreCodelists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            UPDATE bdms.codelist SET schema_cli = 'borehole_type' WHERE schema_cli = 'kind';
            UPDATE bdms.codelist SET schema_cli = 'spatial_reference_system' WHERE schema_cli = 'srs';
            UPDATE bdms.codelist SET schema_cli = 'height_reference_system' WHERE schema_cli = 'hrs'; 
            UPDATE bdms.codelist SET schema_cli = 'countries' WHERE schema_cli = 'country'; ");
        }
    }
}
