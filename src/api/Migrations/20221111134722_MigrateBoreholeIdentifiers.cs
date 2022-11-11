using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class MigrateBoreholeIdentifiers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.borehole_codelist SET id_cli_fk = 100000003 WHERE id_cli_fk = 100000005;
UPDATE bdms.borehole_codelist SET id_cli_fk = 100000004 WHERE id_cli_fk = 100000006;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
