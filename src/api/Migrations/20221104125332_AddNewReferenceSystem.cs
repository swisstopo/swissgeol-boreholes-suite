using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddNewReferenceSystem : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create new columns in borehole table for LV03 coordinates.
        // Migrate existing LV95 coordinates into LV03 coordinates using 'shift' method.
        // Remove prefix (number 1 in the north-south direction and number 2 in the west-east direction).
        // Use 'shift' method because existing coordinates previously were already shifted from LV03 to LV95.
        // Preserve LV95 coordinates for some selected boreholes (e.g. Bülach-1-1, ...)
        migrationBuilder.Sql(@"
ALTER TABLE bdms.borehole ADD COLUMN IF NOT EXISTS location_x_lv03_bho double precision;
ALTER TABLE bdms.borehole ADD COLUMN IF NOT EXISTS location_y_lv03_bho double precision;
UPDATE bdms.borehole SET location_x_lv03_bho = CAST(REGEXP_REPLACE(CAST(location_x_bho AS character varying),'^(2?)(\d{6}.*)$','\2') AS double precision) WHERE location_x_lv03_bho IS NULL;
UPDATE bdms.borehole SET location_y_lv03_bho = CAST(REGEXP_REPLACE(CAST(location_y_bho AS character varying),'^(1?)(\d{6}.*)$','\2') AS double precision) WHERE location_y_lv03_bho IS NULL;
UPDATE bdms.borehole SET srs_id_cli = 20104002 WHERE original_name_bho NOT IN ('Bülach-1-1','Trüllikon-1-1','Marthalen-1','Boezberg-1','Boezberg-2','Stadel-2','Stadel-3','Rheinau-1') OR original_name_bho IS NULL;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
