#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              sets the workflow status for some boreholes to 'reviewed'.
#              The ids must exist in the seeded source database, see
#              SeedData() in src/api/BdmsContextExtensions.cs.
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
        bho_ids INTEGER[] := ARRAY[1000000, 1000001, 1000002, 1000003, 1000004, 1000005, 1000006, 1000007, 1000008, 1000009];
        tabs_id INTEGER;
      BEGIN
          -- Update workflow status
          UPDATE $SOURCE_DB_SCHEMA.workflow
          SET status = 2 -- workflow status 'reviewed'
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
              \"document\" = true,
              identifiers = true
          FROM $SOURCE_DB_SCHEMA.workflow w
          WHERE (w.reviewed_tabs_id = ts.tab_status_id OR w.published_tabs_id = ts.tab_status_id)
          AND w.borehole_id = ANY(bho_ids);
      END \$\$;
    "
