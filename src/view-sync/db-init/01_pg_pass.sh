#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              creates the .pgpass file in the home directory of the postgres
#              user. This file is used to store the credentials for the source
#              and target databases.
# ------------------------------------------------------------------------------

set -e

cat << EOF > $HOME/.pgpass
$SOURCE_DB_HOST:$SOURCE_DB_PORT:$SOURCE_DB_NAME:$SOURCE_DB_USERNAME:$SOURCE_DB_PASSWORD
$TARGET_DB_HOST:$TARGET_DB_PORT:$TARGET_DB_NAME:$TARGET_DB_USERNAME:$TARGET_DB_PASSWORD
localhost:5432:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD
EOF

chmod 600 $HOME/.pgpass
