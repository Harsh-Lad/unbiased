/**
 * Fetch a YouTube transcript via the external Python transcript service.
 * The service is configured with TRANSCRIPT_API_URL (and optional TRANSCRIPT_API_SECRET).
 *
 * Returns:
 *   - string: cleaned transcript text
 *   - null:   service responded that no captions are available (422)
 * Throws on network/auth/server errors so the caller can surface a generic retry message.
 */

const REQUEST_TIMEOUT_MS = 60_000;

export async function fetchTranscriptFromService(
  videoId: string
): Promise<string | null> {
  const apiUrl = process.env.TRANSCRIPT_API_URL;
  if (!apiUrl) {
    throw new Error("TRANSCRIPT_API_URL is not configured.");
  }

  const secret = process.env.TRANSCRIPT_API_SECRET || "";
  const url = `${apiUrl.replace(/\/$/, "")}/transcript/${videoId}`;

  const res = await fetch(url, {
    headers: secret ? { "x-api-secret": secret } : {},
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  // 422 = no captions available for this video — a normal "not found" outcome.
  if (res.status === 422) return null;

  if (!res.ok) {
    throw new Error(`Transcript service returned ${res.status}`);
  }

  const data = (await res.json()) as { transcript?: string };
  const text = data.transcript?.trim();
  return text && text.length > 20 ? text : null;
}
