using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddDrillingMudTypeCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
CREATE TEMP TABLE drilling_mud_type_entries(
    id_cli int NOT NULL PRIMARY KEY,
    text_cli_en varchar,
    text_cli_de varchar,
    text_cli_fr varchar,
    text_cli_it varchar,
    order_cli int,
    path_cli ltree
);

INSERT INTO drilling_mud_type_entries(id_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli, path_cli)
VALUES
    (22109001, 'water', 'Wasser', 'eau', 'acqua', 10, '22109001'),
    (22109002, 'all oil', 'Öl', 'huiles', 'oli', 20, '22109002'),
    (22109003, 'pneumatic', 'pneumatisch', 'pneumatique', 'pneumatico', 30, '22109003'),
    (22109004, 'pneumatic – air', 'pneumatisch - Luft', 'pneumatique - air', 'pneumatico - aria', 40, '22109003.22109004'),
    (22109005, 'pneumatic – gas', 'pneumatisch - Gas', 'pneumatique - gaz', 'pneumatico - gas', 50, '22109003.22109005'),
    (22109006, 'pneumatic – mist', 'pneumatisch - Nebel', 'pneumatique - brouillard', 'pneumatico - nebbia', 60, '22109003.22109006'),
    (22109007, 'pneumatic – foam', 'pneumatisch - Schaum', 'pneumatique - mousse', 'pneumatico - schiuma', 70, '22109003.22109007'),
    (22109008, 'water-based', 'nicht dispergiert auf Wasserbasis', 'non dispersé à base d''eau', 'non dispersi a base d''acqua', 80, '22109008'),
    (22109009, 'water-based non-dispersed - bentonite, polymers', 'nicht dispergiert auf Wasserbasis - Bentonit, Polymere', 'non dispersé à base d''eau - bentonite, polymères', 'non dispersi a base d''acqua - bentonite, polimeri', 90, '22109008.22109009'),
    (22109010, 'water-based non-dispersed - NaCl, KCl, bentonite, polymer', 'nicht dispergiert auf Wasserbasis - NaCl, KCl, Bentonit, Polymer', 'non dispersé à base d''eau - NaCl, KCl, bentonite, polymères', 'non dispersi a base d''acqua - NaCl, KCl, bentonite, polimeri', 100, '22109008.22109010'),
    (22109011, 'water-based non-dispersed - K-silicate, Na-silicate, polymer', 'nicht dispergiert auf Wasserbasis - K-Silikat, Na-Silikat, Polymer', 'non dispersé à base d''eau - silicate de K, silicate de Na, polymère', 'non dispersi a base d''acqua - K-silicato, Na-silicato, polimero', 110, '22109008.22109011'),
    (22109012, 'water-based dispersed', 'dispergiert auf Wasserbasis', 'dispersé à base d''eau', 'dispersa a base acquosa', 120, '22109012'),
    (22109013, 'water-based dispersed - lignite, lignosulfonate, bentonite, polymers, phosphate', 'dispergiert auf Wasserbasis - Braunkohle, Lignosulfonat, Bentonit, Polymere, Phosphat', 'dispersé à base d''eau - lignite, lignosulfonate, bentonite, polymères, phosphate', 'dispersa a base acquosa - lignite, lignosolfonato, bentonite, polimeri, fosfati', 130, '22109012.22109013'),
    (22109014, 'water-based dispersed - lime, gypsum, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymers', 'dispergiert auf Wasserbasis - Kalk, Gips, NaCl, CaCl2, Braunkohle, Lignosulfonat, Bentonit, Polymere', 'dispersé à base d''eau - chaux, gypse, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymères', 'dispersa a base acquosa - calce, gesso, NaCl, CaCl2, lignite, lignosolfonato, bentonite, polimeri', 140, '22109012.22109014'),
    (22109015, 'oil-based', 'auf Ölbasis', 'à base d''huile', 'a base di olio', 150, '22109015'),
    (22109016, 'oil-based - low toxicity', 'auf Ölbasis - geringe Toxizität', 'à base d''huile - faible toxicité', 'a base di olio - bassa tossicità', 160, '22109015.22109016'),
    (22109017, 'oil-based - invert emulsion', 'auf Ölbasis - Invertemulsion', 'à base d''huile - émulsion inversée', 'a base di olio - emulsione inversa', 170, '22109015.22109017'),
    (22109018, 'oil-based - dispersed oil', 'auf Ölbasis - dispergiertes Öl', 'à base d''huile - huile dispersée', 'a base di olio - olio disperso', 180, '22109015.22109018'),
    (22109019, 'oil-based – diesel', 'auf Ölbasis - Diesel', 'à base d''huile - diesel', 'a base di olio - diesel', 190, '22109015.22109019'),
    (22109020, 'oil-based – synthetic', 'auf Ölbasis - synthetisch', 'à base d''huile - synthétique', 'a base di olio - sintetico', 200, '22109015.22109020'),
    (22109021, 'oil-based - non-aqueous', 'auf Ölbasis - nicht wässrig', 'à base d''huile - non aqueuse', 'a base di olio - non acquoso', 210, '22109015.22109021'),
    (22109022, 'other', 'andere', 'autre', 'altro', 220, NULL),
    (22109023, 'not specified', 'keine Angabe', 'sans indication', 'senza indicazioni', 230, NULL);

INSERT INTO bdms.codelist(id_cli, geolcode, schema_cli, code_cli, text_cli_en, description_cli_en, text_cli_de, description_cli_de, text_cli_fr, description_cli_fr, text_cli_it, description_cli_it, order_cli, path_cli)
SELECT id_cli, id_cli, 'drilling_mud_type', '', text_cli_en, '', text_cli_de, '', text_cli_fr, '', text_cli_it, '', order_cli, path_cli
FROM drilling_mud_type_entries;
");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
