using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class FixLithologyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.layer
			SET grain_size_2_id_cli=NULL
            WHERE grain_size_2_id_cli IN (
                23101005, 23101019, 23101026, 23101027, 23101028, 23101032, 23101033, 30000308, 30000309, 30000310, 30000311
            );

            UPDATE bdms.layer
			SET uscs_1_id_cli=NULL
            WHERE uscs_1_id_cli IN (
                23101005, 23101019, 23101026, 23101027, 23101028, 23101032, 23101033, 30000308, 30000309, 30000310, 30000311
            );

            UPDATE bdms.layer
			SET uscs_2_id_cli=NULL
            WHERE uscs_2_id_cli IN (
                23101005, 23101019, 23101026, 23101027, 23101028, 23101032, 23101033, 30000308, 30000309, 30000310, 30000311
            );

            DELETE FROM bdms.codelist
            WHERE schema_cli='uscs_type' AND id_cli IN (
                23101005, 23101019, 23101026, 23101027, 23101028, 23101032, 23101033, 30000308, 30000309, 30000310, 30000311
            );

            UPDATE bdms.layer
			SET grain_size_1_id_cli=NULL
            WHERE grain_size_1_id_cli IN (
                21109002, 21109004, 21109006, 21109008
            );

            UPDATE bdms.lithology_description
			SET grain_size_id=NULL
            WHERE grain_size_id IN (
                21109002, 21109004, 21109006, 21109008
            );

            DELETE FROM bdms.codelist
            WHERE schema_cli='grain_size' AND id_cli IN (21109002, 21109004, 21109006, 21109008);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('organic_components', '', 'other', 'andere', 'autre', 'altro', 100);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21108001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21108002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21108003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21108004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108004;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21108005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108005;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 21108006;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108006;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 21108007;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108007;
            UPDATE bdms.codelist SET order_cli = 80 WHERE id_cli = 21108008;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108008;
            UPDATE bdms.codelist SET order_cli = 90 WHERE id_cli = 21108009;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108009;
            UPDATE bdms.codelist SET order_cli = 110 WHERE id_cli = 21108010;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21108010;

            DELETE FROM bdms.codelist
            WHERE schema_cli='component_uncon_organic';

            UPDATE bdms.codelist
            SET schema_cli='component_uncon_organic'
            WHERE schema_cli='organic_components';

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('debris', '', 'other', 'andere', 'autre', 'altro', 60);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 9100;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9100;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 9101;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9101;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 9102;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9102;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 9103;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9103;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 9104;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9104;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 9105;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 9105;

            DELETE FROM bdms.codelist
            WHERE schema_cli='component_uncon_debris';

            UPDATE bdms.codelist
            SET schema_cli='component_uncon_debris'
            WHERE schema_cli='debris';
        ");
    }
}
#pragma warning restore CA1505
