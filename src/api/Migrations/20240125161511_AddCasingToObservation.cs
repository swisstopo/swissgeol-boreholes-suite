using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingToObservation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_observation_casing", schema: "bdms", table: "observation");

        migrationBuilder.DropForeignKey(
            name: "FK_observation_stratigraphy_casing",
            schema: "bdms",
            table: "observation");

        migrationBuilder.DropColumn(name: "casing", schema: "bdms", table: "observation");

        migrationBuilder.AddColumn<int>(
            name: "casing_id",
            schema: "bdms",
            table: "observation",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_observation_casing_id",
            schema: "bdms",
            table: "observation",
            column: "casing_id");

        migrationBuilder.AddForeignKey(
            name: "FK_observation_casing_casing_id",
            schema: "bdms",
            table: "observation",
            column: "casing_id",
            principalSchema: "bdms",
            principalTable: "casing",
            principalColumn: "id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
