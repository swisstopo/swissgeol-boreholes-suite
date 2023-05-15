using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddHydrogeologyCodelistTranslations : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET text_cli_fr = 'fiable',
                text_cli_it = 'affidabile',
                text_cli_en = 'reliable'
            WHERE id_cli = 15203156;

            UPDATE bdms.codelist
            SET text_cli_fr = 'incertain',
                text_cli_it = 'incerto',
                text_cli_en = 'uncertain'
            WHERE id_cli = 15203157;

            UPDATE bdms.codelist
            SET text_cli_de = 'andere',
                text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203158;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203159;

            UPDATE bdms.codelist
            SET text_cli_fr = 'petite (< 30 l/min)',
                text_cli_it = 'piccola (< 30 l/min)',
                text_cli_en = 'small (< 30 l/min)'
            WHERE id_cli = 15203160;

            UPDATE bdms.codelist
            SET text_cli_fr = 'moyenne (30 - 120 l/min)',
                text_cli_it = 'media (30 - 120 l/min)',
                text_cli_en = 'medium (30 - 120 l/min)'
            WHERE id_cli = 15203161;

            UPDATE bdms.codelist
            SET text_cli_fr = 'grande (> 120 l/min)',
                text_cli_it = 'grande (> 120 l/min)',
                text_cli_en = 'large (> 120 l/min)'
            WHERE id_cli = 15203162;

            UPDATE bdms.codelist
            SET text_cli_de = 'andere',
                text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203163;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203164;

            UPDATE bdms.codelist
            SET text_cli_fr = 'artésien',
                text_cli_it = 'artesiano',
                text_cli_en = 'free flowing artesian'
            WHERE id_cli = 15203165;

            UPDATE bdms.codelist
            SET text_cli_fr = 'captif',
                text_cli_it = 'confinato',
                text_cli_en = 'confined'
            WHERE id_cli = 15203166;

            UPDATE bdms.codelist
            SET text_cli_fr = 'libre',
                text_cli_it = 'libero',
                text_cli_en = 'unconfined'
            WHERE id_cli = 15203167;

            UPDATE bdms.codelist
            SET text_cli_de = 'andere',
                text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203168;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203169;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai de pompage/injection, débit constant',
                text_cli_it = 'prova di pompaggio/iniezione a portata costante',
                text_cli_en = 'pumping/injection test, constant rate'
            WHERE id_cli = 15203170;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai de pompage/injection, par palier',
                text_cli_it = 'prova di pompaggio/iniezione a fasi di portata costante',
                text_cli_en = 'pumping/injection test, step drawdown test'
            WHERE id_cli = 15203171;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai de pompage/injection, débit variable',
                text_cli_it = 'prova di pompaggio/iniezione a portata variabile',
                text_cli_en = 'pumping/injection test, variable rate'
            WHERE id_cli = 15203172;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai de pompage/injection, différentiel de pression constant',
                text_cli_it = 'prova di pompaggio/iniezione a carico costante',
                text_cli_en = 'pumping/injection test, constant pressure head'
            WHERE id_cli = 15203173;

            UPDATE bdms.codelist
            SET text_cli_fr = 'changement brusque de la hauteur de pression (slug/bail, pulse)',
                text_cli_it = 'variazione istantanea del livello piezometrico (slug/bail, pulse)',
                text_cli_en = 'abrupt change of pressure head (slug/bail, pulse)'
            WHERE id_cli = 15203174;

            UPDATE bdms.codelist
            SET text_cli_fr = 'récupération de la pression dans un trou de forage ouvert/une tige/un piézomètre',
                text_cli_it = 'recupero della pressione nel foro aperto/astina/piezometro',
                text_cli_en = 'pressure recovery in open borehole/rod/piezometer'
            WHERE id_cli = 15203175;

            UPDATE bdms.codelist
            SET text_cli_fr = 'récupération de la pression dans un intervalle fermé',
                text_cli_it = 'recupero della pressione a intervallo chiuso',
                text_cli_en = 'pressure recovery in closed interval'
            WHERE id_cli = 15203176;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai de pression d''eau (Drillstem, Lugeon)',
                text_cli_it = 'prova di permeabilità in foro (Drillstem, Lugeon)',
                text_cli_en = 'packer test (Drillstem, Lugeon)'
            WHERE id_cli = 15203177;

            SET text_cli_fr = 'essai de débitmètre / de diagraphie des fluides',
                text_cli_it = 'flussimetro / prova log velocità di flusso',
                text_cli_en = 'flowmeter / fluid logging test'
            WHERE id_cli = 15203178;

            UPDATE bdms.codelist
            SET text_cli_fr = 'essai d''infiltration, zone non saturée',
                text_cli_it = 'prova di infiltrazione, zona insatura',
                text_cli_en = 'infiltration test, unsaturated zone'
            WHERE id_cli = 15203179;

            UPDATE bdms.codelist
            SET text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203180;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203181;

            UPDATE bdms.codelist
            SET text_cli_fr = 'injection',
                text_cli_it = 'iniezione',
                text_cli_en = 'injection'
            WHERE id_cli = 15203182;

            UPDATE bdms.codelist
            SET text_cli_fr = 'prélèvement',
                text_cli_it = 'prelievo',
                text_cli_en = 'withdrawal'
            WHERE id_cli = 15203183;

            UPDATE bdms.codelist
            SET text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203184;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203185;

            UPDATE bdms.codelist
            SET text_cli_fr = 'injection',
                text_cli_it = 'iniezione',
                text_cli_en = 'injection'
            WHERE id_cli = 15203186;

            UPDATE bdms.codelist
            SET text_cli_fr = 'prélèvement',
                text_cli_it = 'prelievo',
                text_cli_en = 'withdrawal'
            WHERE id_cli = 15203187;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203188;

            UPDATE bdms.codelist
            SET text_cli_fr = 'stationnaire',
                text_cli_it = 'stazionario',
                text_cli_en = 'stationary'
            WHERE id_cli = 15203189;

            UPDATE bdms.codelist
            SET text_cli_fr = 'transitoire',
                text_cli_it = 'transitorio',
                text_cli_en = 'transient'
            WHERE id_cli = 15203190;

            UPDATE bdms.codelist
            SET text_cli_fr = 'numérique',
                text_cli_it = 'numerico',
                text_cli_en = 'numerical'
            WHERE id_cli = 15203191;

            UPDATE bdms.codelist
            SET text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other'
            WHERE id_cli = 15203192;

            UPDATE bdms.codelist
            SET text_cli_fr = 'sans indication',
                text_cli_it = 'senza indicazioni',
                text_cli_en = 'not specified'
            WHERE id_cli = 15203193;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
