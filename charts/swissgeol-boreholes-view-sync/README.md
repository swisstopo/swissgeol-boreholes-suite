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

## Installing the Chart

To install the chart with the release name `swissgeol-boreholes-view-sync`:

```bash
helm install swissgeol-boreholes-view-sync swissgeol-boreholes/swissgeol-boreholes-view-sync
```

## Configuring the Chart

The following table lists the configurable parameters of the swissgeol-boreholes chart and their default/required values.

| Parameter            | Description       | Type   | Default / Required |
| -------------------- | ----------------- | ------ | ------------------ |
| `app.version`        | Docker image tag  | config | **required**       |
| `db.source.host`     | Database host     | config | `""`    |
| `db.source.port`     | Database port     | config | `5432`  |
| `db.source.name`     | Database name     | config | `""`    |
| `db.source.schema`   | Database schema   | config | `""`    |
| `db.source.username` | Database username | secret | `""`    |
| `db.source.password` | Database password | secret | `""`    |
| `db.target.host`     | Database host     | config | `""`    |
| `db.target.port`     | Database port     | config | `5432`  |
| `db.target.name`     | Database name     | config | `""`    |
| `db.target.username` | Database username | secret | `""`    |
| `db.target.password` | Database password | secret | `""`    |

Specify each parameter using the `--set key=value` argument to `helm install`. For example, for a dev install:

```bash
helm install swissgeol-boreholes-view-sync swissgeol-boreholes/swissgeol-boreholes-view-sync \
  --namespace 'swissgeol-boreholes-view-sync' \
  --create-namespace \
  --set app.version="edge" \
  --set app.schedule="*/10 * * * *" \
  --set db.source.host="source.example.com" \
  --set db.source.name="source_db" \
  --set db.source.schema="source_schema" \
  --set db.source.username="source_user" \
  --set db.source.password="source_password" \
  --set db.target.host="target.example.com" \
  --set db.target.name="target_db" \
  --set db.target.username="target_user" \
  --set db.target.password="target_password"

```

For a full list of values, you can check the `values.yaml` file or use the `helm show values swissgeol-boreholes/swissgeol-boreholes-view-sync` command. Refer to the corresponding Helm [documentation](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing) for more information on how to override settings in a YAML formatted file.

## Additional commands

Refer to the [Helm documentation](https://helm.sh/docs/helm/helm/) for more information on how to install, upgrade, or delete a Helm chart.

## Automated updates using Keel (optional)

This chart is configured to work with [Keel](https://keel.sh/), a tool that scans Kubernetes and Helm releases for outdated images and performs automated updates according the specified `app.version` setting. To enable Keel, you need to deploy it in your cluster using kubectl or Helm. Refer to the [Keel documentation](https://keel.sh/docs/#introduction) for more information on how to do that.

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
