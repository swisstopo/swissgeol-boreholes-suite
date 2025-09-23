using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateStratigraphies : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
                name: "name",
                schema: "bdms",
                table: "stratigraphy_v2",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

        migrationBuilder.Sql(@"
            INSERT INTO bdms.stratigraphy_v2(
                id, borehole_id, name, date, is_primary, update, updater, creation, creator
            ) 
            SELECT
                id_sty,
                id_bho_fk,
                name_sty,
                date_sty,
                COALESCE(primary_sty, FALSE),
                update_sty,
                updater_sty,
                creation_sty,
                author_sty
            FROM bdms.stratigraphy WHERE id_bho_fk IS NOT NULL;
        ");
    }
}
#pragma warning restore CA1505

