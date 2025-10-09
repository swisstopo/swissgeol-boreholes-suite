using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class AddLogRunsAndLogFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "log_run",
                schema: "bdms",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    borehole_id = table.Column<int>(type: "integer", nullable: false),
                    run_number = table.Column<string>(type: "text", nullable: false),
                    from_depth = table.Column<double>(type: "double precision", nullable: false),
                    to_depth = table.Column<double>(type: "double precision", nullable: false),
                    run_date = table.Column<DateOnly>(type: "date", nullable: true),
                    comment = table.Column<string>(type: "text", nullable: true),
                    service_co = table.Column<string>(type: "text", nullable: true),
                    bit_size = table.Column<double>(type: "double precision", nullable: false),
                    conveyance_method_id = table.Column<int>(type: "integer", nullable: true),
                    borehole_status_id = table.Column<int>(type: "integer", nullable: true),
                    creator = table.Column<int>(type: "integer", nullable: true),
                    creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updater = table.Column<int>(type: "integer", nullable: true),
                    update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_log_run", x => x.id);
                    table.ForeignKey(
                        name: "FK_log_run_borehole_borehole_id",
                        column: x => x.borehole_id,
                        principalSchema: "bdms",
                        principalTable: "borehole",
                        principalColumn: "id_bho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_log_run_codelist_borehole_status_id",
                        column: x => x.borehole_status_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli");
                    table.ForeignKey(
                        name: "FK_log_run_codelist_conveyance_method_id",
                        column: x => x.conveyance_method_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli");
                    table.ForeignKey(
                        name: "FK_log_run_users_creator",
                        column: x => x.creator,
                        principalSchema: "bdms",
                        principalTable: "users",
                        principalColumn: "id_usr");
                    table.ForeignKey(
                        name: "FK_log_run_users_updater",
                        column: x => x.updater,
                        principalSchema: "bdms",
                        principalTable: "users",
                        principalColumn: "id_usr");
                });

            migrationBuilder.CreateTable(
                name: "log_file",
                schema: "bdms",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    log_run_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    name_uuid = table.Column<string>(type: "text", nullable: true),
                    file_type = table.Column<string>(type: "text", nullable: false),
                    pass_type_id = table.Column<int>(type: "integer", nullable: true),
                    pass = table.Column<int>(type: "integer", nullable: true),
                    data_package_id = table.Column<int>(type: "integer", nullable: true),
                    delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    depth_type_id = table.Column<int>(type: "integer", nullable: true),
                    @public = table.Column<bool>(name: "public", type: "boolean", nullable: false),
                    creator = table.Column<int>(type: "integer", nullable: true),
                    creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updater = table.Column<int>(type: "integer", nullable: true),
                    update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_log_file", x => x.id);
                    table.ForeignKey(
                        name: "FK_log_file_codelist_data_package_id",
                        column: x => x.data_package_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli");
                    table.ForeignKey(
                        name: "FK_log_file_codelist_depth_type_id",
                        column: x => x.depth_type_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli");
                    table.ForeignKey(
                        name: "FK_log_file_codelist_pass_type_id",
                        column: x => x.pass_type_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli");
                    table.ForeignKey(
                        name: "FK_log_file_log_run_log_run_id",
                        column: x => x.log_run_id,
                        principalSchema: "bdms",
                        principalTable: "log_run",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_log_file_users_creator",
                        column: x => x.creator,
                        principalSchema: "bdms",
                        principalTable: "users",
                        principalColumn: "id_usr");
                    table.ForeignKey(
                        name: "FK_log_file_users_updater",
                        column: x => x.updater,
                        principalSchema: "bdms",
                        principalTable: "users",
                        principalColumn: "id_usr");
                });

            migrationBuilder.CreateTable(
                name: "logfile_tooltype_codelist",
                schema: "bdms",
                columns: table => new
                {
                    logfile_id = table.Column<int>(type: "integer", nullable: false),
                    codelist_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_logfile_tooltype_codelist", x => new { x.logfile_id, x.codelist_id });
                    table.ForeignKey(
                        name: "FK_logfile_tooltype_codelist_codelist_codelist_id",
                        column: x => x.codelist_id,
                        principalSchema: "bdms",
                        principalTable: "codelist",
                        principalColumn: "id_cli",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_logfile_tooltype_codelist_log_file_logfile_id",
                        column: x => x.logfile_id,
                        principalSchema: "bdms",
                        principalTable: "log_file",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_log_file_creator",
                schema: "bdms",
                table: "log_file",
                column: "creator");

            migrationBuilder.CreateIndex(
                name: "IX_log_file_data_package_id",
                schema: "bdms",
                table: "log_file",
                column: "data_package_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_file_depth_type_id",
                schema: "bdms",
                table: "log_file",
                column: "depth_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_file_log_run_id",
                schema: "bdms",
                table: "log_file",
                column: "log_run_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_file_pass_type_id",
                schema: "bdms",
                table: "log_file",
                column: "pass_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_file_updater",
                schema: "bdms",
                table: "log_file",
                column: "updater");

            migrationBuilder.CreateIndex(
                name: "IX_log_run_borehole_id",
                schema: "bdms",
                table: "log_run",
                column: "borehole_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_run_borehole_status_id",
                schema: "bdms",
                table: "log_run",
                column: "borehole_status_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_run_conveyance_method_id",
                schema: "bdms",
                table: "log_run",
                column: "conveyance_method_id");

            migrationBuilder.CreateIndex(
                name: "IX_log_run_creator",
                schema: "bdms",
                table: "log_run",
                column: "creator");

            migrationBuilder.CreateIndex(
                name: "IX_log_run_updater",
                schema: "bdms",
                table: "log_run",
                column: "updater");

            migrationBuilder.CreateIndex(
                name: "IX_logfile_tooltype_codelist_codelist_id",
                schema: "bdms",
                table: "logfile_tooltype_codelist",
                column: "codelist_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "logfile_tooltype_codelist",
                schema: "bdms");

            migrationBuilder.DropTable(
                name: "log_file",
                schema: "bdms");

            migrationBuilder.DropTable(
                name: "log_run",
                schema: "bdms");
        }
    }
}
