"""
Transcript microservice (Python) — drop-in replacement for the Node version.

Endpoints:
  GET  /              -> health
  GET  /health        -> health
  GET  /transcript/:videoId  -> { "transcript": "..." }   (200)
                                { "error": "..." }        (4xx/5xx)

Env vars:
  PORT                 -- bound port (default 8080, Cloud Run sets it)
  API_SECRET           -- if set, requests must send header x-api-secret: <value>
  YOUTUBE_COOKIES_B64  -- optional base64-encoded Netscape cookies.txt
  PROXY_URL            -- optional, e.g. http://user:pass@host:port (residential proxy)

Fallback order:
  1. youtube-transcript-api  (fast, pure Python, no binary)
  2. yt-dlp                   (robust, supports cookies + proxy)
"""

import base64
import logging
import os
import re
import subprocess
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
log = logging.getLogger("transcript")

API_SECRET = os.environ.get("API_SECRET", "")
PROXY_URL = os.environ.get("PROXY_URL", "")
COOKIES_PATH = "/tmp/youtube.cookies"
VIDEO_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{11}$")


def init_cookies() -> bool:
    b64 = os.environ.get("YOUTUBE_COOKIES_B64")
    if not b64:
        log.info("[init] no YOUTUBE_COOKIES_B64 — running without cookies")
        return False
    try:
        Path(COOKIES_PATH).write_bytes(base64.b64decode(b64))
        log.info("[init] cookies written to %s", COOKIES_PATH)
        return True
    except Exception as e:
        log.error("[init] cookie decode failed: %s", e)
        return False


HAS_COOKIES = init_cookies()


def fetch_via_api(video_id: str) -> str | None:
    """Pure-Python Innertube fetch. Fast but blocked on datacenter IPs without proxy."""
    try:
        kwargs = {}
        if PROXY_URL:
            kwargs["proxies"] = {"http": PROXY_URL, "https": PROXY_URL}
        if HAS_COOKIES:
            kwargs["cookies"] = COOKIES_PATH

        segments = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"], **kwargs)
        text = " ".join(s["text"].strip() for s in segments if s.get("text"))
        text = re.sub(r"\s{2,}", " ", text).strip()
        return text if len(text) > 50 else None
    except (NoTranscriptFound, TranscriptsDisabled, VideoUnavailable) as e:
        log.info("[api] no transcript for %s: %s", video_id, type(e).__name__)
        return None
    except Exception as e:
        log.warning("[api] error for %s: %s", video_id, e)
        return None


def fetch_via_ytdlp(video_id: str) -> str | None:
    """Run yt-dlp to write SRT, then clean it. Supports cookies + proxy."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    with tempfile.TemporaryDirectory() as tmp:
        out_base = os.path.join(tmp, "yt")
        args = [
            "yt-dlp",
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-lang", "en",
            "--sub-format", "srt",
            "--convert-subs", "srt",
            "--extractor-args", "youtube:player_client=tv,mweb,android,ios",
            "-o", out_base,
            url,
        ]
        if HAS_COOKIES and os.path.exists(COOKIES_PATH):
            args += ["--cookies", COOKIES_PATH]
        if PROXY_URL:
            args += ["--proxy", PROXY_URL]

        try:
            subprocess.run(args, capture_output=True, timeout=50, check=False)
        except subprocess.TimeoutExpired:
            log.error("[yt-dlp] timeout for %s", video_id)
            return None

        srts = sorted(Path(tmp).glob("yt*.srt"), key=lambda p: len(p.name))
        if not srts:
            return None

        srt = srts[0].read_text(encoding="utf-8", errors="ignore")
        cleaned = clean_srt(srt)
        return cleaned if len(cleaned) > 50 else None


def clean_srt(srt: str) -> str:
    srt = re.sub(r"^\d+\s*$", "", srt, flags=re.MULTILINE)
    srt = re.sub(r"^\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->.*$", "", srt, flags=re.MULTILINE)
    srt = re.sub(r"<[^>]*>", "", srt)
    srt = re.sub(r"\[.*?\]", "", srt)
    srt = srt.replace("&#39;", "'").replace("&quot;", '"').replace("&amp;", "&")
    lines = [l.strip() for l in srt.splitlines() if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(lines)).strip()


def get_transcript(video_id: str) -> str | None:
    log.info("[fetch] %s — trying youtube-transcript-api", video_id)
    text = fetch_via_api(video_id)
    if text:
        log.info("[fetch] %s — api success (%d chars)", video_id, len(text))
        return text

    log.info("[fetch] %s — falling back to yt-dlp", video_id)
    text = fetch_via_ytdlp(video_id)
    if text:
        log.info("[fetch] %s — yt-dlp success (%d chars)", video_id, len(text))
        return text

    return None


# ---------------------------------------------------------------------------

app = Flask(__name__)


@app.get("/")
@app.get("/health")
def health():
    return jsonify(status="ok", cookies=HAS_COOKIES, proxy=bool(PROXY_URL))


@app.get("/transcript/<video_id>")
def transcript(video_id: str):
    if API_SECRET and request.headers.get("x-api-secret", "") != API_SECRET:
        return jsonify(error="Unauthorized"), 401

    if not VIDEO_ID_RE.match(video_id):
        return jsonify(error="Invalid video id"), 400

    text = get_transcript(video_id)
    if not text:
        return jsonify(error="No transcript available for this video."), 422

    return jsonify(transcript=text)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
