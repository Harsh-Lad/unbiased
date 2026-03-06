"use server";

import { analyzeImage, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt, IMAGE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";

interface AnalyzeImageResult {
    success: boolean;
    data?: AnalysisResult;
    error?: string;
}

export async function analyzeImageAction(
    formData: FormData
): Promise<AnalyzeImageResult> {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return { success: false, error: "API key is not configured. Please set API_KEY in your .env file." };
        }

        const file = formData.get("file") as File | null;

        if (!file || file.size === 0) {
            return { success: false, error: "Please upload an image file." };
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return {
                success: false,
                error: "Please upload a valid image (JPEG, PNG, WebP, or GIF).",
            };
        }

        if (file.size > 20 * 1024 * 1024) {
            return {
                success: false,
                error: "Image file is too large. Please upload an image under 20MB.",
            };
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const systemPrompt = `${buildFullPrompt()}\n\n${IMAGE_ANALYSIS_PROMPT}`;

        const rawAnalysis = await analyzeImage(
            systemPrompt,
            base64,
            file.type,
            apiKey
        );

        const result = parseAnalysisResponse(rawAnalysis);

        return { success: true, data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
