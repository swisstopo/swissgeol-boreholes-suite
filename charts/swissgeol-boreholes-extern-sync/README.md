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
- Helm 3.8.0+

### Secrets

This chart uses a **three-tier secret resolution pattern** for database connection strings:

1. **`--set` override** — when `db.source.host` or `db.target.host` are provided, connection strings are built from the individual values
2. **Existing secret** — on upgrade, existing connection strings in the `<release>-secrets` Secret are preserved automatically via `lookup`
3. **CHANGE_ME placeholder** — on first deploy without `--set`, placeholder connection strings are used

On first deploy, either pass all database values via `--set`, or edit the secret manually afterward:

```bash
kubectl edit secret <release>-secrets -n <namespace>
```

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
  --set db.source.host="source-db.example.com" \
  --set db.source.name="source_db" \
  --set db.source.username="srcuser" \
  --set db.source.password="srcpass" \
  --set db.target.host="target-db.example.com" \
  --set db.target.name="target_db" \
  --set db.target.username="tgtuser" \
  --set db.target.password="tgtpass"
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

Database values are assembled into connection strings and stored in a Kubernetes Secret.

| Parameter            | Description              | Used in Secret Key                  |
| -------------------- | ------------------------ | ----------------------------------- |
| `db.source.host`     | Source database host     | `sourceDatabaseConnectionString`    |
| `db.source.port`     | Source database port     | `sourceDatabaseConnectionString`    |
| `db.source.name`     | Source database name     | `sourceDatabaseConnectionString`    |
| `db.source.username` | Source database username | `sourceDatabaseConnectionString`    |
| `db.source.password` | Source database password | `sourceDatabaseConnectionString`    |
| `db.target.host`     | Target database host     | `targetDatabaseConnectionString`    |
| `db.target.port`     | Target database port     | `targetDatabaseConnectionString`    |
| `db.target.name`     | Target database name     | `targetDatabaseConnectionString`    |
| `db.target.username` | Target database username | `targetDatabaseConnectionString`    |
| `db.target.password` | Target database password | `targetDatabaseConnectionString`    |

### Upgrade / Migration

If upgrading from a version where database host/name were in the ConfigMap, set them once via `--set` or `kubectl edit secret` after the first upgrade. The three-tier pattern will preserve them on subsequent upgrades.

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
