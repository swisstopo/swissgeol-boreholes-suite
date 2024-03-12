using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class DropFieldsFromFieldMeasurement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_field_measurement_codelist_parameter",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropForeignKey(
                name: "FK_field_measurement_codelist_sample_type",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropIndex(
                name: "IX_field_measurement_parameter",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropIndex(
                name: "IX_field_measurement_sample_type",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropColumn(
                name: "parameter",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropColumn(
                name: "sample_type",
                schema: "bdms",
                table: "field_measurement");

            migrationBuilder.DropColumn(
                name: "value",
                schema: "bdms",
                table: "field_measurement");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "parameter",
                schema: "bdms",
                table: "field_measurement",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "sample_type",
                schema: "bdms",
                table: "field_measurement",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "value",
                schema: "bdms",
                table: "field_measurement",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

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

            migrationBuilder.AddForeignKey(
                name: "FK_field_measurement_codelist_parameter",
                schema: "bdms",
                table: "field_measurement",
                column: "parameter",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");

            migrationBuilder.AddForeignKey(
                name: "FK_field_measurement_codelist_sample_type",
                schema: "bdms",
                table: "field_measurement",
                column: "sample_type",
                principalSchema: "bdms",
                principalTable: "codelist",
                principalColumn: "id_cli");
        }
    }
}
