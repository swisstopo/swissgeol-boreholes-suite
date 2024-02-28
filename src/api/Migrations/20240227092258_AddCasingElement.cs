using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddCasingElement : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_casing_codelist_kind_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropForeignKey(
            name: "FK_casing_codelist_material_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropIndex(
            name: "IX_casing_kind_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropIndex(
            name: "IX_casing_material_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "from_depth",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "inner_diameter",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "kind_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "material_id",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "outer_diameter",
            schema: "bdms",
            table: "casing");

        migrationBuilder.DropColumn(
            name: "to_depth",
            schema: "bdms",
            table: "casing");

        migrationBuilder.CreateTable(
            name: "casing_element",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                casing_id = table.Column<int>(type: "integer", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: false),
                to_depth = table.Column<double>(type: "double precision", nullable: false),
                kind_id = table.Column<int>(type: "integer", nullable: false),
                material_id = table.Column<int>(type: "integer", nullable: false),
                inner_diameter = table.Column<double>(type: "double precision", nullable: false),
                outer_diameter = table.Column<double>(type: "double precision", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_casing_element", x => x.id);
                table.ForeignKey(
                    name: "FK_casing_element_casing_casing_id",
                    column: x => x.casing_id,
                    principalSchema: "bdms",
                    principalTable: "casing",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_casing_element_codelist_kind_id",
                    column: x => x.kind_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_casing_element_codelist_material_id",
                    column: x => x.material_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_casing_element_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_casing_element_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_casing_element_casing_id",
            schema: "bdms",
            table: "casing_element",
            column: "casing_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_element_creator",
            schema: "bdms",
            table: "casing_element",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_casing_element_kind_id",
            schema: "bdms",
            table: "casing_element",
            column: "kind_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_element_material_id",
            schema: "bdms",
            table: "casing_element",
            column: "material_id");

        migrationBuilder.CreateIndex(
            name: "IX_casing_element_updater",
            schema: "bdms",
            table: "casing_element",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
