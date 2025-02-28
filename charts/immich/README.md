# Immich

This **unofficial** chart deploys [Immich](https://immich.app/) and
is targeted at an audience which wants to have some lower level control over the deployment.

## Prerequisites

This chart requires:

- a PostgreSQL database with `pgvector` or `pgvector.rs` extension installed
- a Redis instance

## Usage

You can install this chart by running the following command:

```bash
helm repo add secustor https://secustor.dev/helm-charts
helm install my-release secustor/immich
# or directly the OCI registry
helm install my-release oci://ghcr.io/secustor/helm-charts/immich
```

## Example

This example assumes that the CloudNativePG operator has been deployed and configured.

You will:

- Create secrets for PostgreSQL and Redis
- Request a PostgreSQL instance with the `pgvector` extension
- Deploy a Redis instance
- Deploy Immich

Value files can be found in the [`example` directory](https://github.com/secustor/helm-charts/tree/main/charts/immich/example).

### PostgreSQL

This assumes you have [CloudNativePG](https://cloudnative-pg.io/)
installed and configured.

```bash
kubectl create -f example/postgres.yaml
```

### Redis

Create the static password secret for Redis.

```bash
kubectl create -f example/redis-secret.yaml
```

Install the Redis chart.

```bash
helm install immich-redis registry-1.docker.io/bitnamicharts/redis -f example/redis-values.yaml
```

### Immich

Install the Immich chart.

```bash
helm install immich oci://ghcr.io/secustor/helm-charts/immich -f example/immich-values.yaml
```
