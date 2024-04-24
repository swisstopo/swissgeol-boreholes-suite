using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1505S
/// <inheritdoc />
public partial class AddHydrotestCodelistJoinTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "hydrotest_evaluationmethod_codelist",
            schema: "bdms",
            columns: table => new
            {
                hydrotest_id = table.Column<int>(type: "integer", nullable: false),
                codelist_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_evaluationmethod_codelist", x => new { x.hydrotest_id, x.codelist_id });
                table.ForeignKey(
                    name: "FK_hydrotest_evaluationmethod_codelist_codelist_codelist_id",
                    column: x => x.codelist_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_hydrotest_evaluationmethod_codelist_hydrotest_hydrotest_id",
                    column: x => x.hydrotest_id,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "hydrotest_flowdirection_codelist",
            schema: "bdms",
            columns: table => new
            {
                hydrotest_id = table.Column<int>(type: "integer", nullable: false),
                codelist_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_flowdirection_codelist", x => new { x.hydrotest_id, x.codelist_id });
                table.ForeignKey(
                    name: "FK_hydrotest_flowdirection_codelist_codelist_codelist_id",
                    column: x => x.codelist_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_hydrotest_flowdirection_codelist_hydrotest_hydrotest_id",
                    column: x => x.hydrotest_id,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "hydrotest_kind_codelist",
            schema: "bdms",
            columns: table => new
            {
                hydrotest_id = table.Column<int>(type: "integer", nullable: false),
                codelist_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_kind_codelist", x => new { x.hydrotest_id, x.codelist_id });
                table.ForeignKey(
                    name: "FK_hydrotest_kind_codelist_codelist_codelist_id",
                    column: x => x.codelist_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_hydrotest_kind_codelist_hydrotest_hydrotest_id",
                    column: x => x.hydrotest_id,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "hydrotest_result_codelist",
            schema: "bdms",
            columns: table => new
            {
                hydrotest_id = table.Column<int>(type: "integer", nullable: false),
                codelist_id = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_result_codelist", x => new { x.hydrotest_id, x.codelist_id });
                table.ForeignKey(
                    name: "FK_hydrotest_result_codelist_codelist_codelist_id",
                    column: x => x.codelist_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_hydrotest_result_codelist_hydrotest_hydrotest_id",
                    column: x => x.hydrotest_id,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_evaluationmethod_codelist_codelist_id",
            schema: "bdms",
            table: "hydrotest_evaluationmethod_codelist",
            column: "codelist_id");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_flowdirection_codelist_codelist_id",
            schema: "bdms",
            table: "hydrotest_flowdirection_codelist",
            column: "codelist_id");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_kind_codelist_codelist_id",
            schema: "bdms",
            table: "hydrotest_kind_codelist",
            column: "codelist_id");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_result_codelist_codelist_id",
            schema: "bdms",
            table: "hydrotest_result_codelist",
            column: "codelist_id");
    }
}
#pragma warning restore CA1505
