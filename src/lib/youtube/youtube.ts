import { YoutubeTranscript } from "youtube-transcript";

export function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    // Check if the URL is just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
        return url.trim();
    }

    return null;
}

export async function fetchTranscript(
    videoId: string
): Promise<{ text: string; offset: number; duration: number }[]> {
    try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        return transcriptItems.map((item) => ({
            text: item.text,
            offset: item.offset,
            duration: item.duration,
        }));
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to fetch transcript for video ${videoId}: ${message}. ` +
            `This video may not have available captions/subtitles.`
        );
    }
}

export function cleanTranscript(
    segments: { text: string; offset: number; duration: number }[]
): string {
    return segments
        .map((segment) =>
            segment.text
                .replace(/\[.*?\]/g, "") // Remove things like [Music], [Applause]
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/<[^>]*>/g, "") // Remove HTML tags
                .trim()
        )
        .filter((text) => text.length > 0)
        .join(" ");
}

export function getVideoEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function getVideoThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
