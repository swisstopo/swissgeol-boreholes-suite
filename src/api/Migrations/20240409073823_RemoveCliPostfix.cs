using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCliPostfix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_cuttings_id_cli",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_drilling_method_id_cli",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_mud_subtype_id_cli",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_mud_type_id_cli",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.RenameColumn(
                name: "mud_type_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "mud_type_id");

            migrationBuilder.RenameColumn(
                name: "mud_subtype_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "mud_subtype_id");

            migrationBuilder.RenameColumn(
                name: "drilling_method_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "drilling_method_id");

            migrationBuilder.RenameColumn(
                name: "cuttings_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "cuttings_id");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_mud_type_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_mud_type_id");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_mud_subtype_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_mud_subtype_id");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_drilling_method_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_drilling_method_id");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_cuttings_id_cli",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_cuttings_id");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_cuttings_id",
                schema: "bdms",
                table: "section_element",
                column: "cuttings_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_drilling_method_id",
                schema: "bdms",
                table: "section_element",
                column: "drilling_method_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_mud_subtype_id",
                schema: "bdms",
                table: "section_element",
                column: "mud_subtype_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_mud_type_id",
                schema: "bdms",
                table: "section_element",
                column: "mud_type_id",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_cuttings_id",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_drilling_method_id",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_mud_subtype_id",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.DropForeignKey(
                name: "FK_section_element_codelist_mud_type_id",
                schema: "bdms",
                table: "section_element");

            migrationBuilder.RenameColumn(
                name: "mud_type_id",
                schema: "bdms",
                table: "section_element",
                newName: "mud_type_id_cli");

            migrationBuilder.RenameColumn(
                name: "mud_subtype_id",
                schema: "bdms",
                table: "section_element",
                newName: "mud_subtype_id_cli");

            migrationBuilder.RenameColumn(
                name: "drilling_method_id",
                schema: "bdms",
                table: "section_element",
                newName: "drilling_method_id_cli");

            migrationBuilder.RenameColumn(
                name: "cuttings_id",
                schema: "bdms",
                table: "section_element",
                newName: "cuttings_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_mud_type_id",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_mud_type_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_mud_subtype_id",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_mud_subtype_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_drilling_method_id",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_drilling_method_id_cli");

            migrationBuilder.RenameIndex(
                name: "IX_section_element_cuttings_id",
                schema: "bdms",
                table: "section_element",
                newName: "IX_section_element_cuttings_id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_cuttings_id_cli",
                schema: "bdms",
                table: "section_element",
                column: "cuttings_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_drilling_method_id_cli",
                schema: "bdms",
                table: "section_element",
                column: "drilling_method_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_mud_subtype_id_cli",
                schema: "bdms",
                table: "section_element",
                column: "mud_subtype_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_section_element_codelist_mud_type_id_cli",
                schema: "bdms",
                table: "section_element",
                column: "mud_type_id_cli",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");
        }
    }
}
