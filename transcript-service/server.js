/**
 * Transcript microservice for the Unbiased platform — Google Cloud Run.
 *
 * Environment variables:
 *   PORT                  — set automatically by Cloud Run (8080)
 *   API_SECRET            — shared secret; mirror as TRANSCRIPT_API_SECRET on Vercel
 *   YOUTUBE_COOKIES_B64   — base64-encoded Netscape cookies file from your browser
 *                           (see README for how to export this)
 */

const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");

const execFileAsync = promisify(execFile);
const PORT = process.env.PORT || 8080;
const API_SECRET = process.env.API_SECRET || "";

// ---------------------------------------------------------------------------
// Write cookies file once at startup (if provided)
// ---------------------------------------------------------------------------

const COOKIES_PATH = "/tmp/youtube.cookies";

function initCookies() {
  const b64 = process.env.YOUTUBE_COOKIES_B64;
  if (!b64) {
    console.log("[init] No YOUTUBE_COOKIES_B64 set — running without cookies (may hit bot detection)");
    return false;
  }
  try {
    const decoded = Buffer.from(b64, "base64").toString("utf-8");
    fs.writeFileSync(COOKIES_PATH, decoded, "utf-8");
    console.log("[init] YouTube cookies written to", COOKIES_PATH);
    return true;
  } catch (err) {
    console.error("[init] Failed to decode cookies:", err.message);
    return false;
  }
}

const hasCookies = initCookies();

// ---------------------------------------------------------------------------
// Transcript extraction
// ---------------------------------------------------------------------------

async function getTranscript(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const tmpId = crypto.randomBytes(6).toString("hex");
  const tmpBase = `/tmp/yt-${tmpId}`;

  const args = [
    "--skip-download",
    "--write-subs",
    "--write-auto-subs",
    "--sub-lang", "en",
    "--sub-format", "srt",
    "--convert-subs", "srt",
    // Tell yt-dlp where Node.js lives so it can run YouTube's JS player
    "--js-runtimes", "node:/usr/local/bin/node",
    // tv + mweb clients dodge bot detection better than ios/web on Cloud Run IPs
    "--extractor-args", "youtube:player_client=tv,mweb,android,ios",
    "-o", tmpBase,
    url,
  ];

  // Attach cookies if available
  if (hasCookies && fs.existsSync(COOKIES_PATH)) {
    args.push("--cookies", COOKIES_PATH);
  }

  try {
    const { stderr } = await execFileAsync("yt-dlp", args, {
      timeout: 50_000,
    });

    if (stderr) {
      // Log warnings but don't fail — yt-dlp writes progress to stderr
      const lines = stderr.split("\n").filter(l =>
        l.includes("ERROR") || l.includes("Sign in")
      );
      if (lines.length > 0) console.warn("[yt-dlp]", lines.join("\n"));
    }

    // Find the written .srt file
    const dir = path.dirname(tmpBase);
    const prefix = path.basename(tmpBase);
    const files = fs.readdirSync(dir).filter(
      f => f.startsWith(prefix) && f.endsWith(".srt")
    );

    if (files.length === 0) return null;

    files.sort((a, b) => a.length - b.length); // prefer .en.srt over .en-orig.srt
    const srtPath = path.join(dir, files[0]);
    const srt = fs.readFileSync(srtPath, "utf-8");

    // Cleanup
    files.forEach(f => {
      try { fs.unlinkSync(path.join(dir, f)); } catch {}
    });

    const cleaned = cleanSrt(srt);
    return cleaned.length > 50 ? cleaned : null;

  } catch (err) {
    // Cleanup on failure
    try {
      const dir = path.dirname(tmpBase);
      const prefix = path.basename(tmpBase);
      fs.readdirSync(dir)
        .filter(f => f.startsWith(prefix))
        .forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
    } catch {}

    console.error(`[yt-dlp] error for ${videoId}:`, err.message);
    return null;
  }
}

function cleanSrt(srt) {
  return srt
    .replace(/^\d+\s*$/gm, "")
    .replace(/^\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->.*$/gm, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    return send(res, 200, { status: "ok", cookies: hasCookies });
  }

  if (API_SECRET) {
    const incoming = req.headers["x-api-secret"] || "";
    if (incoming !== API_SECRET) {
      return send(res, 401, { error: "Unauthorized" });
    }
  }

  const match = req.url && req.url.match(/^\/transcript\/([a-zA-Z0-9_-]{11})$/);
  if (!match) {
    return send(res, 404, { error: "Use GET /transcript/:videoId" });
  }

  const videoId = match[1];
  console.log(`[${new Date().toISOString()}] Fetching transcript for ${videoId}`);

  const transcript = await getTranscript(videoId);

  if (!transcript) {
    return send(res, 422, { error: "No transcript available for this video." });
  }

  console.log(`[${new Date().toISOString()}] Done — ${transcript.length} chars`);
  return send(res, 200, { transcript });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Transcript service listening on port ${PORT}`);
});
