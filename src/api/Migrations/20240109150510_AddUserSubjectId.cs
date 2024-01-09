using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSubjectId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "subject_id",
                schema: "bdms",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.DropUniqueConstraint(
                name: "users_username_key",
                table: "users",
                schema: "bdms");

            migrationBuilder.Sql(@"
                UPDATE bdms.users
                SET
                    subject_id = CONCAT('sub_', username),
                    username = CONCAT(SUBSTRING(firstname, 1, 1), '. ', lastname);
            ");

            migrationBuilder.AddUniqueConstraint(
                name: "users_subject_id_unique",
                table: "users",
                column: "subject_id",
                schema: "bdms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "users_subject_id_unique",
                table: "users",
                schema: "bdms");

            migrationBuilder.Sql(@"
                UPDATE bdms.users
                SET username = SUBSTRING(subject_id, 5);");

            migrationBuilder.AddUniqueConstraint(
                name: "users_username_key",
                table: "users",
                column: "username",
                schema: "bdms");

            migrationBuilder.DropColumn(
                name: "subject_id",
                schema: "bdms",
                table: "users");
        }
    }
}
