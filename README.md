# Environment configuration for [Bohrdatenmanagementsystem](https://github.com/geoadmin/suite-bdms) (BDMS)

## Configure and run Bohrdatenmanagementsystem

(For kubernetes deployment see [kubernetes-manifests](./kubernetes-manifests/README.md))

Clone the source repository and cd into the newly created directory

```bash
~$ git clone https://github.com/geoadmin/config-bdms.git
~$ cd config-bdms
```

Use the [dotenv](./.env.template) template file to configure environment by copying the contents of the template file into a new _.env_ file.

```bash
~$ cp ./.env.template ./.env
```

Spin up the Docker containers in detached mode.

```bash
~$ docker-compose up -d
```

## Environment variables

Container images are configured using a `.env` file passed at runtime. Refer to the [dotenv](./.env.template) template file for a complete list of the parameters and their documentation.

## Prerequisites

### PostgreSQL database

A PostgreSQL database with the following extensions enabled and a pre-configured user which has the permission to create databases.

```sql
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
```

For testing purposes you can use the provided database backup with sample data (located under the [db folder](./db/)) or spin up a dockerized PostgreSQL database and use this instance when [configuring](#configure-and-run-bohrdatenmanagementsystem) Bohrdatenmanagementsystem.

```yml
db:
  image: postgis/postgis
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: mysecretpassword 
    POSTGRES_DB: postgres
  ports:
    - 5432:5432
```

### S3-Compatible Object Storage

In order to be able to upload and save borehole attachments a S3 compatible object storage must be configured. For testing purposes, you can spin up a dockerized object storage.

```yml
minio:
  image: minio/minio
  environment:
    MINIO_ROOT_USER: minio
    MINIO_ROOT_PASSWORD: mysecretpassword
    MINIO_CONSOLE_ADDRESS: 9001
  ports:
    - 9000:9000 # object storage server address
    - 9001:9001 # embedded console user interface
  command: minio server /home/shared
```

## Automatic Container Updates

Bohrdatenmanagementsystem Docker containers automatically get updated with [Watchtower](https://containrrr.dev/watchtower/). If a new image gets pushed to the registry Watchtower will automatically spin up a new container with the same options that were used when it was deployed initially. Refer to the [dotenv](./.env.template) for scheduling options.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
