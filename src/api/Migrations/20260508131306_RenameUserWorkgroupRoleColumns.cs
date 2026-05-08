using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameUserWorkgroupRoleColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "user_roles_id_usr_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropForeignKey(
            name: "users_roles_id_wgp_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropForeignKey(
            name: "users_roles_id_rol_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropIndex(
            name: "IX_users_roles_id_rol_fk_fkey",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.RenameColumn(
            name: "id_rol_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "role_id");

        migrationBuilder.RenameColumn(
            name: "id_wgp_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "workgroup_id");

        migrationBuilder.RenameColumn(
            name: "id_usr_fk",
            schema: "bdms",
            table: "users_roles",
            newName: "user_id");

        migrationBuilder.RenameIndex(
            name: "IX_users_roles_id_wgp_fk_fkey",
            schema: "bdms",
            table: "users_roles",
            newName: "IX_users_roles_workgroup_id");

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_users_user_id",
            schema: "bdms",
            table: "users_roles",
            column: "user_id",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_workgroups_workgroup_id",
            schema: "bdms",
            table: "users_roles",
            column: "workgroup_id",
            principalSchema: "bdms",
            principalTable: "workgroups",
            principalColumn: "id_wgp",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_users_roles_users_user_id",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.DropForeignKey(
            name: "FK_users_roles_workgroups_workgroup_id",
            schema: "bdms",
            table: "users_roles");

        migrationBuilder.RenameColumn(
            name: "role_id",
            schema: "bdms",
            table: "users_roles",
            newName: "id_rol_fk");

        migrationBuilder.RenameColumn(
            name: "workgroup_id",
            schema: "bdms",
            table: "users_roles",
            newName: "id_wgp_fk");

        migrationBuilder.RenameColumn(
            name: "user_id",
            schema: "bdms",
            table: "users_roles",
            newName: "id_usr_fk");

        migrationBuilder.RenameIndex(
            name: "IX_users_roles_workgroup_id",
            schema: "bdms",
            table: "users_roles",
            newName: "IX_users_roles_id_wgp_fk");

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_users_id_usr_fk",
            schema: "bdms",
            table: "users_roles",
            column: "id_usr_fk",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_users_roles_workgroups_id_wgp_fk",
            schema: "bdms",
            table: "users_roles",
            column: "id_wgp_fk",
            principalSchema: "bdms",
            principalTable: "workgroups",
            principalColumn: "id_wgp",
            onDelete: ReferentialAction.Cascade);
    }
}
