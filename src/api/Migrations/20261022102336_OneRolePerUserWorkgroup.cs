using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class OneRolePerUserWorkgroup : Migration
{
    private static readonly string[] UserWorkgroupKeyColumns = ["user_id", "workgroup_id"];

    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Roles are hierarchical, so only the highest role per user and workgroup carries permissions.
        migrationBuilder.Sql(@"
            DELETE FROM bdms.users_roles AS lower
            USING bdms.users_roles AS higher
            WHERE higher.user_id = lower.user_id
              AND higher.workgroup_id = lower.workgroup_id
              AND higher.role_id > lower.role_id;");

        migrationBuilder.DropPrimaryKey(
            name: "users_roles_pkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.AddPrimaryKey(
            name: "PK_users_roles",
            schema: "bdms",
            table: "users_roles",
            columns: UserWorkgroupKeyColumns);
    }
}
