using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameTermsColumns : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn(
            name: "text_tes_ro",
            schema: "bdms",
            table: "terms",
            newName: "text_ro");

        migrationBuilder.RenameColumn(
            name: "text_tes_it",
            schema: "bdms",
            table: "terms",
            newName: "text_it");

        migrationBuilder.RenameColumn(
            name: "text_tes_fr",
            schema: "bdms",
            table: "terms",
            newName: "text_fr");

        migrationBuilder.RenameColumn(
            name: "text_tes_en",
            schema: "bdms",
            table: "terms",
            newName: "text_en");

        migrationBuilder.RenameColumn(
            name: "text_tes_de",
            schema: "bdms",
            table: "terms",
            newName: "text_de");

        migrationBuilder.RenameColumn(
            name: "expired_tes",
            schema: "bdms",
            table: "terms",
            newName: "expired");

        migrationBuilder.RenameColumn(
            name: "draft_tes",
            schema: "bdms",
            table: "terms",
            newName: "draft");

        migrationBuilder.RenameColumn(
            name: "creation_tes",
            schema: "bdms",
            table: "terms",
            newName: "creation");

        migrationBuilder.RenameColumn(
            name: "id_tes",
            schema: "bdms",
            table: "terms",
            newName: "id");
    }
}
