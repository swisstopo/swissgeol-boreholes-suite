using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddHydrotestModels : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "hydrotest",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false),
                testkind = table.Column<int>(type: "integer", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest", x => x.id);
                table.ForeignKey(
                    name: "FK_hydrotest_codelist_testkind",
                    column: x => x.testkind,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_hydrotest_observation_id",
                    column: x => x.id,
                    principalSchema: "bdms",
                    principalTable: "observation",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "hydrotest_codelist",
            schema: "bdms",
            columns: table => new
            {
                id_ht_fk = table.Column<int>(type: "integer", nullable: false),
                id_cli_fk = table.Column<int>(type: "integer", nullable: false),
                code_cli = table.Column<string>(type: "text", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_codelist", x => new { x.id_ht_fk, x.id_cli_fk });
                table.ForeignKey(
                    name: "FK_hydrotest_codelist_codelist_id_cli_fk",
                    column: x => x.id_cli_fk,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_hydrotest_codelist_hydrotest_id_ht_fk",
                    column: x => x.id_ht_fk,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "hydrotest_result",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                parameter = table.Column<int>(type: "integer", nullable: false),
                value = table.Column<double>(type: "double precision", nullable: true),
                max_value = table.Column<double>(type: "double precision", nullable: true),
                min_value = table.Column<double>(type: "double precision", nullable: true),
                hydrotest_id = table.Column<int>(type: "integer", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_hydrotest_result", x => x.id);
                table.ForeignKey(
                    name: "FK_hydrotest_result_codelist_parameter",
                    column: x => x.parameter,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_hydrotest_result_hydrotest_hydrotest_id",
                    column: x => x.hydrotest_id,
                    principalSchema: "bdms",
                    principalTable: "hydrotest",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_hydrotest_result_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_hydrotest_result_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_testkind",
            schema: "bdms",
            table: "hydrotest",
            column: "testkind");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_codelist_id_cli_fk",
            schema: "bdms",
            table: "hydrotest_codelist",
            column: "id_cli_fk");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_result_creator",
            schema: "bdms",
            table: "hydrotest_result",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_result_hydrotest_id",
            schema: "bdms",
            table: "hydrotest_result",
            column: "hydrotest_id");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_result_parameter",
            schema: "bdms",
            table: "hydrotest_result",
            column: "parameter");

        migrationBuilder.CreateIndex(
            name: "IX_hydrotest_result_updater",
            schema: "bdms",
            table: "hydrotest_result",
            column: "updater");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "hydrotest_codelist",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "hydrotest_result",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "hydrotest",
            schema: "bdms");
    }
}
