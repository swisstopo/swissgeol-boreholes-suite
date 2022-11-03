using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteContactId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"ALTER TABLE bdms.borehole DROP COLUMN IF EXISTS contact_id;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
