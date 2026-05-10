/**
 * Fetch a YouTube transcript via the transcriptapi.com service.
 * The service is configured with TRANSCRIPT_API_KEY.
 *
 * Returns:
 *   - string: cleaned transcript text
 *   - null:   service responded that no captions are available (404)
 * Throws on network/auth/server errors so the caller can surface a generic retry message.
 */

const REQUEST_TIMEOUT_MS = 60_000;

export async function fetchTranscriptFromService(
  videoId: string
): Promise<string | null> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    throw new Error("TRANSCRIPT_API_KEY is not configured.");
  }

  const url = `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodeURIComponent(videoId)}&format=text&include_timestamp=false`;

  const res = await fetch(url, {
    headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  // 404 = no captions available for this video or video not found
  if (res.status === 404) return null;

  if (!res.ok) {
    let errorDetail = "";
    try {
        const errJson = await res.json();
        errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (e) {
        // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(`Transcript service returned ${res.status}: ${errorDetail}`);
  }

  const data = (await res.json()) as { transcript?: string };
  const text = data.transcript?.trim();
  return text && text.length > 20 ? text : null;
}
