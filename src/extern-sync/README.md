# Extern-Sync

## 🎯 Purpose

*Extern-Sync* is a .NET application to sync selected drilling data between a source and a target database. It consists of a couple of *sync tasks* that are executed in sequence.

The application is packed into a Docker container and can be run in a containerized environment. The container exits with a non-zero exit code if any of the *sync tasks* fails.

## 🛠️ Configuration

The application is configured using environment variables. The following environment variables are mandatory:

- `CONNECTIONSTRINGS__SourceBdmsContext`: The connection string of the source database.
- `CONNECTIONSTRINGS__TargetBdmsContext`: The connection string of the target database.
- `TARGET_DEFAULT_WORKGROUP_NAME`: The default workgroup name to assign the borehole to if there is no matching workgroup in the target database.
- `TARGET_DEFAULT_USER_SUB`: The default user subject/identifier to assign the synced boreholes to.
- `MIGRATE_TARGET_DATABASE`: A flag to indicate whether the target database should be migrated if necessary. If not set, it defaults to `false`.

## 🧪 Unit Tests

According to your needs, *sync tasks* can either be executed in a *in-memory* or a real PostgreSQL database using [Testcontainers](https://testcontainers.com/modules/postgresql/).

## 🚀 Usage

A full integration test can be run by executing the following commands:

```bash
# Setup environment (source and target databases)
docker compose -f docker-compose.services.yml up --wait

# Start the extern-sync container
docker compose down && docker compose up --build
```
