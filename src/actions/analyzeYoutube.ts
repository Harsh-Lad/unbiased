"use server";

import { extractVideoId, cleanTranscript } from "@/lib/youtube/youtube";
import { fetchYouTubeTranscript } from "@/lib/youtube/transcript";
import { fetchSubtitlesWithYtDlp, downloadAudioBuffer } from "@/lib/youtube/audio";
import { transcribeAudioWithGemini } from "@/lib/youtube/transcribe";
import { analyzeText, analyzeYoutubeWithGrok, detectProvider, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt } from "@/lib/ai/prompts";
import { shouldSummarize, buildSummarizationPrompt } from "@/lib/pdf/pdf";

interface AnalyzeYoutubeResult {
    success: boolean;
    data?: AnalysisResult;
    videoId?: string;
    error?: string;
}

export async function analyzeYoutubeAction(
    url: string
): Promise<AnalyzeYoutubeResult> {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return { success: false, error: "API key is not configured. Please set API_KEY in your .env file." };
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return { success: false, error: "Invalid YouTube URL. Please paste a valid YouTube video link." };
        }

        // Grok can process YouTube URLs natively — skip transcript extraction entirely
        if (detectProvider(apiKey) === "xai") {
            const systemPrompt = buildFullPrompt();
            const rawAnalysis = await analyzeYoutubeWithGrok(systemPrompt, url, apiKey);
            const result = parseAnalysisResponse(rawAnalysis);
            return { success: true, data: result, videoId };
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
            return {
                success: false,
                error:
                    "Could not extract a transcript from this video. " +
                    "Try a different video, or run the app locally where yt-dlp is available for full support.",
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

        return { success: true, data: result, videoId };
    } catch (error) {
        console.error("YouTube analysis error:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
