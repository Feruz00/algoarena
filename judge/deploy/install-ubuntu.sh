#!/usr/bin/env bash
# Production install on Ubuntu 24.04 (also inside WSL2 with systemd enabled).
# Run as root:  sudo bash deploy/install-ubuntu.sh
set -euo pipefail

apt-get update
apt-get install -y build-essential python3 fp-compiler fp-units-rtl golang-go \
  openjdk-11-jdk-headless openjdk-17-jdk-headless openjdk-21-jdk-headless \
  time curl ca-certificates isolate

# Node.js 20
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# project -> /opt/judge-system
mkdir -p /opt/judge-system
cp -r . /opt/judge-system
cd /opt/judge-system
[ -f .env ] || cp .env.example .env
sed -i 's/^SANDBOX=.*/SANDBOX=isolate/' .env
npm ci --omit=dev || npm install --omit=dev

cp deploy/judge-worker.service /etc/systemd/system/judge-worker.service
systemctl daemon-reload
systemctl enable --now judge-worker
echo "done. logs: journalctl -u judge-worker -f"
