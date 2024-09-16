#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              restores the boreholes source database to the local database.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

pg_restore \
  --username=$POSTGRES_USER \
  --dbname=$POSTGRES_DB \
  --no-owner \
  --no-privileges $DB_BACKUP_PATH
