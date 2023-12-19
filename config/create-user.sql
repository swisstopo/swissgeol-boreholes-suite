INSERT INTO bdms.users
    (created_usr, admin_usr, viewer_usr, username, settings_usr, firstname, middlename, lastname)
VALUES
    (
        NOW(), true, true, 'GeoWerkstatt',
        '{"filter": {"custom": {"borehole_identifier": true, "project_name": true, "landuse": true, "alternate_name": true, "canton": true, "city": true}, "restriction": true, "mapfilter": true, "restriction_until": true, "extended": {"original_name": true, "method": true, "status": true}, "kind": true, "elevation_z": true, "length": true, "drilling_date": true, "zoom2selected": true}, "boreholetable": {"orderby": "original_name", "direction": "ASC"}, "eboreholetable": {"orderby": "creation", "direction": "DESC"}, "map": {"explorer": {}, "editor": {}}, "appearance": {"explorer": 1}}',
        'GeoWerkstatt', NULL, 'user');
