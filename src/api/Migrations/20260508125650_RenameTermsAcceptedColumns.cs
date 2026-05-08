using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RenameTermsAcceptedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_terms_accepted_terms_id_tes_fk",
                schema: "bdms",
                table: "terms_accepted");

            migrationBuilder.DropForeignKey(
                name: "FK_terms_accepted_users_id_usr_fk",
                schema: "bdms",
                table: "terms_accepted");

            migrationBuilder.RenameColumn(
                name: "accepted_tea",
                schema: "bdms",
                table: "terms_accepted",
                newName: "accepted");

            migrationBuilder.RenameColumn(
                name: "id_tes_fk",
                schema: "bdms",
                table: "terms_accepted",
                newName: "term_id");

            migrationBuilder.RenameColumn(
                name: "id_usr_fk",
                schema: "bdms",
                table: "terms_accepted",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_terms_accepted_id_tes_fk",
                schema: "bdms",
                table: "terms_accepted",
                newName: "IX_terms_accepted_term_id");

            migrationBuilder.AddForeignKey(
                name: "FK_terms_accepted_terms_term_id",
                schema: "bdms",
                table: "terms_accepted",
                column: "term_id",
                principalSchema: "bdms",
                principalTable: "terms",
                principalColumn: "id_tes",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_terms_accepted_users_user_id",
                schema: "bdms",
                table: "terms_accepted",
                column: "user_id",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_terms_accepted_terms_term_id",
                schema: "bdms",
                table: "terms_accepted");

            migrationBuilder.DropForeignKey(
                name: "FK_terms_accepted_users_user_id",
                schema: "bdms",
                table: "terms_accepted");

            migrationBuilder.RenameColumn(
                name: "accepted",
                schema: "bdms",
                table: "terms_accepted",
                newName: "accepted_tea");

            migrationBuilder.RenameColumn(
                name: "term_id",
                schema: "bdms",
                table: "terms_accepted",
                newName: "id_tes_fk");

            migrationBuilder.RenameColumn(
                name: "user_id",
                schema: "bdms",
                table: "terms_accepted",
                newName: "id_usr_fk");

            migrationBuilder.RenameIndex(
                name: "IX_terms_accepted_term_id",
                schema: "bdms",
                table: "terms_accepted",
                newName: "IX_terms_accepted_id_tes_fk");

            migrationBuilder.AddForeignKey(
                name: "FK_terms_accepted_terms_id_tes_fk",
                schema: "bdms",
                table: "terms_accepted",
                column: "id_tes_fk",
                principalSchema: "bdms",
                principalTable: "terms",
                principalColumn: "id_tes",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_terms_accepted_users_id_usr_fk",
                schema: "bdms",
                table: "terms_accepted",
                column: "id_usr_fk",
                principalSchema: "bdms",
                principalTable: "users",
                principalColumn: "id_usr",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
