# optimized-microservices-compose

A production-style Docker Compose setup with three services: Nginx (frontend), Node.js (API), and PostgreSQL (database).

---

## Architecture
┌─────────────────────────────────────────────┐
                    │            Docker Network: app_default 

│Browser │ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ │ │ │ │ │ │ │
│ port 8081 │ │ Nginx │ │ Node.js │ │ PostgreSQL │
└──────────────────►│ │ │────►│ API │────►│ DB │
│ │ :80 │ │ :3000 │ │ :5432 │
│ │(exposed) │ │(internal)│ │ (internal) │
│ └──────────┘ └──────────┘ └──────────────┘
│ │
│ Volume: pgdata ─────────────────────────── ┘
└─────────────────────────────────────────────┘
### Services & Ports

| Service    | Internal Port | External Port | Notes                        |
|------------|---------------|---------------|------------------------------|
| nginx      | 80            | 8081          | Reverse proxy + static files |
| api        | 3000          | none          | Internal only                |
| db         | 5432          | none          | Internal only                |

### Network
All three services share one bridge network (`app_default`) created automatically by Docker Compose. Only Nginx is reachable from outside — the API and database are internal only.

### Volume
`pgdata` is a named Docker volume mounted at `/var/lib/postgresql/data`. It survives `docker compose down` and is only removed with `docker compose down -v`.

---

## Health Check & Startup OrderThe API will not start until PostgreSQL passes `pg_isready`. This prevents connection errors on boot.

---

## API Endpoints

| Method | Endpoint        | Description               |
|--------|-----------------|---------------------------|
| GET    | /api/health     | Health check              |
| GET    | /api/hello      | Hello world               |
| GET    | /api/visits     | List last 10 DB visits    |
| POST   | /api/visits     | Record a new visit to DB  |

---

## Persistence Test

```bash
# Record some visits
curl -X POST http://localhost:8081/api/visits
curl -X POST http://localhost:8081/api/visits

# Bring everything down (containers removed, volume kept)
docker compose down

# Bring back up in detached mode
docker compose up -d

# Data is still there
curl http://localhost:8081/api/visits
```

---

## Benchmark: Build vs Cached Startup Times

### What was measured
- **Cold build** (`docker compose up --build`): builds images from scratch, no cache.
- **Pre-built** (`docker compose build` first, then `docker compose up`): images already exist, no rebuild needed.

### Results

| Run                              | Time      |
|----------------------------------|-----------|
| Cold build (`--build`)           | ~121.3s   |
| Pre-built (images cached)        | ~8.8s     |
| Difference                       | ~112.4s   |
121.3s
  Pre-built time   : 8.8s
  Time saved       : 112.4s
### Why the difference?
- Cold build downloads base images (`node:20-alpine`, `nginx:alpine`), installs npm packages, and layers the filesystem — all done from scratch.
- With pre-built images, Docker skips all of that. `docker compose up` only creates containers from the already-built images and starts them, which takes just a couple of seconds.
- This is why CI pipelines use layer caching and pre-building as a core optimization.

---

## Quick Start

```bash
# Clone
git clone https://github.com/<your-username>/optimized-microservices-compose.git
cd optimized-microservices-compose

# Build and run
docker compose up --build

# Visit
open http://localhost:8081
```

## Stop & Clean Up

```bash
docker compose down        # stop containers, keep volume
docker compose down -v     # stop containers AND delete DB volume
```
