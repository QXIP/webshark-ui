<img src=https://github.com/RFbkak37y3kIY/webshark/assets/1423657/e769fcbf-d83b-4d07-8e86-c9b5706ad5ee width=180>

# webshark-ui

_User-Interface builder for [**webShark**](https://github.com/QXIP/webshark), a *Wireshark-like* webapp_ 🕵️

<img src="https://github.com/QXIP/webshark/assets/1423657/092c2544-f5db-4a79-b3da-d48df4e0813c" width=600 />

## Distribution (GitHub releases)

Tagged releases attach two static builds:

| Asset | Build | `environment.kiosk` | Typical use |
|-------|--------|---------------------|-------------|
| **`latest_raw.zip`** | `npm run build` (production) | `false` | Full UI: file browser, uploads, standard layout |
| **`latest.zip`** | `npm run build:kiosk` | `true` | Embedded / kiosk: file UI hidden, compact layout |

```bash
# Standard (non-kiosk) — see #18
wget https://github.com/QXIP/webshark-ui/releases/latest/download/latest_raw.zip

# Kiosk build (same as historical releases before dual artifacts)
wget https://github.com/QXIP/webshark-ui/releases/latest/download/latest.zip
```

Release **1.0.4** only ships `latest.zip` (kiosk). For non-kiosk at that tag, build from source below.

## Build from source

Requirements: **Node.js 20.x**, npm.

```bash
git clone https://github.com/QXIP/webshark-ui.git
cd webshark-ui
npm install
```

**Standard (non-kiosk)** — output in `dist/webshark/`:

```bash
npm run build
```

**Kiosk**:

```bash
npm run build:kiosk
```

**Exact release tag (e.g. v1.0.4)**:

```bash
git checkout 1.0.4   # or tags/1.0.4
npm install
npm run build        # non-kiosk
# npm run build:kiosk  # kiosk instead
```

Serve the built files behind your WebShark backend (API under `/webshark/`). For local dev:

```bash
npm start            # standard
npm run start:kiosk  # kiosk configuration
```

Kiosk mode is controlled at compile time via `src/environments/environment.kiosk.ts` (see `angular.json` → `configurations.kiosk`).

### License
Released under the AGPLv3 License.<br>
Copyright by QXIP BV, Some rights Reserved.
