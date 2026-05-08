"use server";

import { headers } from "next/headers";
import { extractVideoId } from "@/lib/youtube/youtube";
import { fetchTranscriptFromService } from "@/lib/youtube/transcript";
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
    | "SERVICE_UNAVAILABLE"
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
                error: "Service is not configured. Please try again later.",
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

        let transcript: string | null;
        try {
            transcript = await fetchTranscriptFromService(videoId);
        } catch (err) {
            console.error("[analyzeYoutube] transcript service error:", err);
            await logAnalysis({ kind: "youtube", input: url, videoId, success: false, errorCode: "SERVICE_UNAVAILABLE", ...meta });
            return {
                success: false,
                errorCode: "SERVICE_UNAVAILABLE",
                videoId,
                error: "Couldn't fetch the transcript right now. Please try again in a moment.",
            };
        }

        if (!transcript) {
            await logAnalysis({ kind: "youtube", input: url, videoId, success: false, errorCode: "NO_TRANSCRIPT", ...meta });
            return {
                success: false,
                errorCode: "NO_TRANSCRIPT",
                videoId,
                error:
                    "This video doesn't have captions available. " +
                    "Try one with the CC button on YouTube.",
            };
        }

        if (shouldSummarize(transcript)) {
            const summaryPrompt = buildSummarizationPrompt(transcript);
            transcript = await analyzeText(
                "You are a document summarizer. Preserve key arguments, claims, and notable language choices.",
                summaryPrompt,
                apiKey
            );
        }

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
        return {
            success: false,
            errorCode: code,
            error: "Something went wrong analyzing this video. Please try again.",
        };
    }
}
