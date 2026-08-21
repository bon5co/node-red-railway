#!/bin/sh
set -e

DATA_DIR=/data

# Railway mounts volumes owned by uid 0; the node-red user is uid 1000 and the
# stock image otherwise crash-loops (or, worse, silently fails to persist).
# Repair ownership as root, then drop privileges before starting the runtime.
if [ -d "$DATA_DIR" ]; then
    chown -R node-red:node-red "$DATA_DIR" 2>/dev/null || true
fi

echo "[railway] starting Node-RED with adminAuth enabled (user=${NODE_RED_USERNAME:-admin})"

exec su-exec node-red /usr/local/bin/node \
    /usr/src/node-red/node_modules/node-red/red.js \
    --settings /usr/src/node-red/wrapper-settings.js \
    --userDir "$DATA_DIR"
