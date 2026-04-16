using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class UpdateBoreholeIdentifierCodelistTexts : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DELETE FROM bdms.borehole_identifiers_codelist WHERE identifier_id = 100000009;
            DELETE FROM bdms.codelist WHERE id_cli = 100000009;
            DELETE FROM bdms.borehole_identifiers_codelist WHERE identifier_id = 100000008;
            DELETE FROM bdms.codelist WHERE id_cli = 100000008;
            UPDATE bdms.codelist SET text_cli_en = 'original ID',  text_cli_de = 'ID original',  text_cli_fr = 'ID original',    text_cli_it = 'ID originale'    WHERE id_cli = 100000004;
            UPDATE bdms.codelist SET text_cli_en = 'GeODin ID',    text_cli_de = 'ID GeODin',    text_cli_fr = 'ID GeODin',      text_cli_it = 'ID GeODin'       WHERE id_cli = 100000000;
            UPDATE bdms.codelist SET text_cli_en = 'InfoGeol ID',  text_cli_de = 'ID InfoGeol',  text_cli_fr = 'ID InfoGeol',    text_cli_it = 'ID InfoGeol'     WHERE id_cli = 100000003;
            UPDATE bdms.codelist SET text_cli_en = 'canton ID',    text_cli_de = 'ID Kanton',    text_cli_fr = 'ID du Canton',   text_cli_it = 'ID del Cantone'  WHERE id_cli = 100000005;
            UPDATE bdms.codelist SET text_cli_en = 'GeoQuat ID',   text_cli_de = 'ID GeoQuat',   text_cli_fr = 'ID GeoQuat',     text_cli_it = 'ID GeoQuat'      WHERE id_cli = 100000006;
            UPDATE bdms.codelist SET text_cli_en = 'GeoMol ID',    text_cli_de = 'ID GeoMol',    text_cli_fr = 'ID GeoMol',      text_cli_it = 'ID GeoMol'       WHERE id_cli = 100000007;
        ");
    }
}
