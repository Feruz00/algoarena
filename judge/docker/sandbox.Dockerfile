# Image used by the Docker sandbox: contains every compiler / runtime.
# Build:  docker build -f docker/sandbox.Dockerfile -t judge-sandbox:latest .
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      g++ python3 fp-compiler fp-units-rtl golang-go \
      openjdk-11-jdk-headless openjdk-17-jdk-headless openjdk-21-jdk-headless \
      time bash ca-certificates \
 && rm -rf /var/lib/apt/lists/*
# uid 1000 exists in ubuntu:24.04 ("ubuntu"); the sandbox runs as 1000:1000
