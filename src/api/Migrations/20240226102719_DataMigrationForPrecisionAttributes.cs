using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DataMigrationForPrecisionAttributes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION count_decimal_places(n double precision) RETURNS int AS $$
                DECLARE
                    str text := n::text;
                    pos int;
                BEGIN
                    pos := position('.' in str);
                    IF pos > 0 THEN
                        RETURN length(str) - pos;
                    ELSE
                        RETURN 0;
                    END IF;
                END;
                $$ LANGUAGE plpgsql;
            ");

        migrationBuilder.Sql(@"
                UPDATE bdms.borehole SET precision_location_x = count_decimal_places(location_x_bho);
                UPDATE bdms.borehole SET precision_location_y = count_decimal_places(location_y_bho);
                UPDATE bdms.borehole SET precision_location_x_lv03 = count_decimal_places(location_x_lv03_bho);
                UPDATE bdms.borehole SET precision_location_y_lv03 = count_decimal_places(location_y_lv03_bho);
            ");
    }
}
