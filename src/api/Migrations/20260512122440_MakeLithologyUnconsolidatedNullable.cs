using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MakeLithologyUnconsolidatedNullable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
            name: "unconsolidated",
            schema: "bdms",
            table: "lithology",
            type: "boolean",
            nullable: true,
            oldClrType: typeof(bool),
            oldType: "boolean");
    }
}
