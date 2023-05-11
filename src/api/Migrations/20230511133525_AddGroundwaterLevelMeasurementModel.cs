using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddGroundwaterLevelMeasurementModel : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "groundwater_level_measurement",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false),
                kind = table.Column<int>(type: "integer", nullable: false),
                level_m = table.Column<double>(type: "double precision", nullable: true),
                level_masl = table.Column<double>(type: "double precision", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_groundwater_level_measurement", x => x.id);
                table.ForeignKey(
                    name: "FK_groundwater_level_measurement_codelist_kind",
                    column: x => x.kind,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_groundwater_level_measurement_observation_id",
                    column: x => x.id,
                    principalSchema: "bdms",
                    principalTable: "observation",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_groundwater_level_measurement_kind",
            schema: "bdms",
            table: "groundwater_level_measurement",
            column: "kind");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "groundwater_level_measurement",
            schema: "bdms");
    }
}
