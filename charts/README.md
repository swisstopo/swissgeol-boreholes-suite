# Helm Charts

This repository hosts the swissgeol-boreholes Helm charts.

Helm repo URL:
`https://swisstopo.github.io/swissgeol-boreholes-suite/`

## Manual cluster update

Clusters must update their Helm repo URL from the old config repository to the new
suite repository and run upgrades manually.

## Keel note

Keel is currently used via chart annotations for automated image updates. Some teams
avoid tag-based auto updates because of governance/audit requirements, GitOps drift,
or rollout predictability. Alternatives include Flux/Argo image automation or
PR-based updates. No changes are made here.

## Probe coverage note

OCR and Dataextraction use TCP-only probes for now. Revisit later to add explicit
HTTP health endpoints and switch probes accordingly.
