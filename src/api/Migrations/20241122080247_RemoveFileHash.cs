using Microsoft.EntityFrameworkCore.Migrations;

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveFileHash : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "hash_fil",
            schema: "bdms",
            table: "files");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "hash_fil",
            schema: "bdms",
            table: "files",
            type: "text",
            nullable: false,
            defaultValue: "");
    }
}
