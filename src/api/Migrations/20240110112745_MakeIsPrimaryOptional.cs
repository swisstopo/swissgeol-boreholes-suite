using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MakeIsPrimaryOptional : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<bool>(
        name: "is_primary",
        schema: "bdms",
        table: "completion",
        type: "boolean",
        nullable: true,
        oldClrType: typeof(bool),
        oldType: "boolean");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
