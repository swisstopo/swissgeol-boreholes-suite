using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveCodelistDefaultAndBoreholePublic : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "default",
            schema: "bdms",
            table: "codelist");

        migrationBuilder.DropColumn(
            name: "public",
            schema: "bdms",
            table: "borehole");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "default",
            schema: "bdms",
            table: "codelist",
            type: "boolean",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "public",
            schema: "bdms",
            table: "borehole",
            type: "boolean",
            nullable: true);
    }
}
