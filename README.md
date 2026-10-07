# cloud-platform-test-app

Minimal end-to-end test application for a Cloud Platform **Git Repository** deployment flow.

## Purpose

Use this repository to validate the full pipeline:

Git Repository → clone source → detect/build Dockerfile → build container image → push/use image → deploy to Kubernetes → create Service → expose application → health check → verify the app is running.

The app is intentionally tiny: Node.js 22 and the built-in `http` module only. No frameworks, databases, Redis, frontend, Kubernetes manifests, or CI configuration.

## Architecture

| Piece | Detail |
| --- | --- |
| Runtime | Node.js (`>=20`, image uses `node:22-alpine`) |
| Server | Built-in `http` module (`server.js`) |
| Listen | `0.0.0.0` |
| Default port | `3000` (override with `PORT`) |
| Process model | Single HTTP server with graceful `SIGTERM` / `SIGINT` shutdown |

### Endpoints

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | `200` — app identity + hostname + ISO timestamp |
| `GET` | `/health` | `200` — `{ "status": "ok" }` (liveness) |
| `GET` | `/ready` | `200` — `{ "status": "ready" }` (readiness) |
| any | other | `404` — `{ "error": "not_found" }` |

## Local execution

```bash
cd cloud-platform-test-app
npm start
```

Then:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Docker build

```bash
docker build -t cloud-platform-test-app .
```

## Docker run

```bash
docker run --rm -p 3000:3000 cloud-platform-test-app
```

Optional port override:

```bash
docker run --rm -p 8080:8080 -e PORT=8080 cloud-platform-test-app
```

## curl tests

```bash
curl -sS http://localhost:3000/
curl -sS http://localhost:3000/health
curl -sS http://localhost:3000/ready
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/missing
```

Expected shapes:

```json
{
  "message": "Hello from Cloud Platform!",
  "status": "running",
  "hostname": "<container hostname>",
  "timestamp": "<ISO-8601>"
}
```

```json
{ "status": "ok" }
```

```json
{ "status": "ready" }
```

Unknown paths return HTTP `404` with `{ "error": "not_found" }`.

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `production` (in image) | Node environment |

## Health endpoints

- **Liveness:** `GET /health` → `{ "status": "ok" }`
- **Readiness:** `GET /ready` → `{ "status": "ready" }`

These are suitable for Kubernetes liveness and readiness probes.

## Expected Cloud Platform configuration

When connecting this Git repository in the Cloud Platform deployment UI, use:

| Setting | Value |
| --- | --- |
| Build Type | `Dockerfile` |
| Dockerfile Path | `./Dockerfile` |
| Build Context | `.` |
| Container Port | `3000` |
| Environment Variable | `PORT=3000` |
| Liveness endpoint | `/health` |
| Readiness endpoint | `/ready` |

The Cloud Platform owns image registry, Kubernetes Deployment/Service, networking, and exposure. This repository only provides the application source and Dockerfile.
