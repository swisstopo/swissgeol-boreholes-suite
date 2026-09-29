using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MakeLogFileNameUuidNullable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // A log file record created by CSV import exists before its attachment is uploaded,
        // and a null object key is what marks that state.
        migrationBuilder.AlterColumn<string>(
            name: "name_uuid",
            schema: "bdms",
            table: "log_file",
            type: "text",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "text");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "name_uuid",
            schema: "bdms",
            table: "log_file",
            type: "text",
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "text",
            oldNullable: true);
    }
}
