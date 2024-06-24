using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveObsoleteGeometryFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create two point geometries for boreholes where inclination_bho and inclination_direction_bho is defined
        migrationBuilder.Sql(@"
WITH geometry AS (
    SELECT b.id_bho, b.inclination_bho devi, b.inclination_direction_bho hazi, b.total_depth_bho md, radians(b.inclination_bho) devi_rad, radians(b.inclination_direction_bho) hazi_rad
    FROM bdms.borehole b
    WHERE b.inclination_bho IS NOT NULL AND b.inclination_direction_bho IS NOT NULL AND b.total_depth_bho IS NOT NULL
)
INSERT INTO bdms.borehole_geometry (borehole_id, ""X"", ""Y"", ""Z"", ""DEVI"", ""HAZI"", ""MD"")
SELECT id_bho, 0 x, 0 y, 0 z, devi, hazi, 0 md
FROM geometry
UNION ALL
SELECT id_bho, sin(hazi_rad) * sin(devi_rad) * md, cos(hazi_rad) * sin(devi_rad) * md, cos(devi_rad) * md, devi, hazi, md
FROM geometry
ORDER BY id_bho, md;
");

        migrationBuilder.DropForeignKey(
            name: "borehole_qt_bore_inc_dir_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropIndex(
            name: "IX_borehole_qt_bore_inc_dir_id_cli_fkey",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "inclination_bho",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "inclination_direction_bho",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.DropColumn(
            name: "qt_inclination_direction_id_cli",
            schema: "bdms",
            table: "borehole");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
