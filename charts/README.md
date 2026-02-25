# SwissGeol Boreholes Suite Helm Charts

[![.github/workflows/ci.yml](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/ci.yml) [![Release](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/release.yml/badge.svg)](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/release.yml) [![License](https://img.shields.io/github/license/geoadmin/suite-bdms)](https://github.com/swisstopo/swissgeol-boreholes-suite/blob/main/LICENSE)

## Overview

This repository hosts the Helm charts for the **SwissGeol Boreholes Suite** (boreholes.swissgeol.ch).

The application is a comprehensive web platform developed by **swisstopo** for the simple, structured, and harmonized acquisition and management of geological borehole data. It enables users to capture, view, and manage geological data through a modern web interface backed by robust APIs.

## Usage

To use the charts in this repository, add the repo to your Helm client:

```bash
helm repo add swissgeol-boreholes https://swisstopo.github.io/swissgeol-boreholes-suite/
helm repo update
```

## Available Charts

This repository contains three distinct Helm charts that make up the suite's ecosystem.

### 1. Main Application
**Chart Name:** `swissgeol-boreholes`

This is the core web application. It deploys the frontend, backend APIs (.NET and Python Legacy), and configures connections to necessary services (PostgreSQL, S3, OIDC).

*   **Primary Function:** Provides the User Interface and APIs for managing borehole data.
*   **Key Features:** OIDC Authentication, Data Extraction, OCR capabilities, and structured data entry.
*   **Install Command:**
    ```bash
    helm install my-release swissgeol-boreholes/swissgeol-boreholes
    ```

### 2. View Synchronization
**Chart Name:** `swissgeol-boreholes-view-sync`

A Kubernetes CronJob designed to maintain data consistency for public viewing.

*   **Primary Function:** Synchronizes **freely available** drilling data from the source database to a target database.
*   **Use Case:** Ensures that the public-facing view of the data remains up-to-date with the internal edit state without exposing restricted data.
*   **Install Command:**
    ```bash
    helm install my-release swissgeol-boreholes/swissgeol-boreholes-view-sync
    ```

### 3. External Synchronization
**Chart Name:** `swissgeol-boreholes-extern-sync`

A Kubernetes CronJob designed for targeted data exchange.

*   **Primary Function:** Synchronizes **selected** drilling data between a source and a target database.
*   **Use Case:** Facilitates specific data transfers to external partners or specific workgroups based on configuration.
*   **Install Command:**
    ```bash
    helm install my-release swissgeol-boreholes/swissgeol-boreholes-extern-sync
    ```

## Prerequisites

To utilize these charts, your environment should meet the following requirements:

*   **Kubernetes:** Version 1.23+
*   **Helm:** Version 3.8.0+
*   **Dependencies:** External PostgreSQL database and S3-compatible storage (for the main application).

## Support & Source Code

*   **Source Code:** [github.com/swisstopo/swissgeol-boreholes-suite](https://github.com/swisstopo/swissgeol-boreholes-suite)
*   **Issues:** Please report bugs or feature requests in the main repository issue tracker.

## License

This project is licensed under the MIT License.
