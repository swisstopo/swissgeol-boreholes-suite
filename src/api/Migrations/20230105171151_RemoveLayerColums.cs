using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveLayerColums : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "kirost_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "soil_state_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "symbol_id_cli",
            schema: "bdms",
            table: "layer");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "kirost_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "soil_state_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "symbol_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);
    }
}
