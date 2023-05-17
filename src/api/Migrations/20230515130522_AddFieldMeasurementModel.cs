using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddFieldMeasurementModel : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "field_measurement",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false),
                sample_type = table.Column<int>(type: "integer", nullable: false),
                parameter = table.Column<int>(type: "integer", nullable: false),
                value = table.Column<double>(type: "double precision", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_field_measurement", x => x.id);
                table.ForeignKey(
                    name: "FK_field_measurement_codelist_parameter",
                    column: x => x.parameter,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_field_measurement_codelist_sample_type",
                    column: x => x.sample_type,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_field_measurement_observation_id",
                    column: x => x.id,
                    principalSchema: "bdms",
                    principalTable: "observation",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_field_measurement_parameter",
            schema: "bdms",
            table: "field_measurement",
            column: "parameter");

        migrationBuilder.CreateIndex(
            name: "IX_field_measurement_sample_type",
            schema: "bdms",
            table: "field_measurement",
            column: "sample_type");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "field_measurement",
            schema: "bdms");
    }
}
