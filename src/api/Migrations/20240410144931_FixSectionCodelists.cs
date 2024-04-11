using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class FixSectionCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.codelist c
SET
    text_cli_en = codelist_corrections.text_cli_en,
    text_cli_de = codelist_corrections.text_cli_de,
    text_cli_fr = codelist_corrections.text_cli_fr,
    text_cli_it = codelist_corrections.text_cli_it
FROM
    (VALUES
        (22109004, 'air', 'Luft', 'air', 'aria'),
        (22109005, 'gas', 'Gas', 'gaz', 'gas'),
        (22109006, 'mist', 'Nebel', 'brouillard', 'nebbia'),
        (22109007, 'foam', 'Schaum', 'mousse', 'schiuma'),
        (22109008, 'water-based non-dispersed', 'nicht dispergiert auf Wasserbasis', 'non dispersé à base d''eau', 'non dispersi a base d''acqua'),
        (22109009, 'bentonite, polymers', 'Bentonit, Polymere', 'bentonite, polymères', 'bentonite, polimeri'),
        (22109010, 'NaCl, KCl, bentonite, polymer', 'NaCl, KCl, Bentonit, Polymer', 'NaCl, KCl, bentonite, polymères', 'NaCl, KCl, bentonite, polimeri'),
        (22109011, 'K-silicate, Na-silicate, polymer', 'K-Silikat, Na-Silikat, Polymer', 'silicate de K, silicate de Na, polymère', 'K-silicato, Na-silicato, polimero'),
        (22109013, 'lignite, lignosulfonate, bentonite, polymers, phosphate', 'Braunkohle, Lignosulfonat, Bentonit, Polymere, Phosphat', 'lignite, lignosulfonate, bentonite, polymères, phosphate', 'lignite, lignosolfonato, bentonite, polimeri, fosfati'),
        (22109014, 'lime, gypsum, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymers', 'Kalk, Gips, NaCl, CaCl2, Braunkohle, Lignosulfonat, Bentonit, Polymere', 'chaux, gypse, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymères', 'calce, gesso, NaCl, CaCl2, lignite, lignosolfonato, bentonite, polimeri'),
        (22109016, 'low toxicity', 'geringe Toxizität', 'faible toxicité', 'bassa tossicità'),
        (22109017, 'invert emulsion', 'Invertemulsion', 'émulsion inversée', 'emulsione inversa'),
        (22109018, 'dispersed oil', 'dispergiertes Öl', 'huile dispersée', 'olio disperso'),
        (22109019, 'diesel', 'Diesel', 'diesel', 'diesel'),
        (22109020, 'synthetic', 'synthetisch', 'synthétique', 'sintetico'),
        (22109021, 'non-aqueous', 'nicht wässrig', 'non aqueuse', 'non acquoso')
    ) AS codelist_corrections (id_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it)
WHERE c.id_cli = codelist_corrections.id_cli;
");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
