# Backend deployment

The backend is built as a multi-stage Node.js container and deployed to Fly.io
only after GitHub Actions passes type-checking, compilation, a compiled-module
smoke test, and a production container build.

## Why the previous production start failed

TypeScript compiled imports such as `@/controllers/auth.controller` without
rewriting the alias. The former start command loaded `tsconfig-paths`, which
resolved the alias against `src` even though production runs JavaScript from
`dist`. The build therefore succeeded but the process failed at startup with
`MODULE_NOT_FOUND`.

The build now runs `tsc-alias` after `tsc`, rewriting aliases in `dist` to
relative paths. CI loads both the local build and the final container to catch
this failure before deployment.

The Docker image and CI runner use the current Node 24 LTS maintenance release.
The former `node:24.14.1` image also exists and was not the cause of the failed
deployment; the pin was refreshed so CI and production use the same current
runtime.

## Fly.io application configuration

`fly.toml` configures:

- Singapore as the primary region.
- One `shared-cpu-1x` Machine with 512 MB RAM.
- Port 8080 and HTTPS enforcement.
- Scale-to-zero with automatic startup.
- A `/health` HTTP check.
- Non-sensitive production environment variables.

Create these application secrets in Fly.io; never commit them:

```text
DB_URI
REDIS_URL
ACCESS_TOKEN_SECRET
```

Example:

```powershell
fly secrets set -a <app-name> `
  DB_URI="mongodb+srv://..." `
  REDIS_URL="redis://..." `
  ACCESS_TOKEN_SECRET="..."
```

The Fly-managed Upstash private URL uses `redis://`. A public Upstash endpoint
uses `rediss://`.

## GitHub Actions configuration

In the GitHub repository, open **Settings > Secrets and variables > Actions**.

Create this repository variable:

```text
FLY_APP_NAME=<your Fly application name>
```

Create this repository secret:

```text
FLY_API_TOKEN=<app-scoped Fly deploy token>
```

Generate the token locally after authenticating with Fly:

```powershell
fly tokens create deploy -a <app-name>
```

Pull requests run validation only. Pushes to `main` run validation and then
deploy. A failed deployment prints Fly status, release history, and recent logs
into the GitHub Actions job.

If the app was originally connected through Fly's GitHub dashboard, disable
that dashboard auto-deploy after enabling this workflow. Otherwise both Fly and
GitHub Actions can deploy the same commit independently.

## MongoDB Atlas network access

The server connects to MongoDB and Redis before it starts listening. A blocked
database connection therefore appears in Fly as a failed startup or failed
health check, even when the image built successfully.

Fly Machines do not have a stable outbound IP by default. For a small demo, an
Atlas network rule allowing access from anywhere can be used temporarily if the
database account has a strong, least-privilege password. The stricter option is
to allocate an app-scoped Fly egress IP in `sin` and allowlist it in Atlas:

```powershell
fly ips allocate-egress -a <app-name> -r sin
```

## Local verification

```powershell
yarn ci
docker build -t achievable-be:local .
```

Manual deployment remains available:

```powershell
fly deploy --remote-only -a <app-name>
```

Useful diagnostics:

```powershell
fly status -a <app-name>
fly checks list -a <app-name>
fly releases -a <app-name>
fly logs -a <app-name>
```
