using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class FixLithostratiCodelistPaths : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.codelist SET path_cli = text2ltree(regexp_replace(ltree2text(path_cli), '152(\d{5})', '153\1', 'g'))
WHERE schema_cli = 'custom.lithostratigraphy_top_bedrock';
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
