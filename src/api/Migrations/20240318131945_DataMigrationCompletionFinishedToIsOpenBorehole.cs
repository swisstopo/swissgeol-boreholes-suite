using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DataMigrationCompletionFinishedToIsOpenBorehole : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"UPDATE bdms.observation SET is_open_borehole = NOT completion_finished;");
    }
}
