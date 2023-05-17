using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class AddHydrotestParameterTranslations : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET text_cli_fr = 'valeur Kf (saturé)',
                text_cli_it = 'valore Kf (saturo)',
                text_cli_en = 'kf value (saturated)'
            WHERE id_cli = 15203194;

            UPDATE bdms.codelist
            SET text_cli_fr = 'valeur Kf,u (non saturé)',
                text_cli_it = 'valore Kf,i (insaturo)',
                text_cli_en = 'kf,u value (unsaturated)'
            WHERE id_cli = 15203195;

            UPDATE bdms.codelist
            SET text_cli_fr = 'transmissivité',
                text_cli_it = 'trasmissività',
                text_cli_en = 'transmissivity'
            WHERE id_cli = 15203196;

            UPDATE bdms.codelist
            SET text_cli_fr = 'dimension d''écoulement',
                text_cli_it = 'dimensione del flusso',
                text_cli_en = 'flow dimension'
            WHERE id_cli = 15203197;

            UPDATE bdms.codelist
            SET text_cli_fr = 'pression hydrostatique de la formation',
                text_cli_it = 'pressione statica della formazione',
                text_cli_en = 'static formation pressure'
            WHERE id_cli = 15203198;

            UPDATE bdms.codelist
            SET text_cli_fr = 'coefficient d''emmagasinement',
                text_cli_it = 'coefficiente di stoccaggio specifico',
                text_cli_en = 'specific storage coefficient'
            WHERE id_cli = 15203199;

            UPDATE bdms.codelist
            SET text_cli_fr = 'valeur de Lugeon',
                text_cli_it = 'valore di Lugeon',
                text_cli_en = 'Lugeon value'
            WHERE id_cli = 15203200;

            UPDATE bdms.codelist
            SET text_cli_fr = 'épaisseur pertinente',
                text_cli_it = 'spessore rilevante',
                text_cli_en = 'relevant thickness'
            WHERE id_cli = 15203201;

            UPDATE bdms.codelist
            SET text_cli_fr = 'autre',
                text_cli_it = 'altro',
                text_cli_en = 'other',
                text_cli_de = 'anderer'
            WHERE id_cli = 15203202;

            INSERT INTO bdms.codelist(
                id_cli, geolcode, schema_cli, code_cli, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it,
                description_cli_it, text_cli_en, description_cli_en, order_cli, conf_cli, default_cli, path_cli
                ) VALUES (15203223, 010, 'htestres101', '', 'keine Angaben', '', 'sans indication', '', 'senza indicazioni', '', 'not specified', '', 10, NULL, False, '');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
