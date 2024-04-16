using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MigrateSections : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // move sections fields from borehole table to sections tables
        migrationBuilder.Sql(@"
WITH new_sections AS (
    INSERT INTO bdms.section (borehole_id, name)
    SELECT id_bho, 'Section 1'
    FROM bdms.borehole
    WHERE drilling_method_id_cli IS NOT NULL OR  cuttings_id_cli IS NOT NULL OR  spud_date_bho IS NOT NULL OR  drilling_date_bho IS NOT NULL OR  drilling_diameter_bho IS NOT NULL
    RETURNING id, borehole_id
)
INSERT INTO bdms.section_element (section_id, ""order"", from_depth, to_depth, drilling_method_id, cuttings_id, spud_date, drilling_end_date, drilling_diameter)
SELECT new_sections.id, 0, 0, COALESCE(b.total_depth_bho, 0), b.drilling_method_id_cli, b.cuttings_id_cli, DATE(b.spud_date_bho), DATE(b.drilling_date_bho), b.drilling_diameter_bho
FROM new_sections
JOIN bdms.borehole b ON new_sections.borehole_id = b.id_bho;
");

        migrationBuilder.DropForeignKey(
            name: "borehole_cuttings_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropForeignKey(
            name: "borehole_method_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_cuttings_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_method_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "cuttings_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "drilling_date_bho",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "drilling_diameter_bho",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "drilling_method_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "spud_date_bho",
            schema: "bdms",
            table: "borehole");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
