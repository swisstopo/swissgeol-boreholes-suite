#!/bin/bash

# ------------------------------------------------------------------------------
# DESCRIPTION: As part of the docker-entrypoint initialization, this script
#              creates the .pgpass file in the home directory of the postgres
#              user. This file is used to store the credentials for the source
#              database.
# ------------------------------------------------------------------------------

set -e

cat << EOF > $HOME/.pgpass
$SOURCE_DB_HOST:$SOURCE_DB_PORT:$SOURCE_DB_NAME:$SOURCE_DB_USERNAME:$SOURCE_DB_PASSWORD
EOF

chmod 600 $HOME/.pgpass
