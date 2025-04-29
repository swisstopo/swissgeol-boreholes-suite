using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddWorkflow : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "tab_status",
            schema: "bdms",
            columns: table => new
            {
                tab_status_id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                general = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                section = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                geometry = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                lithology = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                chronostratigraphy = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                lithostratigraphy = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                casing = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                instrumentation = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                backfill = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                water_ingress = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                groundwater = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                field_measurement = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                hydrotest = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                profile = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                photo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_tab_status", x => x.tab_status_id);
            });

        migrationBuilder.CreateTable(
            name: "workflow_v2",
            schema: "bdms",
            columns: table => new
            {
                workflow_id = table.Column<int>(type: "integer", nullable: false)
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
                table.PrimaryKey("PK_workflow_v2", x => x.workflow_id);
                table.ForeignKey(
                    name: "FK_workflow_v2_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_v2_tab_status_published_tabs_id",
                    column: x => x.published_tabs_id,
                    principalSchema: "bdms",
                    principalTable: "tab_status",
                    principalColumn: "tab_status_id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_v2_tab_status_reviewed_tabs_id",
                    column: x => x.reviewed_tabs_id,
                    principalSchema: "bdms",
                    principalTable: "tab_status",
                    principalColumn: "tab_status_id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_workflow_v2_users_assignee_id",
                    column: x => x.assignee_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateTable(
            name: "workflow_change",
            schema: "bdms",
            columns: table => new
            {
                workflow_change_id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                comment = table.Column<string>(type: "text", nullable: false),
                from_status = table.Column<int>(type: "integer", nullable: false),
                to_status = table.Column<int>(type: "integer", nullable: false),
                workflow_id = table.Column<int>(type: "integer", nullable: false),
                created_by_id = table.Column<int>(type: "integer", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                assignee_id = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_workflow_change", x => x.workflow_change_id);
                table.ForeignKey(
                    name: "FK_workflow_change_users_assignee_id",
                    column: x => x.assignee_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_workflow_change_users_created_by_id",
                    column: x => x.created_by_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_workflow_change_workflow_v2_workflow_id",
                    column: x => x.workflow_id,
                    principalSchema: "bdms",
                    principalTable: "workflow_v2",
                    principalColumn: "workflow_id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_workflow_change_assignee_id",
            schema: "bdms",
            table: "workflow_change",
            column: "assignee_id");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_change_created_by_id",
            schema: "bdms",
            table: "workflow_change",
            column: "created_by_id");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_change_workflow_id",
            schema: "bdms",
            table: "workflow_change",
            column: "workflow_id");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_v2_assignee_id",
            schema: "bdms",
            table: "workflow_v2",
            column: "assignee_id");

        migrationBuilder.CreateIndex(
            name: "IX_workflow_v2_borehole_id",
            schema: "bdms",
            table: "workflow_v2",
            column: "borehole_id",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_workflow_v2_published_tabs_id",
            schema: "bdms",
            table: "workflow_v2",
            column: "published_tabs_id",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_workflow_v2_reviewed_tabs_id",
            schema: "bdms",
            table: "workflow_v2",
            column: "reviewed_tabs_id",
            unique: true);

        migrationBuilder.Sql("""
            DO
            $$
            DECLARE
              borehole_cursor CURSOR FOR SELECT id_bho FROM bdms.borehole;

              v_borehole_id bdms.borehole.id_bho%TYPE;
              v_tab_status_reviewed_id bdms.tab_status.tab_status_id%TYPE;
              v_tab_status_published_id bdms.tab_status.tab_status_id%TYPE;
            BEGIN
              -- Loop through each borehole
              FOR borehole_record IN borehole_cursor LOOP
                -- Insert into tab_status and capture the generated IDs
                INSERT INTO bdms.tab_status DEFAULT VALUES
                RETURNING tab_status_id INTO v_tab_status_reviewed_id;

                INSERT INTO bdms.tab_status DEFAULT VALUES
                RETURNING tab_status_id INTO v_tab_status_published_id;

                -- Now insert into workflow table with borehole_id and the two tab_status IDs
                v_borehole_id := borehole_record.id_bho;
                INSERT INTO bdms.workflow_v2 (borehole_id, has_requested_changes, reviewed_tabs_id, published_tabs_id, status)
                VALUES (v_borehole_id, FALSE, v_tab_status_reviewed_id, v_tab_status_published_id, 0 /* draft */);
              END LOOP;
            END;
            $$;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "workflow_change",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "workflow_v2",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "tab_status",
            schema: "bdms");
    }
}
