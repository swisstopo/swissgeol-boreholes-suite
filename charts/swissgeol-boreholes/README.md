![Helm Chart](https://img.shields.io/badge/helm%20chart-swissgeol--boreholes-blue)

# Helm package for swissgeol-boreholes

_swissgeol-boreholes_ is a web application which allows to easily manage structured data about boreholes. The source code is available at [swisstopo/swissgeol-boreholes-suite](https://github.com/swisstopo/swissgeol-boreholes-suite).

## TL;DR

```bash
# Add the swissgeol-boreholes Helm repository
helm repo add swissgeol-boreholes https://swisstopo.github.io/swissgeol-boreholes-suite/

# Update the Helm repositories
helm repo update

# Install the swissgeol-boreholes Helm chart
helm install swissgeol-boreholes swissgeol-boreholes/swissgeol-boreholes \
  --namespace 'swissgeol-boreholes' \
  --create-namespace
```

## Introduction

This chart bootstraps the [swissgeol-boreholes](https://github.com/swisstopo/swissgeol-boreholes-suite) web application as also the required services and deployments in a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.8.0+

## Installing the Chart

To install the chart with the release name `swissgeol-boreholes`:

```bash
helm install swissgeol-boreholes swissgeol-boreholes/swissgeol-boreholes
```

## Configuring the Chart

The following table lists the configurable parameters of the swissgeol-boreholes chart and their default/required values.

| Parameter                    | Description                    | Default / Required       |
| ---------------------------- | ------------------------------ | ------------------------ |
| `replicaCount`               | Number of replicas             | `1`                      |
| `app.domain`                 | Base domain name               | `boreholes.swissgeol.ch` |
| `app.version`                | Docker image tag               | **required**             |
| `dataextraction.version`     | Data extraction API version    | **required**             |
| `auth.authority`             | Issuer URL                     | `""`                     |
| `auth.audience`              | Client id                      | `""`                     |
| `auth.anonymousModeEnabled`  | Enable anonymous mode          | `false`                  |
| `database.host`              | Database host                  | `""`                     |
| `database.name`              | Database name                  | `""`                     |
| `database.username`          | Database username              | `""`                     |
| `database.password`          | Database password              | `""`                     |
| `s3.endpoint`                | S3 endpoint                    | `""`                     |
| `s3.bucket`                  | S3 bucket name                 | `""`                     |
| `s3.photosBucket`            | S3 photos bucket name          | `""`                     |
| `s3.logFilesBucket`          | S3 log files bucket name       | `""`                     |
| `s3.accessKey`               | S3 access key                  | `""`                     |
| `s3.secretKey`               | S3 secret key                  | `""`                     |
| `ocr.version`                | OCR API version                | **required**             |
| `ocr.confidenceThreshold`    | OCR confidence score threshold | `0.45`                   |
| `ocr.useAggressiveStrategy`  | OCR processing strategy        | `true`                   |
| `ocr.awsRoleArn`             | OCR API AWS role ARN           | `""`                     |
| `googleAnalytics.trackingId` | Google Analytics Tracking ID   | `""`                     |

Specify each parameter using the `--set key=value` argument to `helm install`. For example, for a dev install:

```bash
helm install swissgeol-boreholes swissgeol-boreholes/swissgeol-boreholes \
  --namespace 'swissgeol-boreholes' \
  --create-namespace \
  --set app.domain="dev-boreholes.swissgeol.ch" \
  --set app.version="edge"
```

For a full list of values, you can check the `values.yaml` file or use the `helm show values swissgeol-boreholes/swissgeol-boreholes` command. Refer to the corresponding Helm [documentation](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing) for more information on how to override settings in a YAML formatted file.

## Additional commands

Refer to the [Helm documentation](https://helm.sh/docs/helm/helm/) for more information on how to install, upgrade, or delete a Helm chart.

## Automated updates using Keel (optional)

This chart is configured to work with [Keel](https://keel.sh/), a tool that scans Kubernetes and Helm releases for outdated images and performs automated updates according the specified `app.version` setting. To enable Keel, you need to deploy it in your cluster using kubectl or Helm. Refer to the [Keel documentation](https://keel.sh/docs/#introduction) for more information on how to do that.

## Validating the Chart

Validate with

```bash
helm lint charts/swissgeol-boreholes
```

or pretend to install the chart to the cluster and if there is some issue it will show the error.

```bash
helm install --dry-run swissgeol-boreholes charts/swissgeol-boreholes
```

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
