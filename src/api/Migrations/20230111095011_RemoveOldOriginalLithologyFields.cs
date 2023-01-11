using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveOldOriginalLithologyFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "lithok_id_cli",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "unconrocks_id_cli",
            schema: "bdms",
            table: "layer");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "lithok_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "unconrocks_id_cli",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);
    }
}
