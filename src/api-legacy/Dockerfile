FROM python:3.8-slim-bookworm

WORKDIR /usr/src/app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./bms

ARG VERSION
ARG REVISION
ENV APP_VERSION=${VERSION}
ENV APP_REVISION=${REVISION}

CMD ["/bin/sh", "-c", "python -u bms/main.py \
    --pg-host=${DB_HOST} \
    --pg-port=${DB_PORT} \
    --pg-database=${DB_DATABASE} \
    --pg-user=${DB_USERNAME} \
    --pg-password=${DB_PASSWORD}"]
