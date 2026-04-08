#!/usr/bin/env python3
"""
Tiny static server for this repo's frontend layout.

Routes:
- /, /index.html, /offline.html, /manifest.json, /service-worker.js -> frontend/public/*
- /src/* -> frontend/src/*

This avoids needing a bundler just to serve /public at the web root while also
allowing /src module imports.
"""

from __future__ import annotations

import argparse
import os
import posixpath
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


FRONTEND_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = FRONTEND_DIR / "public"
SRC_DIR = FRONTEND_DIR / "src"


class IntentNetHandler(SimpleHTTPRequestHandler):
    # Keep logs readable and avoid directory listing noise for "/"
    def list_directory(self, path: str):  # noqa: D401 - inherited signature
        self.send_error(404, "No directory listing")
        return None

    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        request_path = parsed.path

        # Normalize, prevent path traversal, keep leading slash semantics.
        request_path = posixpath.normpath(request_path)
        if request_path.startswith("../") or "/../" in request_path:
            return str(PUBLIC_DIR / "index.html")

        # Map known root assets to frontend/public
        if request_path in ("/", "/index.html"):
            return str(PUBLIC_DIR / "index.html")
        if request_path in ("/offline.html", "/manifest.json", "/service-worker.js"):
            return str(PUBLIC_DIR / request_path.lstrip("/"))

        # Map /src/* to frontend/src/*
        if request_path.startswith("/src/"):
            rel = request_path.removeprefix("/src/").lstrip("/")
            return str(SRC_DIR / rel)

        # Fallback: serve from public (lets relative assets work if added later)
        rel = request_path.lstrip("/")
        return str(PUBLIC_DIR / rel)

    # Good defaults for local dev
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve IntentNet frontend locally.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    if not PUBLIC_DIR.exists():
        raise SystemExit(f"Missing directory: {PUBLIC_DIR}")
    if not SRC_DIR.exists():
        raise SystemExit(f"Missing directory: {SRC_DIR}")

    # Ensure relative links work if someone adds them later.
    os.chdir(str(FRONTEND_DIR))

    httpd = ThreadingHTTPServer((args.host, args.port), IntentNetHandler)
    print(f"IntentNet frontend: http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

