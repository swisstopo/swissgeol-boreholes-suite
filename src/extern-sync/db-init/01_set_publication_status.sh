#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              sets the publication status for some boreholes to 'published'.
#              Only lightweight boreholes, with an id greater than 1000100, are
#              used, because the full blown do not met the requirements
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
    BEGIN
      INSERT INTO $SOURCE_DB_SCHEMA.workflow (id_bho_fk, id_usr_fk, started_wkf, finished_wkf, id_rol_fk)
      SELECT id, 1, NOW(), NOW(), r.id_rol_fk
      FROM unnest(bho_ids) AS id
      CROSS JOIN (VALUES (1), (2), (3), (4)) AS r(id_rol_fk);
    END \$\$
  "
