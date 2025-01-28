-- =============================================================================
-- As part of the docker-entrypoint initialization, this script deletes non-free
-- and non-published boreholes and several other data which are not needed in
-- the public view of the database.
-- =============================================================================

-- Insert default workgroup 'Default'
INSERT INTO bdms.workgroups(id_wgp, name_wgp)
VALUES (1, 'Default')
ON CONFLICT (id_wgp)
DO UPDATE SET name_wgp = EXCLUDED.name_wgp;

-- Update existing boreholes to default workgroup
UPDATE bdms.borehole SET id_wgp_fk = 1 WHERE id_wgp_fk <> 1;
DELETE FROM bdms.workgroups WHERE id_wgp <> 1;

-- Insert default anonymous user to enable anonymous access
INSERT INTO bdms.users(admin_usr, username, firstname, lastname, subject_id)
VALUES (false, 'Anonymous', 'Anonymous', 'Anonymous', 'sub_anonymous');

INSERT INTO bdms.users_roles(id_usr_fk, id_rol_fk, id_wgp_fk)
VALUES ((SELECT id_usr FROM bdms.users WHERE subject_id = 'sub_anonymous'),
        (SELECT id_rol FROM bdms.roles WHERE name_rol = 'VIEW'),
        (SELECT id_wgp FROM bdms.workgroups WHERE name_wgp = 'Default'));

