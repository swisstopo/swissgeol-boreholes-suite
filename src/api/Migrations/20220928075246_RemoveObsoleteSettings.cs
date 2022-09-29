using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteSettings : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"DELETE FROM bdms.config WHERE name_cfg IN ('VERSION', 'PREVIOUS', 'PG_UPGRADE', 'GEOLCODES', 'INSTALLATION');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
