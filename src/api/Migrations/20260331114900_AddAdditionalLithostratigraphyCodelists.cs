using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddAdditionalLithostratigraphyCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.codelist(
                id_cli, geolcode, schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli, conf_cli, default_cli, path_cli
            ) VALUES
                (15281001,15281001,'lithostratigraphy','','Post Messinian','Post-Messinien','Post-Messinien','Post-Messiniano',10010,'{""color"":[240,240,240]}',false,'15281001'),
                (15285022,15285022,'lithostratigraphy','','Post Messinian Marine Deposits','Post-Messinien Marine Ablagerungen','Dépôts Marins Post-Messiniens','Depositi Marini Post-Messiniani',10020,'{""color"":[250,250,150]}',false,'15281001.15285022'),
                (15283100,15283100,'lithostratigraphy','','Alpine Cycle','Alpiner Zyklus','Cycle alpin','Ciclo alpino',10030,'{""color"":[225,200,225]}',false,'15283100'),
                (15283200,15283200,'lithostratigraphy','','Alpine Orogeny','Alpine Orogenese','Orogenèse alpine','Orogenesi alpina',10040,'{""color"":[225,200,225]}',false,'15283100.15283200'),
                (15283001,15283001,'lithostratigraphy','','Alpine Magmatism','Alpines Magmatismus','Magmatisme alpin','Magmatismo alpino',10050,'{""color"":[250,150,125]}',false,'15283100.15283200.15283001'),
                (15283002,15283002,'lithostratigraphy','','Alpine Volcanism','Alpines Vulkanismus','Volcanisme alpin','Vulcanismo alpino',10060,'{""color"":[200,220,180]}',false,'15283100.15283200.15283001.15283002'),
                (15283003,15283003,'lithostratigraphy','','Hegau Volcanism','Hegau-Vulkanismus','Volcanisme de l''Hegau','Vulcanismo dell''Hegau',10070,'{""color"":[110,140,120]}',false,'15283100.15283200.15283001.15283002.15283003'),
                (15283004,15283004,'lithostratigraphy','','Periadriatic Volcanism','Periadriatisches Vulkanismus','Volcanisme périadriatique','Vulcanismo periadriatico',10080,'{""color"":[180,200,120]}',false,'15283100.15283200.15283001.15283002.15283004'),
                (15283005,15283005,'lithostratigraphy','','Alpine Intrusion','Alpine Intrusion','Intrusion alpine','Intrusione alpina',10090,'{""color"":[250,150,125]}',false,'15283100.15283200.15283001.15283005'),
                (15283006,15283006,'lithostratigraphy','','Novate Intrusion','Novate-Intrusion','Intrusion de Novate','Intrusione di Novate',10100,'{""color"":[245,45,0]}',false,'15283100.15283200.15283001.15283005.15283006'),
                (15283007,15283007,'lithostratigraphy','','Bregaglia Intrusion','Bregaglia-Intrusion','Intrusion de la Bregaglia','Intrusione della Bregaglia',10110,'{""color"":[245,70,0]}',false,'15283100.15283200.15283001.15283005.15283007'),
                (15283008,15283008,'lithostratigraphy','','Adamello Intrusion','Adamello-Intrusion','Intrusion de l''Adamello','Intrusione dell''Adamello',10120,'{""color"":[200,25,75]}',false,'15283100.15283200.15283001.15283005.15283008'),
                (15285001,15285001,'lithostratigraphy','','Sedimentary Cover','Sedimentbedeckung','Couverture sédimentaire','Copertura sedimentaria',10130,'{""color"":[200,225,250]}',false,'15283100.15285001'),
                (15285002,15285002,'lithostratigraphy','','Post-Collision','Post-Kollision','Post-collision','Post-collisione',10140,'{""color"":[250,250,150]}',false,'15283100.15285001.15285002'),
                (15285003,15285003,'lithostratigraphy','','Lombardian Gompholite','Lombardischer Gompholit','Gompholite Lombarde','Gonfolite Lombarda',10150,'{""color"":[255,230,45]}',false,'15283100.15285001.15285002.15285003'),
                (15285004,15285004,'lithostratigraphy','','Molasse','Molasse','Molasse','Molassa',10160,'{""color"":[250,250,75]}',false,'15283100.15285001.15285002.15285004'),
                (15285005,15285005,'lithostratigraphy','','Upper Freshwater Molasse (OSM)','Obere Süsswassermolasse (OSM)','Molasse d''eau douce supérieure (OSM)','Molassa d''acqua dolce superiore (OSM)',10170,'{""color"":[255,230,180]}',false,'15283100.15285001.15285002.15285004.15285005'),
                (15285006,15285006,'lithostratigraphy','','OSM-II','OSM-II','OSM-II','OSM-II',10180,'{""color"":[255,230,195]}',false,'15283100.15285001.15285002.15285004.15285005.15285006'),
                (15285007,15285007,'lithostratigraphy','','Appenzellergranit Marker Level','Appenzellergranit-Leitniveau','Niveau repère de l''Appenzellergranit','Livello guida dell''Appenzellergranit',10190,'{""color"":[245,215,200]}',false,'15283100.15285001.15285002.15285004.15285005.15285007'),
                (15285008,15285008,'lithostratigraphy','','OSM-I','OSM-I','OSM-I','OSM-I',10200,'{""color"":[255,225,165]}',false,'15283100.15285001.15285002.15285004.15285005.15285008'),
                (15285009,15285009,'lithostratigraphy','','USM-III to OSM-I','USM-III bis OSM-I','USM-III à OSM-I','USM-III a OSM-I',10210,'{""color"":[230,215,160]}',false,'15283100.15285001.15285002.15285004.15285009'),
                (15285010,15285010,'lithostratigraphy','','Upper Marine Molasse (OMM)','Obere Meeresmolasse (OMM)','Molasse marine supérieure (OMM)','Molassa marina superiore (OMM)',10220,'{""color"":[210,205,145]}',false,'15283100.15285001.15285002.15285004.15285010'),
                (15285011,15285011,'lithostratigraphy','','OMM-II','OMM-II','OMM-II','OMM-II',10230,'{""color"":[225,210,145]}',false,'15283100.15285001.15285002.15285004.15285010.15285011'),
                (15285012,15285012,'lithostratigraphy','','OMM-I','OMM-I','OMM-I','OMM-I',10240,'{""color"":[205,210,140]}',false,'15283100.15285001.15285002.15285004.15285010.15285012'),
                (15285013,15285013,'lithostratigraphy','','Lower Frehswater Molasse (USM)','Untere Süsswassermolasse (USM)','Molasse d''eau douce inférieure (USM)','Molassa d''acqua dolce inferiore (USM)',10250,'{""color"":[220,200,180]}',false,'15283100.15285001.15285002.15285004.15285013'),
                (15285014,15285014,'lithostratigraphy','','USM-III','USM-III','USM-III','USM-III',10260,'{""color"":[230,220,210]}',false,'15283100.15285001.15285002.15285004.15285013.15285014'),
                (15285015,15285015,'lithostratigraphy','','USM-II','USM-II','USM-II','USM-II',10270,'{""color"":[240,210,200]}',false,'15283100.15285001.15285002.15285004.15285013.15285015'),
                (15285016,15285016,'lithostratigraphy','','USM-I','USM-I','USM-I','USM-I',10280,'{""color"":[200,160,115]}',false,'15283100.15285001.15285002.15285004.15285013.15285016'),
                (15285017,15285017,'lithostratigraphy','','Basal levels of the USM','Basisbildungen der USM','Niveaux de base de l''USM','Livelli basali dell''USM',10290,'{""color"":[240,215,70]}',false,'15283100.15285001.15285002.15285004.15285013.15285017'),
                (15285018,15285018,'lithostratigraphy','','Lower Marine Molasse (UMM)','Untere Meeresmolasse (UMM)','Molasse marine inférieure (UMM)','Molassa marina inferiore (OMM)',10300,'{""color"":[225,180,125]}',false,'15283100.15285001.15285002.15285004.15285018'),
                (15285019,15285019,'lithostratigraphy','','UMM-III','UMM-III','UMM-III','UMM-III',10310,'{""color"":[230,170,150]}',false,'15283100.15285001.15285002.15285004.15285018.15285019'),
                (15285020,15285020,'lithostratigraphy','','UMM-II','UMM-II','UMM-II','UMM-II',10320,'{""color"":[220,145,125]}',false,'15283100.15285001.15285002.15285004.15285018.15285020'),
                (15285021,15285021,'lithostratigraphy','','UMM-I','UMM-I','UMM-I','UMM-I',10330,'{""color"":[240,210,100]}',false,'15283100.15285001.15285002.15285004.15285018.15285021'),
                (15285023,15285023,'lithostratigraphy','','Syn-Collision','Syn-Kollision','Syn-collision','Sin-collisione',10340,'{""color"":[250,250,150]}',false,'15283100.15285001.15285023'),
                (15285024,15285024,'lithostratigraphy','','Mélange','Melange','Mélange','Mélange',10350,'{""color"":[250,225,75]}',false,'15283100.15285001.15285023.15285024'),
                (15285025,15285025,'lithostratigraphy','','Flysch','Flysch','Flysch','Flysch',10360,'{""color"":[250,225,75]}',false,'15283100.15285001.15285023.15285025'),
                (15285026,15285026,'lithostratigraphy','','Pre-Collision','Prä-Kollision','Pré-collision','Pre-collisione',10370,'{""color"":[250,200,150]}',false,'15283100.15285001.15285026'),
                (15285027,15285027,'lithostratigraphy','','Nummulitic','Nummulitikum','Nummulitique','Nummulitico',10380,'{""color"":[240,180,100]}',false,'15283100.15285001.15285026.15285027'),
                (15285028,15285028,'lithostratigraphy','','Siderolithic','Siderolithikum','Sidérolithique','Siderolitico',10390,'{""color"":[245,110,50]}',false,'15283100.15285001.15285026.15285028'),
                (15285029,15285029,'lithostratigraphy','','Post-Rift','Post-Rift','Port-rift','Port-rift',10400,'{""color"":[220,240,220]}',false,'15283100.15285001.15285029'),
                (15285030,15285030,'lithostratigraphy','','Post-Rift Mesozoic in pelagic facies','Post-Rift Mesozoikum in pelagischer Fazies','Mésozoïque post-rift en faciès pélagique','Mesozoico post-rift in facies pelagico',10410,'{""color"":[220,240,220]}',false,'15283100.15285001.15285029.15285030'),
                (15285031,15285031,'lithostratigraphy','','Couches Rouges','Couches Rouges','Couches Rouges','Couches Rouges',10420,'{""color"":[200,225,100]}',false,'15283100.15285001.15285029.15285030.15285031'),
                (15285032,15285032,'lithostratigraphy','','Scaglia','Scaglia','Scaglia','Scaglia',10430,'{""color"":[140,200,100]}',false,'15283100.15285001.15285029.15285030.15285032'),
                (15285033,15285033,'lithostratigraphy','','Maiolica / Aptychus Limestone','Maiolica / Aptychenkalk','Maiolica / Calcaire à aptychus','Maiolica / Calcare ad Aptici',10440,'{""color"":[120,205,200]}',false,'15283100.15285001.15285029.15285030.15285033'),
                (15285034,15285034,'lithostratigraphy','','Radiolarite','Radiolarit','Radiolarite','Radiolarite',10450,'{""color"":[225,130,170]}',false,'15283100.15285001.15285029.15285030.15285034'),
                (15285035,15285035,'lithostratigraphy','','Post-Rift Mesozoic in detrital facies','Post-Rift Mesozoikum in detritischer Fazies','Mésozoïque post-rift en faciès détritique','Mesozoico post-rift in facies detritico',10460,'{""color"":[240,180,180]}',false,'15283100.15285001.15285029.15285035'),
                (15285036,15285036,'lithostratigraphy','','Gault','Gault','Gault','Gault',10470,'{""color"":[245,155,155]}',false,'15283100.15285001.15285029.15285035.15285036'),
                (15285037,15285037,'lithostratigraphy','','Post-Rift Mesozoic in platform facies','Post-Rift Mesozoikum in Plattform-Fazies','Mésozoïque post-rift en faciès de plateforme','Mesozoico post-rift in facies di piattaforma',10480,'{""color"":[175,225,225]}',false,'15283100.15285001.15285029.15285037'),
                (15285038,15285038,'lithostratigraphy','','Urgonian','Urgonien','Urgonien','Urgoniano',10490,'{""color"":[105,180,190]}',false,'15283100.15285001.15285029.15285037.15285038'),
                (15285039,15285039,'lithostratigraphy','','Malm','Malm','Malm','Malm',10500,'{""color"":[160,200,240]}',false,'15283100.15285001.15285029.15285037.15285039'),
                (15285055,15285055,'lithostratigraphy','','Upper Malm','Oberer Malm','Malm supérieur','Malm superiore',10510,'{""color"":[160,200,240]}',false,'15283100.15285001.15285029.15285037.15285039.15285055'),
                (15285056,15285056,'lithostratigraphy','','Lower Malm','Unterer Malm','Malm inférieur','Malm inferiore',10520,'{""color"":[160,200,240]}',false,'15283100.15285001.15285029.15285037.15285039.15285056'),
                (15285040,15285040,'lithostratigraphy','','Syn-Rift','Syn-Rift','Syn-rift','Sin-Rift',10530,'{""color"":[125,175,150]}',false,'15283100.15285001.15285040'),
                (15285041,15285041,'lithostratigraphy','','Tethyan Ophiolitic Sequence','Tethys Ophiolithische Abfolge','Séquence ophiolitique téthysienne','Sequenza ofiolitica tetida',10540,'{""color"":[100,160,120]}',false,'15283100.15285001.15285040.15285041'),
                (15285043,15285043,'lithostratigraphy','','Lias-Dogger','Lias-Dogger','Lias-Dogger','Lias-Dogger',10550,'{""color"":[180,120,180]}',false,'15283100.15285001.15285040.15285043'),
                (15285044,15285044,'lithostratigraphy','','Lias-Dogger in breccia facies','Lias-Dogger in brekziöser Fazies','Lias-Dogger en faciès bréchique','Lias-Dogger in facies breccioso',10560,'{""color"":[220,180,100]}',false,'15283100.15285001.15285040.15285043.15285044'),
                (15285057,15285057,'lithostratigraphy','','Dogger','Dogger','Dogger','Dogger',10570,'{""color"":[200,150,100]}',false,'15283100.15285001.15285040.15285043.15285057'),
                (15285058,15285058,'lithostratigraphy','','Upper Dogger','Oberer Dogger','Dogger supérieur','Dogger superiore',10580,'{""color"":[225,200,175]}',false,'15283100.15285001.15285040.15285043.15285057.15285058'),
                (15285059,15285059,'lithostratigraphy','','Lower Dogger','Unterer Dogger','Dogger inférieur','Dogger inferiore',10590,'{""color"":[200,175,125]}',false,'15283100.15285001.15285040.15285043.15285057.15285059'),
                (15285060,15285060,'lithostratigraphy','','Lias','Lias','Lias','Lias',10600,'{""color"":[175,150,200]}',false,'15283100.15285001.15285040.15285043.15285060'),
                (15285061,15285061,'lithostratigraphy','','Upper Lias','Oberer Lias','Lias supérieur','Lias superiore',10610,'{""color"":[200,175,225]}',false,'15283100.15285001.15285040.15285043.15285060.15285061'),
                (15285062,15285062,'lithostratigraphy','','Middle Lias','Mittlerer Lias','Lias moyen','Lias medio',10620,'{""color"":[175,150,200]}',false,'15283100.15285001.15285040.15285043.15285060.15285062'),
                (15285063,15285063,'lithostratigraphy','','Lower Lias','Unterer Lias','Lias inférieur','Lias inferiore',10630,'{""color"":[150,125,175]}',false,'15283100.15285001.15285040.15285043.15285060.15285063'),
                (15285042,15285042,'lithostratigraphy','','Lias-Dogger in pelagic facies','Lias-Dogger in pelagischer Fazies','Lias-Dogger en faciès pélagique','Lias-Dogger in facies pelagico',10640,'{""color"":[190,140,130]}',false,'15283100.15285001.15285040.15285043.15285042'),
                (15285045,15285045,'lithostratigraphy','','Pre-Rift','Prä-Rift','Pré-rift','Pre-Rift',10650,'{""color"":[240,180,120]}',false,'15283100.15285001.15285045'),
                (15285046,15285046,'lithostratigraphy','','Triassic in pelitic facies','Pelitische Trias','Trias en faciès pélitique','Triassico pelitico',10660,'{""color"":[255,215,155]}',false,'15283100.15285001.15285045.15285046'),
                (15285047,15285047,'lithostratigraphy','','Rhaetian','Rhät','Rhétien','Retico',10670,'{""color"":[190,140,160]}',false,'15283100.15285001.15285045.15285047'),
                (15285048,15285048,'lithostratigraphy','','Keuper','Keuper','Keuper','Keuper',10680,'{""color"":[248,195,171]}',false,'15283100.15285001.15285045.15285048'),
                (15285049,15285049,'lithostratigraphy','','Triassic in carbonate facies','Karbonatische Trias','Trias en faciès carbonaté','Triassico carbonato',10690,'{""color"":[250,180,90]}',false,'15283100.15285001.15285045.15285049'),
                (15285050,15285050,'lithostratigraphy','','Muschelkalk','Muschelkalk','Muschelkalk','Muschelkalk',10700,'{""color"":[240,160,70]}',false,'15283100.15285001.15285045.15285050'),
                (15285051,15285051,'lithostratigraphy','','Hauptdolomit','Hauptdolomit','Hauptdolomit','Dolomia Principale',10710,'{""color"":[250,175,50]}',false,'15283100.15285001.15285045.15285051'),
                (15285052,15285052,'lithostratigraphy','','Raibl','Raibl','Raibl','Raibl',10720,'{""color"":[250,210,90]}',false,'15283100.15285001.15285045.15285052'),
                (15285053,15285053,'lithostratigraphy','','(Permo-)Triassic in detrital facies','Detritische (Permo-)Trias','(Permo-)Trias en faciès détritique','(Permo-)Triassico detritico',10730,'{""color"":[245,150,50]}',false,'15283100.15285001.15285045.15285053'),
                (15285054,15285054,'lithostratigraphy','','Buntsandstein','Buntsandstein','Buntsandstein','Buntsandstein',10740,'{""color"":[205,140,85]}',false,'15283100.15285001.15285045.15285054'),
                (15287001,15287001,'lithostratigraphy','','Ante-Alpine Basement','Präalpines Grundgebirge','Socle anté-alpin','Basamento ante-alpino',10750,'{""color"":[225,175,175]}',false,'15287001'),
                (15287002,15287002,'lithostratigraphy','','Variscan Basement','Variszisches Grundgebirge','Socle varisque','Basamento varisco',10760,'{""color"":[250,125,125]}',false,'15287001.15287002'),
                (15287003,15287003,'lithostratigraphy','','Late to Post Variscan Basement','Spät- bis postvariszisches Grundgebirge','Socle tardi- à post-varisque','Basamento tardi- a post-varisco',10770,'{""color"":[225,130,110]}',false,'15287001.15287002.15287003'),
                (15287004,15287004,'lithostratigraphy','','Post Variscan Basement','Postvariszisches Grundgebirge','Socle post-varisque','Basamento post-varisco',10780,'{""color"":[225,130,110]}',false,'15287001.15287002.15287003.15287004'),
                (15287005,15287005,'lithostratigraphy','','Late Variscan Basement','Spätvariszisches Grundgebirge','Socle tardi-varisque','Basamento tardi-varisco',10790,'{""color"":[220,110,115]}',false,'15287001.15287002.15287003.15287005'),
                (15287006,15287006,'lithostratigraphy','','Middle Variscan Basement','Mittelvariszisches Grundgebirge','Socle médio-varisque','Basamento medio-varisco',10800,'{""color"":[220,11,115]}',false,'15287001.15287002.15287006'),
                (15287007,15287007,'lithostratigraphy','','Pre- to Early Variscan Basement','Prä- bis frühvariszisches Grundgebirge','Socle anté- à éo-varisque','Basamento pre- a eovarisco',10810,'{""color"":[140,160,130]}',false,'15287001.15287002.15287007'),
                (15287008,15287008,'lithostratigraphy','','Early Variscan Basement','Frühvariszisches Grundgebirge','Socle éo-varisque','Basamento eovarisco',10820,'{""color"":[220,90,120]}',false,'15287001.15287002.15287007.15287008'),
                (15287009,15287009,'lithostratigraphy','','Pre-Variscan Basement','Prävariszisches Grundgebirge','Socle anté-varisque','Basamento ante-varisco',10830,'{""color"":[250,210,210]}',false,'15287001.15287009');
        ");
    }
}
