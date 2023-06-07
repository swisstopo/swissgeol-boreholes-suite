using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class CombineNullLayers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
CREATE TEMP TABLE combined_layers(
    stratigraphy_id int,
    depth_from float8,
    depth_to float8
);

-- collect combined empty lithostratigraphy layers
WITH startDepth AS
(
    SELECT stratigraphy_id, depth_from, ROW_NUMBER() OVER (PARTITION BY stratigraphy_id ORDER BY depth_from)
    FROM bdms.lithostratigraphy a
    WHERE a.lithostratigraphy_id IS NULL AND NOT EXISTS (
        SELECT *
        FROM bdms.lithostratigraphy b
        WHERE a.stratigraphy_id = b.stratigraphy_id
            AND b.lithostratigraphy_id IS NULL
            AND a.depth_from = b.depth_to
    )
),
endDepth AS
(
    SELECT stratigraphy_id, depth_to, ROW_NUMBER() OVER (PARTITION BY stratigraphy_id ORDER BY depth_from)
    FROM bdms.lithostratigraphy a
    WHERE a.lithostratigraphy_id IS NULL AND NOT EXISTS (
        SELECT *
        FROM bdms.lithostratigraphy b
        WHERE a.stratigraphy_id = b.stratigraphy_id
            AND b.lithostratigraphy_id IS NULL
            AND a.depth_to = b.depth_from
    )
)
INSERT INTO combined_layers (stratigraphy_id, depth_from, depth_to)
SELECT s.stratigraphy_id, depth_from, depth_to
FROM startDepth s
JOIN endDepth e ON s.stratigraphy_id = e.stratigraphy_id AND s.row_number = e.row_number;

-- delete all existing empty lithostratigrahpy layers
DELETE FROM bdms.lithostratigraphy
WHERE lithostratigraphy_id IS NULL;

-- insert combined empty lithostratigraphy layers
INSERT INTO bdms.lithostratigraphy (stratigraphy_id, depth_from, depth_to)
SELECT stratigraphy_id, depth_from, depth_to
FROM combined_layers;

-- clear intermediate table
TRUNCATE combined_layers;

-- collect combined empty chronostratigraphy layers
WITH startDepth AS
(
    SELECT id_sty_fk, depth_from, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from)
    FROM bdms.chronostratigraphy a
    WHERE a.chronostratigraphy_id IS NULL AND NOT EXISTS (
        SELECT *
        FROM bdms.chronostratigraphy b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND b.chronostratigraphy_id IS NULL
            AND a.depth_from = b.depth_to
    )
),
endDepth AS
(
    SELECT id_sty_fk, depth_to, ROW_NUMBER() OVER (PARTITION BY id_sty_fk ORDER BY depth_from)
    FROM bdms.chronostratigraphy a
    WHERE a.chronostratigraphy_id IS NULL AND NOT EXISTS (
        SELECT *
        FROM bdms.chronostratigraphy b
        WHERE a.id_sty_fk = b.id_sty_fk
            AND b.chronostratigraphy_id IS NULL
            AND a.depth_to = b.depth_from
    )
)
INSERT INTO combined_layers (stratigraphy_id, depth_from, depth_to)
SELECT s.id_sty_fk, depth_from, depth_to
FROM startDepth s
JOIN endDepth e ON s.id_sty_fk = e.id_sty_fk AND s.row_number = e.row_number;

-- delete all existing empty chronostratigraphy layers
DELETE FROM bdms.chronostratigraphy
WHERE chronostratigraphy_id IS NULL;

-- insert combined empty chronostratigraphy layers
INSERT INTO bdms.chronostratigraphy (id_sty_fk, depth_from, depth_to)
SELECT stratigraphy_id, depth_from, depth_to
FROM combined_layers;
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