-- Set default settings for anonymous user (e.g. "Maps displayed")
UPDATE bdms.users
SET settings_usr = '{"filter": {}, "viewerFilter": {}, "boreholetable": {"orderby": "alternate_name", "direction": "ASC"}, "eboreholetable": {"orderby": "alternate_name", "direction": "ASC"}, "map": {"explorer": {"ch.swisstopo.geologie-geocover": {"Identifier": "ch.swisstopo.geologie-geocover", "Abstract": "ch.swisstopo.geologie-geocover.wms_abstract", "position": 14, "Title": "GeoCover - Vector Datasets", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geologischer_atlas": {"Identifier": "ch.swisstopo.geologie-geologischer_atlas", "Abstract": "The sheets of the Geological Atlas of Switzerland (GA25) give detailed information about the uppermost layers of the subsurface structure. Geological formations are represented by colours, conventional signs and symbols, which correspond to their age, composition and tectonic structure. For each sheet, an explanatory booklet is also published, in which the geological formations and special features of the study area are described. Over two thirds of the 220 map sheets that are planned have already been published.", "position": 13, "Title": "Geological Atlas GA25", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geologischer_atlas_profile": {"Identifier": "ch.swisstopo.geologie-geologischer_atlas_profile", "Abstract": "The GA25-Profile dataset (GA25_CS) is a compilation of the profiles published together with the Geological Atlas 1:25,000. It depicts the profile tracks and contains metadata on the profiles. The given year of issue corresponds to the publication year of the respective explanatory notes. The profiles represented by the tracks were extracted from the published profile plates and, if possible, saved individually along with the entire plate legend and scale as a PDF. Since the legend always refers to the entire plate, it is likely that not all elements of the legend appear in the individual profile. In a few cases, plates with very closely spaced profiles cannot be subdivided into single profiles. In these cases, the entire plate is shown for each group of the profile tracks. LINK: <a href=''https://www.geocat.ch/geonetwork/srv/api/records/345d02a3-9628-46d7-9e57-e0ab1d9faf8a/attachments/GA25_Profile_Faktenblatt_EN_230113.pdf?approved=true'' target=''_blank''>Fact sheet</a> LINK: <a href=''https://www.geocat.ch/geonetwork/srv/api/records/345d02a3-9628-46d7-9e57-e0ab1d9faf8a/attachments/GA25_Profile_Modellbeschreibung_DE_230113.pdf?approved=true'' target=''_blank''>Dataset description</a> LINK: <a href=''https://map.geo.admin.ch/?topic=geol&lang=en&bgLayer=ch.swisstopo.pixelkarte-grau&layers=ch.swisstopo.geologie-geologischer_atlas'' target=''_blank''>map.geo.admin.ch - Geological Atlas GA25</a> Disclaimer: The user acknowledges that the authors have made all reasonable efforts to verify the information in the particular geologic model / dataset. There is no guarantee that the provided data are correct at any particular point in the subsurface. Under no circumstances shall the publisher be liable for any loss or damage of a material or immaterial nature arising from access to or from use, misuse or technical malfunction of the published information.", "position": 12, "Title": "Geological profiles GA25", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geotechnik-gk500-lithologie_hauptgruppen": {"Identifier": "ch.swisstopo.geologie-geotechnik-gk500-lithologie_hauptgruppen", "Abstract": "The Lithological map of Switzerland 1:500,000 provides an overview of the subsurface classified according to lithological and petrographic criteria.The geometry of the polygons was reproduced unmodified from the Geological and Tectonic maps of Switzerland 1:500,000. Additional attributes were assigned to the polygons on the basis of the Lithological-petrographic map 1:200,000.", "position": 11, "Title": "Lithology 500", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geologische_karte": {"Identifier": "ch.swisstopo.geologie-geologische_karte", "Abstract": "The 1:500,000 Geological Map of Switzerland covers the whole of Switzerland and adjoining parts of neighbouring countries. It gives an overview of the distribution of the uppermost rock strata occurring in Switzerland. Therefore, it provides an important data base and functions as a tool for gaining a better understanding of our environment in the scope of sustainable development. It is an essential aid for education in the fields of environmental and earth sciences, as well as natural hazards.", "position": 10, "Title": "Geology 500", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-tektonische_karte": {"Identifier": "ch.swisstopo.geologie-tektonische_karte", "Abstract": "The Tectonic Map of Switzerland (TK500) depicts the tectonic units and structural elements of the entire Swiss territory and neighboring regions. These units group together rocks with a common geodynamic history and are separated from one another by tectonic discontinuities. Within some units, a distinction has been made between crystalline basement and one or more successive series of sedimentary cover. Units are grouped into structural domains separated by major tectonic discontinuities. Units and subunits can be located by entering their name in the search field, like some structural lines (not all have names). The current map (4th edition, 2024) is accompanied by an <a href=''https://www.geocat.ch/geonetwork/srv/api/records/a4cdef47-505e-41ab-b6a7-ad5b92d80e41/attachments/TK500-ERL.pdf?approved=true'' target=''_blank''>explanatory note</a> providing a brief definition of each unit. A first enclosure contains three NW-SE to N-S <a href=''https://www.geocat.ch/geonetwork/srv/api/records/a4cdef47-505e-41ab-b6a7-ad5b92d80e41/attachments/TK500_Plate-II_Profile.pdf?approved=true'' target=''_blank''>tectonic cross-sections</a> through the entire map area, which also show the major structures at depth. A second enclosure contains a series of <a href=''https://www.geocat.ch/geonetwork/srv/api/records/a4cdef47-505e-41ab-b6a7-ad5b92d80e41/attachments/TK500_Plate-III_Paleogeography.pdf?approved=true'' target=''_blank''>paleogeographic diagrams</a>, from the Middle Jurassic (170 Ma) to the present day, showing the evolution of spatial relationships between the different tectonic domains covered by the map.", "position": 9, "Title": "Tectonics 500", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geotechnik-gk500-gesteinsklassierung": {"Identifier": "ch.swisstopo.geologie-geotechnik-gk500-gesteinsklassierung", "Abstract": "The Lithological map of Switzerland - Groups of rocks 1:500,000 provides an overview of the subsurface subdivided into three groups of rocks: unconsolidated rocks, sedimentary rocks and crystalline rocks.The geometry of the polygons was reproduced unmodified from the Geological and Tectonic maps of Switzerland 1:500,000. Additional attributes were assigned to the polygons on the basis of the Lithological-petrographic map 1:200,000.", "position": 8, "Title": "Groups of rocks 500", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-geotechnik-gk500-genese": {"Identifier": "ch.swisstopo.geologie-geotechnik-gk500-genese", "Abstract": "The Lithological map of Switzerland - Genesis 1:500,000 provides an overview of the subsurface classified according to the origin of the rocks, e.g. deposits from rivers and glaciers, solidification of magma or transformation of rocks through the effects of pressure and temperature.The geometry of the polygons was reproduced unmodified from the Geological and Tectonic maps of Switzerland 1:500,000. Additional attributes were assigned to the polygons on the basis of the Lithological-petrographic map 1:200,000.", "position": 7, "Title": "Origin of rocks 500", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-generalkarte-ggk200": {"Identifier": "ch.swisstopo.geologie-generalkarte-ggk200", "Abstract": "Geological mapping of the whole country based on the Dufour Map of Switzerland. Comprised of eight sheets, published between 1942 and 1964, the General Geological Map of Switzerland (GGK200) is a historical document of the highest quality. The printed versions of the sheets of the General Geological Map are partially out of print, but each sheet is available as a pixel map.", "position": 6, "Title": "General Geol. Map 200", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-lockergestein_maechtigkeitsmodell": {"Identifier": "ch.swisstopo.geologie-lockergestein_maechtigkeitsmodell", "Abstract": "The thickness model of unconsolidated deposits is a digital data set that describes the thickness of the unconsolidated deposits. This product is derived from the bedrock elevation model. The subtraction of the bedrock surface from the terrain surface (digital height model, DHM25) gives the thickness of unconsolidated deposits. 3D models represent a simplification of the real geological settings. The user acknowledges that the authors have taken every reasonable effort to ensure that information contained in the presented 3D geological model is as accurate as possible. There is no guarantee that the given data related to a definite point in the subsurface is accurate. Under no circumstances will the publisher be liable for any loss or damage of a material or immaterial nature arising from access to, use or non-use of published information, or from misuse or technical breakdown.", "position": 5, "Title": "Thickness of unconsolidated deposits", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-gesteinsdichte": {"Identifier": "ch.swisstopo.geologie-gesteinsdichte", "Abstract": "An important physical property of rock is its density, which depends mainly on mineralogy and porosity. Rocks made of minerals with a high content of magnesium, iron or other heavy metallic elements have a high density. In contrast, rocks that have a large proportion of alkalis (e.g. sodium, potassium) and silicon dioxide have a comparatively low density. Furthermore, rocks with a crystalline structure generally have a greater density than those with an amorphous (glassy) structure. Density is defined as mass per unit volume of a material [kg/m3]. While the so-called bulk density comprises the entire volume of a rock, the pure density (also called grain density) represents the volume without the empty spaces - i.e. without the porosity. Based on a database of density values, a bulk-density map of Switzerland was produced, which shows the mean value and other statistical data of all measured samples from each of the 21 lithological groups. Consequently, at no point does the density map show the expected absolute bulk density of a local rock type. Instead, it primarily shows the range in which the density of the local lithology varies. The data source, the data processing and the methodology used to produce the density map can be found in the publication by <a href=''https://sjg.springeropen.com/articles/10.1186/s00015-021-00389-3'' target=''_blank''>Alba Zappone & Edi Kissling (2021, Swiss J. Geosciences)</a>.", "position": 4, "Title": "Rock density", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.swisstopo.geologie-reflexionsseismik": {"Identifier": "ch.swisstopo.geologie-reflexionsseismik", "Abstract": "This map shows the location of seismic reflection data acquired in Switzerland for the exploration of the geological subsurface. The majority of these are two-dimensional measurements (2D) along the profile traces shown. Three-dimensional measurements (3D) are only locally available within the shown perimeters. For more detailed information on the actual reflection seismic data, please contact the rights holder directly. This map is continuously updated and does not claim to be complete.<br><br> References: <ul> <li>Fabbri S. et al. (2021): Active Faulting in Lake Constance (Austria, Germany, Switzerland) Unraveled by Multi-Vintage Reflection Seismic Data. Front. Earth Sci. 9:670532.</li> <li>Gruber, M. (2017): Structural investigations of the western Swiss Molasse Basin - From 2D seismic interpretation to a 3D geological model. - PhD Thesis Univ. Fribourg.</li> <li>Nagra (1993): R\u00e9sultats des recherches effectu\u00e9es sur le site potentiel du Bois de la Glaive (Commune d`Ollon, VD): Recherches sur l`aptitude des sites \u00e0 accueillir un d\u00e9pot final de d\u00e9chets faiblement et moyennement radioactifs \u00e0 vie courte. NTB 93-29.</li> <li>Nagra (1997): Geosynthese Wellenberg 1996 - Ergebnisse der Untersuchungsphasen I und II. Nagra Tech. Ber. NTB 96-01.</li> <li>Meier, B. P. (2010): Erg\u00e4nzende Interpretation reflexionsseismischer Linien zwischen dem \u00f6stlichen und westlichen Molassebecken. Gebiete Waadtland Nord, Fribourg, Berner Seeland und Juras\u00fcdfuss zwischen Biel und Oensingen. - Nagra Arbeitsber. NAB 10-40.</li> <li>Roth, P., Naef, H. & Schnellmann, M. (2010): Kompilation und Interpretation der Reflexionsseismik im Tafeljura und Molassebecken der Zentral- und Nordostschweiz. - Nagra Arbeitsber. NAB 10-39.</li> <li>Sommaruga, A., Eichenberger, U. & Marillier, F. (2012): Seismic Atlas of the Swiss Molasse Basin. - Mat\u00e9r. G\u00e9ol. Suisse, G\u00e9ophys. 44.</li> </ul>", "position": 3, "Title": "Reflection seismic", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.bafu.hydrogeologische-karte_100": {"Identifier": "ch.bafu.hydrogeologische-karte_100", "Abstract": "Published by the Federal Office for the Environment FOEN, the specialist office of the Swiss Geological Survey responsible for hydrogeology.The hydrogeological map 1:100,000 shows the subsurface from the perspective of three disciplines: geology, hydrology and hydrogeology. The subsurface is classified according to lithological-petrographical criteria and permeability. Point and line data (springs, wells, hydraulic connections, groundwater resources, etc.) indicate the flow paths of groundwater and its exploitation at wells and tapped springs. The representation at a scale of 100,000 provides insight into the regional hydrogeological conditions. The following maps are available: 1. B\u00f6zberg/Berom\u00fcnster, 1972; 2. Lake Constance, 1980; 3. Panixerpass, 1985; 4. Biel-Bienne, 1991/92; 5. Toggenburg, 1993/94; 6. Saane, 1999; 8. Vallorbe - L\u00e9man nord, 2006; 7. Basel, 2014. For North West Switzerland, a seamless vector data set of maps 4, 6, 7 and 8 was created. The data can be obtained from the FOEN (www.bafu.admin.ch Data, indicators, maps).", "position": 2, "Title": "Hydrogeological map 100", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": false}, "ch.swisstopo.geologie-tiefengeothermie_projekte": {"Identifier": "ch.swisstopo.geologie-tiefengeothermie_projekte", "Abstract": "This map shows deep geothermal plants in operation as well as current and former deep geothermal projects in Switzerland. The project status corresponds to one of the following: - Prospection: Following regulatory approval by the canton(s) geophysical and geological studies are employed to identify a reservoir in the subsurface (permit zones shown, if available). - Under development: A reservoir has been identified and deemed suitable for producing geothermal energy. Permits required for the construction of a geothermal plant have been obtained and construction will begin shortly or is already in progress. - In operation: The plant is producing geothermal energy. - Abandoned: For any one of various reasons, the project has been stopped. Projects and plants are classified in the following types of system: Deep geothermal probe, Hydrothermal, Enhanced Geothermal System (EGS) and High temperature aquifer thermal energy storage (HT-ATES). Shallow geothermal energy production (i.e., <500 m depth to reservoir) is not featured. The map does not purport to be complete.", "position": 1, "Title": "Deep geothermal projects", "transparency": 0, "type": "WMS", "url": "https://wms.geo.admin.ch/?", "visibility": false, "queryable": true}, "ch.kantone.cadastralwebmap-farbe": {"Identifier": "ch.kantone.cadastralwebmap-farbe", "Abstract": "The basis is a representation service (web map service) created using data from the federal AV-Geoportal. However, the service does not provide the full data from the official cadastral survey.", "position": 0, "Title": "CadastralWebMap", "transparency": 0, "type": "WMTS", "url": "https://wmts.geo.admin.ch/1.0.0/ch.kantone.cadastralwebmap-farbe/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.png", "visibility": false, "queryable": false, "conf": {"urls": ["https://wmts.geo.admin.ch/1.0.0/ch.kantone.cadastralwebmap-farbe/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.png"], "layer": "ch.kantone.cadastralwebmap-farbe", "matrixSet": "2056_28", "format": "image/png", "projection": {"code_": "EPSG:2056", "units_": "m", "extent_": [2420000, 1030000, 2900000, 1350000], "worldExtent_": null, "axisOrientation_": "enu", "global_": false, "canWrapX_": false, "defaultTileGrid_": {"minZoom": 0, "resolutions_": [1875, 937.5, 468.75, 234.375, 117.1875, 58.59375, 29.296875, 14.6484375, 7.32421875, 3.662109375, 1.8310546875, 0.91552734375, 0.457763671875, 0.2288818359375, 0.11444091796875, 0.057220458984375, 0.0286102294921875, 0.01430511474609375, 0.007152557373046875, 0.0035762786865234375, 0.0017881393432617188, 0.0008940696716308594, 0.0004470348358154297, 0.00022351741790771484, 0.00011175870895385742, 5.587935447692871e-05, 2.7939677238464355e-05, 1.3969838619232178e-05, 6.984919309616089e-06, 3.4924596548080444e-06, 1.7462298274040222e-06, 8.731149137020111e-07, 4.3655745685100555e-07, 2.1827872842550278e-07, 1.0913936421275139e-07, 5.4569682106375694e-08, 2.7284841053187847e-08, 1.3642420526593924e-08, 6.821210263296962e-09, 3.410605131648481e-09, 1.7053025658242404e-09, 8.526512829121202e-10, 4.263256414560601e-10], "zoomFactor_": 2, "maxZoom": 42, "origin_": [2420000, 1350000], "origins_": null, "tileSizes_": null, "tileSize_": 256, "extent_": [2420000, 1030000, 2900000, 1350000], "fullTileRanges_": [{"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 1, "minY": 0, "maxY": 1}, {"minX": 0, "maxX": 3, "minY": 0, "maxY": 2}, {"minX": 0, "maxX": 7, "minY": 0, "maxY": 5}, {"minX": 0, "maxX": 15, "minY": 0, "maxY": 10}, {"minX": 0, "maxX": 31, "minY": 0, "maxY": 21}, {"minX": 0, "maxX": 63, "minY": 0, "maxY": 42}, {"minX": 0, "maxX": 127, "minY": 0, "maxY": 85}, {"minX": 0, "maxX": 255, "minY": 0, "maxY": 170}, {"minX": 0, "maxX": 511, "minY": 0, "maxY": 341}, {"minX": 0, "maxX": 1023, "minY": 0, "maxY": 682}, {"minX": 0, "maxX": 2047, "minY": 0, "maxY": 1365}, {"minX": 0, "maxX": 4095, "minY": 0, "maxY": 2730}, {"minX": 0, "maxX": 8191, "minY": 0, "maxY": 5461}, {"minX": 0, "maxX": 16383, "minY": 0, "maxY": 10922}, {"minX": 0, "maxX": 32767, "minY": 0, "maxY": 21845}, {"minX": 0, "maxX": 65535, "minY": 0, "maxY": 43690}, {"minX": 0, "maxX": 131071, "minY": 0, "maxY": 87381}, {"minX": 0, "maxX": 262143, "minY": 0, "maxY": 174762}, {"minX": 0, "maxX": 524287, "minY": 0, "maxY": 349525}, {"minX": 0, "maxX": 1048575, "minY": 0, "maxY": 699050}, {"minX": 0, "maxX": 2097151, "minY": 0, "maxY": 1398101}, {"minX": 0, "maxX": 4194303, "minY": 0, "maxY": 2796202}, {"minX": 0, "maxX": 8388607, "minY": 0, "maxY": 5592405}, {"minX": 0, "maxX": 16777215, "minY": 0, "maxY": 11184810}, {"minX": 0, "maxX": 33554431, "minY": 0, "maxY": 22369621}, {"minX": 0, "maxX": 67108863, "minY": 0, "maxY": 44739242}, {"minX": 0, "maxX": 134217727, "minY": 0, "maxY": 89478485}, {"minX": 0, "maxX": 268435455, "minY": 0, "maxY": 178956970}, {"minX": 0, "maxX": 536870911, "minY": 0, "maxY": 357913941}, {"minX": 0, "maxX": 1073741823, "minY": 0, "maxY": 715827882}, {"minX": 0, "maxX": 2147483647, "minY": 0, "maxY": 1431655765}, {"minX": 0, "maxX": 4294967295, "minY": 0, "maxY": 2863311530}, {"minX": 0, "maxX": 8589934591, "minY": 0, "maxY": 5726623061}, {"minX": 0, "maxX": 17179869183, "minY": 0, "maxY": 11453246122}, {"minX": 0, "maxX": 34359738367, "minY": 0, "maxY": 22906492245}, {"minX": 0, "maxX": 68719476735, "minY": 0, "maxY": 45812984490}, {"minX": 0, "maxX": 137438953471, "minY": 0, "maxY": 91625968981}, {"minX": 0, "maxX": 274877906943, "minY": 0, "maxY": 183251937962}, {"minX": 0, "maxX": 549755813887, "minY": 0, "maxY": 366503875925}, {"minX": 0, "maxX": 1099511627775, "minY": 0, "maxY": 733007751850}, {"minX": 0, "maxX": 2199023255551, "minY": 0, "maxY": 1466015503701}, {"minX": 0, "maxX": 4398046511103, "minY": 0, "maxY": 2932031007402}], "tmpSize_": [256, 256], "tmpExtent_": [0, 0, 0, 0]}, "ol_uid": "54"}, "requestEncoding": "REST", "tileGrid": {"minZoom": 0, "resolutions_": [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.09999999999999999], "maxZoom": 28, "origin_": null, "origins_": [[2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000], [2420000, 1350000]], "tileSizes_": [256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256, 256], "tileSize_": null, "extent_": [2420000, 326000, 3444000, 1350000], "fullTileRanges_": [{"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 0, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 1, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 1, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 1, "minY": 0, "maxY": 0}, {"minX": 0, "maxX": 1, "minY": 0, "maxY": 1}, {"minX": 0, "maxX": 2, "minY": 0, "maxY": 1}, {"minX": 0, "maxX": 2, "minY": 0, "maxY": 1}, {"minX": 0, "maxX": 3, "minY": 0, "maxY": 2}, {"minX": 0, "maxX": 7, "minY": 0, "maxY": 4}, {"minX": 0, "maxX": 18, "minY": 0, "maxY": 12}, {"minX": 0, "maxX": 37, "minY": 0, "maxY": 24}, {"minX": 0, "maxX": 93, "minY": 0, "maxY": 62}, {"minX": 0, "maxX": 187, "minY": 0, "maxY": 124}, {"minX": 0, "maxX": 374, "minY": 0, "maxY": 249}, {"minX": 0, "maxX": 749, "minY": 0, "maxY": 499}, {"minX": 0, "maxX": 937, "minY": 0, "maxY": 624}, {"minX": 0, "maxX": 1249, "minY": 0, "maxY": 833}, {"minX": 0, "maxX": 1874, "minY": 0, "maxY": 1249}, {"minX": 0, "maxX": 3749, "minY": 0, "maxY": 2499}, {"minX": 0, "maxX": 7499, "minY": 0, "maxY": 4999}, {"minX": 0, "maxX": 18749, "minY": 0, "maxY": 12499}], "tmpSize_": [256, 256], "tmpExtent_": [0, 0, 0, 0], "matrixIds_": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]}, "style": "ch.kantone.cadastralwebmap-farbe", "dimensions": {"Time": "current"}, "wrapX": false}}}, "editor": {}}, "appearance": {"explorer": 1}}'
WHERE subject_id = 'sub_anonymous';

