using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RemoveLegacyStratigraphy : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "layer_color_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_debris_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_grain_angularity_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_grain_shape_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_organic_component_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer_uscs3_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "layer",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "stratigraphy",
            schema: "bdms");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "stratigraphy",
            schema: "bdms",
            columns: table => new
            {
                id_sty = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                id_bho_fk = table.Column<int>(type: "integer", nullable: true),
                author_sty = table.Column<int>(type: "integer", nullable: true),
                quality_id = table.Column<int>(type: "integer", nullable: true),
                updater_sty = table.Column<int>(type: "integer", nullable: true),
                creation_sty = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                date_sty = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                primary_sty = table.Column<bool>(type: "boolean", nullable: true),
                name_sty = table.Column<string>(type: "text", nullable: true),
                notes_sty = table.Column<string>(type: "text", nullable: true),
                update_sty = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_stratigraphy", x => x.id_sty);
                table.ForeignKey(
                    name: "FK_stratigraphy_borehole_id_bho_fk",
                    column: x => x.id_bho_fk,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho");
                table.ForeignKey(
                    name: "FK_stratigraphy_codelist_quality_id",
                    column: x => x.quality_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_stratigraphy_users_author_sty",
                    column: x => x.author_sty,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_stratigraphy_users_updater_sty",
                    column: x => x.updater_sty,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "layer",
            schema: "bdms",
            columns: table => new
            {
                id_lay = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                alteration_id_cli = table.Column<int>(type: "integer", nullable: true),
                cohesion_id_cli = table.Column<int>(type: "integer", nullable: true),
                compactness_id_cli = table.Column<int>(type: "integer", nullable: true),
                consistance_id_cli = table.Column<int>(type: "integer", nullable: true),
                creator_lay = table.Column<int>(type: "integer", nullable: true),
                qt_description_id_cli = table.Column<int>(type: "integer", nullable: true),
                gradation_id_cli = table.Column<int>(type: "integer", nullable: true),
                grain_size_1_id_cli = table.Column<int>(type: "integer", nullable: true),
                grain_size_2_id_cli = table.Column<int>(type: "integer", nullable: true),
                humidity_id_cli = table.Column<int>(type: "integer", nullable: true),
                lithology_id_cli = table.Column<int>(type: "integer", nullable: true),
                lithology_top_bedrock_id_cli = table.Column<int>(type: "integer", nullable: true),
                lithostratigraphy_id_cli = table.Column<int>(type: "integer", nullable: true),
                plasticity_id_cli = table.Column<int>(type: "integer", nullable: true),
                id_sty_fk = table.Column<int>(type: "integer", nullable: false),
                updater_lay = table.Column<int>(type: "integer", nullable: true),
                uscs_1_id_cli = table.Column<int>(type: "integer", nullable: true),
                uscs_2_id_cli = table.Column<int>(type: "integer", nullable: true),
                uscs_determination_id_cli = table.Column<int>(type: "integer", nullable: true),
                creation_lay = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                depth_from_lay = table.Column<double>(type: "double precision", nullable: true),
                last_lay = table.Column<bool>(type: "boolean", nullable: true),
                striae_lay = table.Column<bool>(type: "boolean", nullable: true),
                undefined_lay = table.Column<bool>(type: "boolean", nullable: true),
                notes_lay = table.Column<string>(type: "text", nullable: true),
                original_lithology = table.Column<string>(type: "text", nullable: true),
                uscs_original_lay = table.Column<string>(type: "text", nullable: true),
                depth_to_lay = table.Column<double>(type: "double precision", nullable: true),
                update_lay = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer", x => x.id_lay);
                table.ForeignKey(
                    name: "FK_layer_codelist_alteration_id_cli",
                    column: x => x.alteration_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_cohesion_id_cli",
                    column: x => x.cohesion_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_compactness_id_cli",
                    column: x => x.compactness_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_consistance_id_cli",
                    column: x => x.consistance_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_gradation_id_cli",
                    column: x => x.gradation_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_grain_size_1_id_cli",
                    column: x => x.grain_size_1_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_grain_size_2_id_cli",
                    column: x => x.grain_size_2_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_humidity_id_cli",
                    column: x => x.humidity_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_lithology_id_cli",
                    column: x => x.lithology_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_lithology_top_bedrock_id_cli",
                    column: x => x.lithology_top_bedrock_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_lithostratigraphy_id_cli",
                    column: x => x.lithostratigraphy_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_plasticity_id_cli",
                    column: x => x.plasticity_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_qt_description_id_cli",
                    column: x => x.qt_description_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_uscs_1_id_cli",
                    column: x => x.uscs_1_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_uscs_2_id_cli",
                    column: x => x.uscs_2_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_codelist_uscs_determination_id_cli",
                    column: x => x.uscs_determination_id_cli,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_layer_stratigraphy_id_sty_fk",
                    column: x => x.id_sty_fk,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_users_creator_lay",
                    column: x => x.creator_lay,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_layer_users_updater_lay",
                    column: x => x.updater_lay,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "layer_color_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                color_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_color_codelist", x => new { x.layer_id, x.color_id });
                table.ForeignKey(
                    name: "FK_layer_color_codelist_codelist_color_id",
                    column: x => x.color_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_color_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_debris_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                debris_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_debris_codelist", x => new { x.layer_id, x.debris_id });
                table.ForeignKey(
                    name: "FK_layer_debris_codelist_codelist_debris_id",
                    column: x => x.debris_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_debris_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_grain_angularity_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                grain_angularity_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_grain_angularity_codelist", x => new { x.layer_id, x.grain_angularity_id });
                table.ForeignKey(
                    name: "FK_layer_grain_angularity_codelist_codelist_grain_angularity_id",
                    column: x => x.grain_angularity_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_grain_angularity_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_grain_shape_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                grain_shape_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_grain_shape_codelist", x => new { x.layer_id, x.grain_shape_id });
                table.ForeignKey(
                    name: "FK_layer_grain_shape_codelist_codelist_grain_shape_id",
                    column: x => x.grain_shape_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_grain_shape_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_organic_component_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                organic_components_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_organic_component_codelist", x => new { x.layer_id, x.organic_components_id });
                table.ForeignKey(
                    name: "FK_layer_organic_component_codelist_codelist_organic_component~",
                    column: x => x.organic_components_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_organic_component_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "layer_uscs3_codelist",
            schema: "bdms",
            columns: table => new
            {
                layer_id = table.Column<int>(type: "integer", nullable: false),
                uscs3_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_layer_uscs3_codelist", x => new { x.layer_id, x.uscs3_id });
                table.ForeignKey(
                    name: "FK_layer_uscs3_codelist_codelist_uscs3_id",
                    column: x => x.uscs3_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_layer_uscs3_codelist_layer_layer_id",
                    column: x => x.layer_id,
                    principalSchema: "bdms",
                    principalTable: "layer",
                    principalColumn: "id_lay",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_layer_alteration_id_cli",
            schema: "bdms",
            table: "layer",
            column: "alteration_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_cohesion_id_cli",
            schema: "bdms",
            table: "layer",
            column: "cohesion_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_compactness_id_cli",
            schema: "bdms",
            table: "layer",
            column: "compactness_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_consistance_id_cli",
            schema: "bdms",
            table: "layer",
            column: "consistance_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_creator_lay",
            schema: "bdms",
            table: "layer",
            column: "creator_lay");

        migrationBuilder.CreateIndex(
            name: "IX_layer_gradation_id_cli",
            schema: "bdms",
            table: "layer",
            column: "gradation_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_size_1_id_cli",
            schema: "bdms",
            table: "layer",
            column: "grain_size_1_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_size_2_id_cli",
            schema: "bdms",
            table: "layer",
            column: "grain_size_2_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_humidity_id_cli",
            schema: "bdms",
            table: "layer",
            column: "humidity_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_id_sty_fk",
            schema: "bdms",
            table: "layer",
            column: "id_sty_fk");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithology_id_cli",
            schema: "bdms",
            table: "layer",
            column: "lithology_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithology_top_bedrock_id_cli",
            schema: "bdms",
            table: "layer",
            column: "lithology_top_bedrock_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_lithostratigraphy_id_cli",
            schema: "bdms",
            table: "layer",
            column: "lithostratigraphy_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_plasticity_id_cli",
            schema: "bdms",
            table: "layer",
            column: "plasticity_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_qt_description_id_cli",
            schema: "bdms",
            table: "layer",
            column: "qt_description_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_updater_lay",
            schema: "bdms",
            table: "layer",
            column: "updater_lay");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_1_id_cli",
            schema: "bdms",
            table: "layer",
            column: "uscs_1_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_2_id_cli",
            schema: "bdms",
            table: "layer",
            column: "uscs_2_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs_determination_id_cli",
            schema: "bdms",
            table: "layer",
            column: "uscs_determination_id_cli");

        migrationBuilder.CreateIndex(
            name: "IX_layer_color_codelist_color_id",
            schema: "bdms",
            table: "layer_color_codelist",
            column: "color_id");

        migrationBuilder.CreateIndex(
            name: "IX_layer_debris_codelist_debris_id",
            schema: "bdms",
            table: "layer_debris_codelist",
            column: "debris_id");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_angularity_codelist_grain_angularity_id",
            schema: "bdms",
            table: "layer_grain_angularity_codelist",
            column: "grain_angularity_id");

        migrationBuilder.CreateIndex(
            name: "IX_layer_grain_shape_codelist_grain_shape_id",
            schema: "bdms",
            table: "layer_grain_shape_codelist",
            column: "grain_shape_id");

        migrationBuilder.CreateIndex(
            name: "IX_layer_organic_component_codelist_organic_components_id",
            schema: "bdms",
            table: "layer_organic_component_codelist",
            column: "organic_components_id");

        migrationBuilder.CreateIndex(
            name: "IX_layer_uscs3_codelist_uscs3_id",
            schema: "bdms",
            table: "layer_uscs3_codelist",
            column: "uscs3_id");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_author_sty",
            schema: "bdms",
            table: "stratigraphy",
            column: "author_sty");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_id_bho_fk",
            schema: "bdms",
            table: "stratigraphy",
            column: "id_bho_fk");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_quality_id",
            schema: "bdms",
            table: "stratigraphy",
            column: "quality_id");

        migrationBuilder.CreateIndex(
            name: "IX_stratigraphy_updater_sty",
            schema: "bdms",
            table: "stratigraphy",
            column: "updater_sty");
    }
}
