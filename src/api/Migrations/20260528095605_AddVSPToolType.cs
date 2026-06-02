using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddVSPToolType : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
        INSERT INTO bdms.codelist(""schema"", code, text_en, text_de, text_fr, text_it, ""order"")
        VALUES ('log_tool_type', 'VSP', 'Vertical seismic profile', 'Vertikales seismisches Profil', 'Profil sismique vertical', 'Profilo sismico verticale', 235);
        ");
    }
}
