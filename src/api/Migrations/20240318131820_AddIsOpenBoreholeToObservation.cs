using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddIsOpenBoreholeToObservation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "is_open_borehole",
            schema: "bdms",
            table: "observation",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.Sql(@"UPDATE bdms.observation SET is_open_borehole = NOT completion_finished;");
    }
}
