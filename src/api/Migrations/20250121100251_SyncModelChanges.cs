using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class SyncModelChanges : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "conf_cli",
            schema: "bdms",
            table: "codelist",
            type: "json",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "conf_cli",
            schema: "bdms",
            table: "codelist",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "json",
            oldNullable: true);
    }
}
