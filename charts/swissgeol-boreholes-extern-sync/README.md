![Helm Chart](https://img.shields.io/badge/helm%20chart-swissgeol--boreholes-blue)

# Helm package for swissgeol-boreholes-extern-sync

_swissgeol-boreholes-extern-sync_ is a Kubernetes cron job that synchronizes selected drilling data between a source and a target database. The source code is available at [swisstopo/swissgeol-boreholes-suite](https://github.com/swisstopo/swissgeol-boreholes-suite/tree/main/src/extern-sync).

## TL;DR

```bash
# Add the swissgeol-boreholes Helm repository
helm repo add swissgeol-boreholes https://swisstopo.github.io/swissgeol-boreholes-suite/

# Update the Helm repositories
helm repo update

# Install the swissgeol-boreholes-extern-sync Helm chart
helm install swissgeol-boreholes-extern-sync swissgeol-boreholes/swissgeol-boreholes-extern-sync \
  --namespace 'swissgeol-boreholes-extern-sync' \
  --create-namespace
```

## Introduction

This chart creates the [swissgeol-boreholes](https://github.com/swisstopo/swissgeol-boreholes-suite) _extern-sync_ application as a Kubernetes cron job in a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.14+

### Secrets

This chart uses a **three-tier secret resolution pattern** for database connection strings:

1. **`--set` override** — when `db.source.host` or `db.target.host` are provided, connection strings are built from the individual values
2. **Existing secret** — on upgrade, existing connection strings in the `<release>-secrets` Secret are preserved automatically via `lookup`
3. **Fail-loud** — on first deploy without `--set`, required keys trigger a clear error message telling you which value to provide

On first deploy, pass all required secret values via `--set`:

## Installing the Chart

To install the chart with the release name `swissgeol-boreholes-extern-sync`:

```bash
helm install swissgeol-boreholes-extern-sync swissgeol-boreholes/swissgeol-boreholes-extern-sync
```

### First deploy example

```bash
helm install swissgeol-boreholes-extern-sync swissgeol-boreholes/swissgeol-boreholes-extern-sync \
  --namespace 'swissgeol-boreholes-extern-sync' \
  --create-namespace \
  --set configuration.targetDefaultWorkgroupName="Sync" \
  --set configuration.targetDefaultUserSub="sub_admin" \
  --set db.source.connectionString="Host=source-db.example.com;Port=5432;Database=source_db;Username=srcuser;Password=srcpass" \
  --set db.target.connectionString="Host=target-db.example.com;Port=5432;Database=target_db;Username=tgtuser;Password=tgtpass"
```

## Configuring the Chart

### Configuration parameters (ConfigMap)

| Parameter                                  | Description                            | Default          |
| ------------------------------------------ | -------------------------------------- | ---------------- |
| `app.version`                              | Docker image tag                       | baked in (see Chart.yaml) |
| `app.timezone`                             | Application timezone                   | `Europe/Zurich`  |
| `app.schedule`                             | Cron schedule                          | `0 0 * * *`      |
| `configuration.targetDefaultWorkgroupName` | Default target workgroup name          | `Sync`           |
| `configuration.targetDefaultUserSub`       | Default target user subject/identifier | `sub_admin`      |

### Secret parameters

Each database connection string is supplied as one complete value and stored in a Kubernetes Secret. The sync job reads them directly (`CONNECTIONSTRINGS__SourceBdmsContext` / `CONNECTIONSTRINGS__TargetBdmsContext`).

| Parameter                    | Description                     | Secret Key                       |
| ---------------------------- | ------------------------------- | -------------------------------- |
| `db.source.connectionString` | Source database connection string | `sourceDatabaseConnectionString` |
| `db.target.connectionString` | Target database connection string | `targetDatabaseConnectionString` |

### Upgrade / Migration

Connection strings are stored under the same Secret keys as before, so existing deployments need no action: an upgrade without `--set` preserves the values already in the Secret. To change a connection string, set it once via `--set db.source.connectionString=<value>` (or `kubectl edit secret`). An empty or missing connection string fails the deploy rather than writing a blank value.

For a full list of values, you can check the `values.yaml` file or use the `helm show values swissgeol-boreholes/swissgeol-boreholes-extern-sync` command. Refer to the corresponding Helm [documentation](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing) for more information on how to override settings in a YAML formatted file.

## Additional commands

Refer to the [Helm documentation](https://helm.sh/docs/helm/helm/) for more information on how to install, upgrade, or delete a Helm chart.

## Validating the Chart

Validate with

```bash
helm lint charts/swissgeol-boreholes-extern-sync
```

or pretend to install the chart to the cluster and if there is some issue it will show the error.

```bash
helm install --dry-run swissgeol-boreholes-extern-sync charts/swissgeol-boreholes-extern-sync
```

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
