using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateLayerLythologicalAndFaciesDescription : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Copy the layer descriptions and facies descriptions from the layer table into lithological_description and facies_description.
        //
        // The content of the layer table remains unchanged.
        // If two adjacent layers have the same description and quality they are merged into one layer in the new lithological_description and facies_description tables.
        // If lithological_description or facies_description already contains layers for a certain stratigraphy, that layers are skipped and not inserted a second time.

        // lithological_description
        migrationBuilder.Sql(@"
WITH startDepth AS
(
    SELECT id_sty_fk , depth_from_lay, lithological_description_lay, qt_description_id_cli, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from_lay)
    FROM bdms.layer a
    WHERE NOT EXISTS (
        SELECT *
        FROM bdms.layer b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND a.lithological_description_lay = b.lithological_description_lay
            AND a.qt_description_id_cli = b.qt_description_id_cli
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
            AND a.lithological_description_lay = b.lithological_description_lay
            AND a.qt_description_id_cli = b.qt_description_id_cli
            AND a.depth_to_lay  = b.depth_from_lay
    )
)
INSERT INTO bdms.lithological_description (id_sty_fk, description, qt_description_id, depth_from, depth_to, is_last)
SELECT s.id_sty_fk, lithological_description_lay, qt_description_id_cli, depth_from_lay, depth_to_lay, last_lay
FROM startDepth s
JOIN endDepth e ON s.id_sty_fk = e.id_sty_fk AND s.row_number = e.row_number
WHERE NOT EXISTS (
    SELECT *
    FROM bdms.lithological_description ld
    WHERE ld.id_sty_fk = s.id_sty_fk
);");

        // facies_description
        migrationBuilder.Sql(@"
WITH startDepth AS
(
    SELECT id_sty_fk , depth_from_lay, facies_description_lay, qt_description_id_cli, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from_lay)
    FROM bdms.layer a
    WHERE NOT EXISTS (
        SELECT *
        FROM bdms.layer b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND a.facies_description_lay = b.facies_description_lay
            AND a.qt_description_id_cli = b.qt_description_id_cli
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
            AND a.facies_description_lay = b.facies_description_lay
            AND a.qt_description_id_cli = b.qt_description_id_cli
            AND a.depth_to_lay  = b.depth_from_lay
    )
)
INSERT INTO bdms.facies_description (id_sty_fk, description, qt_description_id, depth_from, depth_to, is_last)
SELECT s.id_sty_fk, facies_description_lay, qt_description_id_cli, depth_from_lay, depth_to_lay, last_lay
FROM startDepth s
JOIN endDepth e ON s.id_sty_fk = e.id_sty_fk AND s.row_number = e.row_number
WHERE NOT EXISTS (
    SELECT *
    FROM bdms.facies_description fd
    WHERE fd.id_sty_fk = s.id_sty_fk
);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
