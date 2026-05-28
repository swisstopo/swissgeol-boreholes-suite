using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameStratigraphyConstraints : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_v2_borehole_borehole_id",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_borehole_borehole_id",
            schema: "bdms",
            table: "stratigraphy",
            column: "borehole_id",
            principalSchema: "bdms",
            principalTable: "borehole",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_v2_users_creator",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_users_creator",
            schema: "bdms",
            table: "stratigraphy",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.DropForeignKey(
            name: "FK_stratigraphy_v2_users_updater",
            schema: "bdms",
            table: "stratigraphy");

        migrationBuilder.AddForeignKey(
            name: "FK_stratigraphy_users_updater",
            schema: "bdms",
            table: "stratigraphy",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_v2_borehole_id",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_borehole_id");

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_v2_creator",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_creator");

        migrationBuilder.RenameIndex(
            name: "IX_stratigraphy_v2_updater",
            schema: "bdms",
            table: "stratigraphy",
            newName: "IX_stratigraphy_updater");
    }
}
