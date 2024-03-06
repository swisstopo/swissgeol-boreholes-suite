using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingToBackfill : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "casing_id",
            schema: "bdms",
            table: "backfill",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_backfill_casing_id",
            schema: "bdms",
            table: "backfill",
            column: "casing_id");

        migrationBuilder.AddForeignKey(
            name: "FK_backfill_casing_casing_id",
            schema: "bdms",
            table: "backfill",
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
