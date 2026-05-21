using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameCodelistColumn : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "text_cli_ro",
            schema: "bdms",
            table: "codelist",
            newName: "text_ro");

        migrationBuilder.RenameColumn(
            name: "text_cli_it",
            schema: "bdms",
            table: "codelist",
            newName: "text_it");

        migrationBuilder.RenameColumn(
            name: "text_cli_fr",
            schema: "bdms",
            table: "codelist",
            newName: "text_fr");

        migrationBuilder.RenameColumn(
            name: "text_cli_en",
            schema: "bdms",
            table: "codelist",
            newName: "text_en");

        migrationBuilder.RenameColumn(
            name: "text_cli_de",
            schema: "bdms",
            table: "codelist",
            newName: "text_de");

        migrationBuilder.RenameColumn(
            name: "schema_cli",
            schema: "bdms",
            table: "codelist",
            newName: "schema");

        migrationBuilder.RenameColumn(
            name: "path_cli",
            schema: "bdms",
            table: "codelist",
            newName: "path");

        migrationBuilder.RenameColumn(
            name: "order_cli",
            schema: "bdms",
            table: "codelist",
            newName: "order");

        migrationBuilder.RenameColumn(
            name: "default_cli",
            schema: "bdms",
            table: "codelist",
            newName: "default");

        migrationBuilder.RenameColumn(
            name: "conf_cli",
            schema: "bdms",
            table: "codelist",
            newName: "conf");

        migrationBuilder.RenameColumn(
            name: "code_cli",
            schema: "bdms",
            table: "codelist",
            newName: "code");

        migrationBuilder.RenameColumn(
            name: "id_cli",
            schema: "bdms",
            table: "codelist",
            newName: "id");
    }
}
