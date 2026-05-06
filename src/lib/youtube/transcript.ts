/**
 * YouTube transcript fetcher with multiple fallback methods.
 * 1. External transcript API (yt-dlp based, most reliable)
 * 2. Innertube ANDROID client
 * 3. Web page scraping
 */

const ANDROID_UA = "com.google.android.youtube/20.10.38 (Linux; U; Android 11)";
const IOS_UA = "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X)";
const WEB_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const PLAYER_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
}

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Fetch transcript for a YouTube video using all available methods.
 */
export async function fetchYouTubeTranscript(
  videoId: string,
  lang: string = "en"
): Promise<TranscriptSegment[]> {
  // Method 1: External transcript API (if configured)
  const apiUrl = process.env.TRANSCRIPT_API_URL;
  if (apiUrl) {
    try {
      const segments = await fetchViaExternalApi(videoId, apiUrl);
      if (segments && segments.length > 0) return segments;
    } catch {
      // Continue to next method
    }
  }

  // Method 2: ANDROID Innertube client
  let tracks = await getTracksViaAndroid(videoId);

  // Method 3: IOS Innertube client
  if (!tracks || tracks.length === 0) {
    tracks = await getTracksViaIos(videoId);
  }

  // Method 4: Web page scraping
  if (!tracks || tracks.length === 0) {
    tracks = await getTracksViaWeb(videoId);
  }

  if (!tracks || tracks.length === 0) {
    throw new Error("No caption tracks available for this video.");
  }

  const track = tracks.find((t) => t.languageCode === lang) || tracks[0];

  const segments = await fetchTranscriptXml(track.baseUrl);
  if (segments.length > 0) return segments;

  const srv3Segments = await fetchTranscriptSrv3(track.baseUrl);
  if (srv3Segments.length > 0) return srv3Segments;

  throw new Error("Transcript content is empty for this video.");
}

async function fetchViaExternalApi(
  videoId: string,
  apiUrl: string
): Promise<TranscriptSegment[]> {
  const secret = process.env.TRANSCRIPT_API_SECRET || "";
  const url = `${apiUrl.replace(/\/$/, "")}/transcript/${videoId}`;

  const res = await fetch(url, {
    headers: secret ? { "x-api-secret": secret } : {},
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return [];

  const data = await res.json() as { transcript?: string };
  if (!data.transcript) return [];

  // Convert plain text to a single segment
  return [{
    text: data.transcript,
    offset: 0,
    duration: 0,
  }];
}

async function getTracksViaAndroid(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const res = await fetch(PLAYER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ANDROID_UA,
        "X-YouTube-Client-Name": "3",
        "X-YouTube-Client-Version": "20.10.38",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
            androidSdkVersion: 31,
            hl: "en",
            gl: "US",
          },
        },
        videoId,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    return Array.isArray(tracks) && tracks.length > 0 ? tracks : null;
  } catch {
    return null;
  }
}

async function getTracksViaIos(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const res = await fetch(PLAYER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": IOS_UA,
        "X-YouTube-Client-Name": "5",
        "X-YouTube-Client-Version": "20.10.4",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "IOS",
            clientVersion: "20.10.4",
            deviceMake: "Apple",
            deviceModel: "iPhone16,2",
            osName: "iPhone",
            osVersion: "18.3.2.22D82",
            hl: "en",
            gl: "US",
          },
        },
        videoId,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    return Array.isArray(tracks) && tracks.length > 0 ? tracks : null;
  } catch {
    return null;
  }
}

async function getTracksViaWeb(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": WEB_UA,
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "CONSENT=PENDING+987",
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    if (html.includes('class="g-recaptcha"')) {
      throw new Error("YouTube is rate-limiting requests. Please try again later.");
    }

    // Try multiple patterns — YouTube changes embedding format periodically
    const patterns = [
      /var ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:\s*(?:var|const|let)\s|\s*<\/script>)/,
      /ytInitialPlayerResponse\s*=\s*(\{.+?\});/,
      /"playerResponse"\s*:\s*"(\{.+?\})"/,
    ];
    let player: Record<string, unknown> | null = null;
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m) {
        try {
          const raw = pat.source.includes('"playerResponse"') ? JSON.parse(m[1]) : m[1];
          player = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(m[1]);
          break;
        } catch { /* try next */ }
      }
    }
    if (!player) return null;
    const tracks = (player as { captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } } })
      ?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    return Array.isArray(tracks) && tracks.length > 0 ? tracks : null;
  } catch (e) {
    if (e instanceof Error && e.message.includes("rate-limiting")) throw e;
    return null;
  }
}

async function fetchTranscriptXml(baseUrl: string): Promise<TranscriptSegment[]> {
  try {
    const res = await fetch(baseUrl, { headers: { "User-Agent": WEB_UA } });
    if (!res.ok) return [];

    const xml = await res.text();
    if (!xml || xml.length === 0) return [];

    const segments: TranscriptSegment[] = [];
    const regex = /<text\s+start="([^"]*)"(?:\s+dur="([^"]*)")?[^>]*>([\s\S]*?)<\/text>/g;
    let m;

    while ((m = regex.exec(xml)) !== null) {
      const text = decodeEntities(m[3]).replace(/<[^>]+>/g, "").trim();
      if (text) {
        segments.push({
          text,
          offset: Math.round(parseFloat(m[1]) * 1000),
          duration: Math.round(parseFloat(m[2] || "0") * 1000),
        });
      }
    }

    return segments;
  } catch {
    return [];
  }
}

async function fetchTranscriptSrv3(baseUrl: string): Promise<TranscriptSegment[]> {
  try {
    const url = baseUrl.includes("fmt=") ? baseUrl : baseUrl + "&fmt=srv3";
    const res = await fetch(url, { headers: { "User-Agent": WEB_UA } });
    if (!res.ok) return [];

    const xml = await res.text();
    if (!xml || xml.length === 0) return [];

    const segments: TranscriptSegment[] = [];
    const regex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let m;

    while ((m = regex.exec(xml)) !== null) {
      let text = "";
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let sMatch;
      while ((sMatch = sRegex.exec(m[3])) !== null) {
        text += sMatch[1];
      }
      if (!text) text = m[3].replace(/<[^>]+>/g, "");
      text = decodeEntities(text).trim();

      if (text) {
        segments.push({
          text,
          offset: parseInt(m[1], 10),
          duration: parseInt(m[2], 10),
        });
      }
    }

    return segments;
  } catch {
    return [];
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}
