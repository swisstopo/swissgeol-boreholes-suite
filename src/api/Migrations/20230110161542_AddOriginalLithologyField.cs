using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddOriginalLithologyField : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            ALTER TABLE bdms.layer ADD COLUMN IF NOT EXISTS original_lithology character varying;
            UPDATE bdms.layer layer_a
                SET original_lithology =
                    (SELECT CONCAT(COALESCE(CONCAT(codelist_a.text_cli_en, ', ','')), codelist_b.text_cli_en) AS original_lithology
                    FROM bdms.layer layer_b
                    JOIN bdms.codelist codelist_a ON codelist_a.geolcode=layer_b.unconrocks_id_cli
                    JOIN bdms.codelist codelist_b ON codelist_b.geolcode=layer_b.lithok_id_cli
                    WHERE layer_a.id_lay = layer_b.id_lay);");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "original_lithology",
            schema: "bdms",
            table: "layer");
    }
}
