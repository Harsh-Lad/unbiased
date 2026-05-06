/**
 * Transcript microservice for the Unbiased platform.
 * Deployed on Google Cloud Run.
 *
 * Environment variables:
 *   PORT        — set automatically by Cloud Run (8080)
 *   API_SECRET  — shared secret; set the same value as TRANSCRIPT_API_SECRET on Vercel
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
// Transcript extraction
// ---------------------------------------------------------------------------

async function getTranscript(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const tmpId = crypto.randomBytes(6).toString("hex");
  const tmpBase = `/tmp/yt-${tmpId}`;

  try {
    // Ask yt-dlp to write subtitles (manual CC first, then auto-generated)
    await execFileAsync("yt-dlp", [
      "--skip-download",
      "--write-subs",
      "--write-auto-subs",
      "--sub-lang", "en",
      "--sub-format", "srt",
      "--convert-subs", "srt",
      "-o", tmpBase,
      url,
    ], { timeout: 50_000 });

    // Find whichever .srt file was written
    const dir = path.dirname(tmpBase);
    const prefix = path.basename(tmpBase);
    const files = fs.readdirSync(dir).filter(
      f => f.startsWith(prefix) && f.endsWith(".srt")
    );

    if (files.length === 0) return null;

    // Prefer the shortest filename (e.g. .en.srt over .en-orig.srt)
    files.sort((a, b) => a.length - b.length);
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

    console.error(`yt-dlp error for ${videoId}:`, err.message);
    return null;
  }
}

function cleanSrt(srt) {
  return srt
    .replace(/^\d+\s*$/gm, "")                              // sequence numbers
    .replace(/^\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->.*$/gm, "") // timestamps
    .replace(/<[^>]*>/g, "")                                 // html tags
    .replace(/\[.*?\]/g, "")                                 // [Music] etc.
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
  // Health check — Cloud Run uses this to verify the container is up
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    return send(res, 200, { status: "ok" });
  }

  // Auth
  if (API_SECRET) {
    const incoming = req.headers["x-api-secret"] || "";
    if (incoming !== API_SECRET) {
      return send(res, 401, { error: "Unauthorized" });
    }
  }

  // GET /transcript/:videoId
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
