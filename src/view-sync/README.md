# View-Sync

## 🎯 Purpose

*View-Sync* is a simple PostgreSQL Docker container containing some scripts to sync free and published boreholes from a source to a target database. The [scripts](./db-init/) are executed as part of the PostgreSQL Docker entrypoint [initialization](https://github.com/docker-library/docs/tree/master/postgres#initialization-scripts) process.

## 🚀 Usage

```bash
# Setup environment (source and target databases)
docker compose -f docker-compose.services.yml up --wait

# Start the view-sync container
docker compose down && docker compose up --build
```

ℹ️ For a better debugging and development experience, there is also a pre-configured ***pgAdmin*** container containing the source and target databases. You can access it via [http://localhost:3051](http://localhost:3051) after the service compose file has been started.
