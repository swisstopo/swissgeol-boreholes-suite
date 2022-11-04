using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteCodes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"DELETE FROM bdms.codelist WHERE schema_cli = 'layer_form' OR schema_cli = 'mlpr117'; ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
