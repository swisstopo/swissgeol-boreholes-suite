#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              gracefully exits the Docker container after all tasks have been
#              completed successfully.
# ------------------------------------------------------------------------------

set -e

unset PGPASSWORD

echo "Successfully published some random boreholes in the $SOURCE_DB_NAME database."

# Due to some magic in the Postgres Docker entrypoint, the shutdown of the
# database server gets delayed to ensure proper database initialization.
# Afterward, the Docker container stops gracefully with exit code 0.
(sleep 10 && pg_ctl stop -m smart) &
