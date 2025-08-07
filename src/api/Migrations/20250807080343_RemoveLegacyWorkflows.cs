using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacyWorkflows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "workflow",
                schema: "bdms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "workflow",
                schema: "bdms",
                columns: table => new
                {
                    id_wkf = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_bho_fk = table.Column<int>(type: "integer", nullable: false),
                    id_usr_fk = table.Column<int>(type: "integer", nullable: false),
                    finished_wkf = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes_wkf = table.Column<string>(type: "text", nullable: true),
                    id_rol_fk = table.Column<int>(type: "integer", nullable: true),
                    started_wkf = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workflow", x => x.id_wkf);
                    table.ForeignKey(
                        name: "FK_workflow_borehole_id_bho_fk",
                        column: x => x.id_bho_fk,
                        principalSchema: "bdms",
                        principalTable: "borehole",
                        principalColumn: "id_bho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_workflow_users_id_usr_fk",
                        column: x => x.id_usr_fk,
                        principalSchema: "bdms",
                        principalTable: "users",
                        principalColumn: "id_usr",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_workflow_id_bho_fk",
                schema: "bdms",
                table: "workflow",
                column: "id_bho_fk");

            migrationBuilder.CreateIndex(
                name: "IX_workflow_id_usr_fk",
                schema: "bdms",
                table: "workflow",
                column: "id_usr_fk");
        }
    }
}
