SET client_encoding = 'UTF8';

INSERT INTO bdms.config(
    name_cfg, value_cfg
)
VALUES
    (
        'SETTINGS',
        '{'
        '   "defaults": {'
        '       "stratigraphy": 3002'
        '   },'
        '   "filter": {},'
        '   "efilter": {},'
        '   "boreholetable": {'
        '        "orderby": "original_name",'
        '        "direction": "ASC"'
        '    },'
        '    "eboreholetable": {'
        '        "orderby": "creation",'
        '        "direction": "DESC"'
        '    },'
        '   "map": {'
        '       "explorer": {},'
        '       "editor": {}'
        '   },'
        '   "appearance": {'
        '       "explorer": 1'
        '   }'
        '}'
    );

INSERT INTO bdms.codelist (
    id_cli, geolcode,
    schema_cli, code_cli,
    text_cli_de, description_cli_de,
    text_cli_fr, description_cli_fr,
    text_cli_it, description_cli_it,
    text_cli_en, description_cli_en,
    order_cli, conf_cli,
    default_cli, path_cli
) VALUES (
    100000000, 100000000,
    'borehole_identifier', '',
    'Eindeutige ID', '',
    'Identifiant unique', '',
    'ID univoco', '',
    'Unique id', '',
    1, NULL,
    FALSE, ''
);

SELECT setval('bdms.codelist_id_cli_seq', 100000001, true);

INSERT INTO bdms.roles VALUES (0, 'VIEW', '{}');
INSERT INTO bdms.roles VALUES (1, 'EDIT', '{}');
INSERT INTO bdms.roles VALUES (2, 'CONTROL', '{}');
INSERT INTO bdms.roles VALUES (3, 'VALID', '{}');
INSERT INTO bdms.roles VALUES (4, 'PUBLIC', '{}');
SELECT pg_catalog.setval('bdms.roles_id_rol_seq', 4, false);

INSERT INTO bdms.workgroups (id_wgp, name_wgp, settings_wgp)
VALUES (1, 'Default', '{}');

SELECT pg_catalog.setval('bdms.workgroups_id_wgp_seq', 2, false);

INSERT INTO bdms.users VALUES (
    1, NULL, true, true, 'admin', crypt('swissforages', gen_salt('md5')),
'{"filter": {"custom": {"borehole_identifier": true, "project_name": true, "landuse": true, "alternate_name": true, "canton": true, "city": true}, "restriction": true, "mapfilter": true, "restriction_until": true, "extended": {"original_name": true, "method": true, "status": true}, "kind": true, "elevation_z": true, "length": true, "drilling_date": true, "zoom2selected": true}, "boreholetable": {"orderby": "original_name", "direction": "ASC"}, "eboreholetable": {"orderby": "creation", "direction": "DESC"}, "map": {"explorer": {}, "editor": {}}, "appearance": {"explorer": 1}}',
'admin', NULL, 'user');

-- INSERT INTO bdms.users(
-- 	id_usr, admin_usr, viewer_usr, username, disabled_usr)
-- VALUES (
--     -1, false, false, 'system', true
-- );

INSERT INTO bdms.users_roles(
    id_usr_fk, id_rol_fk, id_wgp_fk)
    VALUES (1, 0, 1),(1, 1, 1),(1, 2, 1),(1, 3, 1),(1, 4, 1);

INSERT INTO bdms.users (id_usr, admin_usr, viewer_usr, username, password, firstname, lastname)
VALUES
(2, false, true, 'editor', crypt('swissforages', gen_salt('md5')),'editor', 'user'),
(3, false, true, 'controller',crypt('swissforages', gen_salt('md5')), 'controller', 'user'),
(4, false, true, 'validator', crypt('swissforages', gen_salt('md5')), 'validator', 'user'),
(5, false, true, 'publisher', crypt('swissforages', gen_salt('md5')), 'publisher', 'user');

SELECT pg_catalog.setval('bdms.users_id_usr_seq', 5, true);

INSERT INTO bdms.users_roles(id_usr_fk, id_rol_fk, id_wgp_fk)
VALUES
(2, 1, 1),
(3, 2, 1),
(4, 3, 1),
(5, 4, 1);


INSERT INTO bdms.contents(
	name_cnt,
	draft_cnt,

    title_cnt_en,
    text_cnt_en,

    title_cnt_de,
    text_cnt_de,

    title_cnt_fr,
    text_cnt_fr,

    title_cnt_it,
    text_cnt_it

) VALUES (
    'login',
    FALSE,

    'Welcome to swissforage.ch',
    'A platform to acquire borehole data according to the Borehole data model defined by the Swiss Geological Survey at swisstopo ([more](https://geoservice2.ist.supsi.ch/docs/bdms)).',

    'Willkommen bei swissforage.ch',
    'Eine Plattform zur Erfassung von Bohrlochdaten nach dem von der Schweizerischen Landesgeologie bei swisstopo definierten Bohrlochdatenmodell ([mehr](https://geoservice2.ist.supsi.ch/docs/bdms)).',

    'Bienvenue sur swissforage.ch',
    'Une plate-forme pour l''acquisition de données de forage selon le modèle de données de forage défini par le Service géologique suisse à swisstopo ([en savoir plus](https://geoservice2.ist.supsi.ch/docs/bdms)).',

    'Benvenuti su swissforage.ch',
    'Una piattaforma per l''acquisizione di dati di trivellazione secondo il modello di dati di trivellazione definito dal Servizio geologico nazionale di swisstopo ([altro](https://geoservice2.ist.supsi.ch/docs/bdms)).'
);