-- Update and disable existing users
UPDATE bdms.users
SET admin_usr = false,
    username = 'Anonymous',
    firstname = 'Anonymous',
    lastname = 'Anonymous',
    disabled_usr = NOW(),
    email = 'Anonymous@example.com'
WHERE username <> 'Anonymous';

-- Purge attachments
DELETE FROM bdms.borehole_files WHERE true;
DELETE FROM bdms.files WHERE true;

-- Purge non-free and non-published boreholes
DELETE FROM bdms.borehole WHERE id_bho NOT IN (
    SELECT id_bho FROM bdms.borehole
    JOIN bdms.codelist ON codelist.id_cli = borehole.restriction_id_cli
    JOIN bdms.workflow ON workflow.id_bho_fk = borehole.id_bho
    JOIN bdms.roles ON roles.id_rol = workflow.id_rol_fk
    WHERE workflow.id_wkf IN (SELECT MAX(id_wkf) FROM bdms.workflow GROUP BY id_bho_fk)
      AND finished_wkf IS NOT NULL -- get latest publication status
      AND roles.name_rol = 'PUBLIC' -- publication status: published
      AND codelist.schema_cli = 'restriction'
      AND codelist.code_cli = 'f' -- restriction: free
);

-- Purge workflow data
DELETE FROM bdms.workflow
WHERE id_rol_fk NOT IN (
    SELECT id_rol FROM bdms.roles WHERE name_rol = 'PUBLIC'
);

-- Purge specific borehole fields
UPDATE bdms.borehole
SET original_name_bho = NULL
WHERE original_name_bho IS NOT NULL;

SELECT COUNT(*) AS "Free/Published Boreholes" FROM bdms.borehole;
