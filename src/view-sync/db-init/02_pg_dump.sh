#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              creates a full backup of the boreholes source database.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

pg_dump \
  --host=$SOURCE_DB_HOST \
  --port=$SOURCE_DB_PORT \
  --dbname=$SOURCE_DB_NAME \
  --schema=$SOURCE_DB_SCHEMA \
  --username=$SOURCE_DB_USERNAME \
  --no-password \
  --format=custom > $DB_BACKUP_PATH
