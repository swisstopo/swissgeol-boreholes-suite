using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class UpdateUSCS3Cardinality : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
        INSERT INTO bdms.layer_codelist
            SELECT id_lay, uscs_3_id_cli, 'mcla101' FROM bdms.layer
            WHERE uscs_3_id_cli IS NOT NULL;
        ALTER TABLE bdms.layer DROP COLUMN IF EXISTS uscs_3_id_cli;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {

    }
}
