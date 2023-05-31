using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateLithostratigraphy : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Copy the lithostratigraphy from the layer table into its own lithostratigraphy table.
        //
        // The content of the layer table remains unchanged.
        // If two adjacent layers have the same lithostratigraphy they are merged into one layer in the new lithostratigraphy table.
        // If lithostratigraphy already contains layers for a certain stratigraphy, that layers are skipped and not inserted a second time.
        migrationBuilder.Sql(@"
WITH startDepth AS
(
    SELECT id_sty_fk , depth_from_lay, lithostratigraphy_id_cli, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from_lay)
    FROM bdms.layer a
    WHERE NOT EXISTS (
        SELECT *
        FROM bdms.layer b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND a.lithostratigraphy_id_cli = b.lithostratigraphy_id_cli
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
            AND a.lithostratigraphy_id_cli = b.lithostratigraphy_id_cli
            AND a.depth_to_lay = b.depth_from_lay
    )
)
INSERT INTO bdms.lithostratigraphy (stratigraphy_id, lithostratigraphy_id, depth_from, depth_to, is_last)
SELECT s.id_sty_fk, lithostratigraphy_id_cli, depth_from_lay, depth_to_lay, last_lay
FROM startDepth s
JOIN endDepth e ON s.id_sty_fk = e.id_sty_fk AND s.row_number = e.row_number
WHERE NOT EXISTS (
    SELECT *
    FROM bdms.lithostratigraphy l
    WHERE l.stratigraphy_id = s.id_sty_fk
);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
