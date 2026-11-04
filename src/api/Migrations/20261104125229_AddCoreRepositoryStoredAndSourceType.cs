using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCoreRepositoryStoredAndSourceType : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "core_repository_stored",
            schema: "bdms",
            table: "borehole",
            type: "boolean",
            nullable: true);

        // The column is added without a default so existing boreholes stay null ("not specified").
        // Only rows inserted afterwards get false.
        migrationBuilder.Sql("ALTER TABLE bdms.borehole ALTER COLUMN core_repository_stored SET DEFAULT false;");

        migrationBuilder.CreateTable(
            name: "borehole_source_type_codelist",
            schema: "bdms",
            columns: table => new
            {
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                codelist_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_borehole_source_type_codelist", x => new { x.borehole_id, x.codelist_id });
                table.ForeignKey(
                    name: "FK_borehole_source_type_codelist_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_borehole_source_type_codelist_codelist_codelist_id",
                    column: x => x.codelist_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_borehole_source_type_codelist_codelist_id",
            schema: "bdms",
            table: "borehole_source_type_codelist",
            column: "codelist_id");

        migrationBuilder.Sql(@"
            INSERT INTO bdms.codelist(""schema"", code, text_en, text_de, text_fr, text_it, ""order"")
            VALUES
                ('source_type', '', 'driller''s log', 'Bohrmeisterprotokoll', 'journal de forage', 'rapporto dalla perforazione', 1),
                ('source_type', '', 'borehole profile', 'Bohrprofil', 'profil de forage', 'profilo di perforazione', 2),
                ('source_type', '', 'report', 'Bericht', 'rapport', 'rapporto', 3),
                ('source_type', '', 'plan', 'Plan', 'plan', 'piano', 4),
                ('source_type', '', 'other', 'anderer', 'autre', 'altro', 5),
                ('source_type', '', 'not specified', 'keine Angabe', 'sans indication', 'senza indicazioni', 6);");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "borehole_source_type_codelist",
            schema: "bdms");

        migrationBuilder.Sql("DELETE FROM bdms.codelist WHERE \"schema\" = 'source_type';");

        migrationBuilder.DropColumn(
            name: "core_repository_stored",
            schema: "bdms",
            table: "borehole");
    }
}
