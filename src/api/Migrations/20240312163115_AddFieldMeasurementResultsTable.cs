using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddFieldMeasurementResultsTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "fieldmeasurement_result",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                sample_type = table.Column<int>(type: "integer", nullable: false),
                parameter = table.Column<int>(type: "integer", nullable: false),
                value = table.Column<double>(type: "double precision", nullable: false),
                fieldmeasurement_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_fieldmeasurement_result", x => x.id);
                table.ForeignKey(
                    name: "FK_fieldmeasurement_result_codelist_parameter",
                    column: x => x.parameter,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_fieldmeasurement_result_codelist_sample_type",
                    column: x => x.sample_type,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_fieldmeasurement_result_field_measurement_fieldmeasurement_~",
                    column: x => x.fieldmeasurement_id,
                    principalSchema: "bdms",
                    principalTable: "field_measurement",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_fieldmeasurement_result_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_fieldmeasurement_result_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_fieldmeasurement_result_creator",
            schema: "bdms",
            table: "fieldmeasurement_result",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_fieldmeasurement_result_fieldmeasurement_id",
            schema: "bdms",
            table: "fieldmeasurement_result",
            column: "fieldmeasurement_id");

        migrationBuilder.CreateIndex(
            name: "IX_fieldmeasurement_result_parameter",
            schema: "bdms",
            table: "fieldmeasurement_result",
            column: "parameter");

        migrationBuilder.CreateIndex(
            name: "IX_fieldmeasurement_result_sample_type",
            schema: "bdms",
            table: "fieldmeasurement_result",
            column: "sample_type");

        migrationBuilder.CreateIndex(
            name: "IX_fieldmeasurement_result_updater",
            schema: "bdms",
            table: "fieldmeasurement_result",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "fieldmeasurement_result",
            schema: "bdms");
    }
}
