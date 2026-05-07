"use server";

import { headers } from "next/headers";
import { extractTextFromPDF, chunkText, shouldSummarize, buildSummarizationPrompt } from "@/lib/pdf/pdf";
import { analyzeText, parseAnalysisResponse, type AnalysisResult } from "@/lib/ai/ai-client";
import { buildFullPrompt } from "@/lib/ai/prompts";
import { logAnalysis, type HistoryKind } from "@/lib/history/store";

async function getMeta() {
    const h = await headers();
    return {
        ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || undefined,
        userAgent: h.get("user-agent") || undefined,
    };
}

interface AnalyzePDFResult {
    success: boolean;
    data?: AnalysisResult;
    error?: string;
}

export async function analyzePDFAction(
    formData: FormData
): Promise<AnalyzePDFResult> {
    const meta = await getMeta();
    let kind: HistoryKind = "pdf";
    let inputLabel = "";
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return { success: false, error: "API key is not configured. Please set API_KEY in your .env file." };
        }

        const file = formData.get("file") as File | null;
        const textContent = formData.get("textContent") as string | null;

        let extractedText = "";

        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            extractedText = await extractTextFromPDF(buffer);
            kind = "pdf";
            inputLabel = file.name || "document.pdf";
        } else if (textContent && textContent.trim().length > 0) {
            extractedText = textContent.trim();
            kind = "text";
            inputLabel = textContent.trim();
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

        if (shouldSummarize(extractedText)) {
            const summaryPrompt = buildSummarizationPrompt(extractedText);
            extractedText = await analyzeText(
                "You are a document summarizer. Preserve key arguments, claims, and notable language choices.",
                summaryPrompt,
                apiKey
            );
        }

        const chunks = chunkText(extractedText, 12000);

        if (chunks.length === 1) {
            const rawAnalysis = await analyzeText(
                systemPrompt,
                `Please analyze the following text for bias and framing:\n\n${chunks[0]}`,
                apiKey
            );
            const result = parseAnalysisResponse(rawAnalysis);
            await logAnalysis({ kind, input: inputLabel, success: true, ...meta });
            return { success: true, data: result };
        }

        const chunkAnalyses: string[] = [];
        for (const chunk of chunks) {
            const analysis = await analyzeText(
                systemPrompt,
                `Please analyze the following text section for bias and framing:\n\n${chunk}`,
                apiKey
            );
            chunkAnalyses.push(analysis);
        }

        const combinedPrompt = `I have analyzed multiple sections of a document. Please synthesize these analyses into a single, coherent bias analysis following the structured format (Content Summary, Potential Bias Indicators, Framing Techniques, Missing Perspectives, Educational Insight). Also include the character dialogue.\n\nSection analyses:\n\n${chunkAnalyses.join("\n\n---\n\n")}`;

        const finalAnalysis = await analyzeText(systemPrompt, combinedPrompt, apiKey);
        const result = parseAnalysisResponse(finalAnalysis);

        await logAnalysis({ kind, input: inputLabel, success: true, ...meta });
        return { success: true, data: result };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        await logAnalysis({ kind, input: inputLabel, success: false, errorCode: "UNKNOWN", ...meta });
        return { success: false, error: message };
    }
}
