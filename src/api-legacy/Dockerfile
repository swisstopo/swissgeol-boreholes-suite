FROM python:3.7.10-slim-buster
RUN apt-get update && apt-get install -y libsqlite3-mod-spatialite
WORKDIR /usr/src/app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./bms

ARG VERSION
ARG REVISION
ENV APP_VERSION ${VERSION}
ENV APP_REVISION ${REVISION}

CMD python -u bms/main.py \
    --pg-host=${DB_HOST} \
    --pg-port=${DB_PORT} \
    --pg-database=${DB_DATABASE} \
    --pg-user=${DB_USERNAME} \
    --pg-password=${DB_PASSWORD} \
    \
    --s3-endpoint=${S3_ENDPOINT} \
    --s3-bucket-name=${S3_BUCKET_NAME} \
    --s3-region=${S3_REGION} \
    --s3-access-key=${S3_ACCESS_KEY} \
    --s3-secret-key=${S3_SECRET_KEY} \
    --s3-secure=${S3_SECURE} \
    \
    --smtp-recipients=${SMTP_RECIPIENTS} \
    --smtp-sender=${SMTP_SENDER} \
    --smtp-password=${SMTP_PASSWORD} \
    --smtp-server=${SMTP_SERVER} \
    --smtp-port=${SMTP_PORT:-25} \
    --smtp-tls=${SMTP_TLS:-0} \
    --smtp-starttls=${SMTP_STARTTLS:-0}
