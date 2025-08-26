using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class AddNewLithologyCodelist : Migration
{
     /// <inheritdoc />
     protected override void Up(MigrationBuilder migrationBuilder)
     {
        migrationBuilder.Sql(@"
        INSERT INTO bdms.codelist(
        id_cli, geolcode, schema_cli, code_cli, text_cli_de, text_cli_fr, text_cli_it,
        text_cli_en, order_cli, conf_cli, default_cli, path_cli
        ) VALUES
          (15104449,NULL,'custom.lithology_top_bedrock',' ','Amphibolit','amphibolite','anfibolite','amphibolite',0, NULL, False, ''),
          (15104450,NULL,'custom.lithology_top_bedrock',' ','Amphibolit, gebändert','amphibolite, rubané','anfibolite, a bande','amphibolite, banded',1, NULL, False, ''),
          (15104451,NULL,'custom.lithology_top_bedrock',' ','Amphibolit, Granat','amphibolite, grenat','anfibolite, granato','amphibolite, garnet',2, NULL, False, ''),
          (15104452,NULL,'custom.lithology_top_bedrock',' ','Amphibolit, Hornblende','amphibolite, hornblende','anfibolite, orneblenda','amphibolite, hornblende',3, NULL, False, ''),
          (15104453,NULL,'custom.lithology_top_bedrock',' ','Amphibolit, migmatitisch','amphibolite, migmatitique','anfibolite, migmatitico','amphibolite, migmatitic',4, NULL, False, ''),
          (15104454,NULL,'custom.lithology_top_bedrock',' ','Andesit','andésite','andesite','andesite',5, NULL, False, ''),
          (15104455,NULL,'custom.lithology_top_bedrock',' ','Aplit','aplite','aplite','aplite',6, NULL, False, ''),
          (15104456,NULL,'custom.lithology_top_bedrock',' ','Basalt','basalte','basalto','basalt',7, NULL, False, ''),
          (15104457,NULL,'custom.lithology_top_bedrock',' ','Basalt, Olivin','basalte, olivine','basalto, olivina','basalt, olivine',8, NULL, False, ''),
          (15104458,NULL,'custom.lithology_top_bedrock',' ','Basalt, verwittert, Albit','basalte, altéré, albite','basalto, alterato, albite','basalt, altered, albite',9, NULL, False, ''),
          (15104459,NULL,'custom.lithology_top_bedrock',' ','Basanit','basanite','basanite','basanite',10, NULL, False, ''),
          (15104460,NULL,'custom.lithology_top_bedrock',' ','Bentonit','bentonite','bentonite','bentonite',11, NULL, False, ''),
          (15104461,NULL,'custom.lithology_top_bedrock',' ','Brekzie','brèche','breccia','breccia',12, NULL, False, ''),
          (15104462,NULL,'custom.lithology_top_bedrock',' ','Brekzie, dolomitisch','brèche, dolomitique','breccia, dolomitico','breccia, dolomitic',13, NULL, False, ''),
          (15104463,NULL,'custom.lithology_top_bedrock',' ','Brekzie, dolomitisch, Bitumen','brèche, dolomitique, bitume','breccia, dolomitico, bitume','breccia, dolomitic, bitumen',14, NULL, False, ''),
          (15104464,NULL,'custom.lithology_top_bedrock',' ','Brekzie, dolomitisch-kataklastisch','brèche, dolomitique-cataclastique','breccia, dolomitico-cataclastico','breccia, dolomitic-cataclastic',15, NULL, False, ''),
          (15104465,NULL,'custom.lithology_top_bedrock',' ','Brekzie, dolomitisch-polymikt','brèche, dolomitique-polymicte','breccia, dolomitico-polimittico','breccia, dolomitic-polymictic',16, NULL, False, ''),
          (15104466,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kakiritisch','brèche, kakiritique','breccia, cachiritico','breccia, kakiritic',17, NULL, False, ''),
          (15104467,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kalkig','brèche, calcaire','breccia, calcareo','breccia, calcareous',18, NULL, False, ''),
          (15104468,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kalkig, Bioklasten','brèche, calcaire, bioclastes','breccia, calcareo, bioclasti','breccia, calcareous, bioclasts',19, NULL, False, ''),
          (15104469,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kalkig-dolomitisch','brèche, calcaire-dolomitique','breccia, calcareo-dolomitico','breccia, calcareous-dolomitic',20, NULL, False, ''),
          (15104470,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kalkig-polymikt','brèche, calcaire-polymicte','breccia, calcareo-polimittico','breccia, calcareous-polymictic',21, NULL, False, ''),
          (15104471,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kataklastisch','brèche, cataclastique','breccia, cataclastico','breccia, cataclastic',22, NULL, False, ''),
          (15104472,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kristallin','brèche, cristallin','breccia, cristallino','breccia, crystalline',23, NULL, False, ''),
          (15104473,NULL,'custom.lithology_top_bedrock',' ','Brekzie, kristallin-polymikt','brèche, cristallin-polymicte','breccia, cristallino-polimittico','breccia, crystalline-polymictic',24, NULL, False, ''),
          (15104474,NULL,'custom.lithology_top_bedrock',' ','Brekzie, monomikt','brèche, monomicte','breccia, monomittico','breccia, monomictic',25, NULL, False, ''),
          (15104475,NULL,'custom.lithology_top_bedrock',' ','Brekzie, polymikt','brèche, polymicte','breccia, polimittico','breccia, polymictic',26, NULL, False, ''),
          (15104476,NULL,'custom.lithology_top_bedrock',' ','Brekzie, pyroklastisch','brèche, pyroclastique','breccia, piroclastico','breccia, pyroclastic',27, NULL, False, ''),
          (15104477,NULL,'custom.lithology_top_bedrock',' ','Brekzie, rhyolithisch','brèche, rhyolitique','breccia, riolitico','breccia, rhyolitic',28, NULL, False, ''),
          (15104478,NULL,'custom.lithology_top_bedrock',' ','Brekzie, sandig','brèche, sableux','breccia, sabbioso','breccia, sandy',29, NULL, False, ''),
          (15104479,NULL,'custom.lithology_top_bedrock',' ','Brekzie, tektonisch','brèche, tectonique','breccia, tettonico','breccia, tectonic',30, NULL, False, ''),
          (15104480,NULL,'custom.lithology_top_bedrock',' ','Brekzie, tuffitisch','brèche, tuffitique','breccia, tufitico','breccia, tuffitic',31, NULL, False, ''),
          (15104481,NULL,'custom.lithology_top_bedrock',' ','Dazit','dacite','dacite','dacite',32, NULL, False, ''),
          (15104482,NULL,'custom.lithology_top_bedrock',' ','Dazit, rhyolithisch','dacite, rhyolitique','dacite, riolitico','dacite, rhyolitic',33, NULL, False, ''),
          (15104483,NULL,'custom.lithology_top_bedrock',' ','Diorit','diorite','diorite','diorite',34, NULL, False, ''),
          (15104484,NULL,'custom.lithology_top_bedrock',' ','Diorit, Biotit-Hornblende','diorite, biotite-hornblende','diorite, biotite-orneblenda','diorite, biotite-hornblende',35, NULL, False, ''),
          (15104485,NULL,'custom.lithology_top_bedrock',' ','Diorit, migmatitisch','diorite, migmatitique','diorite, migmatitico','diorite, migmatitic',36, NULL, False, ''),
          (15104486,NULL,'custom.lithology_top_bedrock',' ','Diorit, mikrokristallin','diorite, microcristallin','diorite, microcristallino','diorite, microcrystalline',37, NULL, False, ''),
          (15104487,NULL,'custom.lithology_top_bedrock',' ','Diorit, monzonitisch','diorite, monzonitique','diorite, monzonitico','diorite, monzonitic',38, NULL, False, ''),
          (15104488,NULL,'custom.lithology_top_bedrock',' ','Diorit, porphyrisch','diorite, porphyrique','diorite, porfirico','diorite, porphyric',39, NULL, False, ''),
          (15104489,NULL,'custom.lithology_top_bedrock',' ','Diorit, Quarz','diorite, quartz','diorite, quarzo','diorite, quartz',40, NULL, False, ''),
          (15104490,NULL,'custom.lithology_top_bedrock',' ','Diorit, Quarz-Biotit','diorite, quartz-biotite','diorite, quarzo-biotite','diorite, quartz-biotite',41, NULL, False, ''),
          (15104491,NULL,'custom.lithology_top_bedrock',' ','Diorit, Quarz-Epidot','diorite, quartz-épidote','diorite, quarzo-epidoto','diorite, quartz-epidote',42, NULL, False, ''),
          (15104492,NULL,'custom.lithology_top_bedrock',' ','Diorit, Quarz-Hornblende','diorite, quartz-hornblende','diorite, quarzo-orneblenda','diorite, quartz-hornblende',43, NULL, False, ''),
          (15104493,NULL,'custom.lithology_top_bedrock',' ','Diorit, schiefrig','diorite, schisteux','diorite, scistoso','diorite, schistose',44, NULL, False, ''),
          (15104494,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein','dolomie','dolomia','dolostone',45, NULL, False, ''),
          (15104495,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, Bioklasten','dolomie, bioclastes','dolomia, bioclasti','dolostone, bioclasts',46, NULL, False, ''),
          (15104496,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, Bitumen','dolomie, bitume','dolomia, bitume','dolostone, bitumen',47, NULL, False, ''),
          (15104497,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, kalkig','dolomie, calcaire','dolomia, calcareo','dolostone, calcareous',48, NULL, False, ''),
          (15104498,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, kieselig','dolomie, siliceux','dolomia, siliceo','dolostone, siliceous',49, NULL, False, ''),
          (15104499,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, mikritisch','dolomie, micritique','dolomia, micritico','dolostone, micritic',50, NULL, False, ''),
          (15104500,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, Ooide','dolomie, ooïdes','dolomia, ooidi','dolostone, ooids',51, NULL, False, ''),
          (15104501,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, Ooide-Chert','dolomie, ooïdes-silex','dolomia, ooidi-selce','dolostone, ooids-chert',52, NULL, False, ''),
          (15104502,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, sandig','dolomie, sableux','dolomia, sabbioso','dolostone, sandy',53, NULL, False, ''),
          (15104503,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, sandig-siltig','dolomie, sableux-silteux','dolomia, sabbioso-siltoso','dolostone, sandy-silty',54, NULL, False, ''),
          (15104504,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, sandig-tonig','dolomie, sableux-argileux','dolomia, sabbioso-argilloso','dolostone, sandy-clayey',55, NULL, False, ''),
          (15104505,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, sandig-tonig, Bitumen','dolomie, sableux-argileux, bitume','dolomia, sabbioso-argilloso, bitume','dolostone, sandy-clayey, bitumen',56, NULL, False, ''),
          (15104506,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, schiefrig','dolomie, schisteux','dolomia, scistoso','dolostone, schistose',57, NULL, False, ''),
          (15104507,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, siltig','dolomie, silteux','dolomia, siltoso','dolostone, silty',58, NULL, False, ''),
          (15104508,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, siltig-tonig','dolomie, silteux-argileux','dolomia, siltoso-argilloso','dolostone, silty-clayey',59, NULL, False, ''),
          (15104509,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, spätig','dolomie, spathique','dolomia, spatico','dolostone, spathic',60, NULL, False, ''),
          (15104510,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, spätig, Bioklasten','dolomie, spathique, bioclastes','dolomia, spatico, bioclasti','dolostone, spathic, bioclasts',61, NULL, False, ''),
          (15104511,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, stromatolithisch','dolomie, stromatolitique','dolomia, stromatolitico','dolostone, stromatolitic',62, NULL, False, ''),
          (15104512,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, stromatolithisch, Chert','dolomie, stromatolitique, silex','dolomia, stromatolitico, selce','dolostone, stromatolitic, chert',63, NULL, False, ''),
          (15104513,NULL,'custom.lithology_top_bedrock',' ','Dolomitstein, tonig','dolomie, argileux','dolomia, argilloso','dolostone, clayey',64, NULL, False, ''),
          (15104514,NULL,'custom.lithology_top_bedrock',' ','Eklogit','éclogite','eclogite','eclogite',65, NULL, False, ''),
          (15104515,NULL,'custom.lithology_top_bedrock',' ','Evaporit','évaporite','evaporite','evaporite',66, NULL, False, ''),
          (15104516,NULL,'custom.lithology_top_bedrock',' ','Evaporit, Anhydrit','évaporite, anhydrite','evaporite, anidrite','evaporite, anhydrite',67, NULL, False, ''),
          (15104517,NULL,'custom.lithology_top_bedrock',' ','Evaporit, Gips','évaporite, gypse','evaporite, gesso','evaporite, gypsum',68, NULL, False, ''),
          (15104518,NULL,'custom.lithology_top_bedrock',' ','Evaporit, Halit','évaporite, halite','evaporite, halite','evaporite, halite',69, NULL, False, ''),
          (15104519,NULL,'custom.lithology_top_bedrock',' ','Evaporit, Sulfat','évaporite, sulfate','evaporite, solfato','evaporite, sulfate',70, NULL, False, ''),
          (15104520,NULL,'custom.lithology_top_bedrock',' ','Evaporit, tonig, Anhydrit','évaporite, argileux, anhydrite','evaporite, argilloso, anidrite','evaporite, clayey, anhydrite',71, NULL, False, ''),
          (15104521,NULL,'custom.lithology_top_bedrock',' ','Evaporit, tonig, Gips','évaporite, argileux, gypse','evaporite, argilloso, gesso','evaporite, clayey, gypsum',72, NULL, False, ''),
          (15104522,NULL,'custom.lithology_top_bedrock',' ','Foidit','foïdite','foidite','foidite',73, NULL, False, ''),
          (15104523,NULL,'custom.lithology_top_bedrock',' ','Foidolit','foïdolite','foidolite','foidolite',74, NULL, False, ''),
          (15104524,NULL,'custom.lithology_top_bedrock',' ','Gabbro','gabbro','gabbro','gabbro',75, NULL, False, ''),
          (15104525,NULL,'custom.lithology_top_bedrock',' ','Gabbro, Hornblende','gabbro, hornblende','gabbro, orneblenda','gabbro, hornblende',76, NULL, False, ''),
          (15104526,NULL,'custom.lithology_top_bedrock',' ','Gabbro, mikrokristallin','gabbro, microcristallin','gabbro, microcristallino','gabbro, microcrystalline',77, NULL, False, ''),
          (15104527,NULL,'custom.lithology_top_bedrock',' ','Gabbro, monzonitisch','gabbro, monzonitique','gabbro, monzonitico','gabbro, monzonitic',78, NULL, False, ''),
          (15104528,NULL,'custom.lithology_top_bedrock',' ','Gabbro, monzonitisch, Nephelin','gabbro, monzonitique, néphéline','gabbro, monzonitico, nefelina','gabbro, monzonitic, nepheline',79, NULL, False, ''),
          (15104529,NULL,'custom.lithology_top_bedrock',' ','Gabbro, mylonitisch','gabbro, mylonitique','gabbro, milonitico','gabbro, mylonitic',80, NULL, False, ''),
          (15104530,NULL,'custom.lithology_top_bedrock',' ','Gabbro, Olivin','gabbro, olivine','gabbro, olivina','gabbro, olivine',81, NULL, False, ''),
          (15104531,NULL,'custom.lithology_top_bedrock',' ','Gabbro, Omphazit','gabbro, omphacite','gabbro, omfacite','gabbro, omphacite',82, NULL, False, ''),
          (15104532,NULL,'custom.lithology_top_bedrock',' ','Gabbro, Orthopyroxen','gabbro, orthopyroxène','gabbro, ortopirosseno','gabbro, orthopyroxene',83, NULL, False, ''),
          (15104533,NULL,'custom.lithology_top_bedrock',' ','Gabbro, Quarz','gabbro, quartz','gabbro, quarzo','gabbro, quartz',84, NULL, False, ''),
          (15104534,NULL,'custom.lithology_top_bedrock',' ','Gestein','roche','roccia','rock',85, NULL, False, ''),
          (15104535,NULL,'custom.lithology_top_bedrock',' ','Gestein, andesitisch','roche, andésitique','roccia, andesitico','rock, andesitic',86, NULL, False, ''),
          (15104536,NULL,'custom.lithology_top_bedrock',' ','Gestein, basaltisch','roche, basaltique','roccia, basaltico','rock, basaltic',87, NULL, False, ''),
          (15104537,NULL,'custom.lithology_top_bedrock',' ','Gestein, basisch','roche, basique','roccia, basico','rock, basic',88, NULL, False, ''),
          (15104538,NULL,'custom.lithology_top_bedrock',' ','Gestein, basisch-gangartig','roche, basique-filonien','roccia, basico-filoniano','rock, basic-filonian',89, NULL, False, ''),
          (15104539,NULL,'custom.lithology_top_bedrock',' ','Gestein, basisch-plutonisch','roche, basique-plutonique','roccia, basico-plutonico','rock, basic-plutonic',90, NULL, False, ''),
          (15104540,NULL,'custom.lithology_top_bedrock',' ','Gestein, basisch-vulkanisch','roche, basique-volcanique','roccia, basico-vulcanico','rock, basic-volcanic',91, NULL, False, ''),
          (15104541,NULL,'custom.lithology_top_bedrock',' ','Gestein, dazitisch','roche, dacitique','roccia, dacitico','rock, dacitic',92, NULL, False, ''),
          (15104542,NULL,'custom.lithology_top_bedrock',' ','Gestein, dioritisch','roche, dioritique','roccia, dioritico','rock, dioritic',93, NULL, False, ''),
          (15104543,NULL,'custom.lithology_top_bedrock',' ','Gestein, Eisenmineralien','roche, minéraux de fer','roccia, mineri di ferro','rock, iron minerals',94, NULL, False, ''),
          (15104544,NULL,'custom.lithology_top_bedrock',' ','Gestein, Eisenooide','roche, ooïdes ferrugineuses','roccia, ooidi di ferro','rock, ferruginous ooids',95, NULL, False, ''),
          (15104545,NULL,'custom.lithology_top_bedrock',' ','Gestein, foiditisch','roche, foïditique','roccia, foiditico','rock, foiditic',96, NULL, False, ''),
          (15104546,NULL,'custom.lithology_top_bedrock',' ','Gestein, foidolitisch','roche, foïdolitique','roccia, foidolitico','rock, foidolitic',97, NULL, False, ''),
          (15104547,NULL,'custom.lithology_top_bedrock',' ','Gestein, gabbroisch','roche, gabbroïque','roccia, gabbroico','rock, gabbroic',98, NULL, False, ''),
          (15104548,NULL,'custom.lithology_top_bedrock',' ','Gestein, gangartig','roche, filonien','roccia, filoniano','rock, filonian',99, NULL, False, ''),
          (15104549,NULL,'custom.lithology_top_bedrock',' ','Gestein, granitisch','roche, granitique','roccia, granitico','rock, granitic',100, NULL, False, ''),
          (15104550,NULL,'custom.lithology_top_bedrock',' ','Gestein, Karbonat','roche, carbonate','roccia, carbonato','rock, carbonate',101, NULL, False, ''),
          (15104551,NULL,'custom.lithology_top_bedrock',' ','Gestein, kieselig','roche, siliceux','roccia, siliceo','rock, siliceous',102, NULL, False, ''),
          (15104552,NULL,'custom.lithology_top_bedrock',' ','Gestein, kieselig, Radiolarien','roche, siliceux, radiolaires','roccia, siliceo, radiolari','rock, siliceous, radiolarians',103, NULL, False, ''),
          (15104553,NULL,'custom.lithology_top_bedrock',' ','Gestein, kieselig, Schwämme','roche, siliceux, éponges','roccia, siliceo, spunghe','rock, siliceous, sponges',104, NULL, False, ''),
          (15104554,NULL,'custom.lithology_top_bedrock',' ','Gestein, kieselig-kryptokristallin','roche, siliceux-kryptocristallin','roccia, siliceo-criptocristallino','rock, siliceous-kryptokrystalline',105, NULL, False, ''),
          (15104555,NULL,'custom.lithology_top_bedrock',' ','Gestein, kieselig-pedogen','roche, siliceux-pédogène','roccia, siliceo-pedogene','rock, siliceous-pedogenic',106, NULL, False, ''),
          (15104556,NULL,'custom.lithology_top_bedrock',' ','Gestein, klastisch','roche, clastique','roccia, clastico','rock, clastic',107, NULL, False, ''),
          (15104557,NULL,'custom.lithology_top_bedrock',' ','Gestein, kristallin','roche, cristallin','roccia, cristallino','rock, crystalline',108, NULL, False, ''),
          (15104558,NULL,'custom.lithology_top_bedrock',' ','Gestein, mafisch','roche, mafique','roccia, mafico','rock, mafic',109, NULL, False, ''),
          (15104559,NULL,'custom.lithology_top_bedrock',' ','Gestein, magmatisch','roche, magmatique','roccia, magmatico','rock, magmatic',110, NULL, False, ''),
          (15104560,NULL,'custom.lithology_top_bedrock',' ','Gestein, metamorph','roche, métamorphique','roccia, metamorfico','rock, metamorphic',111, NULL, False, ''),
          (15104561,NULL,'custom.lithology_top_bedrock',' ','Gestein, metasomatisch','roche, métasomatique','roccia, metasomatico','rock, metasomatic',112, NULL, False, ''),
          (15104562,NULL,'custom.lithology_top_bedrock',' ','Gestein, organisch','roche, organique','roccia, organico','rock, organic',113, NULL, False, ''),
          (15104563,NULL,'custom.lithology_top_bedrock',' ','Gestein, organisch, Anthrazit','roche, organique, anthracite','roccia, organico, antracite','rock, organic, anthracite',114, NULL, False, ''),
          (15104564,NULL,'custom.lithology_top_bedrock',' ','Gestein, organisch, Kohle','roche, organique, charbon','roccia, organico, carbone','rock, organic, coal',115, NULL, False, ''),
          (15104565,NULL,'custom.lithology_top_bedrock',' ','Gestein, organisch, Lignit','roche, organique, lignite','roccia, organico, lignite','rock, organic, lignite',116, NULL, False, ''),
          (15104566,NULL,'custom.lithology_top_bedrock',' ','Gestein, pedogen','roche, pédogène','roccia, pedogene','rock, pedogenic',117, NULL, False, ''),
          (15104567,NULL,'custom.lithology_top_bedrock',' ','Gestein, pedogen, Karbonat','roche, pédogène, carbonate','roccia, pedogene, carbonato','rock, pedogenic, carbonate',118, NULL, False, ''),
          (15104568,NULL,'custom.lithology_top_bedrock',' ','Gestein, pedogen-verkrustet, Karbonat','roche, pédogène-encroûté, carbonate','roccia, pedogene-incrostato, carbonato','rock, pedogenic-encrusted, carbonate',119, NULL, False, ''),
          (15104569,NULL,'custom.lithology_top_bedrock',' ','Gestein, phonolithisch','roche, phonolitique','roccia, fonolitico','rock, phonolitic',120, NULL, False, ''),
          (15104570,NULL,'custom.lithology_top_bedrock',' ','Gestein, Phosphorit','roche, phosphate','roccia, fosfato','rock, phosphate',121, NULL, False, ''),
          (15104571,NULL,'custom.lithology_top_bedrock',' ','Gestein, plutonisch','roche, plutonique','roccia, plutonico','rock, plutonic',122, NULL, False, ''),
          (15104572,NULL,'custom.lithology_top_bedrock',' ','Gestein, pyroklastisch','roche, pyroclastique','roccia, piroclastico','rock, pyroclastic',123, NULL, False, ''),
          (15104573,NULL,'custom.lithology_top_bedrock',' ','Gestein, residual','roche, résiduel','roccia, residuale','rock, residual',124, NULL, False, ''),
          (15104574,NULL,'custom.lithology_top_bedrock',' ','Gestein, residual, Eisenmineralien','roche, résiduel, minéraux de fer','roccia, residuale, mineri di ferro','rock, residual, iron minerals',125, NULL, False, ''),
          (15104575,NULL,'custom.lithology_top_bedrock',' ','Gestein, residual, Silikat','roche, résiduel, silicate','roccia, residuale, silicato','rock, residual, silicate',126, NULL, False, ''),
          (15104576,NULL,'custom.lithology_top_bedrock',' ','Gestein, residual, Silikate-Eisenmineralien','roche, résiduel, silicate-minéraux de fer','roccia, residuale, silicato-mineri di ferro','rock, residual, silicate-iron minerals',127, NULL, False, ''),
          (15104577,NULL,'custom.lithology_top_bedrock',' ','Gestein, rhyolithisch','roche, rhyolitique','roccia, riolitico','rock, rhyolitic',128, NULL, False, ''),
          (15104578,NULL,'custom.lithology_top_bedrock',' ','Gestein, saur-gangartig','roche, acide-filonien','roccia, acido-filoniano','rock, acidic-filonian',129, NULL, False, ''),
          (15104579,NULL,'custom.lithology_top_bedrock',' ','Gestein, saur-plutonisch','roche, acide-plutonique','roccia, acido-plutonico','rock, acidic-plutonic',130, NULL, False, ''),
          (15104580,NULL,'custom.lithology_top_bedrock',' ','Gestein, saur-vulkanisch','roche, acide-volcanique','roccia, acido-vulcanico','rock, acidic-volcanic',131, NULL, False, ''),
          (15104581,NULL,'custom.lithology_top_bedrock',' ','Gestein, sedimentär','roche, sédimentaire','roccia, sedimentario','rock, sedimentary',132, NULL, False, ''),
          (15104582,NULL,'custom.lithology_top_bedrock',' ','Gestein, syenitisch','roche, syénitique','roccia, sienitico','rock, syenitic',133, NULL, False, ''),
          (15104583,NULL,'custom.lithology_top_bedrock',' ','Gestein, tektonisch','roche, tectonique','roccia, tettonico','rock, tectonic',134, NULL, False, ''),
          (15104584,NULL,'custom.lithology_top_bedrock',' ','Gestein, tephritisch','roche, téphritique','roccia, tefritico','rock, tephritic',135, NULL, False, ''),
          (15104585,NULL,'custom.lithology_top_bedrock',' ','Gestein, trachytisch','roche, trachytique','roccia, trachitico','rock, trachytic',136, NULL, False, ''),
          (15104586,NULL,'custom.lithology_top_bedrock',' ','Gestein, ultramafisch','roche, ultramafique','roccia, ultramafico','rock, ultramafic',137, NULL, False, ''),
          (15104587,NULL,'custom.lithology_top_bedrock',' ','Gestein, vulkanisch','roche, volcanique','roccia, vulcanico','rock, volcanic',138, NULL, False, ''),
          (15104588,NULL,'custom.lithology_top_bedrock',' ','Gestein, vulkanisch, Karbonat','roche, volcanique, carbonate','roccia, vulcanico, carbonato','rock, volcanic, carbonate',139, NULL, False, ''),
          (15104589,NULL,'custom.lithology_top_bedrock',' ','Gneis','gneiss','gneiss','gneiss',140, NULL, False, ''),
          (15104590,NULL,'custom.lithology_top_bedrock',' ','Gneis, Albit','gneiss, albite','gneiss, albite','gneiss, albite',141, NULL, False, ''),
          (15104591,NULL,'custom.lithology_top_bedrock',' ','Gneis, Albit-Oligoklas','gneiss, albite-oligoclase','gneiss, albite-oligoclasio','gneiss, albite-oligoclase',142, NULL, False, ''),
          (15104592,NULL,'custom.lithology_top_bedrock',' ','Gneis, Aluminosilikat','gneiss, aluminosilicate','gneiss, aluminosilicato','gneiss, aluminosilicate',143, NULL, False, ''),
          (15104593,NULL,'custom.lithology_top_bedrock',' ','Gneis, Amphibol','gneiss, amphibole','gneiss, anfibolo','gneiss, amphibole',144, NULL, False, ''),
          (15104594,NULL,'custom.lithology_top_bedrock',' ','Gneis, augig','gneiss, oeillé','gneiss, occhiadino','gneiss, augen',145, NULL, False, ''),
          (15104595,NULL,'custom.lithology_top_bedrock',' ','Gneis, augig, Phengit','gneiss, oeillé, phengite','gneiss, occhiadino, fengite','gneiss, augen, phengite',146, NULL, False, ''),
          (15104596,NULL,'custom.lithology_top_bedrock',' ','Gneis, Biotit','gneiss, biotite','gneiss, biotite','gneiss, biotite',147, NULL, False, ''),
          (15104597,NULL,'custom.lithology_top_bedrock',' ','Gneis, Biotit-Hornblende','gneiss, biotite-hornblende','gneiss, biotite-orneblenda','gneiss, biotite-hornblende',148, NULL, False, ''),
          (15104598,NULL,'custom.lithology_top_bedrock',' ','Gneis, Biotit-Muskovit','gneiss, biotite-muscovite','gneiss, biotite-muscovite','gneiss, biotite-muscovite',149, NULL, False, ''),
          (15104599,NULL,'custom.lithology_top_bedrock',' ','Gneis, Chlorit','gneiss, chlorite','gneiss, clorite','gneiss, chlorite',150, NULL, False, ''),
          (15104600,NULL,'custom.lithology_top_bedrock',' ','Gneis, dioritisch','gneiss, dioritique','gneiss, dioritico','gneiss, dioritic',151, NULL, False, ''),
          (15104601,NULL,'custom.lithology_top_bedrock',' ','Gneis, gebändert','gneiss, rubané','gneiss, a bande','gneiss, banded',152, NULL, False, ''),
          (15104602,NULL,'custom.lithology_top_bedrock',' ','Gneis, gebändert, Granat','gneiss, rubané, grenat','gneiss, a bande, granato','gneiss, banded, garnet',153, NULL, False, ''),
          (15104603,NULL,'custom.lithology_top_bedrock',' ','Gneis, Granat','gneiss, grenat','gneiss, granato','gneiss, garnet',154, NULL, False, ''),
          (15104604,NULL,'custom.lithology_top_bedrock',' ','Gneis, granitisch','gneiss, granitique','gneiss, granitico','gneiss, granitic',155, NULL, False, ''),
          (15104605,NULL,'custom.lithology_top_bedrock',' ','Gneis, granitisch-augig','gneiss, granitique-oeillé','gneiss, granitico-occhiadino','gneiss, granitic-augen',156, NULL, False, ''),
          (15104606,NULL,'custom.lithology_top_bedrock',' ','Gneis, granodioritisch','gneiss, granodioritique','gneiss, granodioritico','gneiss, granodioritic',157, NULL, False, ''),
          (15104607,NULL,'custom.lithology_top_bedrock',' ','Gneis, granulitisch','gneiss, granulitique','gneiss, granulitico','gneiss, granulitic',158, NULL, False, ''),
          (15104608,NULL,'custom.lithology_top_bedrock',' ','Gneis, Hornblende','gneiss, hornblende','gneiss, orneblenda','gneiss, hornblende',159, NULL, False, ''),
          (15104609,NULL,'custom.lithology_top_bedrock',' ','Gneis, magmatisch','gneiss, magmatique','gneiss, magmatico','gneiss, magmatic',160, NULL, False, ''),
          (15104610,NULL,'custom.lithology_top_bedrock',' ','Gneis, magmatisch-augig','gneiss, magmatique-oeillé','gneiss, magmatico-occhiadino','gneiss, magmatic-augen',161, NULL, False, ''),
          (15104611,NULL,'custom.lithology_top_bedrock',' ','Gneis, magmatisch-augig, Cordierit','gneiss, magmatique-oeillé, cordiérite','gneiss, magmatico-occhiadino, cordierite','gneiss, magmatic-augen, cordierite',162, NULL, False, ''),
          (15104612,NULL,'custom.lithology_top_bedrock',' ','Gneis, migmatitisch','gneiss, migmatitique','gneiss, migmatitico','gneiss, migmatitic',163, NULL, False, ''),
          (15104613,NULL,'custom.lithology_top_bedrock',' ','Gneis, migmatitisch, Cordierit','gneiss, migmatitique, cordiérite','gneiss, migmatitico, cordierite','gneiss, migmatitic, cordierite',164, NULL, False, ''),
          (15104614,NULL,'custom.lithology_top_bedrock',' ','Gneis, migmatitisch-augig','gneiss, migmatitique-oeillé','gneiss, migmatitico-occhiadino','gneiss, migmatitic-augen',165, NULL, False, ''),
          (15104615,NULL,'custom.lithology_top_bedrock',' ','Gneis, Muskovit','gneiss, muscovite','gneiss, muscovite','gneiss, muscovite',166, NULL, False, ''),
          (15104616,NULL,'custom.lithology_top_bedrock',' ','Gneis, mylonitisch','gneiss, mylonitique','gneiss, milonitico','gneiss, mylonitic',167, NULL, False, ''),
          (15104617,NULL,'custom.lithology_top_bedrock',' ','Gneis, Phengit','gneiss, phengite','gneiss, fengite','gneiss, phengite',168, NULL, False, ''),
          (15104618,NULL,'custom.lithology_top_bedrock',' ','Gneis, psammitisch','gneiss, psammitique','gneiss, psammitico','gneiss, psammitic',169, NULL, False, ''),
          (15104619,NULL,'custom.lithology_top_bedrock',' ','Gneis, psephitisch','gneiss, pséphitique','gneiss, psefitico','gneiss, psephitic',170, NULL, False, ''),
          (15104620,NULL,'custom.lithology_top_bedrock',' ','Gneis, psephitisch, Phengit','gneiss, pséphitique, phengite','gneiss, psefitico, fengite','gneiss, psephitic, phengite',171, NULL, False, ''),
          (15104621,NULL,'custom.lithology_top_bedrock',' ','Gneis, schiefrig','gneiss, schisteux','gneiss, scistoso','gneiss, schistose',172, NULL, False, ''),
          (15104622,NULL,'custom.lithology_top_bedrock',' ','Gneis, schiefrig, Biotit','gneiss, schisteux, biotite','gneiss, scistoso, biotite','gneiss, schistose, biotite',173, NULL, False, ''),
          (15104623,NULL,'custom.lithology_top_bedrock',' ','Gneis, schiefrig, Chlorit','gneiss, schisteux, chlorite','gneiss, scistoso, clorite','gneiss, schistose, chlorite',174, NULL, False, ''),
          (15104624,NULL,'custom.lithology_top_bedrock',' ','Gneis, schiefrig, Hornblende','gneiss, schisteux, hornblende','gneiss, scistoso, orneblenda','gneiss, schistose, hornblende',175, NULL, False, ''),
          (15104625,NULL,'custom.lithology_top_bedrock',' ','Gneis, schiefrig-augig','gneiss, schisteux-oeillé','gneiss, scistoso-occhiadino','gneiss, schistose-augen',176, NULL, False, ''),
          (15104626,NULL,'custom.lithology_top_bedrock',' ','Gneis, sedimentär','gneiss, sédimentaire','gneiss, sedimentario','gneiss, sedimentary',177, NULL, False, ''),
          (15104627,NULL,'custom.lithology_top_bedrock',' ','Gneis, Serizit','gneiss, séricite','gneiss, sericite','gneiss, sericite',178, NULL, False, ''),
          (15104628,NULL,'custom.lithology_top_bedrock',' ','Gneis, Serizit-Granat','gneiss, séricite-grenat','gneiss, sericite-granato','gneiss, sericite-garnet',179, NULL, False, ''),
          (15104629,NULL,'custom.lithology_top_bedrock',' ','Granit','granite','granito','granite',180, NULL, False, ''),
          (15104630,NULL,'custom.lithology_top_bedrock',' ','Granit, Alkalifeldspat','granite, feldspath alcalin','granito, feldspato alcalino','granite, alkali feldspar',181, NULL, False, ''),
          (15104631,NULL,'custom.lithology_top_bedrock',' ','Granit, aplitisch','granite, aplitique','granito, aplitico','granite, aplitic',182, NULL, False, ''),
          (15104632,NULL,'custom.lithology_top_bedrock',' ','Granit, aplitisch, Granat','granite, aplitique, grenat','granito, aplitico, granato','granite, aplitic, garnet',183, NULL, False, ''),
          (15104633,NULL,'custom.lithology_top_bedrock',' ','Granit, Biotit','granite, biotite','granito, biotite','granite, biotite',184, NULL, False, ''),
          (15104634,NULL,'custom.lithology_top_bedrock',' ','Granit, Biotit-Cordierit','granite, biotite-cordiérite','granito, biotite-cordierite','granite, biotite-cordierite',185, NULL, False, ''),
          (15104635,NULL,'custom.lithology_top_bedrock',' ','Granit, Biotit-Granat','granite, biotite-grenat','granito, biotite-granato','granite, biotite-garnet',186, NULL, False, ''),
          (15104636,NULL,'custom.lithology_top_bedrock',' ','Granit, Biotit-Muskovit','granite, biotite-muscovite','granito, biotite-muscovite','granite, biotite-muscovite',187, NULL, False, ''),
          (15104637,NULL,'custom.lithology_top_bedrock',' ','Granit, Hornblende','granite, hornblende','granito, orneblenda','granite, hornblende',188, NULL, False, ''),
          (15104638,NULL,'custom.lithology_top_bedrock',' ','Granit, metasomatisch','granite, métasomatique','granito, metasomatico','granite, metasomatic',189, NULL, False, ''),
          (15104639,NULL,'custom.lithology_top_bedrock',' ','Granit, mikrokristallin','granite, microcristallin','granito, microcristallino','granite, microcrystalline',190, NULL, False, ''),
          (15104640,NULL,'custom.lithology_top_bedrock',' ','Granit, mikrokristallin-porphyrisch','granite, microcristallin-porphyrique','granito, microcristallino-porfirico','granite, microcrystalline-porphyric',191, NULL, False, ''),
          (15104641,NULL,'custom.lithology_top_bedrock',' ','Granit, monzonitisch','granite, monzonitique','granito, monzonitico','granite, monzonitic',192, NULL, False, ''),
          (15104642,NULL,'custom.lithology_top_bedrock',' ','Granit, mylonitisch','granite, mylonitique','granito, milonitico','granite, mylonitic',193, NULL, False, ''),
          (15104643,NULL,'custom.lithology_top_bedrock',' ','Granit, porphyrisch','granite, porphyrique','granito, porfirico','granite, porphyric',194, NULL, False, ''),
          (15104644,NULL,'custom.lithology_top_bedrock',' ','Granit, porphyrisch, Biotit','granite, porphyrique, biotite','granito, porfirico, biotite','granite, porphyric, biotite',195, NULL, False, ''),
          (15104645,NULL,'custom.lithology_top_bedrock',' ','Granit, porphyrisch, Hornblende','granite, porphyrique, hornblende','granito, porfirico, orneblenda','granite, porphyric, hornblende',196, NULL, False, ''),
          (15104646,NULL,'custom.lithology_top_bedrock',' ','Granit, schiefrig','granite, schisteux','granito, scistoso','granite, schistose',197, NULL, False, ''),
          (15104647,NULL,'custom.lithology_top_bedrock',' ','Granit, syenitisch','granite, syénitique','granito, sienitico','granite, syenitic',198, NULL, False, ''),
          (15104648,NULL,'custom.lithology_top_bedrock',' ','Granodiorit','granodiorite','granodiorite','granodiorite',199, NULL, False, ''),
          (15104649,NULL,'custom.lithology_top_bedrock',' ','Granodiorit, aplitisch','granodiorite, aplitique','granodiorite, aplitico','granodiorite, aplitic',200, NULL, False, ''),
          (15104650,NULL,'custom.lithology_top_bedrock',' ','Granodiorit, Hornblende','granodiorite, hornblende','granodiorite, orneblenda','granodiorite, hornblende',201, NULL, False, ''),
          (15104651,NULL,'custom.lithology_top_bedrock',' ','Granodiorit, porphyrisch','granodiorite, porphyrique','granodiorite, porfirico','granodiorite, porphyric',202, NULL, False, ''),
          (15104652,NULL,'custom.lithology_top_bedrock',' ','Granodiorit, schiefrig','granodiorite, schisteux','granodiorite, scistoso','granodiorite, schistose',203, NULL, False, ''),
          (15104653,NULL,'custom.lithology_top_bedrock',' ','Granofels','granofels','granofels','granofels',204, NULL, False, ''),
          (15104654,NULL,'custom.lithology_top_bedrock',' ','Granofels, Albit','granofels, albite','granofels, albite','granofels, albite',205, NULL, False, ''),
          (15104655,NULL,'custom.lithology_top_bedrock',' ','Granofels, Granat','granofels, grenat','granofels, granato','granofels, garnet',206, NULL, False, ''),
          (15104656,NULL,'custom.lithology_top_bedrock',' ','Granofels, Kalksilikat','granofels, calcsilicate','granofels, calcsilicati','granofels, calcsilicate',207, NULL, False, ''),
          (15104657,NULL,'custom.lithology_top_bedrock',' ','Granofels, Olivin','granofels, olivine','granofels, olivina','granofels, olivine',208, NULL, False, ''),
          (15104658,NULL,'custom.lithology_top_bedrock',' ','Granofels, Pyroxen','granofels, pyroxène','granofels, pirosseno','granofels, pyroxene',209, NULL, False, ''),
          (15104659,NULL,'custom.lithology_top_bedrock',' ','Granofels, Silikat-Karbonat','granofels, silicate-carbonate','granofels, silicato-carbonato','granofels, silicate-carbonate',210, NULL, False, ''),
          (15104660,NULL,'custom.lithology_top_bedrock',' ','Granophyr','granophyre','granofiro','granophyre',211, NULL, False, ''),
          (15104661,NULL,'custom.lithology_top_bedrock',' ','Granulit','granulite','granulite','granulite',212, NULL, False, ''),
          (15104662,NULL,'custom.lithology_top_bedrock',' ','Granulit, Biotit-Granat','granulite, biotite-grenat','granulite, biotite-granato','granulite, biotite-garnet',213, NULL, False, ''),
          (15104663,NULL,'custom.lithology_top_bedrock',' ','Granulit, Feldspat-Granat','granulite, feldspath-grenat','granulite, feldspato-granato','granulite, feldspar-garnet',214, NULL, False, ''),
          (15104664,NULL,'custom.lithology_top_bedrock',' ','Hornfels','cornéenne','cornubianite','hornfels',215, NULL, False, ''),
          (15104665,NULL,'custom.lithology_top_bedrock',' ','Ignimbrit','ignimbrite','ignimbrite','ignimbrite',216, NULL, False, ''),
          (15104666,NULL,'custom.lithology_top_bedrock',' ','Kakirit','kakirite','cachirite','kakirite',217, NULL, False, ''),
          (15104667,NULL,'custom.lithology_top_bedrock',' ','Kakirit, tonig','kakirite, argileux','cachirite, argilloso','kakirite, clayey',218, NULL, False, ''),
          (15104668,NULL,'custom.lithology_top_bedrock',' ','Kalkstein','calcaire','calcare','limestone',219, NULL, False, ''),
          (15104669,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Albit','calcaire, albite','calcare, albite','limestone, albite',220, NULL, False, ''),
          (15104670,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Algen','calcaire, algues','calcare, alghe','limestone, algae',221, NULL, False, ''),
          (15104671,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch','calcaire, arénitique','calcare, arenitico','limestone, arenitic',222, NULL, False, ''),
          (15104672,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch, Bioklasten','calcaire, arénitique, bioclastes','calcare, arenitico, bioclasti','limestone, arenitic, bioclasts',223, NULL, False, ''),
          (15104673,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch, Bioklasten-Chert','calcaire, arénitique, bioclastes-silex','calcare, arenitico, bioclasti-selce','limestone, arenitic, bioclasts-chert',224, NULL, False, ''),
          (15104674,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch, Ooide','calcaire, arénitique, ooïdes','calcare, arenitico, ooidi','limestone, arenitic, ooids',225, NULL, False, ''),
          (15104675,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch, Quarz','calcaire, arénitique, quartz','calcare, arenitico, quarzo','limestone, arenitic, quartz',226, NULL, False, ''),
          (15104676,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, arenitisch-spätig','calcaire, arénitique-spathique','calcare, arenitico-spatico','limestone, arenitic-spathic',227, NULL, False, ''),
          (15104677,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Bioklasten','calcaire, bioclastes','calcare, bioclasti','limestone, bioclasts',228, NULL, False, ''),
          (15104678,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Bioklasten-Chert','calcaire, bioclastes-silex','calcare, bioclasti-selce','limestone, bioclasts-chert',229, NULL, False, ''),
          (15104679,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Bioklasten-Ooide','calcaire, bioclastes-ooïdes','calcare, bioclasti-ooidi','limestone, bioclasts-ooids',230, NULL, False, ''),
          (15104680,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Bitumen','calcaire, bitume','calcare, bitume','limestone, bitumen',231, NULL, False, ''),
          (15104681,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Bitumen-Bioklasten','calcaire, bitume-bioclastes','calcare, bitume-bioclasti','limestone, bitumen-bioclasts',232, NULL, False, ''),
          (15104682,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, brekziös','calcaire, bréchique','calcare, brecciato','limestone, brecciated',233, NULL, False, ''),
          (15104683,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Chert','calcaire, silex','calcare, selce','limestone, chert',234, NULL, False, ''),
          (15104684,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, dolomitisch','calcaire, dolomitique','calcare, dolomitico','limestone, dolomitic',235, NULL, False, ''),
          (15104685,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, dolomitisch, Bioklasten','calcaire, dolomitique, bioclastes','calcare, dolomitico, bioclasti','limestone, dolomitic, bioclasts',236, NULL, False, ''),
          (15104686,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Eisenmineralien','calcaire, minéraux de fer','calcare, mineri di ferro','limestone, iron minerals',237, NULL, False, ''),
          (15104687,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Eisenooide','calcaire, ooïdes ferrugineuses','calcare, ooidi di ferro','limestone, ferruginous ooids',238, NULL, False, ''),
          (15104688,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Glaukonit','calcaire, glauconite','calcare, glauconite','limestone, glauconite',239, NULL, False, ''),
          (15104689,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Glaukonit-Bioklasten','calcaire, glauconite-bioclastes','calcare, glauconite-bioclasti','limestone, glauconite-bioclasts',240, NULL, False, ''),
          (15104690,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kieselig','calcaire, siliceux','calcare, siliceo','limestone, siliceous',241, NULL, False, ''),
          (15104691,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kieselig, Bioklasten','calcaire, siliceux, bioclastes','calcare, siliceo, bioclasti','limestone, siliceous, bioclasts',242, NULL, False, ''),
          (15104692,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kieselig, Glaukonit','calcaire, siliceux, glauconite','calcare, siliceo, glauconite','limestone, siliceous, glauconite',243, NULL, False, ''),
          (15104693,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kieselig-spätig','calcaire, siliceux-spathique','calcare, siliceo-spatico','limestone, siliceous-spathic',244, NULL, False, ''),
          (15104694,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Korallen','calcaire, coraiux','calcare, corali','limestone, corals',245, NULL, False, ''),
          (15104695,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kreidig','calcaire, crayeux','calcare, gessoso','limestone, chalky',246, NULL, False, ''),
          (15104696,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kreidig, Bitumen','calcaire, crayeux, bitume','calcare, gessoso, bitume','limestone, chalky, bitumen',247, NULL, False, ''),
          (15104697,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kreidig, Chert','calcaire, crayeux, silex','calcare, gessoso, selce','limestone, chalky, chert',248, NULL, False, ''),
          (15104698,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kreidig, Pisoide','calcaire, crayeux, pisoïdes','calcare, gessoso, pisoidi','limestone, chalky, pisoids',249, NULL, False, ''),
          (15104699,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, kristallin','calcaire, cristallin','calcare, cristallino','limestone, crystalline',250, NULL, False, ''),
          (15104700,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Limonit','calcaire, limonite','calcare, limonite','limestone, limonite',251, NULL, False, ''),
          (15104701,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig','calcaire, marneux','calcare, marnoso','limestone, marly',252, NULL, False, ''),
          (15104702,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig, Bioklasten','calcaire, marneux, bioclastes','calcare, marnoso, bioclasti','limestone, marly, bioclasts',253, NULL, False, ''),
          (15104703,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig, Chert','calcaire, marneux, silex','calcare, marnoso, selce','limestone, marly, chert',254, NULL, False, ''),
          (15104704,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig, Glaukonit','calcaire, marneux, glauconite','calcare, marnoso, glauconite','limestone, marly, glauconite',255, NULL, False, ''),
          (15104705,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig-dolomitisch','calcaire, marneux-dolomitique','calcare, marnoso-dolomitico','limestone, marly-dolomitic',256, NULL, False, ''),
          (15104706,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig-kieselig','calcaire, marneux-siliceux','calcare, marnoso-siliceo','limestone, marly-siliceous',257, NULL, False, ''),
          (15104707,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mergelig-schiefrig','calcaire, marneux-schisteux','calcare, marnoso-scistoso','limestone, marly-schistose',258, NULL, False, ''),
          (15104708,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch','calcaire, micritique','calcare, micritico','limestone, micritic',259, NULL, False, ''),
          (15104709,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Aptychen','calcaire, micritique, aptychi','calcare, micritico, aptici','limestone, micritic, aptychi',260, NULL, False, ''),
          (15104710,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Bioklasten','calcaire, micritique, bioclastes','calcare, micritico, bioclasti','limestone, micritic, bioclasts',261, NULL, False, ''),
          (15104711,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Bioklasten-Chert','calcaire, micritique, bioclastes-silex','calcare, micritico, bioclasti-selce','limestone, micritic, bioclasts-chert',262, NULL, False, ''),
          (15104712,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Calpionellen','calcaire, micritique, calpionelles','calcare, micritico, caplioneli','limestone, micritic, calpionels',263, NULL, False, ''),
          (15104713,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Chert','calcaire, micritique, silex','calcare, micritico, selce','limestone, micritic, chert',264, NULL, False, ''),
          (15104714,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Glaukonit','calcaire, micritique, glauconite','calcare, micritico, glauconite','limestone, micritic, glauconite',265, NULL, False, ''),
          (15104715,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Onkoide','calcaire, micritique, oncoïdes','calcare, micritico, oncoidi','limestone, micritic, oncoids',266, NULL, False, ''),
          (15104716,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, mikritisch, Ooide','calcaire, micritique, ooïdes','calcare, micritico, ooidi','limestone, micritic, ooids',267, NULL, False, ''),
          (15104717,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Nummuliten','calcaire, nummulites','calcare, nummuliti','limestone, nummulites',268, NULL, False, ''),
          (15104718,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Onkoide','calcaire, oncoïdes','calcare, oncoidi','limestone, oncoids',269, NULL, False, ''),
          (15104719,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Ooide','calcaire, ooïdes','calcare, ooidi','limestone, ooids',270, NULL, False, ''),
          (15104720,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Ooide-Chert','calcaire, ooïdes-silex','calcare, ooidi-selce','limestone, ooids-chert',271, NULL, False, ''),
          (15104721,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, pedogen-verkrustet','calcaire, pédogène-encroûté','calcare, pedogene-incrostato','limestone, pedogenic-encrusted',272, NULL, False, ''),
          (15104722,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Phosphorit','calcaire, phosphorite','calcare, fosforite','limestone, phosphorite',273, NULL, False, ''),
          (15104723,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Pisoide','calcaire, pisoïdes','calcare, pisoidi','limestone, pisoids',274, NULL, False, ''),
          (15104724,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, ruditisch','calcaire, ruditique','calcare, ruditico','limestone, ruditic',275, NULL, False, ''),
          (15104725,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, ruditisch, Korallen','calcaire, ruditique, coraiux','calcare, ruditico, corali','limestone, ruditic, corals',276, NULL, False, ''),
          (15104726,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig','calcaire, sableux','calcare, sabbioso','limestone, sandy',277, NULL, False, ''),
          (15104727,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig, Bioklasten','calcaire, sableux, bioclastes','calcare, sabbioso, bioclasti','limestone, sandy, bioclasts',278, NULL, False, ''),
          (15104728,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig, Eisenooide','calcaire, sableux, ooïdes ferrugineuses','calcare, sabbioso, ooidi di ferro','limestone, sandy, ferruginous ooids',279, NULL, False, ''),
          (15104729,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig, Glaukonit','calcaire, sableux, glauconite','calcare, sabbioso, glauconite','limestone, sandy, glauconite',280, NULL, False, ''),
          (15104730,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig, Glimmer','calcaire, sableux, mica','calcare, sabbioso, mica','limestone, sandy, mica',281, NULL, False, ''),
          (15104731,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig-kieselig','calcaire, sableux-siliceux','calcare, sabbioso-siliceo','limestone, sandy-siliceous',282, NULL, False, ''),
          (15104732,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig-spätig','calcaire, sableux-spathique','calcare, sabbioso-spatico','limestone, sandy-spathic',283, NULL, False, ''),
          (15104733,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, sandig-tonig','calcaire, sableux-argileux','calcare, sabbioso-argilloso','limestone, sandy-clayey',284, NULL, False, ''),
          (15104734,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, Schwämme','calcaire, éponges','calcare, spunghe','limestone, sponges',285, NULL, False, ''),
          (15104735,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, siltig','calcaire, silteux','calcare, siltoso','limestone, silty',286, NULL, False, ''),
          (15104736,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, siltig, Bioklasten','calcaire, silteux, bioclastes','calcare, siltoso, bioclasti','limestone, silty, bioclasts',287, NULL, False, ''),
          (15104737,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, siltig-tonig','calcaire, silteux-argileux','calcare, siltoso-argilloso','limestone, silty-clayey',288, NULL, False, ''),
          (15104738,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig','calcaire, spathique','calcare, spatico','limestone, spathic',289, NULL, False, ''),
          (15104739,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Bioklasten','calcaire, spathique, bioclastes','calcare, spatico, bioclasti','limestone, spathic, bioclasts',290, NULL, False, ''),
          (15104740,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Bioklasten-Chert','calcaire, spathique, bioclastes-silex','calcare, spatico, bioclasti-selce','limestone, spathic, bioclasts-chert',291, NULL, False, ''),
          (15104741,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Chert','calcaire, spathique, silex','calcare, spatico, selce','limestone, spathic, chert',292, NULL, False, ''),
          (15104742,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Echinodermen','calcaire, spathique, échinodermes','calcare, spatico, echinodermi','limestone, spathic, echinoderms',293, NULL, False, ''),
          (15104743,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Glaukonit','calcaire, spathique, glauconite','calcare, spatico, glauconite','limestone, spathic, glauconite',294, NULL, False, ''),
          (15104744,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Glaukonit-Chert','calcaire, spathique, glauconite-silex','calcare, spatico, glauconite-selce','limestone, spathic, glauconite-chert',295, NULL, False, ''),
          (15104745,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, spätig, Ooide','calcaire, spathique, ooïdes','calcare, spatico, ooidi','limestone, spathic, ooids',296, NULL, False, ''),
          (15104746,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, stromatolithisch','calcaire, stromatolitique','calcare, stromatolitico','limestone, stromatolitic',297, NULL, False, ''),
          (15104747,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, tonig','calcaire, argileux','calcare, argilloso','limestone, clayey',298, NULL, False, ''),
          (15104748,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, tonig, Bioklasten','calcaire, argileux, bioclastes','calcare, argilloso, bioclasti','limestone, clayey, bioclasts',299, NULL, False, ''),
          (15104749,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, tonig, Chert','calcaire, argileux, silex','calcare, argilloso, selce','limestone, clayey, chert',300, NULL, False, ''),
          (15104750,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, tonig-schiefrig','calcaire, argileux-schisteux','calcare, argilloso-scistoso','limestone, clayey-schistose',301, NULL, False, ''),
          (15104751,NULL,'custom.lithology_top_bedrock',' ','Kalkstein, tuffig','calcaire, tufacé','calcare, tufaceo','limestone, tufaceous',302, NULL, False, ''),
          (15104752,NULL,'custom.lithology_top_bedrock',' ','Kataklasit','cataclastite','cataclastite','cataclastite',303, NULL, False, ''),
          (15104753,NULL,'custom.lithology_top_bedrock',' ','Konglomerat','conglomérat','conglomerato','conglomerate',304, NULL, False, ''),
          (15104754,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, dolomitisch','conglomérat, dolomitique','conglomerato, dolomitico','conglomerate, dolomitic',305, NULL, False, ''),
          (15104755,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, kalkig','conglomérat, calcaire','conglomerato, calcareo','conglomerate, calcareous',306, NULL, False, ''),
          (15104756,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, kalkig, Muscheln','conglomérat, calcaire, bivalves','conglomerato, calcareo, bivalvi','conglomerate, calcareous, bivalves',307, NULL, False, ''),
          (15104757,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, kalkig-dolomitisch','conglomérat, calcaire-dolomitique','conglomerato, calcareo-dolomitico','conglomerate, calcareous-dolomitic',308, NULL, False, ''),
          (15104758,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, kalkig-residual, Eisenpisoide','conglomérat, calcaire-résiduel, pisoïdes ferrugineuses','conglomerato, calcareo-residuale, pisoidi di ferro','conglomerate, calcareous-residual, ferruginous pisoids',309, NULL, False, ''),
          (15104759,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, kristallin','conglomérat, cristallin','conglomerato, cristallino','conglomerate, crystalline',310, NULL, False, ''),
          (15104760,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, monomikt','conglomérat, monomicte','conglomerato, monomittico','conglomerate, monomictic',311, NULL, False, ''),
          (15104761,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, ophiolithisch','conglomérat, ophiolitique','conglomerato, ofiolitico','conglomerate, ophiolitic',312, NULL, False, ''),
          (15104762,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, polymikt','conglomérat, polymicte','conglomerato, polimittico','conglomerate, polymictic',313, NULL, False, ''),
          (15104763,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, polymikt, Bioklasten','conglomérat, polymicte, bioclastes','conglomerato, polimittico, bioclasti','conglomerate, polymictic, bioclasts',314, NULL, False, ''),
          (15104764,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, polymikt, Quarz','conglomérat, polymicte, quartz','conglomerato, polimittico, quarzo','conglomerate, polymictic, quartz',315, NULL, False, ''),
          (15104765,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, pyroklastisch','conglomérat, pyroclastique','conglomerato, piroclastico','conglomerate, pyroclastic',316, NULL, False, ''),
          (15104766,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, Quarz','conglomérat, quartz','conglomerato, quarzo','conglomerate, quartz',317, NULL, False, ''),
          (15104767,NULL,'custom.lithology_top_bedrock',' ','Konglomerat, tuffitisch','conglomérat, tuffitique','conglomerato, tufitico','conglomerate, tuffitic',318, NULL, False, ''),
          (15104768,NULL,'custom.lithology_top_bedrock',' ','Latit','latite','latite','latite',319, NULL, False, ''),
          (15104769,NULL,'custom.lithology_top_bedrock',' ','Lockergestein','roche meuble','deposito sciolto','unconsolidated deposits',320, NULL, False, ''),
          (15104770,NULL,'custom.lithology_top_bedrock',' ','Marmor','marbre','marmo','marble',321, NULL, False, ''),
          (15104771,NULL,'custom.lithology_top_bedrock',' ','Marmor, dolomitisch','marbre, dolomitique','marmo, dolomitico','marble, dolomitic',322, NULL, False, ''),
          (15104772,NULL,'custom.lithology_top_bedrock',' ','Marmor, dolomitisch-schiefrig','marbre, dolomitique-schisteux','marmo, dolomitico-scistoso','marble, dolomitic-schistose',323, NULL, False, ''),
          (15104773,NULL,'custom.lithology_top_bedrock',' ','Marmor, kalkig','marbre, calcaire','marmo, calcareo','marble, calcareous',324, NULL, False, ''),
          (15104774,NULL,'custom.lithology_top_bedrock',' ','Marmor, kalkig, Chlorit','marbre, calcaire, chlorite','marmo, calcareo, clorite','marble, calcareous, chlorite',325, NULL, False, ''),
          (15104775,NULL,'custom.lithology_top_bedrock',' ','Marmor, kalkig, Serizit','marbre, calcaire, séricite','marmo, calcareo, sericite','marble, calcareous, sericite',326, NULL, False, ''),
          (15104776,NULL,'custom.lithology_top_bedrock',' ','Marmor, kalkig-kieselig','marbre, calcaire-siliceux','marmo, calcareo-siliceo','marble, calcareous-siliceous',327, NULL, False, ''),
          (15104777,NULL,'custom.lithology_top_bedrock',' ','Marmor, Kalksilikat','marbre, calcsilicate','marmo, calcsilicati','marble, calcsilicate',328, NULL, False, ''),
          (15104778,NULL,'custom.lithology_top_bedrock',' ','Marmor, kieselig','marbre, siliceux','marmo, siliceo','marble, siliceous',329, NULL, False, ''),
          (15104779,NULL,'custom.lithology_top_bedrock',' ','Marmor, konglomeratisch','marbre, conglomératique','marmo, conglomeratico','marble, conglomeratic',330, NULL, False, ''),
          (15104780,NULL,'custom.lithology_top_bedrock',' ','Marmor, konglomeratisch-kalkig','marbre, conglomératique-calcaire','marmo, conglomeratico-calcareo','marble, conglomeratic-calcareous',331, NULL, False, ''),
          (15104781,NULL,'custom.lithology_top_bedrock',' ','Marmor, metasomatisch','marbre, métasomatique','marmo, metasomatico','marble, metasomatic',332, NULL, False, ''),
          (15104782,NULL,'custom.lithology_top_bedrock',' ','Marmor, sandig','marbre, sableux','marmo, sabbioso','marble, sandy',333, NULL, False, ''),
          (15104783,NULL,'custom.lithology_top_bedrock',' ','Marmor, sandig, Bioklasten','marbre, sableux, bioclastes','marmo, sabbioso, bioclasti','marble, sandy, bioclasts',334, NULL, False, ''),
          (15104784,NULL,'custom.lithology_top_bedrock',' ','Marmor, Serizit','marbre, séricite','marmo, sericite','marble, sericite',335, NULL, False, ''),
          (15104785,NULL,'custom.lithology_top_bedrock',' ','Marmor, Silikat','marbre, silicate','marmo, silicato','marble, silicate',336, NULL, False, ''),
          (15104786,NULL,'custom.lithology_top_bedrock',' ','Marmor, tonig-schiefrig','marbre, argileux-schisteux','marmo, argilloso-scistoso','marble, clayey-schistose',337, NULL, False, ''),
          (15104787,NULL,'custom.lithology_top_bedrock',' ','Mergel, Kaolin','marne, kaolin','marna, caolino','marl, kaoline',338, NULL, False, ''),
          (15104788,NULL,'custom.lithology_top_bedrock',' ','Mergelstein','marne','marna','marlstone',339, NULL, False, ''),
          (15104789,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Bioklasten','marne, bioclastes','marna, bioclasti','marlstone, bioclasts',340, NULL, False, ''),
          (15104790,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Bioklasten-Ooide','marne, bioclastes-ooïdes','marna, bioclasti-ooidi','marlstone, bioclasts-ooids',341, NULL, False, ''),
          (15104791,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Bitumen','marne, bitume','marna, bitume','marlstone, bitumen',342, NULL, False, ''),
          (15104792,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, dolomitisch','marne, dolomitique','marna, dolomitico','marlstone, dolomitic',343, NULL, False, ''),
          (15104793,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Eisenooide','marne, ooïdes ferrugineuses','marna, ooidi di ferro','marlstone, ferruginous ooids',344, NULL, False, ''),
          (15104794,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Gips','marne, gypse','marna, gesso','marlstone, gypsum',345, NULL, False, ''),
          (15104795,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Glaukonit','marne, glauconite','marna, glauconite','marlstone, glauconite',346, NULL, False, ''),
          (15104796,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Glaukonit-Bioklasten','marne, glauconite-bioclastes','marna, glauconite-bioclasti','marlstone, glauconite-bioclasts',347, NULL, False, ''),
          (15104797,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Glimmer','marne, mica','marna, mica','marlstone, mica',348, NULL, False, ''),
          (15104798,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig','marne, calcaire','marna, calcareo','marlstone, calcareous',349, NULL, False, ''),
          (15104799,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig, Bioklasten','marne, calcaire, bioclastes','marna, calcareo, bioclasti','marlstone, calcareous, bioclasts',350, NULL, False, ''),
          (15104800,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig, Bitumen','marne, calcaire, bitume','marna, calcareo, bitume','marlstone, calcareous, bitumen',351, NULL, False, ''),
          (15104801,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig, Glaukonit','marne, calcaire, glauconite','marna, calcareo, glauconite','marlstone, calcareous, glauconite',352, NULL, False, ''),
          (15104802,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig-dolomitisch','marne, calcaire-dolomitique','marna, calcareo-dolomitico','marlstone, calcareous-dolomitic',353, NULL, False, ''),
          (15104803,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig-kieselig','marne, calcaire-siliceux','marna, calcareo-siliceo','marlstone, calcareous-siliceous',354, NULL, False, ''),
          (15104804,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kalkig-schiefrig','marne, calcaire-schisteux','marna, calcareo-scistoso','marlstone, calcareous-schistose',355, NULL, False, ''),
          (15104805,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, kieselig','marne, siliceux','marna, siliceo','marlstone, siliceous',356, NULL, False, ''),
          (15104806,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Kohle','marne, charbon','marna, carbone','marlstone, coal',357, NULL, False, ''),
          (15104807,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, konglomeratisch','marne, conglomératique','marna, conglomeratico','marlstone, conglomeratic',358, NULL, False, ''),
          (15104808,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Korallen','marne, coraiux','marna, corali','marlstone, corals',359, NULL, False, ''),
          (15104809,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Lignit','marne, lignite','marna, lignite','marlstone, lignite',360, NULL, False, ''),
          (15104810,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Ooide','marne, ooïdes','marna, ooidi','marlstone, ooids',361, NULL, False, ''),
          (15104811,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, Phosphorit','marne, phosphorite','marna, fosforite','marlstone, phosphorite',362, NULL, False, ''),
          (15104812,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig','marne, sableux','marna, sabbioso','marlstone, sandy',363, NULL, False, ''),
          (15104813,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig, Bioklasten','marne, sableux, bioclastes','marna, sabbioso, bioclasti','marlstone, sandy, bioclasts',364, NULL, False, ''),
          (15104814,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig, Glaukonit','marne, sableux, glauconite','marna, sabbioso, glauconite','marlstone, sandy, glauconite',365, NULL, False, ''),
          (15104815,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig, Glimmer','marne, sableux, mica','marna, sabbioso, mica','marlstone, sandy, mica',366, NULL, False, ''),
          (15104816,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig, Kohle','marne, sableux, charbon','marna, sabbioso, carbone','marlstone, sandy, coal',367, NULL, False, ''),
          (15104817,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig-dolomitisch','marne, sableux-dolomitique','marna, sabbioso-dolomitico','marlstone, sandy-dolomitic',368, NULL, False, ''),
          (15104818,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig-kalkig','marne, sableux-calcaire','marna, sabbioso-calcareo','marlstone, sandy-calcareous',369, NULL, False, ''),
          (15104819,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig-siltig','marne, sableux-silteux','marna, sabbioso-siltoso','marlstone, sandy-silty',370, NULL, False, ''),
          (15104820,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, sandig-tonig','marne, sableux-argileux','marna, sabbioso-argilloso','marlstone, sandy-clayey',371, NULL, False, ''),
          (15104821,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, schiefrig','marne, schisteux','marna, scistoso','marlstone, schistose',372, NULL, False, ''),
          (15104822,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, schiefrig, Bitumen','marne, schisteux, bitume','marna, scistoso, bitume','marlstone, schistose, bitumen',373, NULL, False, ''),
          (15104823,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig','marne, silteux','marna, siltoso','marlstone, silty',374, NULL, False, ''),
          (15104824,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig, Glaukonit','marne, silteux, glauconite','marna, siltoso, glauconite','marlstone, silty, glauconite',375, NULL, False, ''),
          (15104825,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig, Glimmer','marne, silteux, mica','marna, siltoso, mica','marlstone, silty, mica',376, NULL, False, ''),
          (15104826,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig-dolomitisch','marne, silteux-dolomitique','marna, siltoso-dolomitico','marlstone, silty-dolomitic',377, NULL, False, ''),
          (15104827,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig-kalkig','marne, silteux-calcaire','marna, siltoso-calcareo','marlstone, silty-calcareous',378, NULL, False, ''),
          (15104828,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig-schiefrig','marne, silteux-schisteux','marna, siltoso-scistoso','marlstone, silty-schistose',379, NULL, False, ''),
          (15104829,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, siltig-tonig','marne, silteux-argileux','marna, siltoso-argilloso','marlstone, silty-clayey',380, NULL, False, ''),
          (15104830,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, tonig','marne, argileux','marna, argilloso','marlstone, clayey',381, NULL, False, ''),
          (15104831,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, tonig, Bitumen','marne, argileux, bitume','marna, argilloso, bitume','marlstone, clayey, bitumen',382, NULL, False, ''),
          (15104832,NULL,'custom.lithology_top_bedrock',' ','Mergelstein, tonig, Kohle','marne, argileux, charbon','marna, argilloso, carbone','marlstone, clayey, coal',383, NULL, False, ''),
          (15104833,NULL,'custom.lithology_top_bedrock',' ','Migmatit','migmatite','migmatite','migmatite',384, NULL, False, ''),
          (15104834,NULL,'custom.lithology_top_bedrock',' ','Migmatit, Cordierit','migmatite, cordiérite','migmatite, cordierite','migmatite, cordierite',385, NULL, False, ''),
          (15104835,NULL,'custom.lithology_top_bedrock',' ','Monzonit','monzonite','monzonite','monzonite',386, NULL, False, ''),
          (15104836,NULL,'custom.lithology_top_bedrock',' ','Monzonit, Feldspatoid','monzonite, feldspatoïde','monzonite, feldspatoido','monzonite, feldspatoid',387, NULL, False, ''),
          (15104837,NULL,'custom.lithology_top_bedrock',' ','Monzonit, porphyrisch, Quarz','monzonite, porphyrique, quartz','monzonite, porfirico, quarzo','monzonite, porphyric, quartz',388, NULL, False, ''),
          (15104838,NULL,'custom.lithology_top_bedrock',' ','Monzonit, Quarz','monzonite, quartz','monzonite, quarzo','monzonite, quartz',389, NULL, False, ''),
          (15104839,NULL,'custom.lithology_top_bedrock',' ','Mylonit','mylonite','milonite','mylonite',390, NULL, False, ''),
          (15104840,NULL,'custom.lithology_top_bedrock',' ','Mylonit, kalkig','mylonite, calcaire','milonite, calcareo','mylonite, calcareous',391, NULL, False, ''),
          (15104841,NULL,'custom.lithology_top_bedrock',' ','Mylonit, phyllitisch','mylonite, phyllitique','milonite, filitico','mylonite, phyllitic',392, NULL, False, ''),
          (15104842,NULL,'custom.lithology_top_bedrock',' ','Pegmatit','pegmatite','pegmatite','pegmatite',393, NULL, False, ''),
          (15104843,NULL,'custom.lithology_top_bedrock',' ','Pelit','pélite','pelite','pelite',394, NULL, False, ''),
          (15104844,NULL,'custom.lithology_top_bedrock',' ','Peridotit','péridotite','peridotite','peridotite',395, NULL, False, ''),
          (15104845,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Hornblende','péridotite, hornblende','peridotite, orneblenda','peridotite, hornblende',396, NULL, False, ''),
          (15104846,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Klinopyroxen-Orthopyroxen','péridotite, clinopyroxène-orthopyroxène','peridotite, clinopirosseno-ortopirosseno','peridotite, clinopyroxene-orthopyroxene',397, NULL, False, ''),
          (15104847,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Olivin','péridotite, olivine','peridotite, olivina','peridotite, olivine',398, NULL, False, ''),
          (15104848,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Olivin-Klinopyroxen','péridotite, olivine-clinopyroxène','peridotite, olivina-clinopirosseno','peridotite, olivine-clinopyroxene',399, NULL, False, ''),
          (15104849,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Olivin-Orthopyroxen','péridotite, olivine-orthopyroxène','peridotite, olivina-ortopirosseno','peridotite, olivine-orthopyroxene',400, NULL, False, ''),
          (15104850,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Phlogopit','péridotite, phlogopite','peridotite, flogopite','peridotite, phlogopite',401, NULL, False, ''),
          (15104851,NULL,'custom.lithology_top_bedrock',' ','Peridotit, Serpentin','péridotite, serpentine','peridotite, serpentino','peridotite, serpentine',402, NULL, False, ''),
          (15104852,NULL,'custom.lithology_top_bedrock',' ','Phonolith','phonolite','fonolite','phonolite',403, NULL, False, ''),
          (15104853,NULL,'custom.lithology_top_bedrock',' ','Phonolith, tephritisch','phonolite, téphritique','fonolite, tefritico','phonolite, tephritic',404, NULL, False, ''),
          (15104854,NULL,'custom.lithology_top_bedrock',' ','Phyllit','phyllite','fillite','phyllite',405, NULL, False, ''),
          (15104855,NULL,'custom.lithology_top_bedrock',' ','Phyllit, Graphit','phyllite, graphite','fillite, grafite','phyllite, graphite',406, NULL, False, ''),
          (15104856,NULL,'custom.lithology_top_bedrock',' ','Phyllit, kalkig','phyllite, calcaire','fillite, calcareo','phyllite, calcareous',407, NULL, False, ''),
          (15104857,NULL,'custom.lithology_top_bedrock',' ','Phyllit, Quarz','phyllite, quartz','fillite, quarzo','phyllite, quartz',408, NULL, False, ''),
          (15104858,NULL,'custom.lithology_top_bedrock',' ','Prasinit','prasinite','prasinite','prasinite',409, NULL, False, ''),
          (15104859,NULL,'custom.lithology_top_bedrock',' ','Prasinit, Albit-Chlorit','prasinite, albite-chlorite','prasinite, albite-clorite','prasinite, albite-chlorite',410, NULL, False, ''),
          (15104860,NULL,'custom.lithology_top_bedrock',' ','Prasinit, Chlorit','prasinite, chlorite','prasinite, clorite','prasinite, chlorite',411, NULL, False, ''),
          (15104861,NULL,'custom.lithology_top_bedrock',' ','Prasinit, schiefrig','prasinite, schisteux','prasinite, scistoso','prasinite, schistose',412, NULL, False, ''),
          (15104862,NULL,'custom.lithology_top_bedrock',' ','Psammit','psammite','psammite','psammite',413, NULL, False, ''),
          (15104863,NULL,'custom.lithology_top_bedrock',' ','Psephit','pséphite','psefite','psephite',414, NULL, False, ''),
          (15104864,NULL,'custom.lithology_top_bedrock',' ','Pseudotachyllit','pseudotachyllite','pseudotachilite','pseudotachyllite',415, NULL, False, ''),
          (15104865,NULL,'custom.lithology_top_bedrock',' ','Pyroxenit','pyroxénite','pirossenite','pyroxenite',416, NULL, False, ''),
          (15104866,NULL,'custom.lithology_top_bedrock',' ','Quarzit','quartzite','quarzite','quartzite',417, NULL, False, ''),
          (15104867,NULL,'custom.lithology_top_bedrock',' ','Quarzit, Albit','quartzite, albite','quarzite, albite','quartzite, albite',418, NULL, False, ''),
          (15104868,NULL,'custom.lithology_top_bedrock',' ','Quarzit, Chlorit','quartzite, chlorite','quarzite, clorite','quartzite, chlorite',419, NULL, False, ''),
          (15104869,NULL,'custom.lithology_top_bedrock',' ','Quarzit, kalkig','quartzite, calcaire','quarzite, calcareo','quartzite, calcareous',420, NULL, False, ''),
          (15104870,NULL,'custom.lithology_top_bedrock',' ','Quarzit, Serizit','quartzite, séricite','quarzite, sericite','quartzite, sericite',421, NULL, False, ''),
          (15104871,NULL,'custom.lithology_top_bedrock',' ','Rauwacke','cornieule','cargnola','rauwacke',422, NULL, False, ''),
          (15104872,NULL,'custom.lithology_top_bedrock',' ','Rauwacke, kataklastisch','cornieule, cataclastique','cargnola, cataclastico','rauwacke, cataclastic',423, NULL, False, ''),
          (15104873,NULL,'custom.lithology_top_bedrock',' ','Rauwacke, sandig','cornieule, sableux','cargnola, sabbioso','rauwacke, sandy',424, NULL, False, ''),
          (15104874,NULL,'custom.lithology_top_bedrock',' ','Rauwacke, sedimentär','cornieule, sédimentaire','cargnola, sedimentario','rauwacke, sedimentary',425, NULL, False, ''),
          (15104875,NULL,'custom.lithology_top_bedrock',' ','Rhyolith','rhyolite','riolite','rhyolite',426, NULL, False, ''),
          (15104876,NULL,'custom.lithology_top_bedrock',' ','Rhyolith, Alkalifeldspat','rhyolite, feldspath alcalin','riolite, feldspato alcalino','rhyolite, alkali feldspar',427, NULL, False, ''),
          (15104877,NULL,'custom.lithology_top_bedrock',' ','Rhyolith, ignimbritisch','rhyolite, ignimbritique','riolite, ignimbritico','rhyolite, ignimbritic',428, NULL, False, ''),
          (15104878,NULL,'custom.lithology_top_bedrock',' ','Rhyolith, porphyrisch','rhyolite, porphyrique','riolite, porfirico','rhyolite, porphyric',429, NULL, False, ''),
          (15104879,NULL,'custom.lithology_top_bedrock',' ','Rodingit','rodingite','rodingite','rodingite',430, NULL, False, ''),
          (15104880,NULL,'custom.lithology_top_bedrock',' ','Sand, Quarz','sable, quartz','sabbia, quarzo','sand, quartz',431, NULL, False, ''),
          (15104881,NULL,'custom.lithology_top_bedrock',' ','Sandstein','grès','arenaria','sandstone',432, NULL, False, ''),
          (15104882,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Bitumen','grès, bitume','arenaria, bitume','sandstone, bitumen',433, NULL, False, ''),
          (15104883,NULL,'custom.lithology_top_bedrock',' ','Sandstein, dolomitisch','grès, dolomitique','arenaria, dolomitico','sandstone, dolomitic',434, NULL, False, ''),
          (15104884,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Eisenmineralien','grès, minéraux de fer','arenaria, mineri di ferro','sandstone, iron minerals',435, NULL, False, ''),
          (15104885,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Feldspat','grès, feldspath','arenaria, feldspato','sandstone, feldspar',436, NULL, False, ''),
          (15104886,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Gips','grès, gypse','arenaria, gesso','sandstone, gypsum',437, NULL, False, ''),
          (15104887,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Glaukonit','grès, glauconite','arenaria, glauconite','sandstone, glauconite',438, NULL, False, ''),
          (15104888,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Glimmer','grès, mica','arenaria, mica','sandstone, mica',439, NULL, False, ''),
          (15104889,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Glimmer-Glaukonit','grès, mica-glauconite','arenaria, mica-glauconite','sandstone, mica-glauconite',440, NULL, False, ''),
          (15104890,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig','grès, calcaire','arenaria, calcareo','sandstone, calcareous',441, NULL, False, ''),
          (15104891,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Bioklasten','grès, calcaire, bioclastes','arenaria, calcareo, bioclasti','sandstone, calcareous, bioclasts',442, NULL, False, ''),
          (15104892,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Glaukonit','grès, calcaire, glauconite','arenaria, calcareo, glauconite','sandstone, calcareous, glauconite',443, NULL, False, ''),
          (15104893,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Glimmer','grès, calcaire, mica','arenaria, calcareo, mica','sandstone, calcareous, mica',444, NULL, False, ''),
          (15104894,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Kohle','grès, calcaire, charbon','arenaria, calcareo, carbone','sandstone, calcareous, coal',445, NULL, False, ''),
          (15104895,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Muscheln','grès, calcaire, bivalves','arenaria, calcareo, bivalvi','sandstone, calcareous, bivalves',446, NULL, False, ''),
          (15104896,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Nummuliten','grès, calcaire, nummulites','arenaria, calcareo, nummuliti','sandstone, calcareous, nummulites',447, NULL, False, ''),
          (15104897,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig, Quarz','grès, calcaire, quartz','arenaria, calcareo, quarzo','sandstone, calcareous, quartz',448, NULL, False, ''),
          (15104898,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig-dolomitisch','grès, calcaire-dolomitique','arenaria, calcareo-dolomitico','sandstone, calcareous-dolomitic',449, NULL, False, ''),
          (15104899,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kalkig-kieselig','grès, calcaire-siliceux','arenaria, calcareo-siliceo','sandstone, calcareous-siliceous',450, NULL, False, ''),
          (15104900,NULL,'custom.lithology_top_bedrock',' ','Sandstein, kieselig','grès, siliceux','arenaria, siliceo','sandstone, siliceous',451, NULL, False, ''),
          (15104901,NULL,'custom.lithology_top_bedrock',' ','Sandstein, konglomeratisch','grès, conglomératique','arenaria, conglomeratico','sandstone, conglomeratic',452, NULL, False, ''),
          (15104902,NULL,'custom.lithology_top_bedrock',' ','Sandstein, konglomeratisch-kalkig, Muscheln','grès, conglomératique-calcaire, bivalves','arenaria, conglomeratico-calcareo, bivalvi','sandstone, conglomeratic-calcareous, bivalves',453, NULL, False, ''),
          (15104903,NULL,'custom.lithology_top_bedrock',' ','Sandstein, mergelig','grès, marneux','arenaria, marnoso','sandstone, marly',454, NULL, False, ''),
          (15104904,NULL,'custom.lithology_top_bedrock',' ','Sandstein, mergelig, Glimmer','grès, marneux, mica','arenaria, marnoso, mica','sandstone, marly, mica',455, NULL, False, ''),
          (15104905,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Phosphorit','grès, phosphorite','arenaria, fosforite','sandstone, phosphorite',456, NULL, False, ''),
          (15104906,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Quarz','grès, quartz','arenaria, quarzo','sandstone, quartz',457, NULL, False, ''),
          (15104907,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Quarz-Glaukonit','grès, quartz-glauconite','arenaria, quarzo-glauconite','sandstone, quartz-glauconite',458, NULL, False, ''),
          (15104908,NULL,'custom.lithology_top_bedrock',' ','Sandstein, Quarz-Glimmer','grès, quartz-mica','arenaria, quarzo-mica','sandstone, quartz-mica',459, NULL, False, ''),
          (15104909,NULL,'custom.lithology_top_bedrock',' ','Sandstein, siltig','grès, silteux','arenaria, siltoso','sandstone, silty',460, NULL, False, ''),
          (15104910,NULL,'custom.lithology_top_bedrock',' ','Sandstein, siltig-kalkig','grès, silteux-calcaire','arenaria, siltoso-calcareo','sandstone, silty-calcareous',461, NULL, False, ''),
          (15104911,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig','grès, argileux','arenaria, argilloso','sandstone, clayey',462, NULL, False, ''),
          (15104912,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig, Feldspat','grès, argileux, feldspath','arenaria, argilloso, feldspato','sandstone, clayey, feldspar',463, NULL, False, ''),
          (15104913,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig, Glaukonit','grès, argileux, glauconite','arenaria, argilloso, glauconite','sandstone, clayey, glauconite',464, NULL, False, ''),
          (15104914,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig, Glimmer','grès, argileux, mica','arenaria, argilloso, mica','sandstone, clayey, mica',465, NULL, False, ''),
          (15104915,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig, Kohle','grès, argileux, charbon','arenaria, argilloso, carbone','sandstone, clayey, coal',466, NULL, False, ''),
          (15104916,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig, Lithoklasten','grès, argileux, lithoclastes','arenaria, argilloso, litoclasti','sandstone, clayey, lithoclasts',467, NULL, False, ''),
          (15104917,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig-dolomitisch','grès, argileux-dolomitique','arenaria, argilloso-dolomitico','sandstone, clayey-dolomitic',468, NULL, False, ''),
          (15104918,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig-kalkig','grès, argileux-calcaire','arenaria, argilloso-calcareo','sandstone, clayey-calcareous',469, NULL, False, ''),
          (15104919,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tonig-kalkig, Kohle','grès, argileux-calcaire, charbon','arenaria, argilloso-calcareo, carbone','sandstone, clayey-calcareous, coal',470, NULL, False, ''),
          (15104920,NULL,'custom.lithology_top_bedrock',' ','Sandstein, tuffitisch','grès, tuffitique','arenaria, tufitico','sandstone, tuffitic',471, NULL, False, ''),
          (15104921,NULL,'custom.lithology_top_bedrock',' ','Schiefer','schiste','scisto','schist',472, NULL, False, ''),
          (15104922,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Aktinolith','schiste, actinote','scisto, actinolite','schist, actinolite',473, NULL, False, ''),
          (15104923,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Amphibol','schiste, amphibole','scisto, anfibolo','schist, amphibole',474, NULL, False, ''),
          (15104924,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Anthrazit','schiste, anthracite','scisto, antracite','schist, anthracite',475, NULL, False, ''),
          (15104925,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Antigorit','schiste, antigorite','scisto, antigorite','schist, antigorite',476, NULL, False, ''),
          (15104926,NULL,'custom.lithology_top_bedrock',' ','Schiefer, augig, Glimmer','schiste, oeillé, mica','scisto, occhiadino, mica','schist, augen, mica',477, NULL, False, ''),
          (15104927,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Biotit','schiste, biotite','scisto, biotite','schist, biotite',478, NULL, False, ''),
          (15104928,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Biotit-Apatit','schiste, biotite-apatite','scisto, biotite-apatite','schist, biotite-apatite',479, NULL, False, ''),
          (15104929,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Chlorit','schiste, chlorite','scisto, clorite','schist, chlorite',480, NULL, False, ''),
          (15104930,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Chlorit-Epidot','schiste, chlorite-épidote','scisto, clorite-epidoto','schist, chlorite-epidote',481, NULL, False, ''),
          (15104931,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Chloritoid-Kyanit','schiste, chloritoïde-disthène','scisto, cloritoido-cianite','schist, chloritoid-kyanite',482, NULL, False, ''),
          (15104932,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Chlorit-Talk','schiste, chlorite-talc','scisto, clorite-talco','schist, chlorite-talc',483, NULL, False, ''),
          (15104933,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glaukophan','schiste, glaucophane','scisto, glaucofane','schist, glaucophane',484, NULL, False, ''),
          (15104934,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer','schiste, mica','scisto, mica','schist, mica',485, NULL, False, ''),
          (15104935,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer-Chlorit','schiste, mica-chlorite','scisto, mica-clorite','schist, mica-chlorite',486, NULL, False, ''),
          (15104936,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer-Chloritoid','schiste, mica-chloritoïde','scisto, mica-chloritoido','schist, mica-chloritoid',487, NULL, False, ''),
          (15104937,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer-Granat','schiste, mica-grenat','scisto, mica-granato','schist, mica-garnet',488, NULL, False, ''),
          (15104938,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer-Graphit','schiste, mica-graphite','scisto, mica-grafite','schist, mica-graphite',489, NULL, False, ''),
          (15104939,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Glimmer-Hornblende','schiste, mica-hornblende','scisto, mica-orneblenda','schist, mica-hornblende',490, NULL, False, ''),
          (15104940,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Graphit','schiste, graphite','scisto, grafite','schist, graphite',491, NULL, False, ''),
          (15104941,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Hornblende','schiste, hornblende','scisto, orneblenda','schist, hornblende',492, NULL, False, ''),
          (15104942,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Hornblende-Granat','schiste, hornblende-grenat','scisto, orneblenda-granato','schist, hornblende-garnet',493, NULL, False, ''),
          (15104943,NULL,'custom.lithology_top_bedrock',' ','Schiefer, kalkig','schiste, calcaire','scisto, calcareo','schist, calcareous',494, NULL, False, ''),
          (15104944,NULL,'custom.lithology_top_bedrock',' ','Schiefer, kalkig, Glimmer','schiste, calcaire, mica','scisto, calcareo, mica','schist, calcareous, mica',495, NULL, False, ''),
          (15104945,NULL,'custom.lithology_top_bedrock',' ','Schiefer, kalkig, Serizit','schiste, calcaire, séricite','scisto, calcareo, sericite','schist, calcareous, sericite',496, NULL, False, ''),
          (15104946,NULL,'custom.lithology_top_bedrock',' ','Schiefer, kalkig, Zoisit','schiste, calcaire, zoïsite','scisto, calcareo, zoisite','schist, calcareous, zoisite',497, NULL, False, ''),
          (15104947,NULL,'custom.lithology_top_bedrock',' ','Schiefer, kieselig','schiste, siliceux','scisto, siliceo','schist, siliceous',498, NULL, False, ''),
          (15104948,NULL,'custom.lithology_top_bedrock',' ','Schiefer, konglomeratisch','schiste, conglomératique','scisto, conglomeratico','schist, conglomeratic',499, NULL, False, ''),
          (15104949,NULL,'custom.lithology_top_bedrock',' ','Schiefer, konglomeratisch-kalkig','schiste, conglomératique-calcaire','scisto, conglomeratico-calcareo','schist, conglomeratic-calcareous',500, NULL, False, ''),
          (15104950,NULL,'custom.lithology_top_bedrock',' ','Schiefer, mergelig','schiste, marneux','scisto, marnoso','schist, marly',501, NULL, False, ''),
          (15104951,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Quarz','schiste, quartz','scisto, quarzo','schist, quartz',502, NULL, False, ''),
          (15104952,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Quarz-Chlorit','schiste, quartz-chlorite','scisto, quarzo-clorite','schist, quartz-chlorite',503, NULL, False, ''),
          (15104953,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Quarz-Glimmer','schiste, quartz-mica','scisto, quarzo-mica','schist, quartz-mica',504, NULL, False, ''),
          (15104954,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Quarz-Serizit','schiste, quartz-séricite','scisto, quarzo-sericite','schist, quartz-sericite',505, NULL, False, ''),
          (15104955,NULL,'custom.lithology_top_bedrock',' ','Schiefer, sandig','schiste, sableux','scisto, sabbioso','schist, sandy',506, NULL, False, ''),
          (15104956,NULL,'custom.lithology_top_bedrock',' ','Schiefer, sandig-kalkig','schiste, sableux-calcaire','scisto, sabbioso-calcareo','schist, sandy-calcareous',507, NULL, False, ''),
          (15104957,NULL,'custom.lithology_top_bedrock',' ','Schiefer, sandig-tonig','schiste, sableux-argileux','scisto, sabbioso-argilloso','schist, sandy-clayey',508, NULL, False, ''),
          (15104958,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Serizit','schiste, séricite','scisto, sericite','schist, sericite',509, NULL, False, ''),
          (15104959,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Serizit-Chlorit','schiste, séricite-chlorite','scisto, sericite-clorite','schist, sericite-chlorite',510, NULL, False, ''),
          (15104960,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Serizit-Staurolith','schiste, séricite-staurotide','scisto, sericite-staurolite','schist, sericite-staurolite',511, NULL, False, ''),
          (15104961,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Talk','schiste, talc','scisto, talco','schist, talc',512, NULL, False, ''),
          (15104962,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Talk-Kyanit','schiste, talc-disthène','scisto, talco-cianite','schist, talc-kyanite',513, NULL, False, ''),
          (15104963,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Talk-Serpentin','schiste, talc-serpentine','scisto, talco-serpentino','schist, talc-serpentine',514, NULL, False, ''),
          (15104964,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Talk-Tremolit','schiste, talc-trémolite','scisto, talco-tremolite','schist, talc-tremolite',515, NULL, False, ''),
          (15104965,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig','schiste, argileux','scisto, argilloso','schist, clayey',516, NULL, False, ''),
          (15104966,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig, Anthrazit','schiste, argileux, anthracite','scisto, argilloso, antracite','schist, clayey, anthracite',517, NULL, False, ''),
          (15104967,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig, Bitumen','schiste, argileux, bitume','scisto, argilloso, bitume','schist, clayey, bitumen',518, NULL, False, ''),
          (15104968,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig, Graphit','schiste, argileux, graphite','scisto, argilloso, grafite','schist, clayey, graphite',519, NULL, False, ''),
          (15104969,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig-kalkig','schiste, argileux-calcaire','scisto, argilloso-calcareo','schist, clayey-calcareous',520, NULL, False, ''),
          (15104970,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig-kieselig','schiste, argileux-siliceux','scisto, argilloso-siliceo','schist, clayey-siliceous',521, NULL, False, ''),
          (15104971,NULL,'custom.lithology_top_bedrock',' ','Schiefer, tonig-kieselig, Bitumen','schiste, argileux-siliceux, bitume','scisto, argilloso-siliceo, bitume','schist, clayey-siliceous, bitumen',522, NULL, False, ''),
          (15104972,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Turmalin','schiste, tourmaline','scisto, tormalina','schist, tourmaline',523, NULL, False, ''),
          (15104973,NULL,'custom.lithology_top_bedrock',' ','Schiefer, Zoisit-Fuchsit','schiste, zoïsite-fuchsite','scisto, zoisite-fuchsite','schist, zoisite-fuchsite',524, NULL, False, ''),
          (15104974,NULL,'custom.lithology_top_bedrock',' ','Serpentinit','serpentinite','serpentinite','serpentinite',525, NULL, False, ''),
          (15104975,NULL,'custom.lithology_top_bedrock',' ','Serpentinit, Antigorit','serpentinite, antigorite','serpentinite, antigorite','serpentinite, antigorite',526, NULL, False, ''),
          (15104976,NULL,'custom.lithology_top_bedrock',' ','Serpentinit, brekziös, Karbonat','serpentinite, bréchique, carbonate','serpentinite, brecciato, carbonato','serpentinite, brecciated, carbonate',527, NULL, False, ''),
          (15104977,NULL,'custom.lithology_top_bedrock',' ','Serpentinit, Chrysotil','serpentinite, chrysotile','serpentinite, crisotilo','serpentinite, chrysotile',528, NULL, False, ''),
          (15104978,NULL,'custom.lithology_top_bedrock',' ','Siltstein','siltite','siltite','siltstone',529, NULL, False, ''),
          (15104979,NULL,'custom.lithology_top_bedrock',' ','Siltstein, dolomitisch','siltite, dolomitique','siltite, dolomitico','siltstone, dolomitic',530, NULL, False, ''),
          (15104980,NULL,'custom.lithology_top_bedrock',' ','Siltstein, Glimmer','siltite, mica','siltite, mica','siltstone, mica',531, NULL, False, ''),
          (15104981,NULL,'custom.lithology_top_bedrock',' ','Siltstein, kalkig','siltite, calcaire','siltite, calcareo','siltstone, calcareous',532, NULL, False, ''),
          (15104982,NULL,'custom.lithology_top_bedrock',' ','Siltstein, Kohle','siltite, charbon','siltite, carbone','siltstone, coal',533, NULL, False, ''),
          (15104983,NULL,'custom.lithology_top_bedrock',' ','Siltstein, sandig','siltite, sableux','siltite, sabbioso','siltstone, sandy',534, NULL, False, ''),
          (15104984,NULL,'custom.lithology_top_bedrock',' ','Siltstein, schiefrig','siltite, schisteux','siltite, scistoso','siltstone, schistose',535, NULL, False, ''),
          (15104985,NULL,'custom.lithology_top_bedrock',' ','Siltstein, tonig','siltite, argileux','siltite, argilloso','siltstone, clayey',536, NULL, False, ''),
          (15104986,NULL,'custom.lithology_top_bedrock',' ','Siltstein, tonig-dolomitisch','siltite, argileux-dolomitique','siltite, argilloso-dolomitico','siltstone, clayey-dolomitic',537, NULL, False, ''),
          (15104987,NULL,'custom.lithology_top_bedrock',' ','Siltstein, tonig-kalkig','siltite, argileux-calcaire','siltite, argilloso-calcareo','siltstone, clayey-calcareous',538, NULL, False, ''),
          (15104988,NULL,'custom.lithology_top_bedrock',' ','Siltstein, tuffitisch','siltite, tuffitique','siltite, tufitico','siltstone, tuffitic',539, NULL, False, ''),
          (15104989,NULL,'custom.lithology_top_bedrock',' ','Syenit','syénite','sienite','syenite',540, NULL, False, ''),
          (15104990,NULL,'custom.lithology_top_bedrock',' ','Syenit, Alkalifeldspat','syénite, feldspath alcalin','sienite, feldspato alcalino','syenite, alkali feldspar',541, NULL, False, ''),
          (15104991,NULL,'custom.lithology_top_bedrock',' ','Syenit, Feldspatoid','syénite, feldspatoïde','sienite, feldspatoido','syenite, feldspatoid',542, NULL, False, ''),
          (15104992,NULL,'custom.lithology_top_bedrock',' ','Syenit, Nephelin','syénite, néphéline','sienite, nefelina','syenite, nepheline',543, NULL, False, ''),
          (15104993,NULL,'custom.lithology_top_bedrock',' ','Syenit, porphyrisch, Quarz','syénite, porphyrique, quartz','sienite, porfirico, quarzo','syenite, porphyric, quartz',544, NULL, False, ''),
          (15104994,NULL,'custom.lithology_top_bedrock',' ','Syenit, Quarz','syénite, quartz','sienite, quarzo','syenite, quartz',545, NULL, False, ''),
          (15104995,NULL,'custom.lithology_top_bedrock',' ','Syenit, Quarz-Hornblende','syénite, quartz-hornblende','sienite, quarzo-orneblenda','syenite, quartz-hornblende',546, NULL, False, ''),
          (15104996,NULL,'custom.lithology_top_bedrock',' ','Tephrit','téphrite','tefrite','tephrite',547, NULL, False, ''),
          (15104997,NULL,'custom.lithology_top_bedrock',' ','Tephrit, phonolithisch','téphrite, phonolitique','tefrite, fonolitico','tephrite, phonolitic',548, NULL, False, ''),
          (15104998,NULL,'custom.lithology_top_bedrock',' ','Ton, residual','argile, résiduel','argilla, residuale','clay, residual',549, NULL, False, ''),
          (15104999,NULL,'custom.lithology_top_bedrock',' ','Ton, residual, Eisenpisoide','argile, résiduel, pisoïdes ferrugineuses','argilla, residuale, pisoidi di ferro','clay, residual, ferruginous pisoids',550, NULL, False, ''),
          (15105000,NULL,'custom.lithology_top_bedrock',' ','Ton, sandig-residual','argile, sableux-résiduel','argilla, sabbioso-residuale','clay, sandy-residual',551, NULL, False, ''),
          (15105001,NULL,'custom.lithology_top_bedrock',' ','Tonalit','tonalite','tonalite','tonalite',552, NULL, False, ''),
          (15105002,NULL,'custom.lithology_top_bedrock',' ','Tonalit, Biotit','tonalite, biotite','tonalite, biotite','tonalite, biotite',553, NULL, False, ''),
          (15105003,NULL,'custom.lithology_top_bedrock',' ','Tonalit, Biotit-Hornblende','tonalite, biotite-hornblende','tonalite, biotite-orneblenda','tonalite, biotite-hornblende',554, NULL, False, ''),
          (15105004,NULL,'custom.lithology_top_bedrock',' ','Tonstein','argilite','argillite','claystone',555, NULL, False, ''),
          (15105005,NULL,'custom.lithology_top_bedrock',' ','Tonstein, Bitumen','argilite, bitume','argillite, bitume','claystone, bitumen',556, NULL, False, ''),
          (15105006,NULL,'custom.lithology_top_bedrock',' ','Tonstein, dolomitisch','argilite, dolomitique','argillite, dolomitico','claystone, dolomitic',557, NULL, False, ''),
          (15105007,NULL,'custom.lithology_top_bedrock',' ','Tonstein, kalkig','argilite, calcaire','argillite, calcareo','claystone, calcareous',558, NULL, False, ''),
          (15105008,NULL,'custom.lithology_top_bedrock',' ','Tonstein, kalkig, Glaukonit','argilite, calcaire, glauconite','argillite, calcareo, glauconite','claystone, calcareous, glauconite',559, NULL, False, ''),
          (15105009,NULL,'custom.lithology_top_bedrock',' ','Tonstein, kieselig','argilite, siliceux','argillite, siliceo','claystone, siliceous',560, NULL, False, ''),
          (15105010,NULL,'custom.lithology_top_bedrock',' ','Tonstein, Kohle','argilite, charbon','argillite, carbone','claystone, coal',561, NULL, False, ''),
          (15105011,NULL,'custom.lithology_top_bedrock',' ','Tonstein, mergelig','argilite, marneux','argillite, marnoso','claystone, marly',562, NULL, False, ''),
          (15105012,NULL,'custom.lithology_top_bedrock',' ','Tonstein, mergelig, Bitumen','argilite, marneux, bitume','argillite, marnoso, bitume','claystone, marly, bitumen',563, NULL, False, ''),
          (15105013,NULL,'custom.lithology_top_bedrock',' ','Tonstein, mergelig, Glimmer','argilite, marneux, mica','argillite, marnoso, mica','claystone, marly, mica',564, NULL, False, ''),
          (15105014,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig','argilite, sableux','argillite, sabbioso','claystone, sandy',565, NULL, False, ''),
          (15105015,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig, Kohle','argilite, sableux, charbon','argillite, sabbioso, carbone','claystone, sandy, coal',566, NULL, False, ''),
          (15105016,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig-dolomitisch','argilite, sableux-dolomitique','argillite, sabbioso-dolomitico','claystone, sandy-dolomitic',567, NULL, False, ''),
          (15105017,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig-kalkig','argilite, sableux-calcaire','argillite, sabbioso-calcareo','claystone, sandy-calcareous',568, NULL, False, ''),
          (15105018,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig-mergelig','argilite, sableux-marneux','argillite, sabbioso-marnoso','claystone, sandy-marly',569, NULL, False, ''),
          (15105019,NULL,'custom.lithology_top_bedrock',' ','Tonstein, sandig-schiefrig','argilite, sableux-schisteux','argillite, sabbioso-scistoso','claystone, sandy-schistose',570, NULL, False, ''),
          (15105020,NULL,'custom.lithology_top_bedrock',' ','Tonstein, schiefrig','argilite, schisteux','argillite, scistoso','claystone, schistose',571, NULL, False, ''),
          (15105021,NULL,'custom.lithology_top_bedrock',' ','Tonstein, schiefrig, Anthrazit','argilite, schisteux, anthracite','argillite, scistoso, antracite','claystone, schistose, anthracite',572, NULL, False, ''),
          (15105022,NULL,'custom.lithology_top_bedrock',' ','Tonstein, schiefrig, Bitumen','argilite, schisteux, bitume','argillite, scistoso, bitume','claystone, schistose, bitumen',573, NULL, False, ''),
          (15105023,NULL,'custom.lithology_top_bedrock',' ','Tonstein, siltig','argilite, silteux','argillite, siltoso','claystone, silty',574, NULL, False, ''),
          (15105024,NULL,'custom.lithology_top_bedrock',' ','Tonstein, siltig, Glimmer','argilite, silteux, mica','argillite, siltoso, mica','claystone, silty, mica',575, NULL, False, ''),
          (15105025,NULL,'custom.lithology_top_bedrock',' ','Tonstein, siltig-dolomitisch','argilite, silteux-dolomitique','argillite, siltoso-dolomitico','claystone, silty-dolomitic',576, NULL, False, ''),
          (15105026,NULL,'custom.lithology_top_bedrock',' ','Tonstein, siltig-kalkig','argilite, silteux-calcaire','argillite, siltoso-calcareo','claystone, silty-calcareous',577, NULL, False, ''),
          (15105027,NULL,'custom.lithology_top_bedrock',' ','Tonstein, siltig-schiefrig','argilite, silteux-schisteux','argillite, siltoso-scistoso','claystone, silty-schistose',578, NULL, False, ''),
          (15105028,NULL,'custom.lithology_top_bedrock',' ','Tonstein, tuffitisch','argilite, tuffitique','argillite, tufitico','claystone, tuffitic',579, NULL, False, ''),
          (15105029,NULL,'custom.lithology_top_bedrock',' ','Trachyt','trachyte','trachite','trachyte',580, NULL, False, ''),
          (15105030,NULL,'custom.lithology_top_bedrock',' ','Trachyt, Alkalifeldspat','trachyte, feldspath alcalin','trachite, feldspato alcalino','trachyte, alkali feldspar',581, NULL, False, ''),
          (15105031,NULL,'custom.lithology_top_bedrock',' ','Tuff, kalkig','tuf, calcaire','tufo, calcareo','tuff, calcareous',582, NULL, False, ''),
          (15105032,NULL,'custom.lithology_top_bedrock',' ','Tuff, vulkanisch','tuf, volcanique','tufo, vulcanico','tuff, volcanic',583, NULL, False, ''),
          (15105033,NULL,'custom.lithology_top_bedrock',' ','Tuff, vulkanisch, Asche','tuf, volcanique, cendre','tufo, vulcanico, cenere','tuff, volcanic, ash',584, NULL, False, ''),
          (15105034,NULL,'custom.lithology_top_bedrock',' ','Tuff, vulkanisch, Kristalle','tuf, volcanique, cristaux','tufo, vulcanico, cristalli','tuff, volcanic, crystals',585, NULL, False, ''),
          (15105035,NULL,'custom.lithology_top_bedrock',' ','Tuff, vulkanisch, Lapilli','tuf, volcanique, lapilli','tufo, vulcanico, lapilli','tuff, volcanic, lapilli',586, NULL, False, ''),
          (15105036,NULL,'custom.lithology_top_bedrock',' ','Tuffit','tuffite','tufite','tuffite',587, NULL, False, ''),
          (15105037,NULL,'custom.lithology_top_bedrock',' ','Unbekannt','Inconnu','Sconosciuto','Unknown',588, NULL, False, ''),
          (15105038,NULL,'custom.lithology_top_bedrock',' ','andere','autre','altro','other',589, NULL, False, ''),
          (15105039,NULL,'custom.lithology_top_bedrock',' ','keine Angabe','sans indication','senza indicazioni','not specified',590, NULL, False, '');

        UPDATE bdms.layer SET lithology_id_cli =15105037  WHERE lithology_id_cli = 4000;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101001;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101003;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101005;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101006;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101007;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101008;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101009;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101010;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101012;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101013;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101014;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101015;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101016;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101017;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101019;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101021;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101024;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101026;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101028;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101029;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101030;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101031;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101032;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101033;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101034;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101036;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101037;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101039;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101040;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101041;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101042;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101044;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101046;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101047;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101048;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101049;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101051;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101052;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101053;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101054;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101055;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101056;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101057;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101058;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101059;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101061;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101062;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101063;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101065;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101067;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101069;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101070;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101071;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101072;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101073;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101076;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101077;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101078;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101079;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101080;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101081;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101082;
        UPDATE bdms.layer SET lithology_id_cli =15104769  WHERE lithology_id_cli = 15101083;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15102001;
        UPDATE bdms.layer SET lithology_id_cli =15104556  WHERE lithology_id_cli = 15102003;
        UPDATE bdms.layer SET lithology_id_cli =15104863  WHERE lithology_id_cli = 15102004;
        UPDATE bdms.layer SET lithology_id_cli =15104863  WHERE lithology_id_cli = 15102005;
        UPDATE bdms.layer SET lithology_id_cli =15104461  WHERE lithology_id_cli = 15102006;
        UPDATE bdms.layer SET lithology_id_cli =15104753  WHERE lithology_id_cli = 15102007;
        UPDATE bdms.layer SET lithology_id_cli =15104862  WHERE lithology_id_cli = 15102008;
        UPDATE bdms.layer SET lithology_id_cli =15104881  WHERE lithology_id_cli = 15102009;
        UPDATE bdms.layer SET lithology_id_cli =15104906  WHERE lithology_id_cli = 15102010;
        UPDATE bdms.layer SET lithology_id_cli =15104890  WHERE lithology_id_cli = 15102011;
        UPDATE bdms.layer SET lithology_id_cli =15104883  WHERE lithology_id_cli = 15102012;
        UPDATE bdms.layer SET lithology_id_cli =15104900  WHERE lithology_id_cli = 15102013;
        UPDATE bdms.layer SET lithology_id_cli =15104903  WHERE lithology_id_cli = 15102014;
        UPDATE bdms.layer SET lithology_id_cli =15104911  WHERE lithology_id_cli = 15102015;
        UPDATE bdms.layer SET lithology_id_cli =15104885  WHERE lithology_id_cli = 15102016;
        UPDATE bdms.layer SET lithology_id_cli =15104916  WHERE lithology_id_cli = 15102017;
        UPDATE bdms.layer SET lithology_id_cli =15104901  WHERE lithology_id_cli = 15102018;
        UPDATE bdms.layer SET lithology_id_cli =15104888  WHERE lithology_id_cli = 15102019;
        UPDATE bdms.layer SET lithology_id_cli =15104887  WHERE lithology_id_cli = 15102020;
        UPDATE bdms.layer SET lithology_id_cli =15104896  WHERE lithology_id_cli = 15102021;
        UPDATE bdms.layer SET lithology_id_cli =15104895  WHERE lithology_id_cli = 15102022;
        UPDATE bdms.layer SET lithology_id_cli =15104843  WHERE lithology_id_cli = 15102023;
        UPDATE bdms.layer SET lithology_id_cli =15104843  WHERE lithology_id_cli = 15102024;
        UPDATE bdms.layer SET lithology_id_cli =15104978  WHERE lithology_id_cli = 15102025;
        UPDATE bdms.layer SET lithology_id_cli =15105004  WHERE lithology_id_cli = 15102026;
        UPDATE bdms.layer SET lithology_id_cli =15104788  WHERE lithology_id_cli = 15102027;
        UPDATE bdms.layer SET lithology_id_cli =15104830  WHERE lithology_id_cli = 15102028;
        UPDATE bdms.layer SET lithology_id_cli =15104798  WHERE lithology_id_cli = 15102029;
        UPDATE bdms.layer SET lithology_id_cli =15104843  WHERE lithology_id_cli = 15102030;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15102031;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15102032;
        UPDATE bdms.layer SET lithology_id_cli =15104668  WHERE lithology_id_cli = 15102033;
        UPDATE bdms.layer SET lithology_id_cli =15104668  WHERE lithology_id_cli = 15102034;
        UPDATE bdms.layer SET lithology_id_cli =15104690  WHERE lithology_id_cli = 15102035;
        UPDATE bdms.layer SET lithology_id_cli =15104738  WHERE lithology_id_cli = 15102036;
        UPDATE bdms.layer SET lithology_id_cli =15104708  WHERE lithology_id_cli = 15102037;
        UPDATE bdms.layer SET lithology_id_cli =15104671  WHERE lithology_id_cli = 15102038;
        UPDATE bdms.layer SET lithology_id_cli =15104724  WHERE lithology_id_cli = 15102039;
        UPDATE bdms.layer SET lithology_id_cli =15104725  WHERE lithology_id_cli = 15102040;
        UPDATE bdms.layer SET lithology_id_cli =15104467  WHERE lithology_id_cli = 15102041;
        UPDATE bdms.layer SET lithology_id_cli =15104719  WHERE lithology_id_cli = 15102042;
        UPDATE bdms.layer SET lithology_id_cli =15104717  WHERE lithology_id_cli = 15102043;
        UPDATE bdms.layer SET lithology_id_cli =15104709  WHERE lithology_id_cli = 15102044;
        UPDATE bdms.layer SET lithology_id_cli =15104668  WHERE lithology_id_cli = 15102045;
        UPDATE bdms.layer SET lithology_id_cli =15104726  WHERE lithology_id_cli = 15102046;
        UPDATE bdms.layer SET lithology_id_cli =15104668  WHERE lithology_id_cli = 15102047;
        UPDATE bdms.layer SET lithology_id_cli =15104494  WHERE lithology_id_cli = 15102048;
        UPDATE bdms.layer SET lithology_id_cli =15104494  WHERE lithology_id_cli = 15102049;
        UPDATE bdms.layer SET lithology_id_cli =15104551  WHERE lithology_id_cli = 15102050;
        UPDATE bdms.layer SET lithology_id_cli =15104551  WHERE lithology_id_cli = 15102051;
        UPDATE bdms.layer SET lithology_id_cli =15104552  WHERE lithology_id_cli = 15102052;
        UPDATE bdms.layer SET lithology_id_cli =15104553  WHERE lithology_id_cli = 15102053;
        UPDATE bdms.layer SET lithology_id_cli =15104554  WHERE lithology_id_cli = 15102054;
        UPDATE bdms.layer SET lithology_id_cli =15104564  WHERE lithology_id_cli = 15102055;
        UPDATE bdms.layer SET lithology_id_cli =15104564  WHERE lithology_id_cli = 15102056;
        UPDATE bdms.layer SET lithology_id_cli =15104565  WHERE lithology_id_cli = 15102057;
        UPDATE bdms.layer SET lithology_id_cli =15104564  WHERE lithology_id_cli = 15102058;
        UPDATE bdms.layer SET lithology_id_cli =15104563  WHERE lithology_id_cli = 15102059;
        UPDATE bdms.layer SET lithology_id_cli =15104543  WHERE lithology_id_cli = 15102060;
        UPDATE bdms.layer SET lithology_id_cli =15104544  WHERE lithology_id_cli = 15102061;
        UPDATE bdms.layer SET lithology_id_cli =15104570  WHERE lithology_id_cli = 15102062;
        UPDATE bdms.layer SET lithology_id_cli =15104570  WHERE lithology_id_cli = 15102063;
        UPDATE bdms.layer SET lithology_id_cli =15104905  WHERE lithology_id_cli = 15102064;
        UPDATE bdms.layer SET lithology_id_cli =15104722  WHERE lithology_id_cli = 15102065;
        UPDATE bdms.layer SET lithology_id_cli =15104811  WHERE lithology_id_cli = 15102066;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15102067;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15102068;
        UPDATE bdms.layer SET lithology_id_cli =15104515  WHERE lithology_id_cli = 15102069;
        UPDATE bdms.layer SET lithology_id_cli =15104515  WHERE lithology_id_cli = 15102070;
        UPDATE bdms.layer SET lithology_id_cli =15104516  WHERE lithology_id_cli = 15102071;
        UPDATE bdms.layer SET lithology_id_cli =15104517  WHERE lithology_id_cli = 15102072;
        UPDATE bdms.layer SET lithology_id_cli =15104518  WHERE lithology_id_cli = 15102073;
        UPDATE bdms.layer SET lithology_id_cli =15104550  WHERE lithology_id_cli = 15102074;
        UPDATE bdms.layer SET lithology_id_cli =15104550  WHERE lithology_id_cli = 15102075;
        UPDATE bdms.layer SET lithology_id_cli =15104874  WHERE lithology_id_cli = 15102076;
        UPDATE bdms.layer SET lithology_id_cli =15105031  WHERE lithology_id_cli = 15102077;
        UPDATE bdms.layer SET lithology_id_cli =15104751  WHERE lithology_id_cli = 15102078;
        UPDATE bdms.layer SET lithology_id_cli =15104573  WHERE lithology_id_cli = 15102079;
        UPDATE bdms.layer SET lithology_id_cli =15104573  WHERE lithology_id_cli = 15102080;
        UPDATE bdms.layer SET lithology_id_cli =15104574  WHERE lithology_id_cli = 15102081;
        UPDATE bdms.layer SET lithology_id_cli =15104999  WHERE lithology_id_cli = 15102082;
        UPDATE bdms.layer SET lithology_id_cli =15104576  WHERE lithology_id_cli = 15102083;
        UPDATE bdms.layer SET lithology_id_cli =15104574  WHERE lithology_id_cli = 15102084;
        UPDATE bdms.layer SET lithology_id_cli =15104575  WHERE lithology_id_cli = 15102085;
        UPDATE bdms.layer SET lithology_id_cli =15104575  WHERE lithology_id_cli = 15102086;
        UPDATE bdms.layer SET lithology_id_cli =15104998  WHERE lithology_id_cli = 15102087;
        UPDATE bdms.layer SET lithology_id_cli =15105000  WHERE lithology_id_cli = 15102088;
        UPDATE bdms.layer SET lithology_id_cli =15104880  WHERE lithology_id_cli = 15102089;
        UPDATE bdms.layer SET lithology_id_cli =15104555  WHERE lithology_id_cli = 15102090;
        UPDATE bdms.layer SET lithology_id_cli =15104567  WHERE lithology_id_cli = 15102091;
        UPDATE bdms.layer SET lithology_id_cli =15104567  WHERE lithology_id_cli = 15102092;
        UPDATE bdms.layer SET lithology_id_cli =15104568  WHERE lithology_id_cli = 15102093;
        UPDATE bdms.layer SET lithology_id_cli =15104721  WHERE lithology_id_cli = 15102094;
        UPDATE bdms.layer SET lithology_id_cli =15104742  WHERE lithology_id_cli = 15102100;
        UPDATE bdms.layer SET lithology_id_cli =15104688  WHERE lithology_id_cli = 15102101;
        UPDATE bdms.layer SET lithology_id_cli =15104884  WHERE lithology_id_cli = 15102103;
        UPDATE bdms.layer SET lithology_id_cli =15104795  WHERE lithology_id_cli = 15102104;
        UPDATE bdms.layer SET lithology_id_cli =15104695  WHERE lithology_id_cli = 15102105;
        UPDATE bdms.layer SET lithology_id_cli =15104677  WHERE lithology_id_cli = 15102106;
        UPDATE bdms.layer SET lithology_id_cli =15104701  WHERE lithology_id_cli = 15102107;
        UPDATE bdms.layer SET lithology_id_cli =15104686  WHERE lithology_id_cli = 15102108;
        UPDATE bdms.layer SET lithology_id_cli =15104559  WHERE lithology_id_cli = 15103001;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15103002;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15103003;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15103004;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15103005;
        UPDATE bdms.layer SET lithology_id_cli =15104630  WHERE lithology_id_cli = 15103006;
        UPDATE bdms.layer SET lithology_id_cli =15104629  WHERE lithology_id_cli = 15103007;
        UPDATE bdms.layer SET lithology_id_cli =15104648  WHERE lithology_id_cli = 15103008;
        UPDATE bdms.layer SET lithology_id_cli =15104489  WHERE lithology_id_cli = 15103009;
        UPDATE bdms.layer SET lithology_id_cli =15105001  WHERE lithology_id_cli = 15103010;
        UPDATE bdms.layer SET lithology_id_cli =15104483  WHERE lithology_id_cli = 15103011;
        UPDATE bdms.layer SET lithology_id_cli =15104989  WHERE lithology_id_cli = 15103012;
        UPDATE bdms.layer SET lithology_id_cli =15104990  WHERE lithology_id_cli = 15103013;
        UPDATE bdms.layer SET lithology_id_cli =15104533  WHERE lithology_id_cli = 15103014;
        UPDATE bdms.layer SET lithology_id_cli =15104524  WHERE lithology_id_cli = 15103015;
        UPDATE bdms.layer SET lithology_id_cli =15104532  WHERE lithology_id_cli = 15103016;
        UPDATE bdms.layer SET lithology_id_cli =15104487  WHERE lithology_id_cli = 15103017;
        UPDATE bdms.layer SET lithology_id_cli =15104527  WHERE lithology_id_cli = 15103018;
        UPDATE bdms.layer SET lithology_id_cli =15104835  WHERE lithology_id_cli = 15103019;
        UPDATE bdms.layer SET lithology_id_cli =15104865  WHERE lithology_id_cli = 15103020;
        UPDATE bdms.layer SET lithology_id_cli =15104844  WHERE lithology_id_cli = 15103021;
        UPDATE bdms.layer SET lithology_id_cli =15104992  WHERE lithology_id_cli = 15103022;
        UPDATE bdms.layer SET lithology_id_cli =15104528  WHERE lithology_id_cli = 15103023;
        UPDATE bdms.layer SET lithology_id_cli =15104660  WHERE lithology_id_cli = 15103024;
        UPDATE bdms.layer SET lithology_id_cli =15104548  WHERE lithology_id_cli = 15103025;
        UPDATE bdms.layer SET lithology_id_cli =15104548  WHERE lithology_id_cli = 15103026;
        UPDATE bdms.layer SET lithology_id_cli =15104639  WHERE lithology_id_cli = 15103027;
        UPDATE bdms.layer SET lithology_id_cli =15104878  WHERE lithology_id_cli = 15103028;
        UPDATE bdms.layer SET lithology_id_cli =15104842  WHERE lithology_id_cli = 15103029;
        UPDATE bdms.layer SET lithology_id_cli =15104455  WHERE lithology_id_cli = 15103030;
        UPDATE bdms.layer SET lithology_id_cli =15104486  WHERE lithology_id_cli = 15103031;
        UPDATE bdms.layer SET lithology_id_cli =15104526  WHERE lithology_id_cli = 15103032;
        UPDATE bdms.layer SET lithology_id_cli =15104538  WHERE lithology_id_cli = 15103033;
        UPDATE bdms.layer SET lithology_id_cli =15104457  WHERE lithology_id_cli = 15103034;
        UPDATE bdms.layer SET lithology_id_cli =15104526  WHERE lithology_id_cli = 15103035;
        UPDATE bdms.layer SET lithology_id_cli =15104587  WHERE lithology_id_cli = 15103036;
        UPDATE bdms.layer SET lithology_id_cli =15104587  WHERE lithology_id_cli = 15103037;
        UPDATE bdms.layer SET lithology_id_cli =15104587  WHERE lithology_id_cli = 15103038;
        UPDATE bdms.layer SET lithology_id_cli =15104587  WHERE lithology_id_cli = 15103039;
        UPDATE bdms.layer SET lithology_id_cli =15104876  WHERE lithology_id_cli = 15103040;
        UPDATE bdms.layer SET lithology_id_cli =15104875  WHERE lithology_id_cli = 15103041;
        UPDATE bdms.layer SET lithology_id_cli =15104482  WHERE lithology_id_cli = 15103042;
        UPDATE bdms.layer SET lithology_id_cli =15104481  WHERE lithology_id_cli = 15103043;
        UPDATE bdms.layer SET lithology_id_cli =15104481  WHERE lithology_id_cli = 15103044;
        UPDATE bdms.layer SET lithology_id_cli =15104454  WHERE lithology_id_cli = 15103045;
        UPDATE bdms.layer SET lithology_id_cli =15105030  WHERE lithology_id_cli = 15103046;
        UPDATE bdms.layer SET lithology_id_cli =15105029  WHERE lithology_id_cli = 15103047;
        UPDATE bdms.layer SET lithology_id_cli =15104456  WHERE lithology_id_cli = 15103048;
        UPDATE bdms.layer SET lithology_id_cli =15104457  WHERE lithology_id_cli = 15103049;
        UPDATE bdms.layer SET lithology_id_cli =15104852  WHERE lithology_id_cli = 15103050;
        UPDATE bdms.layer SET lithology_id_cli =15104588  WHERE lithology_id_cli = 15103051;
        UPDATE bdms.layer SET lithology_id_cli =15104572  WHERE lithology_id_cli = 15103052;
        UPDATE bdms.layer SET lithology_id_cli =15104572  WHERE lithology_id_cli = 15103053;
        UPDATE bdms.layer SET lithology_id_cli =15104665  WHERE lithology_id_cli = 15103054;
        UPDATE bdms.layer SET lithology_id_cli =15104476  WHERE lithology_id_cli = 15103055;
        UPDATE bdms.layer SET lithology_id_cli =15105035  WHERE lithology_id_cli = 15103056;
        UPDATE bdms.layer SET lithology_id_cli =15105034  WHERE lithology_id_cli = 15103057;
        UPDATE bdms.layer SET lithology_id_cli =15105033  WHERE lithology_id_cli = 15103058;
        UPDATE bdms.layer SET lithology_id_cli =15105036  WHERE lithology_id_cli = 15103059;
        UPDATE bdms.layer SET lithology_id_cli =15105036  WHERE lithology_id_cli = 15103060;
        UPDATE bdms.layer SET lithology_id_cli =15104480  WHERE lithology_id_cli = 15103061;
        UPDATE bdms.layer SET lithology_id_cli =15104767  WHERE lithology_id_cli = 15103062;
        UPDATE bdms.layer SET lithology_id_cli =15104920  WHERE lithology_id_cli = 15103063;
        UPDATE bdms.layer SET lithology_id_cli =15104988  WHERE lithology_id_cli = 15103064;
        UPDATE bdms.layer SET lithology_id_cli =15105028  WHERE lithology_id_cli = 15103065;
        UPDATE bdms.layer SET lithology_id_cli =15104460  WHERE lithology_id_cli = 15103066;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104001;
        UPDATE bdms.layer SET lithology_id_cli =15104583  WHERE lithology_id_cli = 15104002;
        UPDATE bdms.layer SET lithology_id_cli =15104583  WHERE lithology_id_cli = 15104003;
        UPDATE bdms.layer SET lithology_id_cli =15104666  WHERE lithology_id_cli = 15104004;
        UPDATE bdms.layer SET lithology_id_cli =15104666  WHERE lithology_id_cli = 15104005;
        UPDATE bdms.layer SET lithology_id_cli =15104666  WHERE lithology_id_cli = 15104006;
        UPDATE bdms.layer SET lithology_id_cli =15104667  WHERE lithology_id_cli = 15104007;
        UPDATE bdms.layer SET lithology_id_cli =15104466  WHERE lithology_id_cli = 15104008;
        UPDATE bdms.layer SET lithology_id_cli =15104752  WHERE lithology_id_cli = 15104009;
        UPDATE bdms.layer SET lithology_id_cli =15104752  WHERE lithology_id_cli = 15104010;
        UPDATE bdms.layer SET lithology_id_cli =15104872  WHERE lithology_id_cli = 15104011;
        UPDATE bdms.layer SET lithology_id_cli =15104464  WHERE lithology_id_cli = 15104012;
        UPDATE bdms.layer SET lithology_id_cli =15104471  WHERE lithology_id_cli = 15104013;
        UPDATE bdms.layer SET lithology_id_cli =15104752  WHERE lithology_id_cli = 15104014;
        UPDATE bdms.layer SET lithology_id_cli =15104752  WHERE lithology_id_cli = 15104015;
        UPDATE bdms.layer SET lithology_id_cli =15104752  WHERE lithology_id_cli = 15104016;
        UPDATE bdms.layer SET lithology_id_cli =15104839  WHERE lithology_id_cli = 15104017;
        UPDATE bdms.layer SET lithology_id_cli =15104839  WHERE lithology_id_cli = 15104018;
        UPDATE bdms.layer SET lithology_id_cli =15104839  WHERE lithology_id_cli = 15104019;
        UPDATE bdms.layer SET lithology_id_cli =15104839  WHERE lithology_id_cli = 15104020;
        UPDATE bdms.layer SET lithology_id_cli =15104839  WHERE lithology_id_cli = 15104021;
        UPDATE bdms.layer SET lithology_id_cli =15104841  WHERE lithology_id_cli = 15104022;
        UPDATE bdms.layer SET lithology_id_cli =15104841  WHERE lithology_id_cli = 15104023;
        UPDATE bdms.layer SET lithology_id_cli =15104864  WHERE lithology_id_cli = 15104024;
        UPDATE bdms.layer SET lithology_id_cli =15104864  WHERE lithology_id_cli = 15104025;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104026;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104027;
        UPDATE bdms.layer SET lithology_id_cli =15104854  WHERE lithology_id_cli = 15104028;
        UPDATE bdms.layer SET lithology_id_cli =15104854  WHERE lithology_id_cli = 15104029;
        UPDATE bdms.layer SET lithology_id_cli =15104921  WHERE lithology_id_cli = 15104030;
        UPDATE bdms.layer SET lithology_id_cli =15104921  WHERE lithology_id_cli = 15104031;
        UPDATE bdms.layer SET lithology_id_cli =15104965  WHERE lithology_id_cli = 15104032;
        UPDATE bdms.layer SET lithology_id_cli =15104958  WHERE lithology_id_cli = 15104033;
        UPDATE bdms.layer SET lithology_id_cli =15104929  WHERE lithology_id_cli = 15104034;
        UPDATE bdms.layer SET lithology_id_cli =15104934  WHERE lithology_id_cli = 15104035;
        UPDATE bdms.layer SET lithology_id_cli =15104933  WHERE lithology_id_cli = 15104036;
        UPDATE bdms.layer SET lithology_id_cli =15104943  WHERE lithology_id_cli = 15104037;
        UPDATE bdms.layer SET lithology_id_cli =15104858  WHERE lithology_id_cli = 15104038;
        UPDATE bdms.layer SET lithology_id_cli =15104961  WHERE lithology_id_cli = 15104039;
        UPDATE bdms.layer SET lithology_id_cli =15104589  WHERE lithology_id_cli = 15104040;
        UPDATE bdms.layer SET lithology_id_cli =15104589  WHERE lithology_id_cli = 15104041;
        UPDATE bdms.layer SET lithology_id_cli =15104594  WHERE lithology_id_cli = 15104042;
        UPDATE bdms.layer SET lithology_id_cli =15104601  WHERE lithology_id_cli = 15104043;
        UPDATE bdms.layer SET lithology_id_cli =15104589  WHERE lithology_id_cli = 15104044;
        UPDATE bdms.layer SET lithology_id_cli =15104598  WHERE lithology_id_cli = 15104045;
        UPDATE bdms.layer SET lithology_id_cli =15104612  WHERE lithology_id_cli = 15104046;
        UPDATE bdms.layer SET lithology_id_cli =15104653  WHERE lithology_id_cli = 15104047;
        UPDATE bdms.layer SET lithology_id_cli =15104626  WHERE lithology_id_cli = 15104048;
        UPDATE bdms.layer SET lithology_id_cli =15104609  WHERE lithology_id_cli = 15104049;
        UPDATE bdms.layer SET lithology_id_cli =15104663  WHERE lithology_id_cli = 15104050;
        UPDATE bdms.layer SET lithology_id_cli =15104662  WHERE lithology_id_cli = 15104051;
        UPDATE bdms.layer SET lithology_id_cli =15104653  WHERE lithology_id_cli = 15104052;
        UPDATE bdms.layer SET lithology_id_cli =15104653  WHERE lithology_id_cli = 15104053;
        UPDATE bdms.layer SET lithology_id_cli =15104656  WHERE lithology_id_cli = 15104054;
        UPDATE bdms.layer SET lithology_id_cli =15104770  WHERE lithology_id_cli = 15104055;
        UPDATE bdms.layer SET lithology_id_cli =15104659  WHERE lithology_id_cli = 15104056;
        UPDATE bdms.layer SET lithology_id_cli =15104785  WHERE lithology_id_cli = 15104057;
        UPDATE bdms.layer SET lithology_id_cli =15104661  WHERE lithology_id_cli = 15104058;
        UPDATE bdms.layer SET lithology_id_cli =15104879  WHERE lithology_id_cli = 15104059;
        UPDATE bdms.layer SET lithology_id_cli =15104449  WHERE lithology_id_cli = 15104060;
        UPDATE bdms.layer SET lithology_id_cli =15104450  WHERE lithology_id_cli = 15104061;
        UPDATE bdms.layer SET lithology_id_cli =15104453  WHERE lithology_id_cli = 15104062;
        UPDATE bdms.layer SET lithology_id_cli =15104593  WHERE lithology_id_cli = 15104063;
        UPDATE bdms.layer SET lithology_id_cli =15104514  WHERE lithology_id_cli = 15104064;
        UPDATE bdms.layer SET lithology_id_cli =15104657  WHERE lithology_id_cli = 15104065;
        UPDATE bdms.layer SET lithology_id_cli =15104664  WHERE lithology_id_cli = 15104066;
        UPDATE bdms.layer SET lithology_id_cli =15104664  WHERE lithology_id_cli = 15104067;
        UPDATE bdms.layer SET lithology_id_cli =15104561  WHERE lithology_id_cli = 15104068;
        UPDATE bdms.layer SET lithology_id_cli =15104561  WHERE lithology_id_cli = 15104069;
        UPDATE bdms.layer SET lithology_id_cli =15104781  WHERE lithology_id_cli = 15104070;
        UPDATE bdms.layer SET lithology_id_cli =15104638  WHERE lithology_id_cli = 15104071;
        UPDATE bdms.layer SET lithology_id_cli =15104589  WHERE lithology_id_cli = 15104072;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104073;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104074;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104075;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104076;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104077;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104078;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104079;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104080;
        UPDATE bdms.layer SET lithology_id_cli =15104833  WHERE lithology_id_cli = 15104081;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104082;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104083;
        UPDATE bdms.layer SET lithology_id_cli =15104560  WHERE lithology_id_cli = 15104084;
        UPDATE bdms.layer SET lithology_id_cli =15104927  WHERE lithology_id_cli = 15104085;
        UPDATE bdms.layer SET lithology_id_cli =15104928  WHERE lithology_id_cli = 15104085;
        UPDATE bdms.layer SET lithology_id_cli =15104452  WHERE lithology_id_cli = 15104086;
        UPDATE bdms.layer SET lithology_id_cli =15104654  WHERE lithology_id_cli = 15104087;
        UPDATE bdms.layer SET lithology_id_cli =15104658  WHERE lithology_id_cli = 15104088;
        UPDATE bdms.layer SET lithology_id_cli =15104929  WHERE lithology_id_cli = 15104089;
        UPDATE bdms.layer SET lithology_id_cli =15104974  WHERE lithology_id_cli = 15104090;
        UPDATE bdms.layer SET lithology_id_cli =15104866  WHERE lithology_id_cli = 15104091;
        UPDATE bdms.layer SET lithology_id_cli =15104534  WHERE lithology_id_cli = 15104092;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15104093;
        UPDATE bdms.layer SET lithology_id_cli =15104559  WHERE lithology_id_cli = 15104095;
        UPDATE bdms.layer SET lithology_id_cli =15104937  WHERE lithology_id_cli = 15104097;
        UPDATE bdms.layer SET lithology_id_cli =15104861  WHERE lithology_id_cli = 15104098;
        UPDATE bdms.layer SET lithology_id_cli =15104976  WHERE lithology_id_cli = 15104099;
        UPDATE bdms.layer SET lithology_id_cli =15104951  WHERE lithology_id_cli = 15104103;
        UPDATE bdms.layer SET lithology_id_cli =15104581  WHERE lithology_id_cli = 15104201;
        UPDATE bdms.layer SET lithology_id_cli =15104863  WHERE lithology_id_cli = 15104202;
        UPDATE bdms.layer SET lithology_id_cli =15104461  WHERE lithology_id_cli = 15104203;
        UPDATE bdms.layer SET lithology_id_cli =15104753  WHERE lithology_id_cli = 15104204;
        UPDATE bdms.layer SET lithology_id_cli =15104881  WHERE lithology_id_cli = 15104205;
        UPDATE bdms.layer SET lithology_id_cli =15104906  WHERE lithology_id_cli = 15104206;
        UPDATE bdms.layer SET lithology_id_cli =15104862  WHERE lithology_id_cli = 15104207;
        UPDATE bdms.layer SET lithology_id_cli =15104885  WHERE lithology_id_cli = 15104208;
        UPDATE bdms.layer SET lithology_id_cli =15104916  WHERE lithology_id_cli = 15104209;
        UPDATE bdms.layer SET lithology_id_cli =15104901  WHERE lithology_id_cli = 15104210;
        UPDATE bdms.layer SET lithology_id_cli =15104843  WHERE lithology_id_cli = 15104211;
        UPDATE bdms.layer SET lithology_id_cli =15104978  WHERE lithology_id_cli = 15104212;
        UPDATE bdms.layer SET lithology_id_cli =15105004  WHERE lithology_id_cli = 15104213;
        UPDATE bdms.layer SET lithology_id_cli =15104788  WHERE lithology_id_cli = 15104214;
        UPDATE bdms.layer SET lithology_id_cli =15104668  WHERE lithology_id_cli = 15104215;
        UPDATE bdms.layer SET lithology_id_cli =15104771  WHERE lithology_id_cli = 15104216;
        UPDATE bdms.layer SET lithology_id_cli =15104552  WHERE lithology_id_cli = 15104217;
        UPDATE bdms.layer SET lithology_id_cli =15104550  WHERE lithology_id_cli = 15104218;
        UPDATE bdms.layer SET lithology_id_cli =15104559  WHERE lithology_id_cli = 15104401;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15104402;
        UPDATE bdms.layer SET lithology_id_cli =15104571  WHERE lithology_id_cli = 15104403;
        UPDATE bdms.layer SET lithology_id_cli =15104630  WHERE lithology_id_cli = 15104404;
        UPDATE bdms.layer SET lithology_id_cli =15104629  WHERE lithology_id_cli = 15104405;
        UPDATE bdms.layer SET lithology_id_cli =15104648  WHERE lithology_id_cli = 15104406;
        UPDATE bdms.layer SET lithology_id_cli =15104489  WHERE lithology_id_cli = 15104407;
        UPDATE bdms.layer SET lithology_id_cli =15105001  WHERE lithology_id_cli = 15104408;
        UPDATE bdms.layer SET lithology_id_cli =15104483  WHERE lithology_id_cli = 15104409;
        UPDATE bdms.layer SET lithology_id_cli =15104989  WHERE lithology_id_cli = 15104410;
        UPDATE bdms.layer SET lithology_id_cli =15104990  WHERE lithology_id_cli = 15104411;
        UPDATE bdms.layer SET lithology_id_cli =15104533  WHERE lithology_id_cli = 15104412;
        UPDATE bdms.layer SET lithology_id_cli =15104524  WHERE lithology_id_cli = 15104413;
        UPDATE bdms.layer SET lithology_id_cli =15104532  WHERE lithology_id_cli = 15104414;
        UPDATE bdms.layer SET lithology_id_cli =15104487  WHERE lithology_id_cli = 15104415;
        UPDATE bdms.layer SET lithology_id_cli =15104527  WHERE lithology_id_cli = 15104416;
        UPDATE bdms.layer SET lithology_id_cli =15104835  WHERE lithology_id_cli = 15104417;
        UPDATE bdms.layer SET lithology_id_cli =15104865  WHERE lithology_id_cli = 15104418;
        UPDATE bdms.layer SET lithology_id_cli =15104844  WHERE lithology_id_cli = 15104419;
        UPDATE bdms.layer SET lithology_id_cli =15104992  WHERE lithology_id_cli = 15104420;
        UPDATE bdms.layer SET lithology_id_cli =15104528  WHERE lithology_id_cli = 15104421;
        UPDATE bdms.layer SET lithology_id_cli =15104660  WHERE lithology_id_cli = 15104422;
        UPDATE bdms.layer SET lithology_id_cli =15104548  WHERE lithology_id_cli = 15104423;
        UPDATE bdms.layer SET lithology_id_cli =15104639  WHERE lithology_id_cli = 15104424;
        UPDATE bdms.layer SET lithology_id_cli =15104878  WHERE lithology_id_cli = 15104425;
        UPDATE bdms.layer SET lithology_id_cli =15104842  WHERE lithology_id_cli = 15104426;
        UPDATE bdms.layer SET lithology_id_cli =15104455  WHERE lithology_id_cli = 15104427;
        UPDATE bdms.layer SET lithology_id_cli =15104486  WHERE lithology_id_cli = 15104428;
        UPDATE bdms.layer SET lithology_id_cli =15104526  WHERE lithology_id_cli = 15104429;
        UPDATE bdms.layer SET lithology_id_cli =15104538  WHERE lithology_id_cli = 15104430;
        UPDATE bdms.layer SET lithology_id_cli =15104457  WHERE lithology_id_cli = 15104431;
        UPDATE bdms.layer SET lithology_id_cli =15104526  WHERE lithology_id_cli = 15104432;
        UPDATE bdms.layer SET lithology_id_cli =15104876  WHERE lithology_id_cli = 15104433;
        UPDATE bdms.layer SET lithology_id_cli =15104875  WHERE lithology_id_cli = 15104434;
        UPDATE bdms.layer SET lithology_id_cli =15104482  WHERE lithology_id_cli = 15104435;
        UPDATE bdms.layer SET lithology_id_cli =15104481  WHERE lithology_id_cli = 15104436;
        UPDATE bdms.layer SET lithology_id_cli =15104481  WHERE lithology_id_cli = 15104437;
        UPDATE bdms.layer SET lithology_id_cli =15104454  WHERE lithology_id_cli = 15104438;
        UPDATE bdms.layer SET lithology_id_cli =15105030  WHERE lithology_id_cli = 15104439;
        UPDATE bdms.layer SET lithology_id_cli =15105029  WHERE lithology_id_cli = 15104440;
        UPDATE bdms.layer SET lithology_id_cli =15104456  WHERE lithology_id_cli = 15104441;
        UPDATE bdms.layer SET lithology_id_cli =15104457  WHERE lithology_id_cli = 15104442;
        UPDATE bdms.layer SET lithology_id_cli =15104852  WHERE lithology_id_cli = 15104443;
        UPDATE bdms.layer SET lithology_id_cli =15104572  WHERE lithology_id_cli = 15104444;
        UPDATE bdms.layer SET lithology_id_cli =15104665  WHERE lithology_id_cli = 15104445;
        UPDATE bdms.layer SET lithology_id_cli =15104587  WHERE lithology_id_cli = 15104446;
        UPDATE bdms.layer SET lithology_id_cli =15104586  WHERE lithology_id_cli = 15104447;
        UPDATE bdms.layer SET lithology_id_cli =15104840  WHERE lithology_id_cli = 15104448;

       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105037  WHERE lithology_top_bedrock_id_cli = 4000;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101001;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101003;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101005;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101006;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101007;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101008;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101009;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101010;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101012;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101013;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101014;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101015;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101016;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101017;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101019;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101021;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101024;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101026;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101028;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101029;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101030;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101031;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101032;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101033;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101034;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101036;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101037;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101039;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101040;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101041;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101042;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101044;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101046;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101047;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101048;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101049;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101051;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101052;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101053;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101054;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101055;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101056;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101057;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101058;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101059;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101061;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101062;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101063;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101065;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101067;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101069;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101070;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101071;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101072;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101073;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101076;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101077;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101078;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101079;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101080;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101081;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101082;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101083;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102001;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104556  WHERE lithology_top_bedrock_id_cli = 15102003;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15102004;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15102005;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104461  WHERE lithology_top_bedrock_id_cli = 15102006;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104753  WHERE lithology_top_bedrock_id_cli = 15102007;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104862  WHERE lithology_top_bedrock_id_cli = 15102008;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104881  WHERE lithology_top_bedrock_id_cli = 15102009;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104906  WHERE lithology_top_bedrock_id_cli = 15102010;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104890  WHERE lithology_top_bedrock_id_cli = 15102011;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104883  WHERE lithology_top_bedrock_id_cli = 15102012;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104900  WHERE lithology_top_bedrock_id_cli = 15102013;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104903  WHERE lithology_top_bedrock_id_cli = 15102014;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104911  WHERE lithology_top_bedrock_id_cli = 15102015;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104885  WHERE lithology_top_bedrock_id_cli = 15102016;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104916  WHERE lithology_top_bedrock_id_cli = 15102017;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104901  WHERE lithology_top_bedrock_id_cli = 15102018;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104888  WHERE lithology_top_bedrock_id_cli = 15102019;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104887  WHERE lithology_top_bedrock_id_cli = 15102020;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104896  WHERE lithology_top_bedrock_id_cli = 15102021;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104895  WHERE lithology_top_bedrock_id_cli = 15102022;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102023;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102024;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104978  WHERE lithology_top_bedrock_id_cli = 15102025;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105004  WHERE lithology_top_bedrock_id_cli = 15102026;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104788  WHERE lithology_top_bedrock_id_cli = 15102027;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104830  WHERE lithology_top_bedrock_id_cli = 15102028;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104798  WHERE lithology_top_bedrock_id_cli = 15102029;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102030;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102031;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102032;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102033;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102034;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104690  WHERE lithology_top_bedrock_id_cli = 15102035;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104738  WHERE lithology_top_bedrock_id_cli = 15102036;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104708  WHERE lithology_top_bedrock_id_cli = 15102037;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104671  WHERE lithology_top_bedrock_id_cli = 15102038;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104724  WHERE lithology_top_bedrock_id_cli = 15102039;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104725  WHERE lithology_top_bedrock_id_cli = 15102040;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104467  WHERE lithology_top_bedrock_id_cli = 15102041;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104719  WHERE lithology_top_bedrock_id_cli = 15102042;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104717  WHERE lithology_top_bedrock_id_cli = 15102043;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104709  WHERE lithology_top_bedrock_id_cli = 15102044;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102045;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104726  WHERE lithology_top_bedrock_id_cli = 15102046;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102047;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104494  WHERE lithology_top_bedrock_id_cli = 15102048;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104494  WHERE lithology_top_bedrock_id_cli = 15102049;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104551  WHERE lithology_top_bedrock_id_cli = 15102050;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104551  WHERE lithology_top_bedrock_id_cli = 15102051;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104552  WHERE lithology_top_bedrock_id_cli = 15102052;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104553  WHERE lithology_top_bedrock_id_cli = 15102053;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104554  WHERE lithology_top_bedrock_id_cli = 15102054;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102055;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102056;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104565  WHERE lithology_top_bedrock_id_cli = 15102057;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102058;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104563  WHERE lithology_top_bedrock_id_cli = 15102059;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104543  WHERE lithology_top_bedrock_id_cli = 15102060;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104544  WHERE lithology_top_bedrock_id_cli = 15102061;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104570  WHERE lithology_top_bedrock_id_cli = 15102062;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104570  WHERE lithology_top_bedrock_id_cli = 15102063;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104905  WHERE lithology_top_bedrock_id_cli = 15102064;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104722  WHERE lithology_top_bedrock_id_cli = 15102065;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104811  WHERE lithology_top_bedrock_id_cli = 15102066;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102067;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102068;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104515  WHERE lithology_top_bedrock_id_cli = 15102069;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104515  WHERE lithology_top_bedrock_id_cli = 15102070;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104516  WHERE lithology_top_bedrock_id_cli = 15102071;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104517  WHERE lithology_top_bedrock_id_cli = 15102072;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104518  WHERE lithology_top_bedrock_id_cli = 15102073;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15102074;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15102075;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104874  WHERE lithology_top_bedrock_id_cli = 15102076;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105031  WHERE lithology_top_bedrock_id_cli = 15102077;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104751  WHERE lithology_top_bedrock_id_cli = 15102078;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104573  WHERE lithology_top_bedrock_id_cli = 15102079;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104573  WHERE lithology_top_bedrock_id_cli = 15102080;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104574  WHERE lithology_top_bedrock_id_cli = 15102081;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104999  WHERE lithology_top_bedrock_id_cli = 15102082;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104576  WHERE lithology_top_bedrock_id_cli = 15102083;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104574  WHERE lithology_top_bedrock_id_cli = 15102084;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104575  WHERE lithology_top_bedrock_id_cli = 15102085;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104575  WHERE lithology_top_bedrock_id_cli = 15102086;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104998  WHERE lithology_top_bedrock_id_cli = 15102087;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105000  WHERE lithology_top_bedrock_id_cli = 15102088;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104880  WHERE lithology_top_bedrock_id_cli = 15102089;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104555  WHERE lithology_top_bedrock_id_cli = 15102090;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104567  WHERE lithology_top_bedrock_id_cli = 15102091;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104567  WHERE lithology_top_bedrock_id_cli = 15102092;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104568  WHERE lithology_top_bedrock_id_cli = 15102093;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104721  WHERE lithology_top_bedrock_id_cli = 15102094;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104742  WHERE lithology_top_bedrock_id_cli = 15102100;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104688  WHERE lithology_top_bedrock_id_cli = 15102101;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104884  WHERE lithology_top_bedrock_id_cli = 15102103;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104795  WHERE lithology_top_bedrock_id_cli = 15102104;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104695  WHERE lithology_top_bedrock_id_cli = 15102105;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104677  WHERE lithology_top_bedrock_id_cli = 15102106;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104701  WHERE lithology_top_bedrock_id_cli = 15102107;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104686  WHERE lithology_top_bedrock_id_cli = 15102108;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15103001;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103002;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103003;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103004;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103005;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104630  WHERE lithology_top_bedrock_id_cli = 15103006;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104629  WHERE lithology_top_bedrock_id_cli = 15103007;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104648  WHERE lithology_top_bedrock_id_cli = 15103008;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104489  WHERE lithology_top_bedrock_id_cli = 15103009;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105001  WHERE lithology_top_bedrock_id_cli = 15103010;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104483  WHERE lithology_top_bedrock_id_cli = 15103011;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104989  WHERE lithology_top_bedrock_id_cli = 15103012;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104990  WHERE lithology_top_bedrock_id_cli = 15103013;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104533  WHERE lithology_top_bedrock_id_cli = 15103014;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104524  WHERE lithology_top_bedrock_id_cli = 15103015;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104532  WHERE lithology_top_bedrock_id_cli = 15103016;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104487  WHERE lithology_top_bedrock_id_cli = 15103017;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104527  WHERE lithology_top_bedrock_id_cli = 15103018;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104835  WHERE lithology_top_bedrock_id_cli = 15103019;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104865  WHERE lithology_top_bedrock_id_cli = 15103020;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104844  WHERE lithology_top_bedrock_id_cli = 15103021;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104992  WHERE lithology_top_bedrock_id_cli = 15103022;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104528  WHERE lithology_top_bedrock_id_cli = 15103023;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104660  WHERE lithology_top_bedrock_id_cli = 15103024;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15103025;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15103026;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104639  WHERE lithology_top_bedrock_id_cli = 15103027;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104878  WHERE lithology_top_bedrock_id_cli = 15103028;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104842  WHERE lithology_top_bedrock_id_cli = 15103029;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104455  WHERE lithology_top_bedrock_id_cli = 15103030;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104486  WHERE lithology_top_bedrock_id_cli = 15103031;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15103032;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104538  WHERE lithology_top_bedrock_id_cli = 15103033;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15103034;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15103035;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103036;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103037;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103038;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103039;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104876  WHERE lithology_top_bedrock_id_cli = 15103040;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104875  WHERE lithology_top_bedrock_id_cli = 15103041;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104482  WHERE lithology_top_bedrock_id_cli = 15103042;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15103043;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15103044;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104454  WHERE lithology_top_bedrock_id_cli = 15103045;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105030  WHERE lithology_top_bedrock_id_cli = 15103046;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105029  WHERE lithology_top_bedrock_id_cli = 15103047;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104456  WHERE lithology_top_bedrock_id_cli = 15103048;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15103049;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104852  WHERE lithology_top_bedrock_id_cli = 15103050;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104588  WHERE lithology_top_bedrock_id_cli = 15103051;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15103052;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15103053;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104665  WHERE lithology_top_bedrock_id_cli = 15103054;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104476  WHERE lithology_top_bedrock_id_cli = 15103055;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105035  WHERE lithology_top_bedrock_id_cli = 15103056;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105034  WHERE lithology_top_bedrock_id_cli = 15103057;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105033  WHERE lithology_top_bedrock_id_cli = 15103058;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105036  WHERE lithology_top_bedrock_id_cli = 15103059;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105036  WHERE lithology_top_bedrock_id_cli = 15103060;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104480  WHERE lithology_top_bedrock_id_cli = 15103061;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104767  WHERE lithology_top_bedrock_id_cli = 15103062;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104920  WHERE lithology_top_bedrock_id_cli = 15103063;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104988  WHERE lithology_top_bedrock_id_cli = 15103064;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105028  WHERE lithology_top_bedrock_id_cli = 15103065;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104460  WHERE lithology_top_bedrock_id_cli = 15103066;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104001;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104583  WHERE lithology_top_bedrock_id_cli = 15104002;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104583  WHERE lithology_top_bedrock_id_cli = 15104003;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104004;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104005;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104006;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104667  WHERE lithology_top_bedrock_id_cli = 15104007;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104466  WHERE lithology_top_bedrock_id_cli = 15104008;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104009;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104010;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104872  WHERE lithology_top_bedrock_id_cli = 15104011;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104464  WHERE lithology_top_bedrock_id_cli = 15104012;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104471  WHERE lithology_top_bedrock_id_cli = 15104013;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104014;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104015;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104016;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104017;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104018;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104019;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104020;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104021;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104841  WHERE lithology_top_bedrock_id_cli = 15104022;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104841  WHERE lithology_top_bedrock_id_cli = 15104023;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104864  WHERE lithology_top_bedrock_id_cli = 15104024;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104864  WHERE lithology_top_bedrock_id_cli = 15104025;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104026;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104027;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104854  WHERE lithology_top_bedrock_id_cli = 15104028;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104854  WHERE lithology_top_bedrock_id_cli = 15104029;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104921  WHERE lithology_top_bedrock_id_cli = 15104030;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104921  WHERE lithology_top_bedrock_id_cli = 15104031;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104965  WHERE lithology_top_bedrock_id_cli = 15104032;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104958  WHERE lithology_top_bedrock_id_cli = 15104033;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104929  WHERE lithology_top_bedrock_id_cli = 15104034;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104934  WHERE lithology_top_bedrock_id_cli = 15104035;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104933  WHERE lithology_top_bedrock_id_cli = 15104036;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104943  WHERE lithology_top_bedrock_id_cli = 15104037;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104858  WHERE lithology_top_bedrock_id_cli = 15104038;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104961  WHERE lithology_top_bedrock_id_cli = 15104039;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104040;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104041;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104594  WHERE lithology_top_bedrock_id_cli = 15104042;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104601  WHERE lithology_top_bedrock_id_cli = 15104043;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104044;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104598  WHERE lithology_top_bedrock_id_cli = 15104045;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104612  WHERE lithology_top_bedrock_id_cli = 15104046;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104047;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104626  WHERE lithology_top_bedrock_id_cli = 15104048;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104609  WHERE lithology_top_bedrock_id_cli = 15104049;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104663  WHERE lithology_top_bedrock_id_cli = 15104050;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104662  WHERE lithology_top_bedrock_id_cli = 15104051;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104052;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104053;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104656  WHERE lithology_top_bedrock_id_cli = 15104054;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104770  WHERE lithology_top_bedrock_id_cli = 15104055;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104659  WHERE lithology_top_bedrock_id_cli = 15104056;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104785  WHERE lithology_top_bedrock_id_cli = 15104057;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104661  WHERE lithology_top_bedrock_id_cli = 15104058;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104879  WHERE lithology_top_bedrock_id_cli = 15104059;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104449  WHERE lithology_top_bedrock_id_cli = 15104060;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104450  WHERE lithology_top_bedrock_id_cli = 15104061;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104453  WHERE lithology_top_bedrock_id_cli = 15104062;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104593  WHERE lithology_top_bedrock_id_cli = 15104063;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104514  WHERE lithology_top_bedrock_id_cli = 15104064;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104657  WHERE lithology_top_bedrock_id_cli = 15104065;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104664  WHERE lithology_top_bedrock_id_cli = 15104066;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104664  WHERE lithology_top_bedrock_id_cli = 15104067;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104561  WHERE lithology_top_bedrock_id_cli = 15104068;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104561  WHERE lithology_top_bedrock_id_cli = 15104069;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104781  WHERE lithology_top_bedrock_id_cli = 15104070;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104638  WHERE lithology_top_bedrock_id_cli = 15104071;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104072;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104073;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104074;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104075;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104076;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104077;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104078;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104079;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104080;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104081;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104082;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104083;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104084;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104927  WHERE lithology_top_bedrock_id_cli = 15104085;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104928  WHERE lithology_top_bedrock_id_cli = 15104085;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104452  WHERE lithology_top_bedrock_id_cli = 15104086;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104654  WHERE lithology_top_bedrock_id_cli = 15104087;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104658  WHERE lithology_top_bedrock_id_cli = 15104088;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104929  WHERE lithology_top_bedrock_id_cli = 15104089;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104974  WHERE lithology_top_bedrock_id_cli = 15104090;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104866  WHERE lithology_top_bedrock_id_cli = 15104091;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104534  WHERE lithology_top_bedrock_id_cli = 15104092;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15104093;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15104095;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104937  WHERE lithology_top_bedrock_id_cli = 15104097;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104861  WHERE lithology_top_bedrock_id_cli = 15104098;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104976  WHERE lithology_top_bedrock_id_cli = 15104099;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104951  WHERE lithology_top_bedrock_id_cli = 15104103;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15104201;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15104202;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104461  WHERE lithology_top_bedrock_id_cli = 15104203;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104753  WHERE lithology_top_bedrock_id_cli = 15104204;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104881  WHERE lithology_top_bedrock_id_cli = 15104205;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104906  WHERE lithology_top_bedrock_id_cli = 15104206;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104862  WHERE lithology_top_bedrock_id_cli = 15104207;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104885  WHERE lithology_top_bedrock_id_cli = 15104208;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104916  WHERE lithology_top_bedrock_id_cli = 15104209;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104901  WHERE lithology_top_bedrock_id_cli = 15104210;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15104211;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104978  WHERE lithology_top_bedrock_id_cli = 15104212;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105004  WHERE lithology_top_bedrock_id_cli = 15104213;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104788  WHERE lithology_top_bedrock_id_cli = 15104214;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15104215;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104771  WHERE lithology_top_bedrock_id_cli = 15104216;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104552  WHERE lithology_top_bedrock_id_cli = 15104217;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15104218;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15104401;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15104402;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15104403;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104630  WHERE lithology_top_bedrock_id_cli = 15104404;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104629  WHERE lithology_top_bedrock_id_cli = 15104405;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104648  WHERE lithology_top_bedrock_id_cli = 15104406;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104489  WHERE lithology_top_bedrock_id_cli = 15104407;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105001  WHERE lithology_top_bedrock_id_cli = 15104408;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104483  WHERE lithology_top_bedrock_id_cli = 15104409;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104989  WHERE lithology_top_bedrock_id_cli = 15104410;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104990  WHERE lithology_top_bedrock_id_cli = 15104411;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104533  WHERE lithology_top_bedrock_id_cli = 15104412;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104524  WHERE lithology_top_bedrock_id_cli = 15104413;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104532  WHERE lithology_top_bedrock_id_cli = 15104414;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104487  WHERE lithology_top_bedrock_id_cli = 15104415;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104527  WHERE lithology_top_bedrock_id_cli = 15104416;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104835  WHERE lithology_top_bedrock_id_cli = 15104417;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104865  WHERE lithology_top_bedrock_id_cli = 15104418;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104844  WHERE lithology_top_bedrock_id_cli = 15104419;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104992  WHERE lithology_top_bedrock_id_cli = 15104420;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104528  WHERE lithology_top_bedrock_id_cli = 15104421;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104660  WHERE lithology_top_bedrock_id_cli = 15104422;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15104423;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104639  WHERE lithology_top_bedrock_id_cli = 15104424;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104878  WHERE lithology_top_bedrock_id_cli = 15104425;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104842  WHERE lithology_top_bedrock_id_cli = 15104426;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104455  WHERE lithology_top_bedrock_id_cli = 15104427;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104486  WHERE lithology_top_bedrock_id_cli = 15104428;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15104429;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104538  WHERE lithology_top_bedrock_id_cli = 15104430;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15104431;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15104432;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104876  WHERE lithology_top_bedrock_id_cli = 15104433;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104875  WHERE lithology_top_bedrock_id_cli = 15104434;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104482  WHERE lithology_top_bedrock_id_cli = 15104435;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15104436;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15104437;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104454  WHERE lithology_top_bedrock_id_cli = 15104438;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105030  WHERE lithology_top_bedrock_id_cli = 15104439;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15105029  WHERE lithology_top_bedrock_id_cli = 15104440;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104456  WHERE lithology_top_bedrock_id_cli = 15104441;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15104442;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104852  WHERE lithology_top_bedrock_id_cli = 15104443;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15104444;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104665  WHERE lithology_top_bedrock_id_cli = 15104445;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15104446;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104586  WHERE lithology_top_bedrock_id_cli = 15104447;
       UPDATE bdms.layer SET lithology_top_bedrock_id_cli =15104840  WHERE lithology_top_bedrock_id_cli = 15104448;

        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105037  WHERE lithology_top_bedrock_id_cli = 4000;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101001;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101003;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101005;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101006;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101007;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101008;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101009;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101010;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101012;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101013;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101014;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101015;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101016;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101017;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101019;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101021;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101024;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101026;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101028;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101029;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101030;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101031;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101032;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101033;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101034;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101036;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101037;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101039;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101040;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101041;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101042;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101044;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101046;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101047;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101048;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101049;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101051;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101052;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101053;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101054;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101055;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101056;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101057;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101058;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101059;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101061;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101062;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101063;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101065;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101067;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101069;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101070;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101071;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101072;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101073;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101076;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101077;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101078;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101079;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101080;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101081;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101082;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104769  WHERE lithology_top_bedrock_id_cli = 15101083;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102001;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104556  WHERE lithology_top_bedrock_id_cli = 15102003;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15102004;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15102005;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104461  WHERE lithology_top_bedrock_id_cli = 15102006;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104753  WHERE lithology_top_bedrock_id_cli = 15102007;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104862  WHERE lithology_top_bedrock_id_cli = 15102008;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104881  WHERE lithology_top_bedrock_id_cli = 15102009;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104906  WHERE lithology_top_bedrock_id_cli = 15102010;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104890  WHERE lithology_top_bedrock_id_cli = 15102011;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104883  WHERE lithology_top_bedrock_id_cli = 15102012;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104900  WHERE lithology_top_bedrock_id_cli = 15102013;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104903  WHERE lithology_top_bedrock_id_cli = 15102014;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104911  WHERE lithology_top_bedrock_id_cli = 15102015;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104885  WHERE lithology_top_bedrock_id_cli = 15102016;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104916  WHERE lithology_top_bedrock_id_cli = 15102017;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104901  WHERE lithology_top_bedrock_id_cli = 15102018;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104888  WHERE lithology_top_bedrock_id_cli = 15102019;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104887  WHERE lithology_top_bedrock_id_cli = 15102020;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104896  WHERE lithology_top_bedrock_id_cli = 15102021;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104895  WHERE lithology_top_bedrock_id_cli = 15102022;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102023;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102024;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104978  WHERE lithology_top_bedrock_id_cli = 15102025;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105004  WHERE lithology_top_bedrock_id_cli = 15102026;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104788  WHERE lithology_top_bedrock_id_cli = 15102027;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104830  WHERE lithology_top_bedrock_id_cli = 15102028;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104798  WHERE lithology_top_bedrock_id_cli = 15102029;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15102030;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102031;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102032;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102033;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102034;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104690  WHERE lithology_top_bedrock_id_cli = 15102035;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104738  WHERE lithology_top_bedrock_id_cli = 15102036;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104708  WHERE lithology_top_bedrock_id_cli = 15102037;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104671  WHERE lithology_top_bedrock_id_cli = 15102038;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104724  WHERE lithology_top_bedrock_id_cli = 15102039;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104725  WHERE lithology_top_bedrock_id_cli = 15102040;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104467  WHERE lithology_top_bedrock_id_cli = 15102041;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104719  WHERE lithology_top_bedrock_id_cli = 15102042;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104717  WHERE lithology_top_bedrock_id_cli = 15102043;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104709  WHERE lithology_top_bedrock_id_cli = 15102044;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102045;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104726  WHERE lithology_top_bedrock_id_cli = 15102046;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15102047;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104494  WHERE lithology_top_bedrock_id_cli = 15102048;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104494  WHERE lithology_top_bedrock_id_cli = 15102049;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104551  WHERE lithology_top_bedrock_id_cli = 15102050;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104551  WHERE lithology_top_bedrock_id_cli = 15102051;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104552  WHERE lithology_top_bedrock_id_cli = 15102052;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104553  WHERE lithology_top_bedrock_id_cli = 15102053;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104554  WHERE lithology_top_bedrock_id_cli = 15102054;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102055;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102056;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104565  WHERE lithology_top_bedrock_id_cli = 15102057;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104564  WHERE lithology_top_bedrock_id_cli = 15102058;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104563  WHERE lithology_top_bedrock_id_cli = 15102059;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104543  WHERE lithology_top_bedrock_id_cli = 15102060;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104544  WHERE lithology_top_bedrock_id_cli = 15102061;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104570  WHERE lithology_top_bedrock_id_cli = 15102062;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104570  WHERE lithology_top_bedrock_id_cli = 15102063;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104905  WHERE lithology_top_bedrock_id_cli = 15102064;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104722  WHERE lithology_top_bedrock_id_cli = 15102065;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104811  WHERE lithology_top_bedrock_id_cli = 15102066;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102067;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15102068;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104515  WHERE lithology_top_bedrock_id_cli = 15102069;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104515  WHERE lithology_top_bedrock_id_cli = 15102070;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104516  WHERE lithology_top_bedrock_id_cli = 15102071;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104517  WHERE lithology_top_bedrock_id_cli = 15102072;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104518  WHERE lithology_top_bedrock_id_cli = 15102073;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15102074;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15102075;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104874  WHERE lithology_top_bedrock_id_cli = 15102076;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105031  WHERE lithology_top_bedrock_id_cli = 15102077;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104751  WHERE lithology_top_bedrock_id_cli = 15102078;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104573  WHERE lithology_top_bedrock_id_cli = 15102079;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104573  WHERE lithology_top_bedrock_id_cli = 15102080;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104574  WHERE lithology_top_bedrock_id_cli = 15102081;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104999  WHERE lithology_top_bedrock_id_cli = 15102082;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104576  WHERE lithology_top_bedrock_id_cli = 15102083;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104574  WHERE lithology_top_bedrock_id_cli = 15102084;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104575  WHERE lithology_top_bedrock_id_cli = 15102085;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104575  WHERE lithology_top_bedrock_id_cli = 15102086;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104998  WHERE lithology_top_bedrock_id_cli = 15102087;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105000  WHERE lithology_top_bedrock_id_cli = 15102088;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104880  WHERE lithology_top_bedrock_id_cli = 15102089;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104555  WHERE lithology_top_bedrock_id_cli = 15102090;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104567  WHERE lithology_top_bedrock_id_cli = 15102091;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104567  WHERE lithology_top_bedrock_id_cli = 15102092;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104568  WHERE lithology_top_bedrock_id_cli = 15102093;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104721  WHERE lithology_top_bedrock_id_cli = 15102094;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104742  WHERE lithology_top_bedrock_id_cli = 15102100;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104688  WHERE lithology_top_bedrock_id_cli = 15102101;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104884  WHERE lithology_top_bedrock_id_cli = 15102103;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104795  WHERE lithology_top_bedrock_id_cli = 15102104;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104695  WHERE lithology_top_bedrock_id_cli = 15102105;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104677  WHERE lithology_top_bedrock_id_cli = 15102106;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104701  WHERE lithology_top_bedrock_id_cli = 15102107;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104686  WHERE lithology_top_bedrock_id_cli = 15102108;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15103001;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103002;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103003;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103004;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15103005;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104630  WHERE lithology_top_bedrock_id_cli = 15103006;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104629  WHERE lithology_top_bedrock_id_cli = 15103007;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104648  WHERE lithology_top_bedrock_id_cli = 15103008;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104489  WHERE lithology_top_bedrock_id_cli = 15103009;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105001  WHERE lithology_top_bedrock_id_cli = 15103010;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104483  WHERE lithology_top_bedrock_id_cli = 15103011;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104989  WHERE lithology_top_bedrock_id_cli = 15103012;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104990  WHERE lithology_top_bedrock_id_cli = 15103013;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104533  WHERE lithology_top_bedrock_id_cli = 15103014;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104524  WHERE lithology_top_bedrock_id_cli = 15103015;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104532  WHERE lithology_top_bedrock_id_cli = 15103016;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104487  WHERE lithology_top_bedrock_id_cli = 15103017;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104527  WHERE lithology_top_bedrock_id_cli = 15103018;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104835  WHERE lithology_top_bedrock_id_cli = 15103019;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104865  WHERE lithology_top_bedrock_id_cli = 15103020;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104844  WHERE lithology_top_bedrock_id_cli = 15103021;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104992  WHERE lithology_top_bedrock_id_cli = 15103022;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104528  WHERE lithology_top_bedrock_id_cli = 15103023;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104660  WHERE lithology_top_bedrock_id_cli = 15103024;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15103025;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15103026;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104639  WHERE lithology_top_bedrock_id_cli = 15103027;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104878  WHERE lithology_top_bedrock_id_cli = 15103028;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104842  WHERE lithology_top_bedrock_id_cli = 15103029;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104455  WHERE lithology_top_bedrock_id_cli = 15103030;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104486  WHERE lithology_top_bedrock_id_cli = 15103031;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15103032;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104538  WHERE lithology_top_bedrock_id_cli = 15103033;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15103034;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15103035;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103036;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103037;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103038;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15103039;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104876  WHERE lithology_top_bedrock_id_cli = 15103040;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104875  WHERE lithology_top_bedrock_id_cli = 15103041;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104482  WHERE lithology_top_bedrock_id_cli = 15103042;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15103043;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15103044;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104454  WHERE lithology_top_bedrock_id_cli = 15103045;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105030  WHERE lithology_top_bedrock_id_cli = 15103046;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105029  WHERE lithology_top_bedrock_id_cli = 15103047;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104456  WHERE lithology_top_bedrock_id_cli = 15103048;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15103049;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104852  WHERE lithology_top_bedrock_id_cli = 15103050;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104588  WHERE lithology_top_bedrock_id_cli = 15103051;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15103052;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15103053;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104665  WHERE lithology_top_bedrock_id_cli = 15103054;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104476  WHERE lithology_top_bedrock_id_cli = 15103055;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105035  WHERE lithology_top_bedrock_id_cli = 15103056;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105034  WHERE lithology_top_bedrock_id_cli = 15103057;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105033  WHERE lithology_top_bedrock_id_cli = 15103058;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105036  WHERE lithology_top_bedrock_id_cli = 15103059;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105036  WHERE lithology_top_bedrock_id_cli = 15103060;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104480  WHERE lithology_top_bedrock_id_cli = 15103061;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104767  WHERE lithology_top_bedrock_id_cli = 15103062;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104920  WHERE lithology_top_bedrock_id_cli = 15103063;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104988  WHERE lithology_top_bedrock_id_cli = 15103064;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105028  WHERE lithology_top_bedrock_id_cli = 15103065;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104460  WHERE lithology_top_bedrock_id_cli = 15103066;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104001;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104583  WHERE lithology_top_bedrock_id_cli = 15104002;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104583  WHERE lithology_top_bedrock_id_cli = 15104003;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104004;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104005;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104666  WHERE lithology_top_bedrock_id_cli = 15104006;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104667  WHERE lithology_top_bedrock_id_cli = 15104007;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104466  WHERE lithology_top_bedrock_id_cli = 15104008;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104009;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104010;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104872  WHERE lithology_top_bedrock_id_cli = 15104011;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104464  WHERE lithology_top_bedrock_id_cli = 15104012;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104471  WHERE lithology_top_bedrock_id_cli = 15104013;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104014;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104015;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104752  WHERE lithology_top_bedrock_id_cli = 15104016;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104017;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104018;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104019;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104020;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104839  WHERE lithology_top_bedrock_id_cli = 15104021;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104841  WHERE lithology_top_bedrock_id_cli = 15104022;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104841  WHERE lithology_top_bedrock_id_cli = 15104023;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104864  WHERE lithology_top_bedrock_id_cli = 15104024;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104864  WHERE lithology_top_bedrock_id_cli = 15104025;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104026;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104027;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104854  WHERE lithology_top_bedrock_id_cli = 15104028;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104854  WHERE lithology_top_bedrock_id_cli = 15104029;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104921  WHERE lithology_top_bedrock_id_cli = 15104030;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104921  WHERE lithology_top_bedrock_id_cli = 15104031;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104965  WHERE lithology_top_bedrock_id_cli = 15104032;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104958  WHERE lithology_top_bedrock_id_cli = 15104033;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104929  WHERE lithology_top_bedrock_id_cli = 15104034;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104934  WHERE lithology_top_bedrock_id_cli = 15104035;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104933  WHERE lithology_top_bedrock_id_cli = 15104036;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104943  WHERE lithology_top_bedrock_id_cli = 15104037;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104858  WHERE lithology_top_bedrock_id_cli = 15104038;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104961  WHERE lithology_top_bedrock_id_cli = 15104039;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104040;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104041;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104594  WHERE lithology_top_bedrock_id_cli = 15104042;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104601  WHERE lithology_top_bedrock_id_cli = 15104043;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104044;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104598  WHERE lithology_top_bedrock_id_cli = 15104045;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104612  WHERE lithology_top_bedrock_id_cli = 15104046;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104047;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104626  WHERE lithology_top_bedrock_id_cli = 15104048;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104609  WHERE lithology_top_bedrock_id_cli = 15104049;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104663  WHERE lithology_top_bedrock_id_cli = 15104050;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104662  WHERE lithology_top_bedrock_id_cli = 15104051;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104052;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104653  WHERE lithology_top_bedrock_id_cli = 15104053;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104656  WHERE lithology_top_bedrock_id_cli = 15104054;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104770  WHERE lithology_top_bedrock_id_cli = 15104055;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104659  WHERE lithology_top_bedrock_id_cli = 15104056;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104785  WHERE lithology_top_bedrock_id_cli = 15104057;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104661  WHERE lithology_top_bedrock_id_cli = 15104058;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104879  WHERE lithology_top_bedrock_id_cli = 15104059;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104449  WHERE lithology_top_bedrock_id_cli = 15104060;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104450  WHERE lithology_top_bedrock_id_cli = 15104061;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104453  WHERE lithology_top_bedrock_id_cli = 15104062;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104593  WHERE lithology_top_bedrock_id_cli = 15104063;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104514  WHERE lithology_top_bedrock_id_cli = 15104064;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104657  WHERE lithology_top_bedrock_id_cli = 15104065;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104664  WHERE lithology_top_bedrock_id_cli = 15104066;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104664  WHERE lithology_top_bedrock_id_cli = 15104067;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104561  WHERE lithology_top_bedrock_id_cli = 15104068;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104561  WHERE lithology_top_bedrock_id_cli = 15104069;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104781  WHERE lithology_top_bedrock_id_cli = 15104070;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104638  WHERE lithology_top_bedrock_id_cli = 15104071;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104589  WHERE lithology_top_bedrock_id_cli = 15104072;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104073;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104074;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104075;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104076;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104077;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104078;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104079;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104080;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104833  WHERE lithology_top_bedrock_id_cli = 15104081;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104082;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104083;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104560  WHERE lithology_top_bedrock_id_cli = 15104084;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104927  WHERE lithology_top_bedrock_id_cli = 15104085;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104928  WHERE lithology_top_bedrock_id_cli = 15104085;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104452  WHERE lithology_top_bedrock_id_cli = 15104086;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104654  WHERE lithology_top_bedrock_id_cli = 15104087;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104658  WHERE lithology_top_bedrock_id_cli = 15104088;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104929  WHERE lithology_top_bedrock_id_cli = 15104089;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104974  WHERE lithology_top_bedrock_id_cli = 15104090;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104866  WHERE lithology_top_bedrock_id_cli = 15104091;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104534  WHERE lithology_top_bedrock_id_cli = 15104092;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15104093;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15104095;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104937  WHERE lithology_top_bedrock_id_cli = 15104097;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104861  WHERE lithology_top_bedrock_id_cli = 15104098;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104976  WHERE lithology_top_bedrock_id_cli = 15104099;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104951  WHERE lithology_top_bedrock_id_cli = 15104103;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104581  WHERE lithology_top_bedrock_id_cli = 15104201;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104863  WHERE lithology_top_bedrock_id_cli = 15104202;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104461  WHERE lithology_top_bedrock_id_cli = 15104203;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104753  WHERE lithology_top_bedrock_id_cli = 15104204;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104881  WHERE lithology_top_bedrock_id_cli = 15104205;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104906  WHERE lithology_top_bedrock_id_cli = 15104206;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104862  WHERE lithology_top_bedrock_id_cli = 15104207;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104885  WHERE lithology_top_bedrock_id_cli = 15104208;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104916  WHERE lithology_top_bedrock_id_cli = 15104209;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104901  WHERE lithology_top_bedrock_id_cli = 15104210;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104843  WHERE lithology_top_bedrock_id_cli = 15104211;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104978  WHERE lithology_top_bedrock_id_cli = 15104212;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105004  WHERE lithology_top_bedrock_id_cli = 15104213;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104788  WHERE lithology_top_bedrock_id_cli = 15104214;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104668  WHERE lithology_top_bedrock_id_cli = 15104215;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104771  WHERE lithology_top_bedrock_id_cli = 15104216;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104552  WHERE lithology_top_bedrock_id_cli = 15104217;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104550  WHERE lithology_top_bedrock_id_cli = 15104218;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104559  WHERE lithology_top_bedrock_id_cli = 15104401;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15104402;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104571  WHERE lithology_top_bedrock_id_cli = 15104403;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104630  WHERE lithology_top_bedrock_id_cli = 15104404;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104629  WHERE lithology_top_bedrock_id_cli = 15104405;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104648  WHERE lithology_top_bedrock_id_cli = 15104406;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104489  WHERE lithology_top_bedrock_id_cli = 15104407;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105001  WHERE lithology_top_bedrock_id_cli = 15104408;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104483  WHERE lithology_top_bedrock_id_cli = 15104409;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104989  WHERE lithology_top_bedrock_id_cli = 15104410;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104990  WHERE lithology_top_bedrock_id_cli = 15104411;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104533  WHERE lithology_top_bedrock_id_cli = 15104412;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104524  WHERE lithology_top_bedrock_id_cli = 15104413;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104532  WHERE lithology_top_bedrock_id_cli = 15104414;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104487  WHERE lithology_top_bedrock_id_cli = 15104415;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104527  WHERE lithology_top_bedrock_id_cli = 15104416;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104835  WHERE lithology_top_bedrock_id_cli = 15104417;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104865  WHERE lithology_top_bedrock_id_cli = 15104418;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104844  WHERE lithology_top_bedrock_id_cli = 15104419;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104992  WHERE lithology_top_bedrock_id_cli = 15104420;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104528  WHERE lithology_top_bedrock_id_cli = 15104421;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104660  WHERE lithology_top_bedrock_id_cli = 15104422;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104548  WHERE lithology_top_bedrock_id_cli = 15104423;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104639  WHERE lithology_top_bedrock_id_cli = 15104424;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104878  WHERE lithology_top_bedrock_id_cli = 15104425;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104842  WHERE lithology_top_bedrock_id_cli = 15104426;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104455  WHERE lithology_top_bedrock_id_cli = 15104427;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104486  WHERE lithology_top_bedrock_id_cli = 15104428;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15104429;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104538  WHERE lithology_top_bedrock_id_cli = 15104430;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15104431;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104526  WHERE lithology_top_bedrock_id_cli = 15104432;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104876  WHERE lithology_top_bedrock_id_cli = 15104433;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104875  WHERE lithology_top_bedrock_id_cli = 15104434;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104482  WHERE lithology_top_bedrock_id_cli = 15104435;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15104436;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104481  WHERE lithology_top_bedrock_id_cli = 15104437;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104454  WHERE lithology_top_bedrock_id_cli = 15104438;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105030  WHERE lithology_top_bedrock_id_cli = 15104439;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15105029  WHERE lithology_top_bedrock_id_cli = 15104440;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104456  WHERE lithology_top_bedrock_id_cli = 15104441;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104457  WHERE lithology_top_bedrock_id_cli = 15104442;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104852  WHERE lithology_top_bedrock_id_cli = 15104443;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104572  WHERE lithology_top_bedrock_id_cli = 15104444;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104665  WHERE lithology_top_bedrock_id_cli = 15104445;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104587  WHERE lithology_top_bedrock_id_cli = 15104446;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104586  WHERE lithology_top_bedrock_id_cli = 15104447;
        UPDATE bdms.borehole SET lithology_top_bedrock_id_cli =15104840  WHERE lithology_top_bedrock_id_cli = 15104448;


        DELETE FROM bdms.codelist WHERE schema_cli = 'custom.lithology_top_bedrock' AND id_cli < 15104449;

        ");
    }
  }
#pragma warning restore CA1505
