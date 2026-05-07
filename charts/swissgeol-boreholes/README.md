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
- Helm 3.14+

### Secrets

This chart uses a **three-tier secret resolution pattern** for sensitive values:

1. **`--set` override** — values passed via `helm install --set` or `helm upgrade --set` take highest priority
2. **Existing secret** — on upgrade, existing values in the `<release>-secrets` Secret are preserved automatically via `lookup`
3. **Fail-loud** — on first deploy without `--set`, required keys trigger a clear error message telling you which value to provide

On first deploy, pass all required secret values via `--set`:

## Installing the Chart

To install the chart with the release name `swissgeol-boreholes`:

```bash
helm install swissgeol-boreholes swissgeol-boreholes/swissgeol-boreholes
```

### First deploy example

```bash
helm install swissgeol-boreholes swissgeol-boreholes/swissgeol-boreholes \
  --namespace 'swissgeol-boreholes' \
  --create-namespace \
  --set app.domain="boreholes.example.com" \
  --set app.version="v2.1.1462" \
  --set database.host="db.example.com" \
  --set database.name="bdms" \
  --set database.username="dbuser" \
  --set database.password="dbpass" \
  --set s3.endpoint="https://s3.eu-central-1.amazonaws.com" \
  --set s3.bucket="my-profiles" \
  --set s3.photosBucket="my-photos" \
  --set s3.logFilesBucket="my-logs" \
  --set s3.accessKey="AKIA..." \
  --set s3.secretKey="secret..." \
  --set auth.authority="https://cognito-idp.region.amazonaws.com/pool-id" \
  --set auth.audience="client-id" \
  --set ocr.awsRoleArn="arn:aws:iam::123456789:role/my-role"
```

## Configuring the Chart

### Configuration parameters (ConfigMap)

| Parameter                     | Description                    | Default                  |
| ----------------------------- | ------------------------------ | ------------------------ |
| `replicaCount`                | Number of replicas             | `1`                      |
| `app.domain`                  | Base domain name               | `""`                     |
| `app.version`                 | Docker image tag               | baked in (see Chart.yaml)|
| `app.timezone`                | Application timezone           | `Europe/Zurich`          |
| `dataextraction.version`      | Data extraction API version    | baked in (see Chart.yaml)|
| `ocr.version`                 | OCR API version                | baked in (see Chart.yaml)|
| `ocr.confidenceThreshold`     | OCR confidence score threshold | `0.45`                   |
| `ocr.useAggressiveStrategy`   | OCR processing strategy        | `true`                   |
| `ocr.skipProcessing`          | Skip OCR processing entirely   | `false`                  |
| `auth.scopes`                 | Required OIDC scopes           | `openid profile email`   |
| `auth.anonymousModeEnabled`   | Enable anonymous mode          | `false`                  |
| `auth.basicAuthEnabled`       | Enable basic auth on ingress   | `false`                  |
| `database.port`               | Database port                  | `5432`                   |
| `s3.endpoint`                 | S3 endpoint URL                | `""`                     |
| `s3.secure`                   | Use HTTPS for S3               | `"1"`                    |
| `googleAnalytics.trackingId`  | Google Analytics tracking ID   | `""`                     |

### Secret parameters

These values are stored in a Kubernetes Secret. Pass via `--set` on first deploy.

| Parameter                  | Description                       | Secret Key                 |
| -------------------------- | --------------------------------- | -------------------------- |
| `database.host`            | Database hostname                 | `databaseHost`             |
| `database.name`            | Database name                     | `databaseName`             |
| `database.username`        | Database username                 | `databaseUsername`         |
| `database.password`        | Database password                 | `databasePassword`         |
| `s3.bucket`                | S3 bucket name                    | `s3Bucket`                 |
| `s3.photosBucket`          | S3 photos bucket name             | `s3PhotosBucket`           |
| `s3.logFilesBucket`        | S3 log files bucket name          | `s3LogFilesBucket`         |
| `s3.accessKey`             | S3 access key                     | `s3AccessKey`              |
| `s3.secretKey`             | S3 secret key                     | `s3SecretKey`              |
| `auth.authority`           | OIDC issuer URL                   | `authAuthority`            |
| `auth.audience`            | OIDC client ID                    | `authAudience`             |
| `ocr.awsRoleArn`           | AWS IAM Role ARN for OCR (IRSA)   | `awsRoleArn`               |

### Upgrade / Migration

If upgrading from a version where these values were in the ConfigMap, no action is needed. The three-tier pattern will pick up existing secret values on `helm upgrade`. For values that were previously only in the ConfigMap (database host/name, S3 buckets, auth, ARN), set them once via `--set` or `kubectl edit secret` after the first upgrade.

Specify each parameter using the `--set key=value` argument to `helm install`. For a full list of values, you can check the `values.yaml` file or use the `helm show values swissgeol-boreholes/swissgeol-boreholes` command. Refer to the corresponding Helm [documentation](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing) for more information on how to override settings in a YAML formatted file.

## Additional commands

Refer to the [Helm documentation](https://helm.sh/docs/helm/helm/) for more information on how to install, upgrade, or delete a Helm chart.

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
