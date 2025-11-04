using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveLogFileType : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "file_type",
            schema: "bdms",
            table: "log_file");
    }
}
