import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { readFile, unlink, readdir } from "fs/promises";
import { randomBytes } from "crypto";

const execFileAsync = promisify(execFile);
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

/**
 * Check if yt-dlp is available on the system.
 */
async function isYtDlpAvailable(): Promise<boolean> {
  try {
    await execFileAsync("yt-dlp", ["--version"], { timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract English subtitles using yt-dlp.
 * Returns cleaned transcript text or null if unavailable.
 */
export async function fetchSubtitlesWithYtDlp(
  videoId: string
): Promise<string | null> {
  if (!(await isYtDlpAvailable())) {
    return null;
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const id = randomBytes(6).toString("hex");
  const tmpDir = tmpdir();
  const tmpBase = join(tmpDir, `yt-sub-${id}`);

  try {
    await execFileAsync("yt-dlp", [
      "--skip-download",
      "--write-subs",
      "--write-auto-subs",
      "--sub-lang", "en,en-en,en-orig",
      "--sub-format", "srt",
      "--convert-subs", "srt",
      "-o", tmpBase,
      url,
    ], { timeout: 45_000 });

    // Find the generated .srt file (filename varies: .en.srt, .en-en.srt, etc.)
    const files = await readdir(tmpDir);
    const srtFile = files
      .filter(f => f.startsWith(`yt-sub-${id}`) && f.endsWith(".srt"))
      .sort((a, b) => a.length - b.length)[0]; // prefer shortest name (en over en-en)

    if (!srtFile) return null;

    const srtPath = join(tmpDir, srtFile);
    const srt = await readFile(srtPath, "utf-8");

    // Cleanup all generated files
    for (const f of files.filter(fn => fn.startsWith(`yt-sub-${id}`))) {
      await unlink(join(tmpDir, f)).catch(() => {});
    }

    const cleaned = cleanSrtText(srt);
    return cleaned.length > 20 ? cleaned : null;
  } catch {
    // Cleanup on failure
    try {
      const files = await readdir(tmpDir);
      for (const f of files.filter(fn => fn.startsWith(`yt-sub-${id}`))) {
        await unlink(join(tmpDir, f)).catch(() => {});
      }
    } catch { /* ignore */ }
    return null;
  }
}

/**
 * Download audio buffer using yt-dlp.
 */
export async function downloadAudioBuffer(
  videoId: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const { stdout } = await execFileAsync("yt-dlp", [
    "-f", "ba[ext=m4a]/ba",
    "--max-filesize", "20M",
    "-o", "-",
    url,
  ], {
    timeout: 120_000,
    maxBuffer: MAX_AUDIO_SIZE + 1024 * 1024,
    encoding: "buffer" as BufferEncoding,
  });

  const buffer = Buffer.from(stdout);

  if (buffer.length === 0) {
    throw new Error("Failed to download audio. The video may be restricted or unavailable.");
  }

  if (buffer.length > MAX_AUDIO_SIZE) {
    throw new Error("Audio file too large for transcription (>20MB). Try a shorter video.");
  }

  return { buffer, mimeType: "audio/mp4" };
}

/**
 * Clean SRT subtitle text — remove timestamps, sequence numbers, and tags.
 */
function cleanSrtText(srt: string): string {
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
