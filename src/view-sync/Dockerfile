FROM postgis/postgis:17-3.5-alpine

# Setup local database
ENV POSTGRES_USER=ISLANDHAIR \
    POSTGRES_PASSWORD=VAGRANTICARUS \
    POSTGRES_DB=FRUGALSHARK \
    DB_BACKUP_PATH=/tmp/$POSTGRES_DB.dump

# Copy the database initialization scripts to the container
COPY ./db-init /docker-entrypoint-initdb.d/
