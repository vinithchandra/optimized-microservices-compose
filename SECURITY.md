# Security Posture

## Container Hardening
- API runs as non-root user (node:1000)
- Nginx runs as non-root user (nginx)
- Both images use Alpine base (minimal attack surface)
- Alpine packages upgraded to latest on every build (`apk upgrade --no-cache`)

## Dependency Security
- npm overrides enforce patched versions of vulnerable transitive dependencies
- Production builds use `--omit=dev` to exclude dev tooling

## Secret Management
- No secrets baked into images
- Secrets passed via environment variables at runtime
- .env files excluded from build context via .dockerignore

## Vulnerability Scanning
- Trivy scans run automatically on every push and PR via GitHub Actions
- Builds fail on any HIGH or CRITICAL CVE (`--exit-code 1`)
- Secret scanning runs on every build (`scanners: secret`)

## Scan Results (latest)
- app-api:latest    → HIGH: 0, CRITICAL: 0
- app-nginx:latest  → HIGH: 0, CRITICAL: 0
- Last scanned: $(date +%Y-%m-%d)
