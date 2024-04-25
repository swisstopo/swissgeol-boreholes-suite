using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

#pragma warning disable CA1505
/// <inheritdoc />
public partial class DatamigrationHydrotestCodelistJoinTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"INSERT INTO hydrotest_kind_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM hydrotest_codelist hc
            JOIN codelists c ON hc.codelist_id = c.Id
            WHERE c.schema_name = 'hydrotest_kind';
            
            INSERT INTO hydrotest_flowdirection_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM hydrotest_codelist hc
            JOIN codelists c ON hc.codelist_id = c.Id
            WHERE c.schema_name = 'hydrotest_flowdirection';
            
            INSERT INTO hydrotest_evaluationmethod_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM hydrotest_codelist hc
            JOIN codelists c ON hc.codelist_id = c.Id
            WHERE c.schema_name = 'hydrotest_evaluationmethod';
            
            INSERT INTO hydrotest_result_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM hydrotest_codelist hc
            JOIN codelists c ON hc.codelist_id = c.Id
            WHERE c.schema_name = 'hydrotest_result';");

        migrationBuilder.DropTable(
            name: "hydrotest_codelist",
            schema: "bdms");
    }
}
#pragma warning restore CA1505
