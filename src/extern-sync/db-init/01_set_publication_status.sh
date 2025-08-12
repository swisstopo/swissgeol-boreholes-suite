#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              sets the publication status for some boreholes to 'published'.
#              Only lightweight boreholes, with an id greater than 1000100, are
#              used, because the full blown do not meet the requirements
#              regarding the use of casings.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

psql \
  --host=$SOURCE_DB_HOST \
  --port=$SOURCE_DB_PORT \
  --dbname=$SOURCE_DB_NAME \
  --username=$SOURCE_DB_USERNAME \
  --no-password \
  --command="
    DO \$\$
    DECLARE
      bho_ids INTEGER[] := ARRAY[1000299, 1000300, 1000301, 1000302, 1000999, 1002008, 1002999];
      tabs_id1 INTEGER;
      tabs_id2 INTEGER;
    BEGIN
      -- For each borehole
      FOREACH bho_id IN ARRAY bho_ids LOOP
        -- Insert first tab_status entry
        INSERT INTO $SOURCE_DB_SCHEMA.tab_status (\"general\", \"location\", \"section\", geometry, lithology, chronostratigraphy,lithostratigraphy, casing, instrumentation, backfill, water_ingress, groundwater, field_measurement, hydrotest, profile, photo, \"document\")
        VALUES (true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true)
        RETURNING tab_status_id INTO tabs_id1;

        -- Insert second tab_status
        INSERT INTO $SOURCE_DB_SCHEMA.tab_status (\"general\", \"location\", \"section\", geometry, lithology, chronostratigraphy,lithostratigraphy, casing, instrumentation, backfill, water_ingress, groundwater, field_measurement, hydrotest, profile, photo, \"document\")
        VALUES (true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true)
        RETURNING tab_status_id INTO tabs_id2;

        -- Insert workflow entry with the new tab_status ids
        INSERT INTO $SOURCE_DB_SCHEMA.workflow (has_requested_changes, status, borehole_id, reviewed_tabs_id, published_tabs_id, assignee_id)
        VALUES (false, 3, bho_id, tabs_id1, tabs_id2, null);
      END LOOP;
    END \$\$
  "
