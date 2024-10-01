#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              restores the cleaned-up boreholes database backup to the target
#              database.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

psql \
  --host=$TARGET_DB_HOST \
  --port=$TARGET_DB_PORT \
  --dbname=$TARGET_DB_NAME \
  --username=$TARGET_DB_USERNAME \
  --no-password \
  --command="
    CREATE EXTENSION IF NOT EXISTS ltree;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS postgis;
    DROP SCHEMA IF EXISTS $SOURCE_DB_SCHEMA CASCADE;
  "

pg_restore \
  --host=$TARGET_DB_HOST \
  --port=$TARGET_DB_PORT \
  --dbname=$TARGET_DB_NAME \
  --username=$TARGET_DB_USERNAME \
  --no-password \
  --no-owner \
  --no-privileges \
  --no-comments $DB_BACKUP_PATH
