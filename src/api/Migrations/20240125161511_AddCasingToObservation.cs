using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingToObservation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_observation_stratigraphy_casing",
            schema: "bdms",
            table: "observation");

        migrationBuilder.RenameColumn(
            name: "casing",
            schema: "bdms",
            table: "observation",
            newName: "casing_id");

        migrationBuilder.RenameIndex(
            name: "IX_observation_casing",
            schema: "bdms",
            table: "observation",
            newName: "IX_observation_casing_id");

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
