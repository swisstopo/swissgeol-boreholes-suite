using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveTectonicIds : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "tectonic_unit_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "tecto_id_cli",
            schema: "bdms",
            table: "borehole");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "tectonic_unit_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "tecto_id_cli",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true);
    }
}
