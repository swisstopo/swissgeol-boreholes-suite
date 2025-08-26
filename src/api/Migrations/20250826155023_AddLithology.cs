using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddLithology : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "lithology",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                stratigraphy_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                depth_from = table.Column<double>(type: "double precision", nullable: false),
                depth_to = table.Column<double>(type: "double precision", nullable: false),
                description = table.Column<int>(type: "integer", nullable: true),
                unconsolidated = table.Column<bool>(type: "boolean", nullable: false),
                bedding = table.Column<bool>(type: "boolean", nullable: false),
                bedding_share = table.Column<int>(type: "integer", nullable: true),
                alteration_degree_id = table.Column<int>(type: "integer", nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                compactness_id = table.Column<int>(type: "integer", nullable: true),
                cohesion_id = table.Column<int>(type: "integer", nullable: true),
                humidity_id = table.Column<int>(type: "integer", nullable: true),
                consistency_id = table.Column<int>(type: "integer", nullable: true),
                plasticity_id = table.Column<int>(type: "integer", nullable: true),
                uscs_determination_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology", x => x.id);
                table.ForeignKey(
                    name: "FK_lithology_codelist_alteration_degree_id",
                    column: x => x.alteration_degree_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_cohesion_id",
                    column: x => x.cohesion_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_compactness_id",
                    column: x => x.compactness_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_consistency_id",
                    column: x => x.consistency_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_humidity_id",
                    column: x => x.humidity_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_plasticity_id",
                    column: x => x.plasticity_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_codelist_uscs_determination_id",
                    column: x => x.uscs_determination_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_lithological_description_description",
                    column: x => x.description,
                    principalSchema: "bdms",
                    principalTable: "lithological_description",
                    principalColumn: "id_ldp");
                table.ForeignKey(
                    name: "FK_lithology_stratigraphy_v2_stratigraphy_id",
                    column: x => x.stratigraphy_id,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy_v2",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_lithology_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "lithology_description",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                lithology_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                first = table.Column<bool>(type: "boolean", nullable: false),
                color_primary_id = table.Column<int>(type: "integer", nullable: true),
                color_secondary_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_main_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_2_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_3_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_4_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_5_id = table.Column<int>(type: "integer", nullable: true),
                lithology_uncon_6_id = table.Column<int>(type: "integer", nullable: true),
                striae = table.Column<bool>(type: "boolean", nullable: false),
                lithology_con_id = table.Column<int>(type: "integer", nullable: true),
                grain_size_id = table.Column<int>(type: "integer", nullable: true),
                grain_angularitye_id = table.Column<int>(type: "integer", nullable: true),
                gradation_id = table.Column<int>(type: "integer", nullable: true),
                cementation_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description", x => x.id);
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_cementation_id",
                    column: x => x.cementation_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_color_primary_id",
                    column: x => x.color_primary_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_color_secondary_id",
                    column: x => x.color_secondary_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_gradation_id",
                    column: x => x.gradation_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_grain_angularitye_id",
                    column: x => x.grain_angularitye_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_grain_size_id",
                    column: x => x.grain_size_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_con_id",
                    column: x => x.lithology_con_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_2_id",
                    column: x => x.lithology_uncon_2_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_3_id",
                    column: x => x.lithology_uncon_3_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_4_id",
                    column: x => x.lithology_uncon_4_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_5_id",
                    column: x => x.lithology_uncon_5_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_6_id",
                    column: x => x.lithology_uncon_6_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_codelist_lithology_uncon_main_id",
                    column: x => x.lithology_uncon_main_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithology_description_lithology_lithology_id",
                    column: x => x.lithology_id,
                    principalSchema: "bdms",
                    principalTable: "lithology",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_lithology_description_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "lithology_rock_condition_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_id = table.Column<int>(type: "integer", nullable: false),
                rock_condition_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_rock_condition_codelist", x => new { x.lithology_id, x.rock_condition_id });
                table.ForeignKey(
                    name: "FK_lithology_rock_condition_codelist_codelist_rock_condition_id",
                    column: x => x.rock_condition_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_rock_condition_codelist_lithology_lithology_id",
                    column: x => x.lithology_id,
                    principalSchema: "bdms",
                    principalTable: "lithology",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_uscs_type_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_id = table.Column<int>(type: "integer", nullable: false),
                uscs_type_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_uscs_type_codelist", x => new { x.lithology_id, x.uscs_type_id });
                table.ForeignKey(
                    name: "FK_lithology_uscs_type_codelist_codelist_uscs_type_id",
                    column: x => x.uscs_type_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_uscs_type_codelist_lithology_lithology_id",
                    column: x => x.lithology_id,
                    principalSchema: "bdms",
                    principalTable: "lithology",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_component_con_mineral_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_component_con_mineral_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_component_con_mineral_codelist", x => new { x.lithology_description_id, x.lithology_component_con_mineral_id });
                table.ForeignKey(
                    name: "FK_lithology_description_component_con_mineral_codelist_codeli~",
                    column: x => x.lithology_component_con_mineral_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_component_con_mineral_codelist_lithol~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_component_con_particle_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_component_con_particle_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_component_con_particle_codelist", x => new { x.lithology_description_id, x.lithology_component_con_particle_id });
                table.ForeignKey(
                    name: "FK_lithology_description_component_con_particle_codelist_codel~",
                    column: x => x.lithology_component_con_particle_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_component_con_particle_codelist_litho~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

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
            name: "lithology_description_grain_angularity_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                grain_angularity_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_grain_angularity_codelist", x => new { x.lithology_description_id, x.grain_angularity_id });
                table.ForeignKey(
                    name: "FK_lithology_description_grain_angularity_codelist_codelist_gr~",
                    column: x => x.grain_angularity_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_grain_angularity_codelist_lithology_d~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_grain_shape_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                grain_shape_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_grain_shape_codelist", x => new { x.lithology_description_id, x.grain_shape_id });
                table.ForeignKey(
                    name: "FK_lithology_description_grain_shape_codelist_codelist_grain_s~",
                    column: x => x.grain_shape_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_grain_shape_codelist_lithology_descri~",
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
            name: "lithology_description_strucutre_post_gen_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_strucutre_post_gen_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_strucutre_post_gen_codelist", x => new { x.lithology_description_id, x.lithology_strucutre_post_gen_id });
                table.ForeignKey(
                    name: "FK_lithology_description_strucutre_post_gen_codelist_codelist_~",
                    column: x => x.lithology_strucutre_post_gen_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_strucutre_post_gen_codelist_lithology~",
                    column: x => x.lithology_description_id,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lithology_description_strucutre_syn_gen_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_description_id = table.Column<int>(type: "integer", nullable: false),
                lithology_strucutre_syn_gen_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_description_strucutre_syn_gen_codelist", x => new { x.lithology_description_id, x.lithology_strucutre_syn_gen_id });
                table.ForeignKey(
                    name: "FK_lithology_description_strucutre_syn_gen_codelist_codelist_l~",
                    column: x => x.lithology_strucutre_syn_gen_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_description_strucutre_syn_gen_codelist_lithology_~",
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

        migrationBuilder.CreateTable(
            name: "lithology_texture_meta_codelist",
            schema: "bdms",
            columns: table => new
            {
                lithology_id = table.Column<int>(type: "integer", nullable: false),
                lithology_texture_meta_id = table.Column<int>(type: "integer", nullable: false),
                LithologyDescriptionId = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithology_texture_meta_codelist", x => new { x.lithology_id, x.lithology_texture_meta_id });
                table.ForeignKey(
                    name: "FK_lithology_texture_meta_codelist_codelist_lithology_texture_~",
                    column: x => x.lithology_texture_meta_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithology_texture_meta_codelist_lithology_description_Litho~",
                    column: x => x.LithologyDescriptionId,
                    principalSchema: "bdms",
                    principalTable: "lithology_description",
                    principalColumn: "id");
                table.ForeignKey(
                    name: "FK_lithology_texture_meta_codelist_lithology_lithology_id",
                    column: x => x.lithology_id,
                    principalSchema: "bdms",
                    principalTable: "lithology",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_lithology_alteration_degree_id",
            schema: "bdms",
            table: "lithology",
            column: "alteration_degree_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_cohesion_id",
            schema: "bdms",
            table: "lithology",
            column: "cohesion_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_compactness_id",
            schema: "bdms",
            table: "lithology",
            column: "compactness_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_consistency_id",
            schema: "bdms",
            table: "lithology",
            column: "consistency_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_creator",
            schema: "bdms",
            table: "lithology",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description",
            schema: "bdms",
            table: "lithology",
            column: "description");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_humidity_id",
            schema: "bdms",
            table: "lithology",
            column: "humidity_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_plasticity_id",
            schema: "bdms",
            table: "lithology",
            column: "plasticity_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_stratigraphy_id",
            schema: "bdms",
            table: "lithology",
            column: "stratigraphy_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_updater",
            schema: "bdms",
            table: "lithology",
            column: "updater");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_uscs_determination_id",
            schema: "bdms",
            table: "lithology",
            column: "uscs_determination_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_cementation_id",
            schema: "bdms",
            table: "lithology_description",
            column: "cementation_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_color_primary_id",
            schema: "bdms",
            table: "lithology_description",
            column: "color_primary_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_color_secondary_id",
            schema: "bdms",
            table: "lithology_description",
            column: "color_secondary_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_creator",
            schema: "bdms",
            table: "lithology_description",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_gradation_id",
            schema: "bdms",
            table: "lithology_description",
            column: "gradation_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_grain_angularitye_id",
            schema: "bdms",
            table: "lithology_description",
            column: "grain_angularitye_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_grain_size_id",
            schema: "bdms",
            table: "lithology_description",
            column: "grain_size_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_con_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_con_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_2_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_2_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_3_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_3_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_4_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_4_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_5_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_5_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_6_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_6_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_lithology_uncon_main_id",
            schema: "bdms",
            table: "lithology_description",
            column: "lithology_uncon_main_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_updater",
            schema: "bdms",
            table: "lithology_description",
            column: "updater");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_component_con_mineral_codelist_lithol~",
            schema: "bdms",
            table: "lithology_description_component_con_mineral_codelist",
            column: "lithology_component_con_mineral_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_component_con_particle_codelist_litho~",
            schema: "bdms",
            table: "lithology_description_component_con_particle_codelist",
            column: "lithology_component_con_particle_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_description_debris_codelist_debris_id",
            schema: "bdms",
            table: "lithology_description_description_debris_codelist",
            column: "debris_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_grain_angularity_codelist_grain_angul~",
            schema: "bdms",
            table: "lithology_description_grain_angularity_codelist",
            column: "grain_angularity_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_grain_shape_codelist_grain_shape_id",
            schema: "bdms",
            table: "lithology_description_grain_shape_codelist",
            column: "grain_shape_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_organic_component_codelist_organic_co~",
            schema: "bdms",
            table: "lithology_description_organic_component_codelist",
            column: "organic_components_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_strucutre_post_gen_codelist_lithology~",
            schema: "bdms",
            table: "lithology_description_strucutre_post_gen_codelist",
            column: "lithology_strucutre_post_gen_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_strucutre_syn_gen_codelist_lithology_~",
            schema: "bdms",
            table: "lithology_description_strucutre_syn_gen_codelist",
            column: "lithology_strucutre_syn_gen_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_description_uncon_coarse_codelist_lithology_uncon~",
            schema: "bdms",
            table: "lithology_description_uncon_coarse_codelist",
            column: "lithology_uncon_coarse_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_rock_condition_codelist_rock_condition_id",
            schema: "bdms",
            table: "lithology_rock_condition_codelist",
            column: "rock_condition_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_texture_meta_codelist_lithology_texture_meta_id",
            schema: "bdms",
            table: "lithology_texture_meta_codelist",
            column: "lithology_texture_meta_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_texture_meta_codelist_LithologyDescriptionId",
            schema: "bdms",
            table: "lithology_texture_meta_codelist",
            column: "LithologyDescriptionId");

        migrationBuilder.CreateIndex(
            name: "IX_lithology_uscs_type_codelist_uscs_type_id",
            schema: "bdms",
            table: "lithology_uscs_type_codelist",
            column: "uscs_type_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "lithology_description_component_con_mineral_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_component_con_particle_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_description_debris_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_grain_angularity_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_grain_shape_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_organic_component_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_strucutre_post_gen_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_strucutre_syn_gen_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description_uncon_coarse_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_rock_condition_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_texture_meta_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_uscs_type_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology_description",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithology",
            schema: "bdms");
    }
}
