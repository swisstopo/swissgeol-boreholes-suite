using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class UpdateExistingLithologyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('grain_shape', '', 'other', 'andere', 'autre', 'altro', 40);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21110002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21110002;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21110003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21110003;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21110004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21110004;
            UPDATE bdms.codelist SET text_cli_en = 'elongated' WHERE id_cli = 21110004;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21110005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21110005;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('grain_angularity', '', 'other', 'andere', 'autre', 'altro', 70);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21115001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115001;
            UPDATE bdms.codelist SET text_cli_en = 'very angular' WHERE id_cli = 21115001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21115003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115003;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21115004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115004;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21115005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115005;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21115006;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115006;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 21115007;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115007;
            UPDATE bdms.codelist SET order_cli = 80 WHERE id_cli = 21115008;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21115008;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('compactness', '', 'other', 'andere', 'autre', 'altro', 60);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21102001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21102002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21102003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21102005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102005;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21102006;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102006;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 21102007;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21102007;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('cohesion', '', 'other', 'andere', 'autre', 'altro', 50);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21116001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21116001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21116002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21116002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21116003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21116003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21116004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21116004;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 21116005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21116005;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('humidity', '', 'other', 'andere', 'autre', 'altro', 50);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21105001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21105001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21105002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21105002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21105003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21105003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21105004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21105004;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 21105005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21105005;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('consistency', '', 'other', 'andere', 'autre', 'altro', 70);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21103001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21103002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21103003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103003;
            UPDATE bdms.codelist SET text_cli_en = 'medium stiff' WHERE id_cli = 21103003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21103004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103004;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21103008;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103008;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 21103009;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103009;
            UPDATE bdms.codelist SET order_cli = 80 WHERE id_cli = 21103010;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21103010;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('plasticity', '', 'other', 'andere', 'autre', 'altro', 60);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 21101001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21101002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21101003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21101004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101004;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 21101005;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101005;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 21101006;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 21101006;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('uscs_determination', '',  'other', 'andere', 'autre', 'altro', 40);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 23107001;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 23107001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 23107002;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 23107002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 23107003;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 23107003;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 23107004;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 23107004;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('gradation', '', 'other', 'andere', 'autre', 'altro', 60),
                ('gradation', '', 'not specified', 'keine Angabe', 'sans indication', 'senza indicazioni', '70');
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 30000015;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 30000015;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 30000016;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 30000016;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 30000017;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 30000017;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 30000018;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 30000018;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 30000019;
            UPDATE bdms.codelist SET code_cli = '' WHERE id_cli = 30000019;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('uscs_type', 'O', 'other', 'andere', 'autre', 'altro', 280);
            UPDATE bdms.codelist SET order_cli = 10 WHERE id_cli = 23101001;
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 23101002;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 23101003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 23101004;
            UPDATE bdms.codelist SET order_cli = 50 WHERE id_cli = 23101006;
            UPDATE bdms.codelist SET order_cli = 60 WHERE id_cli = 23101007;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 23101008;
            UPDATE bdms.codelist SET order_cli = 80 WHERE id_cli = 23101009;
            UPDATE bdms.codelist SET order_cli = 90 WHERE id_cli = 231010010;
            UPDATE bdms.codelist SET order_cli = 100 WHERE id_cli = 23101011;
            UPDATE bdms.codelist SET order_cli = 110 WHERE id_cli = 23101012;
            UPDATE bdms.codelist SET order_cli = 120 WHERE id_cli = 23101013;
            UPDATE bdms.codelist SET order_cli = 130 WHERE id_cli = 23101014;
            UPDATE bdms.codelist SET order_cli = 140 WHERE id_cli = 23101015;
            UPDATE bdms.codelist SET order_cli = 150 WHERE id_cli = 23101016;
            UPDATE bdms.codelist SET order_cli = 160 WHERE id_cli = 23101017;
            UPDATE bdms.codelist SET order_cli = 170 WHERE id_cli = 23101018;
            UPDATE bdms.codelist SET order_cli = 180 WHERE id_cli = 23101020;
            UPDATE bdms.codelist SET order_cli = 190 WHERE id_cli = 23101021;
            UPDATE bdms.codelist SET order_cli = 200 WHERE id_cli = 23101022;
            UPDATE bdms.codelist SET order_cli = 210 WHERE id_cli = 23101023;
            UPDATE bdms.codelist SET order_cli = 220 WHERE id_cli = 23101024;
            UPDATE bdms.codelist SET order_cli = 230 WHERE id_cli = 23101025;
            UPDATE bdms.codelist SET order_cli = 240 WHERE id_cli = 23101029;
            UPDATE bdms.codelist SET order_cli = 250 WHERE id_cli = 23101030;
            UPDATE bdms.codelist SET order_cli = 260 WHERE id_cli = 23101031;
            UPDATE bdms.codelist SET order_cli = 270 WHERE id_cli = 23101035;
            UPDATE bdms.codelist SET order_cli = 290 WHERE id_cli = 23101034;

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('grain_size', '', 'very fine', 'sehr fein', 'très fin', 'molto fine', 10),
                ('grain_size', '', 'very coarse', 'sehr grob', 'très grossier', 'molto grossolano', 50),
                ('grain_size', '', 'other', 'andere', 'autre', 'altro', 60);
            UPDATE bdms.codelist SET order_cli = 20 WHERE id_cli = 21109001;
            UPDATE bdms.codelist SET order_cli = 30 WHERE id_cli = 21109003;
            UPDATE bdms.codelist SET order_cli = 40 WHERE id_cli = 21109005;
            UPDATE bdms.codelist SET order_cli = 70 WHERE id_cli = 21109007;
        ");
    }
}
#pragma warning restore CA1505
