using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddOriginalLithologyField : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            ALTER TABLE bdms.layer ADD COLUMN IF NOT EXISTS original_lithology character varying;
            UPDATE bdms.layer
                SET original_lithology = CONCAT(COALESCE(CONCAT(unconrocks_id_cli, ', '),''), lithok_id_cli);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "original_lithology",
            schema: "bdms",
            table: "layer");
    }
}
