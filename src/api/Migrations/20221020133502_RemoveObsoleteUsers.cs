using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteUsers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"DELETE FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
