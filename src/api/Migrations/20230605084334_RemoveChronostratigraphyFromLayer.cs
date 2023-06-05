using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveChronostratigraphyFromLayer : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "layer_chronostratigraphy_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropIndex(
            name: "IX_layer_chronostratigraphy_id_cli_fkey",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "chronostratigraphy_id_cli",
            schema: "bdms",
            table: "layer");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
