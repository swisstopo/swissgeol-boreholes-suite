using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateChronostratigraphy : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Copy the chronostratigraphy from the layer table into its own chronostratigraphy table.
        //
        // The content of the layer table remains unchanged.
        // If two adjacent layers have the same chronostratigraphy they are merged into one layer in the new chronostratigraphy table.
        // If chronostratigraphy already contains layers for a certain stratigraphy, that layers are skipped and not inserted a second time.
        migrationBuilder.Sql(@"
WITH startDepth AS
(
    SELECT id_sty_fk , depth_from_lay, chronostratigraphy_id_cli, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from_lay)
    FROM bdms.layer a
    WHERE NOT EXISTS (
        SELECT *
        FROM bdms.layer b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND a.chronostratigraphy_id_cli = b.chronostratigraphy_id_cli
            AND a.depth_from_lay = b.depth_to_lay
    )
),
endDepth AS
(
    SELECT id_sty_fk, depth_to_lay, last_lay, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from_lay)
    FROM bdms.layer a
    WHERE NOT EXISTS (
        SELECT *
        FROM bdms.layer b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND a.chronostratigraphy_id_cli = b.chronostratigraphy_id_cli
            AND a.depth_to_lay  = b.depth_from_lay
    )
)
INSERT INTO bdms.chronostratigraphy (id_sty_fk, chronostratigraphy_id, depth_from, depth_to, is_last)
SELECT s.id_sty_fk, chronostratigraphy_id_cli, depth_from_lay, depth_to_lay, last_lay
FROM startDepth s
JOIN endDepth e ON s.id_sty_fk = e.id_sty_fk AND s.row_number = e.row_number
WHERE NOT EXISTS (
    SELECT *
    FROM bdms.chronostratigraphy c
    WHERE c.id_sty_fk = s.id_sty_fk
);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
