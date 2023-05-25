using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveUnneededCodelists : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
           	DELETE FROM bdms.codelist
	        WHERE schema_cli = 'ebor106';

           	DELETE FROM bdms.codelist
	        WHERE schema_cli = 'borehole_form';
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
