"use server";

import { extractVideoId, fetchTranscript, cleanTranscript } from "@/lib/youtube/youtube";
import { analyzeText, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt } from "@/lib/ai/prompts";
import { shouldSummarize, buildSummarizationPrompt } from "@/lib/pdf/pdf";

interface AnalyzeYoutubeInput {
    url: string;
    apiKey: string;
}

interface AnalyzeYoutubeResult {
    success: boolean;
    data?: AnalysisResult;
    videoId?: string;
    error?: string;
}

export async function analyzeYoutubeAction(
    input: AnalyzeYoutubeInput
): Promise<AnalyzeYoutubeResult> {
    try {
        if (!input.apiKey) {
            return { success: false, error: "Please provide an API key in the settings." };
        }

        const videoId = extractVideoId(input.url);
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
                input.apiKey
            );
        }

        // Run bias analysis
        const systemPrompt = buildFullPrompt();
        const rawAnalysis = await analyzeText(
            systemPrompt,
            `Please analyze the following YouTube video transcript for bias and framing:\n\n${transcript}`,
            input.apiKey
        );

        const result = parseAnalysisResponse(rawAnalysis);

        return { success: true, data: result, videoId };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
