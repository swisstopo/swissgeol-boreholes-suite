using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveImportIds : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "import_id",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.DropColumn(
            name: "import_id",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropColumn(
            name: "import_id",
            schema: "bdms",
            table: "borehole");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "import_id",
            schema: "bdms",
            table: "stratigraphy",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "import_id",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "import_id",
            schema: "bdms",
            table: "borehole",
            type: "integer",
            nullable: true);
    }
}
