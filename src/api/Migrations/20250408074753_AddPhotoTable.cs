using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddPhotoTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "photo",
            schema: "bdms",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                borehole_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                name_uuid = table.Column<string>(type: "text", nullable: false),
                file_type = table.Column<string>(type: "text", nullable: false),
                from_depth = table.Column<double>(type: "double precision", nullable: false),
                to_depth = table.Column<double>(type: "double precision", nullable: false),
                @public = table.Column<bool>(name: "public", type: "boolean", nullable: false),
                creator = table.Column<int>(type: "integer", nullable: true),
                creation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                updater = table.Column<int>(type: "integer", nullable: true),
                update = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_photo", x => x.id);
                table.ForeignKey(
                    name: "FK_photo_borehole_borehole_id",
                    column: x => x.borehole_id,
                    principalSchema: "bdms",
                    principalTable: "borehole",
                    principalColumn: "id_bho",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_photo_users_creator",
                    column: x => x.creator,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
                table.ForeignKey(
                    name: "FK_photo_users_updater",
                    column: x => x.updater,
                    principalSchema: "bdms",
                    principalTable: "users",
                    principalColumn: "id_usr");
            });

        migrationBuilder.CreateIndex(
            name: "IX_photo_borehole_id",
            schema: "bdms",
            table: "photo",
            column: "borehole_id");

        migrationBuilder.CreateIndex(
            name: "IX_photo_creator",
            schema: "bdms",
            table: "photo",
            column: "creator");

        migrationBuilder.CreateIndex(
            name: "IX_photo_updater",
            schema: "bdms",
            table: "photo",
            column: "updater");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "photo",
            schema: "bdms");
    }
}
