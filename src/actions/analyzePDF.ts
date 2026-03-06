"use server";

import { extractTextFromPDF, chunkText, shouldSummarize, buildSummarizationPrompt } from "@/lib/pdf/pdf";
import { analyzeText, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt } from "@/lib/ai/prompts";

interface AnalyzePDFResult {
    success: boolean;
    data?: AnalysisResult;
    error?: string;
}

export async function analyzePDFAction(
    formData: FormData
): Promise<AnalyzePDFResult> {
    try {
        const apiKey = formData.get("apiKey") as string;
        const file = formData.get("file") as File | null;
        const textContent = formData.get("textContent") as string | null;

        if (!apiKey) {
            return { success: false, error: "Please provide an API key in the settings." };
        }

        let extractedText = "";

        if (file && file.size > 0) {
            // Process PDF file in memory
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            extractedText = await extractTextFromPDF(buffer);
        } else if (textContent && textContent.trim().length > 0) {
            extractedText = textContent.trim();
        } else {
            return { success: false, error: "Please upload a PDF file or paste text content." };
        }

        if (extractedText.length < 50) {
            return {
                success: false,
                error: "The extracted text is too short for meaningful analysis. Please provide more content.",
            };
        }

        const systemPrompt = buildFullPrompt();

        // If text is very large, summarize first
        if (shouldSummarize(extractedText)) {
            const summaryPrompt = buildSummarizationPrompt(extractedText);
            extractedText = await analyzeText(
                "You are a document summarizer. Preserve key arguments, claims, and notable language choices.",
                summaryPrompt,
                apiKey
            );
        }

        // For chunked content, analyze each chunk and combine
        const chunks = chunkText(extractedText, 12000);

        if (chunks.length === 1) {
            const rawAnalysis = await analyzeText(
                systemPrompt,
                `Please analyze the following text for bias and framing:\n\n${chunks[0]}`,
                apiKey
            );
            const result = parseAnalysisResponse(rawAnalysis);
            return { success: true, data: result };
        }

        // Multi-chunk: analyze each, then combine
        const chunkAnalyses: string[] = [];
        for (const chunk of chunks) {
            const analysis = await analyzeText(
                systemPrompt,
                `Please analyze the following text section for bias and framing:\n\n${chunk}`,
                apiKey
            );
            chunkAnalyses.push(analysis);
        }

        // Combine analyses
        const combinedPrompt = `I have analyzed multiple sections of a document. Please synthesize these analyses into a single, coherent bias analysis following the structured format (Content Summary, Potential Bias Indicators, Framing Techniques, Missing Perspectives, Educational Insight). Also include the character dialogue.\n\nSection analyses:\n\n${chunkAnalyses.join("\n\n---\n\n")}`;

        const finalAnalysis = await analyzeText(systemPrompt, combinedPrompt, apiKey);
        const result = parseAnalysisResponse(finalAnalysis);

        return { success: true, data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
