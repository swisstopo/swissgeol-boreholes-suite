using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

public partial class AddLithologicalDescription : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "lithological_description_profile",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                id_sty = table.Column<int>(type: "integer", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithological_description_profile", x => x.id);
                table.ForeignKey(
                    name: "FK_lithological_description_profile_stratigraphy_id_sty",
                    column: x => x.id_sty,
                    principalSchema: "bdms",
                    principalTable: "stratigraphy",
                    principalColumn: "id_sty");
            });

        migrationBuilder.CreateTable(
            name: "lithological_description",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                id_ldp = table.Column<int>(type: "integer", nullable: true),
                creator = table.Column<int>(type: "integer", nullable: false),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: false),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                description = table.Column<string>(type: "text", nullable: true),
                qt_description_id = table.Column<int>(type: "integer", nullable: true),
                depth_from_lay = table.Column<double>(type: "double precision", nullable: true),
                depth_to_lay = table.Column<double>(type: "double precision", nullable: true),
                is_last = table.Column<bool>(type: "boolean", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_lithological_description", x => x.id);
                table.ForeignKey(
                    name: "FK_lithological_description_codelist_qt_description_id",
                    column: x => x.qt_description_id,
                    principalSchema: "bdms",
                    principalTable: "codelist",
                    principalColumn: "id_cli");
                table.ForeignKey(
                    name: "FK_lithological_description_lithological_description_profile_i~",
                    column: x => x.id_ldp,
                    principalSchema: "bdms",
                    principalTable: "lithological_description_profile",
                    principalColumn: "id");
                table.ForeignKey(
                    name: "FK_lithological_description_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_lithological_description_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_creator",
            schema: "bdms",
            table: "lithological_description",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_id_ldp",
            schema: "bdms",
            table: "lithological_description",
            column: "id_ldp");

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_qt_description_id",
            schema: "bdms",
            table: "lithological_description",
            column: "qt_description_id");

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_updater",
            schema: "bdms",
            table: "lithological_description",
            column: "updater");

        migrationBuilder.CreateIndex(
            name: "IX_lithological_description_profile_id_sty",
            schema: "bdms",
            table: "lithological_description_profile",
            column: "id_sty");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "lithological_description",
            schema: "bdms");

        migrationBuilder.DropTable(
            name: "lithological_description_profile",
            schema: "bdms");
    }
}
