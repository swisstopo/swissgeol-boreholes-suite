using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class RenameWorkflowV2 : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_workflow_change_workflow_v2_workflow_id",
            schema: "bdms",
            table: "workflow_change");

        migrationBuilder.DropTable(
            name: "workflow_v2",
            schema: "bdms");

        migrationBuilder.CreateTable(
            name: "workflow",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                has_requested_changes = table.Column<bool>(type: "boolean", nullable: false),
                status = table.Column<int>(type: "integer", nullable: false),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                reviewed_tabs_id = table.Column<int>(type: "integer", nullable: false),
                published_tabs_id = table.Column<int>(type: "integer", nullable: false),
                assignee_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_workflow", x => x.id);
                table.ForeignKey(
                    name: "FK_workflow_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_tab_status_published_tabs_id",
                    column: x => x.published_tabs_id,
                    principalSchema: "bdms",
                    principalTable: "tab_status",
                    principalColumn: "tab_status_id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_tab_status_reviewed_tabs_id",
                    column: x => x.reviewed_tabs_id,
                    principalSchema: "bdms",
                    principalTable: "tab_status",
                    principalColumn: "tab_status_id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_users_assignee_id",
                    column: x => x.assignee_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_workflow_assignee_id",
            schema: "bdms",
            table: "workflow",
            column: "assignee_id");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_borehole_id",
            schema: "bdms",
            table: "workflow",
            column: "borehole_id",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_workflow_published_tabs_id",
            schema: "bdms",
            table: "workflow",
            column: "published_tabs_id",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_workflow_reviewed_tabs_id",
            schema: "bdms",
            table: "workflow",
            column: "reviewed_tabs_id",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "FK_workflow_change_workflow_id",
            schema: "bdms",
            table: "workflow_change",
            column: "id",
            principalSchema: "bdms",
            principalTable: "workflow",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);
    }
}
#pragma warning restore CA1505
