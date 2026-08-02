#!/bin/bash

echo "============================================"
echo "  Docker Compose Startup Benchmark"
echo "============================================"

echo ""
echo ">>> Step 1: Cleaning up any running containers..."
docker compose down -v 2>/dev/null

echo ""
echo ">>> Step 2: COLD BUILD (no cache) — docker compose up --build"
docker rmi $(docker images -q) 2>/dev/null || true

START=$(date +%s%N)
docker compose up --build -d
END=$(date +%s%N)

COLD=$(( (END - START) / 1000000 ))
echo ""
echo "✅ Cold build time: ${COLD}ms ($(( COLD / 1000 )).$(( (COLD % 1000) / 100 ))s)"

echo ""
echo ">>> Step 3: Stopping containers (keeping images)..."
docker compose down

echo ""
echo ">>> Step 4: PRE-BUILT — docker compose build first, then docker compose up"
docker compose build

START=$(date +%s%N)
docker compose up -d
END=$(date +%s%N)

PREBUILT=$(( (END - START) / 1000000 ))
echo ""
echo "✅ Pre-built startup time: ${PREBUILT}ms ($(( PREBUILT / 1000 )).$(( (PREBUILT % 1000) / 100 ))s)"

DIFF=$(( COLD - PREBUILT ))
echo ""
echo "============================================"
echo "  RESULTS"
echo "============================================"
echo "  Cold build time  : $(( COLD / 1000 )).$(( (COLD % 1000) / 100 ))s"
echo "  Pre-built time   : $(( PREBUILT / 1000 )).$(( (PREBUILT % 1000) / 100 ))s"
echo "  Time saved       : $(( DIFF / 1000 )).$(( (DIFF % 1000) / 100 ))s"
echo "============================================"
echo ""
echo ">>> Update your README.md with these numbers!"

docker compose down
