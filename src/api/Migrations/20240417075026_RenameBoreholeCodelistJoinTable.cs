using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameBoreholeCodelistJoinTable : Migration
{
    private static readonly string[] primaryKeyColumns = new[] { "borehole_id", "identifier_id" };

    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_borehole_codelist_borehole_id_bho_fk",
            schema: "bdms",
            table: "borehole_codelist");

        migrationBuilder.DropForeignKey(
            name: "FK_borehole_codelist_codelist_id_cli_fk",
            schema: "bdms",
            table: "borehole_codelist");

        migrationBuilder.DropPrimaryKey(
            name: "PK_borehole_codelist",
            schema: "bdms",
            table: "borehole_codelist");

        migrationBuilder.DropColumn(
            name: "code_cli",
            schema: "bdms",
            table: "borehole_codelist");

        migrationBuilder.RenameTable(
            name: "borehole_codelist",
            schema: "bdms",
            newName: "borehole_identifiers_codelist",
            newSchema: "bdms");

        migrationBuilder.RenameColumn(
            name: "value_bco",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            newName: "identifier_value");

        migrationBuilder.RenameColumn(
            name: "id_cli_fk",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            newName: "identifier_id");

        migrationBuilder.RenameColumn(
            name: "id_bho_fk",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            newName: "borehole_id");

        migrationBuilder.RenameIndex(
            name: "IX_borehole_codelist_id_cli_fk",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            newName: "IX_borehole_identifiers_codelist_identifier_id");

        migrationBuilder.AddPrimaryKey(
            name: "PK_borehole_identifiers_codelist",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            columns: primaryKeyColumns);

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_identifiers_codelist_borehole_borehole_id",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            column: "borehole_id",
            principalSchema: "bdms",
            principalTable: "borehole",
            principalColumn: "id_bho",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_identifiers_codelist_codelist_identifier_id",
            schema: "bdms",
            table: "borehole_identifiers_codelist",
            column: "identifier_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli",
            onDelete: ReferentialAction.Cascade);
    }
}
