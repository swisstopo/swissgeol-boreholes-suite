using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveDescriptionQuality : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_codelist_qt_description_id",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_codelist_qt_description_id",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropIndex(
            name: "IX_lithological_description_qt_description_id",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropIndex(
            name: "IX_facies_description_qt_description_id",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropColumn(
            name: "qt_description_id",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropColumn(
            name: "qt_description_id",
            schema: "bdms",
            table: "facies_description");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "qt_description_id",
            schema: "bdms",
            table: "lithological_description",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "qt_description_id",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_qt_description_id",
            schema: "bdms",
            table: "lithological_description",
            column: "qt_description_id");

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_qt_description_id",
            schema: "bdms",
            table: "facies_description",
            column: "qt_description_id");

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_codelist_qt_description_id",
            schema: "bdms",
            table: "facies_description",
            column: "qt_description_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_codelist_qt_description_id",
            schema: "bdms",
            table: "lithological_description",
            column: "qt_description_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }
}
