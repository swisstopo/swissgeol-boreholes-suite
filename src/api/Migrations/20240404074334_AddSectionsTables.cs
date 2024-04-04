using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddSectionsTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "section",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_section", x => x.id);
                table.ForeignKey(
                    name: "FK_section_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_section_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_section_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "section_element",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                section_id = table.Column<int>(type: "integer", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: false),
                to_depth = table.Column<double>(type: "double precision", nullable: false),
                order = table.Column<int>(type: "integer", nullable: false),
                drilling_method_id_cli = table.Column<int>(type: "integer", nullable: true),
                spud_date = table.Column<DateOnly>(type: "date", nullable: true),
                drilling_end_date = table.Column<DateOnly>(type: "date", nullable: true),
                cuttings_id_cli = table.Column<int>(type: "integer", nullable: true),
                drilling_diameter = table.Column<double>(type: "double precision", nullable: true),
                drilling_core_diameter = table.Column<double>(type: "double precision", nullable: true),
                mud_type_id_cli = table.Column<int>(type: "integer", nullable: true),
                mud_subtype_id_cli = table.Column<int>(type: "integer", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_section_element", x => x.id);
                table.ForeignKey(
                    name: "FK_section_element_codelist_cuttings_id_cli",
                    column: x => x.cuttings_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_section_element_codelist_drilling_method_id_cli",
                    column: x => x.drilling_method_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_section_element_codelist_mud_subtype_id_cli",
                    column: x => x.mud_subtype_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_section_element_codelist_mud_type_id_cli",
                    column: x => x.mud_type_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_section_element_section_section_id",
                    column: x => x.section_id,
                    principalSchema: "bdms",
                    principalTable: "section",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_section_element_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_section_element_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_section_borehole_id",
            schema: "bdms",
            table: "section",
            column: "borehole_id");

        migrationBuilder.CreateIndex(
            name: "IX_section_creator",
            schema: "bdms",
            table: "section",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_section_updater",
            schema: "bdms",
            table: "section",
            column: "updater");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_creator",
            schema: "bdms",
            table: "section_element",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_cuttings_id_cli",
            schema: "bdms",
            table: "section_element",
            column: "cuttings_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_drilling_method_id_cli",
            schema: "bdms",
            table: "section_element",
            column: "drilling_method_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_mud_subtype_id_cli",
            schema: "bdms",
            table: "section_element",
            column: "mud_subtype_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_mud_type_id_cli",
            schema: "bdms",
            table: "section_element",
            column: "mud_type_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_section_id",
            schema: "bdms",
            table: "section_element",
            column: "section_id");

        migrationBuilder.CreateIndex(
            name: "IX_section_element_updater",
            schema: "bdms",
            table: "section_element",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "section_element",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "section",
            schema: "bdms");
    }
}
