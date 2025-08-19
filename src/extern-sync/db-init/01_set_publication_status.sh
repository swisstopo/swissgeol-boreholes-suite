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
        tabs_id INTEGER;
      BEGIN
          -- Update workflow status
          UPDATE $SOURCE_DB_SCHEMA.workflow
          SET status = 3
          WHERE borehole_id = ANY(bho_ids);

          -- Update tab_status for all workflow entries related to these boreholes
          UPDATE $SOURCE_DB_SCHEMA.tab_status ts
          SET \"general\" = true,
              \"location\" = true,
              \"section\" = true,
              geometry = true,
              lithology = true,
              chronostratigraphy = true,
              lithostratigraphy = true,
              casing = true,
              instrumentation = true,
              backfill = true,
              water_ingress = true,
              groundwater = true,
              field_measurement = true,
              hydrotest = true,
              profile = true,
              photo = true,
              \"document\" = true
          FROM $SOURCE_DB_SCHEMA.workflow w
          WHERE (w.reviewed_tabs_id = ts.tab_status_id OR w.published_tabs_id = ts.tab_status_id)
          AND w.borehole_id = ANY(bho_ids);
      END \$\$;
    "
