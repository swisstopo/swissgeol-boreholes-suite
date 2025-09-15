using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveLithologicalDescriptionFromLithology : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_lithology_lithological_description_description",
            schema: "bdms",
            table: "lithology");

        migrationBuilder.DropIndex(
            name: "IX_lithology_description",
            schema: "bdms",
            table: "lithology");

        migrationBuilder.DropColumn(
            name: "description",
            schema: "bdms",
            table: "lithology");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "description",
            schema: "bdms",
            table: "lithology",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description",
            schema: "bdms",
            table: "lithology",
            column: "description");

        migrationBuilder.AddForeignKey(
            name: "FK_lithology_lithological_description_description",
            schema: "bdms",
            table: "lithology",
            column: "description",
            principalSchema: "bdms",
            principalTable: "lithological_description",
            principalColumn: "id_ldp");
    }
}
