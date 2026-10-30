# Node-RED on Railway — editor locked before the first request

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/node-red-or-just-updated-flow-automation?referralCode=Z1xivh&utm_medium=integration&utm_source=template&utm_campaign=generic)

**Deploy on Railway:** [Node-RED template](https://railway.com/deploy/node-red-or-just-updated-flow-automation?referralCode=Z1xivh&utm_medium=integration&utm_source=template&utm_campaign=generic)

A Railway wrapper for [Node-RED](https://nodered.org) that closes the admin API
**before the public URL ever serves a request**, pins the runtime, and repairs
the Railway volume so flows and credentials actually persist.

## Why this exists

The stock `nodered/node-red` image serves the admin HTTP API with **no
authentication**. On a public URL that means anyone who has the link can:

- rewrite your flows (`POST /flows`), and
- install arbitrary npm packages (`POST /nodes`) — which on a tool that runs
  JavaScript in function nodes is remote code execution.

Node-RED does **not** read `NODE_RED_PASSWORD` / `NODE_RED_USERNAME` /
`NODE_RED_CREDENTIAL_SECRET` on its own; those names only do anything if a
`settings.js` wires them into `adminAuth`. The marketplace listings that publish
those variables ship no such `settings.js`, so the editor is open regardless of
what you type into the deploy form. This image ships the `settings.js`, so the
first request the public URL serves is already behind a login.

Reproduced on a live control of the leading template (official image, same as
this one's base): anonymous `POST /flows` → **200** and anonymous `POST /nodes`
→ **200**. On this image both return **401**.

## What it does

- **`adminAuth` on by default**, wired to `NODE_RED_USERNAME` /
  `NODE_RED_PASSWORD` (bcrypt-hashed at boot). **Refuses to start** if
  `NODE_RED_PASSWORD` or `NODE_RED_CREDENTIAL_SECRET` is empty.
- **Password rotation by redeploy** — the hash is recomputed from the
  environment every boot, so changing the variable and redeploying resets the
  login. Node-RED has no other reset path.
- **Stable `credentialSecret`** from the environment, so encrypted node
  credentials still decrypt after a redeploy (a fresh random secret each boot
  would silently break them).
- **Volume repaired** — Railway mounts the volume as uid 0; the entrypoint
  chowns `/data` to the `node-red` user as root, then drops privileges with
  `su-exec`. No `RAILWAY_RUN_UID=0` needed.
- **Pinned** to `nodered/node-red:5.0.4` against the incumbents' moving `latest`.
- **`$PORT` honoured**; the settings file binds Railway's injected port.

HTTP-node endpoints stay open — that is the point of deployed HTTP routes; it is
only the editor and admin API that `adminAuth` closes.

## Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_RED_PASSWORD` | yes | — | Editor login password (plaintext; hashed at boot). |
| `NODE_RED_CREDENTIAL_SECRET` | yes | — | Encrypts stored node credentials. Keep it stable. |
| `NODE_RED_USERNAME` | no | `admin` | Editor login username. |

Data (flows, credentials, installed palette nodes) persists on a volume at
`/data`.

## Image

`ghcr.io/bon5co/node-red-railway:5.0.4`
