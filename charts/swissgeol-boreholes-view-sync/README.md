![Helm Chart](https://img.shields.io/badge/helm%20chart-swissgeol--boreholes-blue)

# Helm package for swissgeol-boreholes-view-sync

_swissgeol-boreholes-view-sync_ is a Kubernetes cron job that synchronizes freely available drilling data from a source database to a target database. The source code is available at [swisstopo/swissgeol-boreholes-suite](https://github.com/swisstopo/swissgeol-boreholes-suite/tree/main/src/view-sync).

## TL;DR

```bash
# Add the swissgeol-boreholes Helm repository
helm repo add swissgeol-boreholes https://swisstopo.github.io/swissgeol-boreholes-suite/

# Update the Helm repositories
helm repo update

# Install the swissgeol-boreholes-view-sync Helm chart
helm install swissgeol-boreholes-view-sync swissgeol-boreholes/swissgeol-boreholes-view-sync \
  --namespace 'swissgeol-boreholes-view-sync' \
  --create-namespace
```

## Introduction

This chart creates the [swissgeol-boreholes](https://github.com/swisstopo/swissgeol-boreholes-suite) _view-sync_ application as a Kubernetes cron job in a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.8.0+

### Secrets

This chart uses a **three-tier secret resolution pattern** for all database values:

1. **`--set` override** — values passed via `helm install --set` or `helm upgrade --set` take highest priority
2. **Existing secret** — on upgrade, existing values in the `<release>-secrets` Secret are preserved automatically via `lookup`
3. **CHANGE_ME placeholder** — on first deploy without `--set`, placeholder values are used

On first deploy, either pass all secret values via `--set`, or edit the secret manually afterward:

```bash
kubectl edit secret <release>-secrets -n <namespace>
```

## Installing the Chart

To install the chart with the release name `swissgeol-boreholes-view-sync`:

```bash
helm install swissgeol-boreholes-view-sync swissgeol-boreholes/swissgeol-boreholes-view-sync
```

### First deploy example

```bash
helm install swissgeol-boreholes-view-sync swissgeol-boreholes/swissgeol-boreholes-view-sync \
  --namespace 'swissgeol-boreholes-view-sync' \
  --create-namespace \
  --set db.source.host="source-db.example.com" \
  --set db.source.name="source_db" \
  --set db.source.schema="public" \
  --set db.source.username="srcuser" \
  --set db.source.password="srcpass" \
  --set db.target.host="target-db.example.com" \
  --set db.target.name="target_db" \
  --set db.target.username="tgtuser" \
  --set db.target.password="tgtpass"
```

## Configuring the Chart

### Configuration parameters (ConfigMap)

| Parameter       | Description          | Default          |
| --------------- | -------------------- | ---------------- |
| `app.version`   | Docker image tag     | baked in (see Chart.yaml) |
| `app.timezone`  | Application timezone | `Europe/Zurich`  |
| `app.schedule`  | Cron schedule        | `0 0 * * *`      |

### Secret parameters

All database values are stored in a Kubernetes Secret. Pass via `--set` on first deploy.

| Parameter            | Description              | Secret Key               |
| -------------------- | ------------------------ | ------------------------ |
| `db.source.host`     | Source database host     | `sourceDatabaseHost`     |
| `db.source.port`     | Source database port     | `sourceDatabasePort`     |
| `db.source.name`     | Source database name     | `sourceDatabaseName`     |
| `db.source.schema`   | Source database schema   | `sourceDatabaseSchema`   |
| `db.source.username` | Source database username | `sourceDatabaseUsername` |
| `db.source.password` | Source database password | `sourceDatabasePassword` |
| `db.target.host`     | Target database host     | `targetDatabaseHost`     |
| `db.target.port`     | Target database port     | `targetDatabasePort`     |
| `db.target.name`     | Target database name     | `targetDatabaseName`     |
| `db.target.username` | Target database username | `targetDatabaseUsername` |
| `db.target.password` | Target database password | `targetDatabasePassword` |

### Upgrade / Migration

If upgrading from a version where database host/port/name/schema were in the ConfigMap, set them once via `--set` or `kubectl edit secret` after the first upgrade. The three-tier pattern will preserve them on subsequent upgrades.

For a full list of values, you can check the `values.yaml` file or use the `helm show values swissgeol-boreholes/swissgeol-boreholes-view-sync` command. Refer to the corresponding Helm [documentation](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing) for more information on how to override settings in a YAML formatted file.

## Additional commands

Refer to the [Helm documentation](https://helm.sh/docs/helm/helm/) for more information on how to install, upgrade, or delete a Helm chart.

## Validating the Chart

Validate with

```bash
helm lint charts/swissgeol-boreholes-view-sync
```

or pretend to install the chart to the cluster and if there is some issue it will show the error.

```bash
helm install --dry-run swissgeol-boreholes-view-sync charts/swissgeol-boreholes-view-sync
```

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
