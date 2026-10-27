using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveValidatorRole : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // No permission check requires the Validator role, so Controller grants its holders the same rights.
        migrationBuilder.Sql(@"
            UPDATE bdms.users_roles SET role_id = 2 WHERE role_id = 3;
            DELETE FROM bdms.roles WHERE id = 3;");

        // Publisher moves from 4 to 3 so the role ids stay contiguous. users_roles references roles,
        // so the new row must exist before the users move to it, and the old one goes last.
        migrationBuilder.Sql(@"
            INSERT INTO bdms.roles (id, name, config) SELECT 3, name, config FROM bdms.roles WHERE id = 4;
            UPDATE bdms.users_roles SET role_id = 3 WHERE role_id = 4;
            DELETE FROM bdms.roles WHERE id = 4;");
    }
}
