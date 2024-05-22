using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveObsoleteGeometryFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
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
