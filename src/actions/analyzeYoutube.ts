"use server";

import { headers } from "next/headers";
import { extractVideoId, cleanTranscript } from "@/lib/youtube/youtube";
import { fetchYouTubeTranscript } from "@/lib/youtube/transcript";
import { fetchSubtitlesWithYtDlp, downloadAudioBuffer } from "@/lib/youtube/audio";
import { transcribeAudioWithGemini } from "@/lib/youtube/transcribe";
import { analyzeText, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt } from "@/lib/ai/prompts";
import { shouldSummarize, buildSummarizationPrompt } from "@/lib/pdf/pdf";
import { logAnalysis } from "@/lib/history/store";

async function getRequestMeta() {
    const h = await headers();
    return {
        ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || undefined,
        userAgent: h.get("user-agent") || undefined,
    };
}

type AnalyzeYoutubeErrorCode =
    | "INVALID_URL"
    | "NO_API_KEY"
    | "NO_TRANSCRIPT"
    | "RATE_LIMITED"
    | "UNKNOWN";

interface AnalyzeYoutubeResult {
    success: boolean;
    data?: AnalysisResult;
    videoId?: string;
    error?: string;
    errorCode?: AnalyzeYoutubeErrorCode;
}

export async function analyzeYoutubeAction(
    url: string
): Promise<AnalyzeYoutubeResult> {
    const meta = await getRequestMeta();
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return {
                success: false,
                errorCode: "NO_API_KEY",
                error: "API key is not configured. Please set API_KEY in your .env file.",
            };
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            await logAnalysis({ kind: "youtube", input: url, success: false, errorCode: "INVALID_URL", ...meta });
            return {
                success: false,
                errorCode: "INVALID_URL",
                error: "Invalid YouTube URL. Please paste a valid YouTube video link.",
            };
        }

        let transcript: string | null = null;

        // Step 1: Try yt-dlp subtitles (most reliable, works locally)
        transcript = await fetchSubtitlesWithYtDlp(videoId);

        // Step 2: Try Innertube API transcript (works on Vercel, no binary needed)
        if (!transcript) {
            try {
                const segments = await fetchYouTubeTranscript(videoId);
                if (segments && segments.length > 0) {
                    transcript = cleanTranscript(segments);
                }
            } catch {
                // Continue to next fallback
            }
        }

        // Step 3: Fall back to audio extraction + Gemini transcription
        if (!transcript) {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (!geminiKey) {
                return {
                    success: false,
                    error:
                        "Could not extract subtitles for this video. Add a free Gemini API key (GEMINI_API_KEY) " +
                        "to your .env.local file to enable audio transcription. " +
                        "Get one at https://aistudio.google.com/apikey",
                };
            }

            try {
                const { buffer, mimeType } = await downloadAudioBuffer(videoId);
                transcript = await transcribeAudioWithGemini(buffer, mimeType, geminiKey);
            } catch {
                // yt-dlp not available (e.g. on Vercel) or download failed
            }
        }

        if (!transcript) {
            await logAnalysis({ kind: "youtube", input: url, videoId, success: false, errorCode: "NO_TRANSCRIPT", ...meta });
            return {
                success: false,
                errorCode: "NO_TRANSCRIPT",
                videoId,
                error:
                    "This video has no captions or transcript available. " +
                    "Pick a video that shows the 'CC' button on YouTube, or one with manual subtitles.",
            };
        }

        // If transcript is very large, summarize first
        if (shouldSummarize(transcript)) {
            const summaryPrompt = buildSummarizationPrompt(transcript);
            transcript = await analyzeText(
                "You are a document summarizer. Preserve key arguments, claims, and notable language choices.",
                summaryPrompt,
                apiKey
            );
        }

        // Run bias analysis
        const systemPrompt = buildFullPrompt();
        const rawAnalysis = await analyzeText(
            systemPrompt,
            `Please analyze the following YouTube video transcript for bias and framing:\n\n${transcript}`,
            apiKey
        );

        const result = parseAnalysisResponse(rawAnalysis);

        await logAnalysis({ kind: "youtube", input: url, videoId, success: true, ...meta });
        return { success: true, data: result, videoId };
    } catch (error) {
        console.error("YouTube analysis error:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        const code: AnalyzeYoutubeErrorCode = message.toLowerCase().includes("rate")
            ? "RATE_LIMITED"
            : "UNKNOWN";
        await logAnalysis({ kind: "youtube", input: url, success: false, errorCode: code, ...meta });
        return { success: false, errorCode: code, error: message };
    }
}
