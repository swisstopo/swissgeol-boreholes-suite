using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddMaintenanceTaskLog : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "maintenance_task_log",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                task_type = table.Column<int>(type: "integer", nullable: false),
                status = table.Column<int>(type: "integer", nullable: false),
                affected_count = table.Column<int>(type: "integer", nullable: true),
                message = table.Column<string>(type: "text", nullable: true),
                parameters = table.Column<string>(type: "jsonb", nullable: true),
                is_dry_run = table.Column<bool>(type: "boolean", nullable: false),
                only_missing = table.Column<bool>(type: "boolean", nullable: false),
                started_by_id = table.Column<int>(type: "integer", nullable: true),
                started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_maintenance_task_log", x => x.id);
                table.ForeignKey(
                    name: "FK_maintenance_task_log_users_started_by_id",
                    column: x => x.started_by_id,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_maintenance_task_log_started_by_id",
            schema: "bdms",
            table: "maintenance_task_log",
            column: "started_by_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "maintenance_task_log",
            schema: "bdms");
    }
}
