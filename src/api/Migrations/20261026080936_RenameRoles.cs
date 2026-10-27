using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameRoles : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.roles SET name = 'READER' WHERE id = 0;
            UPDATE bdms.roles SET name = 'EDITOR' WHERE id = 1;
            UPDATE bdms.roles SET name = 'REVIEWER' WHERE id = 2;
            UPDATE bdms.roles SET name = 'PUBLISHER' WHERE id = 3;");
    }
}
