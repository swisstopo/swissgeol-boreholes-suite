# Swissgeol Boreholes - Remote Deployment

Self-contained Docker Compose stack for deploying the Swissgeol Boreholes suite on a remote server.
Uses pre-built images from GitHub Container Registry instead of building from source.

## Prerequisites

- Docker and Docker Compose
- Access to `ghcr.io/swisstopo` container registry

## Setup

1. Copy the entire `remote-deploy/` folder to the target server.

2. Edit `.env` and set `SERVER_HOST` to the server's IP address or hostname:

```bash
SERVER_HOST=192.168.101.10
```

For local testing, use `SERVER_HOST=localhost`.

## Commands

```bash
# Start the stack
docker compose up -d

# Stop the stack
docker compose down

# Stop and remove all data volumes
docker compose down -v

# View logs
docker compose logs -f
docker compose logs api --tail 50

# Restart a single service
docker compose restart api

# Check container status
docker compose ps
```

## Services and URLs

Replace `SERVER_HOST` with the value from your `.env` file.

| Service     | URL                           | Description                          |
| ----------- | ----------------------------- | ------------------------------------ |
| Application | `https://SERVER_HOST:8888`    | Main web UI (via Traefik, self-signed TLS) |
| OIDC Server | `https://SERVER_HOST:4011`    | Authentication (self-signed TLS)     |
| pgAdmin     | `http://SERVER_HOST:3001`     | Database management                  |

Ports 8888 and 4011 must both be accessible from the user's browser.
The browser will show a certificate warning for the self-signed TLS certificates
on both ports - accept them before using the application.

## Login Credentials

| User   | Username | Password     |
| ------ | -------- | ------------ |
| Admin  | admin    | swissforages |
| Editor | editor   | swissforages |
| Viewer | viewer   | swissforages |

pgAdmin: `pgadmin@example.com` / `PEEVEDWATER`

## Architecture

Traefik reverse proxy handles TLS termination and routing:

- Port 8888 (HTTPS): Application
  - `/api/*`, `/dataextraction/*`, `/ocr/*`, `/health` - .NET API (priority 10)
  - `/*` - React client (priority 1, catch-all)
- Port 4011 (HTTPS): OIDC mock server (all paths)

The API uses YARP internally to proxy `/api/v1/*` to the legacy Python API.

All other backend services (db, minio, api-legacy, dataextraction, ocr) are
internal only with no exposed ports.

## Folder Contents

```text
remote-deploy/
  .env                          # SERVER_HOST configuration
  docker-compose.yml            # Full stack definition
  README.md                     # This file
  config/
    oidc-mock-users.json        # Mock OIDC users
    pgadmin4-servers.json       # pgAdmin server config
  db/
    01-schema.sql               # Database schema
    02-geolcodes.sql            # Reference data
    03-data.sql                 # Seed data
```

## Notes

- HTTPS is required because browsers restrict `crypto.subtle` (needed for OIDC
  PKCE) to secure contexts. Plain HTTP only works on `localhost`.
- Both ports (8888 and 4011) use Traefik's auto-generated self-signed certificates.
  Users must accept the certificate warning for both origins in their browser.
- The API runs with `ASPNETCORE_ENVIRONMENT=Development` to allow the HTTP-based
  internal OIDC metadata address for token validation.
- The API reaches the OIDC server internally via Docker networking
  (`Auth__MetadataAddress`) for token validation, while the browser accesses it
  through Traefik with TLS on port 4011.
- Traefik overrides the client's Content-Security-Policy header and strips
  `X-Forwarded-*` headers to avoid `express-rate-limit` errors in the client's
  Express server.
- Volume names are prefixed with `remote-` to avoid conflicts with the development
  compose stack.
