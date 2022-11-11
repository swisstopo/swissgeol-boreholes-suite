-- Migrates existing LV95 coordinates (x, y) into LV03 coordinates using 'shift' method.
-- Removes prefix - number 1 in the north-south direction and number 2 in the west-east direction.

-- !!! Please check WHERE conditions before running this script !!!

UPDATE bdms.borehole
SET location_x_lv03_bho = CAST(REGEXP_REPLACE(CAST(location_x_bho AS character varying),'^(2?)(\d{6}.*)$','\2') AS double precision)
WHERE location_x_lv03_bho IS NULL;
-- AND srs_id_cli = 20104001
-- AND geodin_id IS NOT NULL;


UPDATE bdms.borehole
SET location_y_lv03_bho = CAST(REGEXP_REPLACE(CAST(location_y_bho AS character varying),'^(1?)(\d{6}.*)$','\2') AS double precision)
WHERE location_y_lv03_bho IS NULL;
-- AND srs_id_cli = 20104001
-- AND geodin_id IS NOT NULL;

-- When updating spatial reference system please keep in mind to preserve LV95 (Geolcode 20104001) for some boreholes
UPDATE bdms.borehole
SET srs_id_cli = 20104002
WHERE original_name_bho NOT IN ('Bülach-1-1','Trüllikon-1-1','Marthalen-1','Boezberg-1','Boezberg-2','Stadel-2','Stadel-3','Rheinau-1') OR original_name_bho IS NULL;
-- AND geodin_id IS NOT NULL;
