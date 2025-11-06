#!/bin/bash

docker rm -f nats 2>/dev/null || true

docker run -d --name nats \
  -p 4222:4222 \
  -p 8222:8222 \
  -p 9222:9222 \
  -v "$PWD/nats/nats.conf:/etc/nats/nats.conf:ro" \
  -v "$PWD/nats-data:/data/jetstream" \
  nats:latest \
  -c /etc/nats/nats.conf
