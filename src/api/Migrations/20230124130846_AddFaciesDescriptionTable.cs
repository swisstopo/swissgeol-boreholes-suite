using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddFaciesDescriptionTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "facies_description",
            schema: "bdms",
            columns: table => new
            {
                id_fac = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                id_sty_fk = table.Column<int>(type: "integer", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: false),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: false),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                qt_description_id = table.Column<int>(type: "integer", nullable: true),
                depth_from = table.Column<double>(type: "double precision", nullable: true),
                depth_to = table.Column<double>(type: "double precision", nullable: true),
                is_last = table.Column<bool>(type: "boolean", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_facies_description", x => x.id_fac);
                table.ForeignKey(
                    name: "FK_facies_description_codelist_qt_description_id",
                    column: x => x.qt_description_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_facies_description_stratigraphy_id_sty_fk",
                    column: x => x.id_sty_fk,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty");
                table.ForeignKey(
                    name: "FK_facies_description_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_facies_description_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_creator",
            schema: "bdms",
            table: "facies_description",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_id_sty_fk",
            schema: "bdms",
            table: "facies_description",
            column: "id_sty_fk");

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_qt_description_id",
            schema: "bdms",
            table: "facies_description",
            column: "qt_description_id");

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_updater",
            schema: "bdms",
            table: "facies_description",
            column: "updater");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "facies_description",
            schema: "bdms");
    }
}
