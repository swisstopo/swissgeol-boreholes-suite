INSERT INTO bdms.users
    (created_usr, admin_usr, username, settings_usr, firstname, lastname)
VALUES
    (
        NOW(), true, 'GeoWerkstatt',
        '{"filter": {"custom": {"borehole_identifier": true, "project_name": true, "landuse": true, "alternate_name": true, "canton": true, "city": true}, "restriction": true, "restriction_until": true, "extended": {"original_name": true, "method": true, "status": true}, "kind": true, "elevation_z": true, "length": true, "drilling_date": true, "zoom2selected": true}, "boreholetable": {"orderby": "original_name", "direction": "ASC"}, "eboreholetable": {"orderby": "original_name", "direction": "ASC"}, "map": {"explorer": {}, "editor": {}}, "appearance": {"explorer": 1}}',
        'GeoWerkstatt', 'user');
