using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class RenameLithologyDescriptionJoinTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "lithology_description_description_debris_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_organic_component_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_uncon_coarse_codelist",
            schema: "bdms");

        migrationBuilder.CreateTable(
            name: "lithology_description_component_uncon_debris_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                component_uncon_debris_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_component_uncon_debris_codelist", x => new { x.lithology_description_id, x.component_uncon_debris_id });
                table.ForeignKey(
                    name: "FK_lithology_description_component_uncon_debris_codelist_codel~",
                    column: x => x.component_uncon_debris_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_component_uncon_debris_codelist_litho~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_component_uncon_organic_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                component_uncon_organic_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_component_uncon_organic_codelist", x => new { x.lithology_description_id, x.component_uncon_organic_id });
                table.ForeignKey(
                    name: "FK_lithology_description_component_uncon_organic_codelist_code~",
                    column: x => x.component_uncon_organic_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_component_uncon_organic_codelist_lith~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_lithology_uncon_debris_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_uncon_debris_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_lithology_uncon_debris_codelist", x => new { x.lithology_description_id, x.lithology_uncon_debris_id });
                table.ForeignKey(
                    name: "FK_lithology_description_lithology_uncon_debris_codelist_codel~",
                    column: x => x.lithology_uncon_debris_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_lithology_uncon_debris_codelist_litho~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_component_uncon_debris_codelist_compo~",
            schema: "bdms",
            table: "lithology_description_component_uncon_debris_codelist",
            column: "component_uncon_debris_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_component_uncon_organic_codelist_comp~",
            schema: "bdms",
            table: "lithology_description_component_uncon_organic_codelist",
            column: "component_uncon_organic_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_debris_codelist_litho~",
            schema: "bdms",
            table: "lithology_description_lithology_uncon_debris_codelist",
            column: "lithology_uncon_debris_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "lithology_description_component_uncon_debris_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_component_uncon_organic_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_lithology_uncon_debris_codelist",
            schema: "bdms");

        migrationBuilder.CreateTable(
            name: "lithology_description_description_debris_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                debris_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_description_debris_codelist", x => new { x.lithology_description_id, x.debris_id });
                table.ForeignKey(
                    name: "FK_lithology_description_description_debris_codelist_codelist_~",
                    column: x => x.debris_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_description_debris_codelist_lithology~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_organic_component_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                organic_components_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_organic_component_codelist", x => new { x.lithology_description_id, x.organic_components_id });
                table.ForeignKey(
                    name: "FK_lithology_description_organic_component_codelist_codelist_o~",
                    column: x => x.organic_components_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_organic_component_codelist_lithology_~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_uncon_coarse_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_uncon_coarse_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_uncon_coarse_codelist", x => new { x.lithology_description_id, x.lithology_uncon_coarse_id });
                table.ForeignKey(
                    name: "FK_lithology_description_uncon_coarse_codelist_codelist_lithol~",
                    column: x => x.lithology_uncon_coarse_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_uncon_coarse_codelist_lithology_descr~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_description_debris_codelist_debris_id",
            schema: "bdms",
            table: "lithology_description_description_debris_codelist",
            column: "debris_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_organic_component_codelist_organic_co~",
            schema: "bdms",
            table: "lithology_description_organic_component_codelist",
            column: "organic_components_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_uncon_coarse_codelist_lithology_uncon~",
            schema: "bdms",
            table: "lithology_description_uncon_coarse_codelist",
            column: "lithology_uncon_coarse_id");
    }
}
#pragma warning restore CA1505
