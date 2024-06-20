using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingBoreholeFilesConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add missing foreign key constraint to borehole table
            migrationBuilder.AddForeignKey(
                name: "borehole_files_id_bho_fk_fkey",
                schema: "bdms",
                table: "borehole_files",
                column: "id_bho_fk",
                principalSchema: "bdms",
                principalTable: "borehole",
                principalColumn: "id_bho",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.CreateIndex(
                name: "IX_borehole_files_id_bho_fk",
                schema: "bdms",
                table: "borehole_files",
                column: "id_bho_fk");

            // Add missing foreign key constraint to files table
            migrationBuilder.AddForeignKey(
                name: "borehole_files_id_fil_fk_fkey",
                schema: "bdms",
                table: "borehole_files",
                column: "id_fil_fk",
                principalSchema: "bdms",
                principalTable: "files",
                principalColumn: "id_fil",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.CreateIndex(
                name: "IX_borehole_files_id_fil_fk",
                schema: "bdms",
                table: "borehole_files",
                column: "id_fil_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "borehole_files_id_bho_fk_fkey",
                schema: "bdms",
                table: "borehole_files");

            migrationBuilder.DropIndex(
                name: "IX_borehole_files_id_bho_fk",
                schema: "bdms",
                table: "borehole_files");

            migrationBuilder.DropForeignKey(
                name: "borehole_files_id_fil_fk_fkey",
                schema: "bdms",
                table: "borehole_files");

            migrationBuilder.DropIndex(
                name: "IX_borehole_files_id_fil_fk",
                schema: "bdms",
                table: "borehole_files");
        }
    }
}
