using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MakeBitSizeNullable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<double>(
            name: "bit_size",
            schema: "bdms",
            table: "log_run",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<double>(
            name: "bit_size",
            schema: "bdms",
            table: "log_run",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);
    }
}
#pragma warning restore CA1505
