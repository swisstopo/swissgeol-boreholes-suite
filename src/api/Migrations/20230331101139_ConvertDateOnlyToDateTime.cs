using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class ConvertDateOnlyToDateTime : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // migrationBuilder.AlterColumn did not change the column type as expected. Thus raw sql command was used.
        migrationBuilder.Sql(@"
ALTER TABLE bdms.layer
ALTER COLUMN casng_date_finish_lay TYPE timestamp with time zone;

ALTER TABLE bdms.layer
ALTER COLUMN casng_date_spud_lay TYPE timestamp with time zone;

ALTER TABLE bdms.stratigraphy
ALTER COLUMN casng_date_abd_sty TYPE timestamp with time zone;

ALTER TABLE bdms.stratigraphy
ALTER COLUMN date_sty TYPE timestamp with time zone;

ALTER TABLE bdms.borehole
ALTER COLUMN spud_date_bho TYPE timestamp with time zone;

ALTER TABLE bdms.borehole
ALTER COLUMN drilling_date_bho TYPE timestamp with time zone;

do $$          
  declare v_completness_def text;
  declare exec_text text;
begin          
  v_completness_def := (select view_definition from INFORMATION_SCHEMA.views
where table_name like 'completness');
  --raise notice '%', v_completness_def;
  drop view if exists bdms.completness;
  
  ALTER TABLE bdms.borehole
  ALTER COLUMN restriction_until_bho TYPE timestamp with time zone;
  
  exec_text := format('create view bdms.completness as %s', 
      v_completness_def);
  execute exec_text;
end $$;
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
