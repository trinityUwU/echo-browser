#!/usr/bin/env bash
set -e

ELECTRON_VERSION="33.4.11"
ELECTRON_CACHE="$HOME/.cache/electron"
ELECTRON_ZIP="electron-v${ELECTRON_VERSION}-linux-x64.zip"
ELECTRON_URL="https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/${ELECTRON_ZIP}"

echo "[echo-browser] Installing dependencies..."
bun install

ELECTRON_BIN="node_modules/electron"
PATH_FILE="$ELECTRON_BIN/path.txt"

if [ ! -f "$PATH_FILE" ] || [ ! -x "$ELECTRON_BIN/$(cat $PATH_FILE 2>/dev/null)" ]; then
  echo "[echo-browser] Installing Electron binary..."

  mkdir -p "$ELECTRON_CACHE"
  CACHED_ZIP="$ELECTRON_CACHE/$ELECTRON_ZIP"

  if [ ! -f "$CACHED_ZIP" ]; then
    echo "[echo-browser] Downloading $ELECTRON_ZIP..."
    curl -L "$ELECTRON_URL" -o "$CACHED_ZIP"
  else
    echo "[echo-browser] Using cached $ELECTRON_ZIP"
  fi

  unzip -o "$CACHED_ZIP" -d "$ELECTRON_BIN" electron > /dev/null
  printf "electron" > "$PATH_FILE"
  chmod +x "$ELECTRON_BIN/electron"
  echo "[echo-browser] Electron binary ready."
else
  echo "[echo-browser] Electron binary already installed."
fi

echo "[echo-browser] Building..."
bun run build

echo ""
echo "[echo-browser] Done. Run with: bun run start  (or ./start.sh)"
