using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveIsCompletionFinishedFromObservation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "completion_finished",
            schema: "bdms",
            table: "observation");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "completion_finished",
            schema: "bdms",
            table: "observation",
            type: "boolean",
            nullable: true);
    }
}
