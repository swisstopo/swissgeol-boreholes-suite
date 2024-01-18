using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "casing_id",
            schema: "bdms",
            table: "instrumentation",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "casing",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                completion_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: false),
                to_depth = table.Column<double>(type: "double precision", nullable: false),
                kind_id = table.Column<int>(type: "integer", nullable: false),
                material_id = table.Column<int>(type: "integer", nullable: false),
                inner_diameter = table.Column<double>(type: "double precision", nullable: false),
                outer_diameter = table.Column<double>(type: "double precision", nullable: false),
                date_start = table.Column<DateOnly>(type: "date", nullable: false),
                date_finish = table.Column<DateOnly>(type: "date", nullable: false),
                notes = table.Column<string>(type: "text", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_casing", x => x.id);
                table.ForeignKey(
                    name: "FK_casing_codelist_kind_id",
                    column: x => x.kind_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_casing_codelist_material_id",
                    column: x => x.material_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_casing_completion_completion_id",
                    column: x => x.completion_id,
                    principalSchema: "bdms",
                    principalTable: "completion",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_casing_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_casing_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_instrumentation_casing_id",
            schema: "bdms",
            table: "instrumentation",
            column: "casing_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_completion_id",
            schema: "bdms",
            table: "casing",
            column: "completion_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_creator",
            schema: "bdms",
            table: "casing",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_casing_kind_id",
            schema: "bdms",
            table: "casing",
            column: "kind_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_material_id",
            schema: "bdms",
            table: "casing",
            column: "material_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_updater",
            schema: "bdms",
            table: "casing",
            column: "updater");

        migrationBuilder.AddForeignKey(
            name: "FK_instrumentation_casing_casing_id",
            schema: "bdms",
            table: "instrumentation",
            column: "casing_id",
            principalSchema: "bdms",
            principalTable: "casing",
            principalColumn: "id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
