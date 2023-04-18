using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddWaterIngressModel : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "observation",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                observation_type = table.Column<int>(type: "integer", nullable: false),
                start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                duration = table.Column<double>(type: "double precision", nullable: true),
                from_depth_m = table.Column<double>(type: "double precision", nullable: true),
                to_depth_m = table.Column<double>(type: "double precision", nullable: true),
                from_depth_masl = table.Column<double>(type: "double precision", nullable: true),
                to_depth_masl = table.Column<double>(type: "double precision", nullable: true),
                completion_finished = table.Column<bool>(type: "boolean", nullable: true),
                casing = table.Column<int>(type: "integer", nullable: true),
                comment = table.Column<string>(type: "text", nullable: true),
                reliability = table.Column<int>(type: "integer", nullable: false),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_observation", x => x.id);
                table.ForeignKey(
                    name: "FK_observation_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_observation_codelist_reliability",
                    column: x => x.reliability,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_observation_stratigraphy_casing",
                    column: x => x.casing,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty");
                table.ForeignKey(
                    name: "FK_observation_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_observation_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "water_ingress",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false),
                quantity = table.Column<int>(type: "integer", nullable: false),
                conditions = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_water_ingress", x => x.id);
                table.ForeignKey(
                    name: "FK_water_ingress_codelist_conditions",
                    column: x => x.conditions,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_water_ingress_codelist_quantity",
                    column: x => x.quantity,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_water_ingress_observation_id",
                    column: x => x.id,
                    principalSchema: "bdms",
                    principalTable: "observation",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_observation_borehole_id",
            schema: "bdms",
            table: "observation",
            column: "borehole_id");

        migrationBuilder.CreateIndex(
            name: "IX_observation_casing",
            schema: "bdms",
            table: "observation",
            column: "casing");

        migrationBuilder.CreateIndex(
            name: "IX_observation_creator",
            schema: "bdms",
            table: "observation",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_observation_reliability",
            schema: "bdms",
            table: "observation",
            column: "reliability");

        migrationBuilder.CreateIndex(
            name: "IX_observation_updater",
            schema: "bdms",
            table: "observation",
            column: "updater");

        migrationBuilder.CreateIndex(
            name: "IX_water_ingress_conditions",
            schema: "bdms",
            table: "water_ingress",
            column: "conditions");

        migrationBuilder.CreateIndex(
            name: "IX_water_ingress_quantity",
            schema: "bdms",
            table: "water_ingress",
            column: "quantity");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "water_ingress",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "observation",
            schema: "bdms");
    }
}
