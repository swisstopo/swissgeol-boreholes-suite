using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveField : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_lithology_texture_meta_codelist_lithology_description_Litho~",
            schema: "bdms",
            table: "lithology_texture_meta_codelist");

        migrationBuilder.DropIndex(
            name: "IX_lithology_texture_meta_codelist_LithologyDescriptionId",
            schema: "bdms",
            table: "lithology_texture_meta_codelist");

        migrationBuilder.DropColumn(
            name: "LithologyDescriptionId",
            schema: "bdms",
            table: "lithology_texture_meta_codelist");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "LithologyDescriptionId",
            schema: "bdms",
            table: "lithology_texture_meta_codelist",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_lithology_texture_meta_codelist_LithologyDescriptionId",
            schema: "bdms",
            table: "lithology_texture_meta_codelist",
            column: "LithologyDescriptionId");

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_texture_meta_codelist_lithology_description_Litho~",
            schema: "bdms",
            table: "lithology_texture_meta_codelist",
            column: "LithologyDescriptionId",
            principalSchema: "bdms",
            principalTable: "lithology_description",
            principalColumn: "id");
    }
}
