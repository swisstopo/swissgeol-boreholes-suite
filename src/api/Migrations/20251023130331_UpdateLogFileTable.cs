using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class UpdateLogFileTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "name_uuid",
            schema: "bdms",
            table: "log_file",
            type: "text",
            nullable: false,
            defaultValue: null,
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);
    }
}
