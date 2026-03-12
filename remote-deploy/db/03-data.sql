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
        '        "orderby": "original_name",'
        '        "direction": "ASC"'
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
    text_cli_en, description_cli_en,
    text_cli_de, description_cli_de,
    text_cli_fr, description_cli_fr,
    text_cli_it, description_cli_it,
    order_cli, conf_cli,
    default_cli, path_cli
) VALUES (100000004,100000004,'borehole_identifier','100000004','ID Original','','ID Original',NULL,'ID Originale',NULL,'ID Original',NULL,2,NULL,False,NULL),
(100000000,100000000,'borehole_identifier','100000000','ID GeODin-Shortname','','ID GeODin-Shortname',NULL,'ID GeODin-Shortname',NULL,'IID GeODin-Shortname',NULL,3,NULL,False,NULL),
(100000010,100000010,'borehole_identifier','100000010','ID GeODin','','ID GeODin',NULL,'ID GeODin',NULL,'ID GeODin',NULL,4,NULL,False,NULL),
(100000003,100000003,'borehole_identifier','100000003','ID InfoGeol','','ID InfoGeol',NULL,'ID InfoGeol',NULL,'ID InfoGeol',NULL,5,NULL,False,NULL),
(100000005,100000005,'borehole_identifier','100000005','ID Canton','','ID Kanton',NULL,'ID Cantone',NULL,'ID Canton',NULL,6,NULL,False,NULL),
(100000006,100000006,'borehole_identifier','100000006','ID GeoQuat','','ID GeoQuat',NULL,'ID GeoQuat',NULL,'ID GeoQuat',NULL,7,NULL,False,NULL),
(100000007,100000007,'borehole_identifier','100000007','ID GeoMol','','ID GeoMol',NULL,'ID GeoMol',NULL,'ID GeoMol',NULL,8,NULL,False,NULL),
(100000009,100000009,'borehole_identifier','100000009','ID TopFels','','ID TopFels',NULL,'ID TopFels',NULL,'ID TopFels',NULL,9,NULL,False,NULL),
(100000008,100000008,'borehole_identifier','100000008','ID GeoTherm','','ID GeoTherm',NULL,'ID GeoTherm',NULL,'ID GeoTherm',NULL,10,NULL,False,NULL),
(100000011,100000011,'borehole_identifier','100000011','ID Kernlager','','ID Kernlager',NULL,'ID Kernlager',NULL,'ID Kernlager',NULL,11,NULL,False,NULL);

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
'{"filter": {"custom": {"borehole_identifier": true, "project_name": true, "landuse": true, "alternate_name": true, "canton": true, "city": true}, "restriction": true, "restriction_until": true, "extended": {"original_name": true, "method": true, "status": true}, "kind": true, "elevation_z": true, "length": true, "drilling_date": true, "zoom2selected": true}, "boreholetable": {"orderby": "original_name", "direction": "ASC"}, "eboreholetable": {"orderby": "original_name", "direction": "ASC"}, "map": {"explorer": {}, "editor": {}}, "appearance": {"explorer": 1}}',
'admin', NULL, 'user');

INSERT INTO bdms.users_roles(
    id_usr_fk, id_rol_fk, id_wgp_fk)
    VALUES (1, 0, 1),(1, 1, 1),(1, 2, 1),(1, 3, 1),(1, 4, 1);

INSERT INTO bdms.users (id_usr, admin_usr, viewer_usr, username, password, firstname, lastname)
VALUES
(2, false, true, 'editor', crypt('swissforages', gen_salt('md5')),'editor', 'user'),
(3, false, true, 'controller',crypt('swissforages', gen_salt('md5')), 'controller', 'user'),
(4, false, true, 'validator', crypt('swissforages', gen_salt('md5')), 'validator', 'user'),
(5, false, true, 'publisher', crypt('swissforages', gen_salt('md5')), 'publisher', 'user'),
(6, false, true, 'filesUser', crypt('swissforages', gen_salt('md5')), 'user_that_only', 'has_files'),
(7, false, true, 'deletableUser', crypt('swissforages', gen_salt('md5')), 'user_that_can', 'be_deleted'),
(8, false, true, 'viewer', crypt('swissforages', gen_salt('md5')), 'viewer', 'user');

SELECT pg_catalog.setval('bdms.users_id_usr_seq', 8, true);

INSERT INTO bdms.users_roles(id_usr_fk, id_rol_fk, id_wgp_fk)
VALUES
(2, 1, 1),
(3, 2, 1),
(4, 3, 1),
(5, 4, 1),
(6, 4, 1),
(7, 4, 1),
(8, 0, 1);
