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
        migrationBuilder.Sql(@"
            INSERT INTO bdms.hydrotest_kind_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM bdms.hydrotest_codelist hc
            JOIN bdms.codelist cl ON hc.id_cli_fk = cl.id_cli
            WHERE cl.schema_cli = 'hydrotest_kind';

            INSERT INTO bdms.hydrotest_flowdirection_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM bdms.hydrotest_codelist hc
            JOIN bdms.codelist cl ON hc.id_cli_fk = cl.id_cli
            WHERE cl.schema_cli = 'hydrotest_flowdirection';

            INSERT INTO bdms.hydrotest_evaluationmethod_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM bdms.hydrotest_codelist hc
            JOIN bdms.codelist cl ON hc.id_cli_fk = cl.id_cli
            WHERE cl.schema_cli = 'hydrotest_evaluationmethod';

            INSERT INTO bdms.hydrotest_result_codelist (hydrotest_id, codelist_id)
            SELECT hc.id_ht_fk, hc.id_cli_fk
            FROM bdms.hydrotest_codelist hc
            JOIN bdms.codelist cl ON hc.id_cli_fk = cl.id_cli
            WHERE cl.schema_cli = 'hydrotest_result';
            ");

        migrationBuilder.DropTable(
            name: "hydrotest_codelist",
            schema: "bdms");
    }
}
#pragma warning restore CA1505
