#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              creates a full backup of the cleaned-up boreholes database.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

pg_dump \
  --username=$POSTGRES_USER \
  --dbname=$POSTGRES_DB \
  --schema=$SOURCE_DB_SCHEMA \
  --format=custom > $DB_BACKUP_PATH
