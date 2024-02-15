using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddStratigraphyQuality : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "quality_id",
            schema: "bdms",
            table: "stratigraphy",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_quality_id_sty",
            schema: "bdms",
            table: "stratigraphy",
            column: "quality_id");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_codelist_quality_id_sty",
            schema: "bdms",
            table: "stratigraphy",
            column: "quality_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
