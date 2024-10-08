#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              cleans-up the local database which is not used anymore.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

psql \
  --dbname=$POSTGRES_DB \
  --username=$POSTGRES_USER \
  --no-password \
  --command="
    DROP SCHEMA IF EXISTS $SOURCE_DB_SCHEMA CASCADE;
  "
