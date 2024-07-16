using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameAttributes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_borehole_codelist_kind_id_cli",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.RenameColumn(
            name: "kind_id_cli",
            schema: "bdms",
            table: "borehole",
            newName: "borehole_type_id");

        migrationBuilder.RenameColumn(
            name: "top_bedrock_bho",
            schema: "bdms",
            table: "borehole",
            newName: "top_bedrock_weathered_md");

        migrationBuilder.RenameColumn(
            name: "qt_top_bedrock",
            schema: "bdms",
            table: "borehole",
            newName: "top_bedrock_fresh_md");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_kind_id_cli",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_borehole_type_id");

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_codelist_borehole_type_id",
            schema: "bdms",
            table: "borehole",
            column: "borehole_type_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_borehole_codelist_borehole_type_id",
            schema: "bdms",
            table: "borehole");

        migrationBuilder.RenameColumn(
            name: "borehole_type_id",
            schema: "bdms",
            table: "borehole",
            newName: "kind_id_cli");

        migrationBuilder.RenameColumn(
            name: "top_bedrock_weathered_md",
            schema: "bdms",
            table: "borehole",
            newName: "top_bedrock_bho");

        migrationBuilder.RenameColumn(
            name: "top_bedrock_fresh_md",
            schema: "bdms",
            table: "borehole",
            newName: "qt_top_bedrock");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_borehole_type_id",
            schema: "bdms",
            table: "borehole",
            newName: "IX_borehole_kind_id_cli");

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_codelist_kind_id_cli",
            schema: "bdms",
            table: "borehole",
            column: "kind_id_cli",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }
}
