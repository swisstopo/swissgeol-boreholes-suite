using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddFaciesId : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('facies_con', '', 'terrestrial', 'terrestrisch', 'terrestre ', 'terrestre', 10),
                ('facies_con', '', 'alluvial', 'alluvial', 'alluvial', 'alluvionale', 20),
                ('facies_con', '', 'alluvial fan', 'Alluvialfächer', 'cône alluvial', 'cono alluvionale', 30),
                ('facies_con', '', 'alluvial fan, humid', 'Alluvialfächer, feucht', 'cône alluvial, humide', 'cono alluvionale, umido', 40),
                ('facies_con', '', 'alluvial fan, arid', 'Alluvialfächer, trocken', 'cône alluvial, aride', 'cono alluvionale, arido', 50),
                ('facies_con', '', 'alluvial fan, delta', 'Alluvialfächer, Delta', 'cône alluvial, delta', 'cono alluvionale, delta', 60),
                ('facies_con', '', 'alluvial channel', 'Alluvialkanal', 'chenal alluvial', 'canale alluvionale', 70),
                ('facies_con', '', 'alluvial channel, braided', 'Alluvialkanal, Flechtstrom', 'chenal alluvial, tressé', 'canale alluvionale, intrecciato', 80),
                ('facies_con', '', 'alluvial channel, single-storey meandering', 'Alluvialkanal, einschürfig mäandrierend', 'chenal alluvial, méandriforme à un seul étage', 'canale alluvionale, meandriforme a singolo livello', 90),
                ('facies_con', '', 'alluvial channel, multi-storey meandering', 'Alluvialkanal, mehrschürfig mäandrierend', 'chenal alluvial, méandriforme à plusieurs étages', 'canale alluvionale, meandriforme multilivello', 100),
                ('facies_con', '', 'alluvial channel, anastomosed', 'Alluvialkanal, anastomosierend', 'chenal alluvial, anastomosé', 'canale alluvionale, anastomizzato', 110),
                ('facies_con', '', 'alluvial braidplain', 'Alluvial, Flechtstromebene', 'plaine alluviale tressée', 'pianura alluvionale, intrecciata', 120),
                ('facies_con', '', 'alluvial floodplain', 'Alluvialebene', 'plaine d’inondation alluviale', 'pianura alluvionale', 130),
                ('facies_con', '', 'alluvial floodplain, crevasse-splays', 'Alluvialebene, Crevasse-Splays', 'plaine d’inondation alluviale, dépôts de rupture de levée', 'pianura alluvionale, crevasse-splay', 140),
                ('facies_con', '', 'alluvial floodplain, paleosol', 'Alluvialebene, Paläoboden', 'plaine d’inondation alluviale, paléosol', 'pianura alluvionale, paleosuolo', 150),
                ('facies_con', '', 'alluvial floodplain, fines', 'Alluvialebene, Feinsedimente', 'plaine d’inondation alluviale, particules fines', 'pianura alluvionale, sedimenti fini', 160),
                ('facies_con', '', 'lacustrine', 'lakustrin', 'lacustre', 'lacustre', 170),
                ('facies_con', '', 'fluvio-lacustrine', 'fluvio-lakustrin', 'fluvio-lacustre', 'fluvio-lacustre', 180),
                ('facies_con', '', 'fluvio-lacustrine, sheet', 'fluvio-lakustrin, Schichtablagerung', 'fluvio-lacustre, dépôt stratifié', 'deposito a foglio fluvio-lacustre', 190),
                ('facies_con', '', 'fluvio-lacustrine, mouth-bar', 'fluvio-lakustrin, Mündungsbarren', 'fluvio-lacustre, barre d’embouchure', 'barra di foce fluvio-lacustre', 200),
                ('facies_con', '', 'fluvio-lacustrine, distributary channel', 'fluvio-lakustrin, Distributärkanal', 'fluvio-lacustre, chenal distributaire', 'canale distributario fluvio-lacustre', 210),
                ('facies_con', '', 'fluvio-lacustrine, turbidite', 'fluvio-lakustrin, Turbidite', 'fluvio-lacustre, turbidite', 'turbidite fluvio-lacustre', 220),
                ('facies_con', '', 'ephemeral-lacustrine', 'ephemer-lakustrin', 'lacustre éphémère', 'lacustre, effimero', 230),
                ('facies_con', '', 'ephemeral-lacustrine, fines', 'ephemer-lakustrin, Feinsedimente', 'lacustre éphémère, particules fines', 'sedimenti fini lacustri effimeri', 240),
                ('facies_con', '', 'ephemeral-lacustrine, sheet', 'ephemer-lakustrin, Schichtablagerung', 'lacustre éphémère, dépôt stratifié', 'deposito a foglio lacustre effimero', 250),
                ('facies_con', '', 'aeolian', 'äolisch', 'éolien', 'eolico', 260),
                ('facies_con', '', 'aeolian dunes', 'äolische Dünen', 'dunes éoliennes', 'dune eoliche', 270),
                ('facies_con', '', 'aeolian dunes, barchan', 'äolische Sicheldüne', 'dunes éoliennes, barchanes', 'dune eoliche barchan', 280),
                ('facies_con', '', 'aeolian dunes, ridge', 'äolische Dünenkamm', 'dunes éoliennes, crête', 'dune eoliche a cresta', 290),
                ('facies_con', '', 'aeolian dunes, toe', 'äolische Dünenfuss', 'dunes éoliennes, pied', 'piede di duna eolica', 300),
                ('facies_con', '', 'aeolian dunes, slipface', 'äolische Dünen, Leeseite', 'dunes éoliennes, face au vent', 'duna eolica, versante sottovento', 310),
                ('facies_con', '', 'aeolian interdune', 'äolische Interdüne', 'interdune éolienne', 'interduna eolica', 320),
                ('facies_con', '', 'aeolian flat', 'äolische Ebene', 'plaine éolienne', 'pianura eolica', 330),
                ('facies_con', '', 'aeolian dune field margins', 'äolische Dünenfeldränder', 'marges de champs de dunes éoliennes', 'margini di campi di dune eoliche', 340),
                ('facies_con', '', 'aeolian fans', 'äolische Fächer', 'éventails éoliens', 'ventagli eolici', 350),
                ('facies_con', '', 'aeolian sheet sands', 'äolische Schichtsande', 'sables éoliens stratifiés', 'sabbie eoliche a foglio', 360),
                ('facies_con', '', 'fluvial-aeolian', 'fluvial-äolisch', 'fluvio-éolien', 'fluvio-eolico', 370),
                ('facies_con', '', 'fluvial-aeolian, sheet', 'fluvial-äolisch, Schichtablagerung', 'fluvio-éolien, stratifié', 'deposito a foglio fluvio-eolico', 380),
                ('facies_con', '', 'fluvial-aeolian, distributary channel', 'fluvial-äolisch, Distributärkanal', 'fluvio-éolien, chenal distributaire', 'canale distributario fluvio-eolico', 390),
                ('facies_con', '', 'fluvial-aeolian, fines', 'fluvial-äolisch, Feinsedimente', 'fluvio-éolien, particules fines', 'sedimenti fini fluviali-eolici', 400),
                ('facies_con', '', 'fluvial-aeolian, interdune', 'fluvial-äolisch, Interdune', 'fluvio-éolien, interdune', 'interduna fluviale-eolica', 410),
                ('facies_con', '', 'fluvial-aeolian, flat', 'fluvial-äolisch, Ebene', 'fluvio-éolien, plaine', 'pianura fluviale-eolica', 420),
                ('facies_con', '', 'fluvial-aeolian, dune field margins', 'fluvial-äolisch, Dünenfeldränder', 'fluvio-éolien, marges de champs de dunes', 'margini di campi di dune fluviali-eoliche', 430),
                ('facies_con', '', 'fluvial-aeolian, fans', 'fluvial-äolisch, Fächer', 'fluvio-éolien, éventails', 'ventagli fluviali-eolici', 440),
                ('facies_con', '', 'fluvial-aeolian, sheet sands', 'fluvial-äolisch, Schichtsande', 'fluvio-éolien, sables stratifiés', 'sabbie fluviali-eolici', 450),
                ('facies_con', '', 'fluvio-glacial', 'fluvio-glazial', 'fluvio-glaciaire', 'fluvio-glaciale', 460),
                ('facies_con', '', 'delta', 'Delta', 'delta', 'delta', 470),
                ('facies_con', '', 'deltaic river-dominated', 'deltaisch flussdominiert', 'delta dominé par le fleuve', 'delta fluviale dominato dal fiume', 480),
                ('facies_con', '', 'deltaic river-dominated, offshore', 'deltaisch flussdominiert, offshore', 'delta dominé par le fleuve, au large', 'delta fluviale dominato dal fiume, offshore', 490),
                ('facies_con', '', 'deltaic river-dominated, prodelta', 'deltaisch flussdominiert, Prodelta', 'delta dominé par le fleuve, prodelta', 'delta fluviale dominato dal fiume, prodelta', 500),
                ('facies_con', '', 'deltaic river-dominated, proximal prodelta', 'deltaisch flussdominiert, proximales Prodelta', 'delta dominé par le fleuve, prodelta proximal', 'delta fluviale dominato dal fiume, prodelta prossimale', 510),
                ('facies_con', '', 'deltaic river-dominated, distal prodelta', 'deltaisch flussdominiert, distales Prodelta', 'delta dominé par le fleuve, prodelta distal', 'delta fluviale dominato dal fiume, prodelta distale', 520),
                ('facies_con', '', 'deltaic river-dominated, delta front', 'deltaisch flussdominiert, Deltafront', 'delta dominé par le fleuve, front deltaïque', 'delta fluviale dominato dal fiume, fronte del delta', 530),
                ('facies_con', '', 'deltaic river-dominated, mouth-bar', 'deltaisch flussdominiert, Mündungsbarren', 'delta dominé par le fleuve, barre d’embouchure', 'delta fluviale dominato dal fiume, barra di foce', 540),
                ('facies_con', '', 'deltaic river-dominated, upper mouth-bar', 'deltaisch flussdominiert, oberer Mündungsbarren', 'delta dominé par le fleuve, barre d’embouchure supérieure', 'delta fluviale dominato dal fiume, barra di foce superiore', 550),
                ('facies_con', '', 'deltaic river-dominated, lower mouth-bar', 'deltaisch flussdominiert, unterer Mündungsbarren', 'delta dominé par le fleuve, barre d’embouchure inférieure', 'delta fluviale dominato dal fiume, barra di foce inferiore', 560),
                ('facies_con', '', 'deltaic river-dominated, distributary channel', 'deltaisch flussdominiert, Distributärkanal', 'delta dominé par le fleuve, chenal distributaire', 'delta fluviale dominato dal fiume, canale distributario', 570),
                ('facies_con', '', 'deltaic river-dominated, active distributary channel', 'deltaisch flussdominiert, aktiver Distributärkanal', 'delta dominé par le fleuve, chenal distributaire actif', 'delta fluviale dominato dal fiume, canale distributario attivo', 580),
                ('facies_con', '', 'deltaic river-dominated, abandoned distributary channel', 'deltaisch flussdominiert, verlassener Distributärkanal', 'delta dominé par le fleuve, chenal distributaire abandonné', 'delta fluviale dominato dal fiume, canale distributario abbandonato', 590),
                ('facies_con', '', 'deltaic river-dominated, interdistributary bay', 'deltaisch flussdominiert, Interdistributärbucht', 'delta dominé par le fleuve, baie interdistributaire', 'delta fluviale dominato dal fiume, baia interdistributaria', 600),
                ('facies_con', '', 'deltaic river-dominated, interdistributary bay, fines', 'deltaisch flussdominiert, Feinsedimente in der Interdistributärbucht', 'delta dominé par le fleuve, particules fines de baie interdistributaire', 'delta fluviale dominato dal fiume, baia interdistributaria, sedimenti fini', 610),
                ('facies_con', '', 'deltaic river-dominated, interdistributary bay, crevasse splay', 'deltaisch flussdominiert, Crevasse-Splay in der Interdistributärbucht', 'delta dominé par le fleuve, baie interdistributaire, dépôts de rupture de levée', 'delta fluviale dominato dal fiume, baia interdistributaria, crevasse-splay', 620),
                ('facies_con', '', 'deltaic river-dominated, delta plain', 'deltaisch flussdominiert, Deltaebene', 'delta dominé par le fleuve, plaine deltaïque', 'delta fluviale dominato dal fiume, pianura deltizia', 630),
                ('facies_con', '', 'deltaic wave-dominated', 'deltaisch wellendominiert', 'delta dominé par les vagues', 'delta dominato dalle onde', 640),
                ('facies_con', '', 'deltaic wave-dominated, offshore', 'deltaisch wellendominiert, offshore', 'delta dominé par les vagues, au large', 'delta dominato dalle onde, offshore', 650),
                ('facies_con', '', 'deltaic wave-dominated, lower shoreface', 'deltaisch wellendominiert, unterer Küstenstreifen', 'delta dominé par les vagues, littoral inférieur', 'delta dominato dalle onde, litorale inferiore', 660),
                ('facies_con', '', 'deltaic wave-dominated, middle shoreface', 'deltaisch wellendominiert, mittlerer Küstenstreifen', 'delta dominé par les vagues, littoral moyen', 'delta dominato dalle onde, litorale medio', 670),
                ('facies_con', '', 'deltaic wave-dominated, upper shoreface', 'deltaisch wellendominiert, oberer Küstenstreifen', 'delta dominé par les vagues, littoral supérieur', 'delta dominato dalle onde, litorale superiore', 680),
                ('facies_con', '', 'deltaic wave-dominated, beach/foreshore', 'deltaisch wellendominiert, Strand/Vorstrand', 'delta dominé par les vagues, plage/estran', 'delta dominato dalle onde, spiaggia/battigia', 690),
                ('facies_con', '', 'deltaic wave-dominated, backshore/dunes', 'deltaisch wellendominiert, Hinterstrand/Dünen', 'delta dominé par les vagues, arrière-plage/dunes', 'delta dominato dalle onde, retrospiaggia/dune', 700),
                ('facies_con', '', 'deltaic wave-dominated, barrier', 'deltaisch wellendominiert, Barriere', 'delta dominé par les vagues, barrière', 'delta dominato dalle onde, barriera', 710),
                ('facies_con', '', 'deltaic wave-dominated, lagoon', 'deltaisch wellendominiert, Lagune', 'delta dominé par les vagues, lagune', 'delta dominato dalle onde, laguna', 720),
                ('facies_con', '', 'deltaic wave-dominated, lagoon, fines', 'deltaisch wellendominiert, Feinsedimente der Lagune', 'delta dominé par les vagues, lagune, particules fines', 'delta dominato dalle onde, laguna, sedimenti fini', 730),
                ('facies_con', '', 'deltaic wave-dominated, lagoon, washover', 'deltaisch wellendominiert, Lagunenüberschüttung', 'delta dominé par les vagues, lagune, dépôt d’overwash', 'delta dominato dalle onde, laguna, deposito di washover', 740),
                ('facies_con', '', 'deltaic wave-dominated, coastal plain', 'deltaisch wellendominiert, Küstenebene', 'delta dominé par les vagues, plaine côtière', 'delta dominato dalle onde, pianura costiera', 750),
                ('facies_con', '', 'deltaic tide-dominated', 'deltaisch gezeitendominiert', 'delta dominé par les marées', 'delta dominato dalle maree', 760),
                ('facies_con', '', 'deltaic tide-dominated, offshore', 'deltaisch gezeitendominiert, offshore', 'delta dominé par les marées, au large', 'delta dominato dalle maree, offshore', 770),
                ('facies_con', '', 'deltaic tide-dominated, prodelta', 'deltaisch gezeitendominiert, Prodelta', 'delta dominé par les marées, prodelta', 'delta dominato dalle maree, prodelta', 780),
                ('facies_con', '', 'deltaic tide-dominated, delta front', 'deltaisch von Gezeiten dominiert, Deltafront', 'delta dominé par les marées, front deltaïque', 'delta dominato dalle maree, fronte del delta', 790),
                ('facies_con', '', 'deltaic tide-dominated, tidal ridge', 'deltaisch von Gezeiten dominiert, Gezeitenrücken', 'delta dominé par les marées, crête de marée', 'delta dominato dalle maree, cresta di marea', 800),
                ('facies_con', '', 'deltaic tide-dominated, tidal flat', 'deltaisch von Gezeiten dominiert, Gezeitenfläche', 'delta dominé par les marées, plaine tidale', 'delta dominato dalle maree, pianura tidale', 810),
                ('facies_con', '', 'deltaic tide-dominated, tidal channel', 'deltaisch von Gezeiten dominiert, Gezeitenkanal', 'delta dominé par les marées, chenal de marée', 'delta dominato dalle maree, canale tidale', 820),
                ('facies_con', '', 'deltaic tide-dominated, supratidal flats', 'deltaisch von Gezeiten dominiert, supratidale Flächen', 'delta dominé par les marées, plaine supratidale', 'delta dominato dalle maree, pianure supratidali', 830),
                ('facies_con', '', 'deltaic tide-dominated, salt marsh', 'deltaisch von Gezeiten dominiert, Salzwiese', 'delta dominé par les marées, marais salé', 'delta dominato dalle maree, palude salata', 840),
                ('facies_con', '', 'deltaic shelf edge', 'deltaischer Schelfrand', 'bord du plateau deltaïque', 'margine della piattaforma continentale deltaica', 850),
                ('facies_con', '', 'sabka', 'Sabkha', 'sabkha', 'sabka', 860),
                ('facies_con', '', 'playa', 'Playa', 'playa', 'playa', 870),
                ('facies_con', '', 'salina', 'Salina', 'saline', 'salina', 880),
                ('facies_con', '', 'marine', 'marin', 'marin', 'marino', 890),
                ('facies_con', '', 'marine platform', 'marin, Plattform', 'plateforme marine', 'piattaforma marina', 900),
                ('facies_con', '', 'marine platform, rimmed', 'marin, gerandete Plattform', 'plateforme marine, bordée', 'piattaforma marina bordata', 910),
                ('facies_con', '', 'marine platform, unrimmed', 'marin, unberandete Plattform', 'plateforme marine, non bordée', 'piattaforma marina priva di bordo', 920),
                ('facies_con', '', 'marine platform, ramp', 'marin, Plattform, Karbonatrampe', 'plateforme marine, rampe', 'piattaforma marina a rampa', 930),
                ('facies_con', '', 'marine platform, inner shelf', 'marin, plattforminterner Schelf', 'plateforme marine, plateforme interne', 'piattaforma marina interna', 940),
                ('facies_con', '', 'marine platform, outer shelf', 'marin, plattformexterner Schelf', 'plateforme marine, plateforme externe', 'piattaforma marina esterna', 950),
                ('facies_con', '', 'marine platform, shelf', 'marin, Plattform, Schelf', 'plateforme marine, plateforme', 'piattaforma marina, piattaforma', 960),
                ('facies_con', '', 'marine platform, bank', 'marin, Plattform, Bank', 'plateforme marine, banc', 'piattaforma marina a banco', 970),
                ('facies_con', '', 'marine platform, basin', 'marin, Plattform, Becken', 'plateforme marine, bassin', 'piattaforma marina a bacino', 980),
                ('facies_con', '', 'marine, peritidal', 'marin, peritidal', 'marin, péritidal', 'marino peritidale', 990),
                ('facies_con', '', 'marine, reefs/mounds', 'marin, Riff/Mound', 'marin, récifs/monticules', 'scogliere/monticoli marini', 1000),
                ('facies_con', '', 'marine, back reef', 'marin, Hinterriff', 'marin, arrière-récif', 'retro-scogliera marina', 1010),
                ('facies_con', '', 'marine, reef flat', 'marin, Riffplatte', 'marin, platier récifal', 'pianoro di scogliera marina', 1020),
                ('facies_con', '', 'marine, reef crest', 'marin, Riffkamm', 'marin, crête récifale', 'cresta di scogliera marina', 1030),
                ('facies_con', '', 'marine, reef front', 'marin, Riffvorderseite', 'marin, front récifal', 'fronte di scogliera marina', 1040),
                ('facies_con', '', 'marine, fore reef', 'marin, Vorriff', 'marin, avant-récif', 'avan-scogliera marina', 1050),
                ('facies_con', '', 'marine, slope', 'marin, Kontinentalhang', 'marin, talus continental', 'pendio marino', 1060),
                ('facies_con', '', 'marine, upper slope', 'marin, oberer Kontinentalhang', 'marin, haut talus continental', 'pendio marino superiore', 1070),
                ('facies_con', '', 'marine, lower slope', 'marin, unterer Kontinentalhang', 'marin, bas talus continental', 'pendio marino inferiore', 1080),
                ('facies_con', '', 'marginal marine', 'randmarin', 'marin marginal', 'marino marginale', 1090),
                ('facies_con', '', 'marginal marine, lagoon', 'randmarin, Lagune', 'marin marginal, lagune', 'laguna marina marginale', 1100),
                ('facies_con', '', 'marginal marine, estuary', 'randmarin, Ästuar', 'marin marginal, estuaire', 'estuario marino marginale', 1110),
                ('facies_con', '', 'marginal marine, estuary, fluvial', 'randmarin, Ästuar, fluvial', 'marin marginal, estuaire, fluvial', 'estuario marino marginale fluviale', 1120),
                ('facies_con', '', 'marginal marine, estuary, bay-head delta', 'randmarin, Ästuar, Buchtkopfdelta', 'marin marginal, estuaire, delta en tête de baie', 'estuario marino marginale, delta di testa di baia', 1130),
                ('facies_con', '', 'marginal marine, estuary, central basin', 'randmarin, Ästuar, Zentralbecken', 'marin marginal, estuaire, bassin central', 'estuario marino marginale, bacino centrale', 1140),
                ('facies_con', '', 'marginal marine, estuary, sand plug', 'randmarin, Sandpfropfen des Ästuars', 'marin marginal, estuaire, bouchon de sable', 'estuario marino marginale, tappo di sabbia', 1150),
                ('facies_con', '', 'marginal marine, estuary, tidal', 'randmarin, Ästuar, Gezeiten', 'marin marginal, estuaire, dominé par les marées', 'estuario marino marginale dominato dalle maree', 1160),
                ('facies_con', '', 'marginal marine, incised valley fill', 'randmarin, eingeschnittene Talauffüllung', 'marin marginal, remplissage de vallée incisée', 'riempimento di valle incisa marino marginale', 1170),
                ('facies_con', '', 'shallow marine', 'flachmarin', 'marin peu profond', 'marino poco profondo', 1180),
                ('facies_con', '', 'shallow marine, offshore', 'flachmarin, Offshore', 'marin peu profond, au large', 'marino poco profondo al largo', 1190),
                ('facies_con', '', 'shallow marine, offshore, outer shelf', 'flachmarin, Offshore, äusserer Schelf', 'marin peu profond, au large, plateau extérieur', 'marino poco profondo al largo piattaforma esterna', 1200),
                ('facies_con', '', 'shallow marine, offshore, inner shelf', 'flachmarin, Offshore, innerer Schelf', 'marin peu profond, au large, plateau intérieur', 'marino poco profondo al largo piattaforma interna', 1210),
                ('facies_con', '', 'shallow marine, offshore, tidal shelf ridge', 'flachmarin, Offshore, Gezeitrücken', 'marin peu profond, au large, crête tidale du plateau', 'marino poco profondo, dorsale tidale di piattaforma', 1220),
                ('facies_con', '', 'shallow marine, shoreface', 'flachmarin, am Küstenstreifen', 'marin peu profond, litoral', 'litorale marino poco profondo', 1230),
                ('facies_con', '', 'shallow marine, lower shoreface', 'flachmarin, am unteren Küstenstreifen', 'marin peu profond, litoral inférieur', 'litorale marino poco profondo inferiore', 1240),
                ('facies_con', '', 'shallow marine, lower shoreface, sharp-based', 'flachmarin, am unteren Küstenstreifen, scharf begrenzt', 'marin peu profond, litoral inférieur, à base abrupte', 'litorale marino poco profondo inferiore a base netta', 1250),
                ('facies_con', '', 'shallow marine, lower shoreface, gradationally based', 'flachmarin, am unteren Küstenstreifen, allmählich abfallend', 'marin peu profond, litoral inférieur, à base en pente douce', 'litorale marino poco profondo inferiore a base graduale', 1260),
                ('facies_con', '', 'shallow marine, middle shoreface', 'flachmarin, am mittleren Küstenstreifen', 'marin peu profond, litoral moyen', 'litorale marino poco profondo medio', 1270),
                ('facies_con', '', 'shallow marine, upper shoreface', 'flachmarin, am oberen Küstenstreifen', 'marin peu profond, litoral supérieur', 'litorale marino poco profondo superiore', 1280),
                ('facies_con', '', 'shallow marine, foreshore/beach', 'flachmarin, am Vorstrand/Strand', 'marin peu profond, avant-plage/plage', 'marino poco profondo battigia/spiaggia', 1290),
                ('facies_con', '', 'shallow marine, barrier', 'flachmarin, Barriere', 'marin peu profond, barrière', 'barriera marina poco profonda', 1300),
                ('facies_con', '', 'shallow marine, tidal inlet', 'flachmarin, Gezeitenpassage', 'marin peu profond, chenal d’entrée de marée', 'imboccatura tidale marina poco profonda', 1310),
                ('facies_con', '', 'shallow marine, flood/ebb tidal delta', 'flachmarin, Flut-/Ebbe-Gezeitendelta', 'marin peu profond, delta tidal', 'delta marino poco profondo di marea', 1320),
                ('facies_con', '', 'shallow marine, tidal channel', 'flachmarin, Gezeitenkanal', 'marin peu profond, chenal tidal', 'canale tidale marino poco profondo', 1330),
                ('facies_con', '', 'shallow marine, lag deposit', 'flachmarin, Lagsediment', 'marin peu profond, dépôt résiduel', 'marino poco profondo deposito di lag', 1340),
                ('facies_con', '', 'shallow marine, transgressive lag deposit', 'flachmarin, transgressive Lagsediment', 'marin peu profond, dépôt résiduel transgressif', 'deposito di lag trasgressivo marino poco profondo', 1350),
                ('facies_con', '', 'shallow marine, regressive lag deposit', 'flachmarin, regressive Lagsediment', 'marin peu profond, dépôt résiduel régressif', 'marino poco profondo deposito di lag regressivo', 1360),
                ('facies_con', '', 'deep marine', 'tiefmarin', 'marin profond', 'marino profondo', 1370),
                ('facies_con', '', 'deep marine, pelagic', 'tiefmarin, pelagisch', 'marin profond, pélagique', 'marino profondo pelagico', 1380),
                ('facies_con', '', 'deep marine, hemipelagic', 'tiefmarin, hemipelagisch', 'marin profond, hémipélagique', 'marino profondo emipelagico', 1390),
                ('facies_con', '', 'deep marine, turbidite', 'tiefmarin, Turbidit', 'marin profond, turbidite', 'turbidite marino profondo', 1400),
                ('facies_con', '', 'deep marine, thick-bedded turbidite', 'tiefmarin, dickbankige Turbidit', 'marin profond, turbidite à couches épaisses', 'turbidite marino profondo a strati spessi', 1410),
                ('facies_con', '', 'deep marine, thin-bedded turbidite', 'tiefmarin, dünnbankige Turbidit', 'marin profond, turbidite à couches minces', 'turbidite marino profondo a strati sottili', 1420),
                ('facies_con', '', 'deep marine, channel/levee complex', 'tiefmarin, Kanal-/Deichkomplex', 'marin profond, complexe de chenaux/levées', 'complesso di canali/argini marino profondo', 1430),
                ('facies_con', '', 'deep marine, submarine canyon', 'tiefmarin, Submariner Canyon', 'marin profond, canyon sous-marin', 'canyon sottomarino marino profondo', 1440),
                ('facies_con', '', 'deep marine, fan', 'tiefmarin, Fächer', 'marin profond, éventail', 'ventaglio sottomarino profondo', 1450),
                ('facies_con', '', 'deep marine, fan basin floor', 'tiefmarin, Fächerbeckenboden', 'marin profond, éventail, fond du bassin', 'ventaglio sottomarino profondo, fondo del bacino', 1460),
                ('facies_con', '', 'deep marine, fan toe of slope', 'tiefmarin, Fächerfuss', 'marin profond, éventail, pied de pente', 'ventaglio sottomarino profondo, piede del pendio', 1470),
                ('facies_con', '', 'deep marine, fan slope', 'tiefmarin, Fächerhang', 'marin profond, éventail, pente', 'ventaglio sottomarino profondo, pendio del ventaglio', 1480),
                ('facies_con', '', 'deep marine, fan debris flow', 'tiefmarin, Fächer-Schuttstrom', 'marin profond, éventail, coulée de débris', 'ventaglio sottomarino profondo, flusso di detriti', 1490),
                ('facies_con', '', 'deep marine, fan debris slump', 'tiefmarin, Fächer-Rutschung', 'marin profond, éventail, glissement de débris', 'ventaglio sottomarino profondo, slump di detriti', 1500),
                ('facies_con', '', 'deep marine, slump', 'tiefmarin, Rutschung', 'marin profond, glissement', 'slump marino profondo', 1510),
                ('facies_con', '', 'deep marine, autochthonous', 'tiefmarin, autochthones Sediment', 'marin profond, sédiment autochtone', 'sedimento marino profondo autoctono', 1520),
                ('facies_con', '', 'other ', 'andere', 'autre', 'altro', 1530),
                ('facies_con', '', 'not specified', 'keine Angabe', 'sans indication', 'senza indicazioni', 1540);
            ");

        migrationBuilder.AddColumn<int>(
            name: "facies_id",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_facies_description_facies_id",
            schema: "bdms",
            table: "facies_description",
            column: "facies_id");

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_codelist_facies_id",
            schema: "bdms",
            table: "facies_description",
            column: "facies_id",
            principalSchema: "bdms",
            principalTable: "codelist",
            principalColumn: "id_cli");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_codelist_facies_id",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropIndex(
            name: "IX_facies_description_facies_id",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropColumn(
            name: "facies_id",
            schema: "bdms",
            table: "facies_description");
    }
}
