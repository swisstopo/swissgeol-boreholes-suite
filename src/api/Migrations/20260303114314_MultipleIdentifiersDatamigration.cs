using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MultipleIdentifiersDatamigration : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.borehole_identifiers_codelist (borehole_id, identifier_id, identifier_value)
            SELECT
              borehole_id,
              identifier_id,
              btrim(x) AS identifier_value
            FROM bdms.borehole_identifiers_codelist
            CROSS JOIN LATERAL unnest(string_to_array(identifier_value, ',')) AS x
            WHERE identifier_value IS NOT NULL AND identifier_value LIKE '%,%'
              AND btrim(identifier_value) <> ''
              AND btrim(x) <> '';

            DELETE FROM bdms.borehole_identifiers_codelist
            WHERE identifier_value LIKE '%,%';
            ");
    }
}
