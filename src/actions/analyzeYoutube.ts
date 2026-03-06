"use server";

import { extractVideoId, fetchTranscript, cleanTranscript } from "@/lib/youtube/youtube";
import { analyzeText, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
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

        // Fetch and clean transcript
        const segments = await fetchTranscript(videoId);
        if (!segments || segments.length === 0) {
            return {
                success: false,
                error: "No captions/subtitles found for this video. The video must have available captions.",
            };
        }

        let transcript = cleanTranscript(segments);

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
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
