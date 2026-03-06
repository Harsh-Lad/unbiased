/* eslint-disable @typescript-eslint/no-require-imports */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Dynamic import to avoid Next.js bundler issues with pdf-parse
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
}

export function chunkText(text: string, maxChunkSize: number = 12000): string[] {
    if (text.length <= maxChunkSize) {
        return [text];
    }

    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }

            // If a single paragraph exceeds max size, split by sentences
            if (paragraph.length > maxChunkSize) {
                const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
                for (const sentence of sentences) {
                    if (currentChunk.length + sentence.length + 1 > maxChunkSize) {
                        if (currentChunk.length > 0) {
                            chunks.push(currentChunk.trim());
                            currentChunk = "";
                        }
                    }
                    currentChunk += sentence + " ";
                }
            } else {
                currentChunk = paragraph + "\n\n";
            }
        } else {
            currentChunk += paragraph + "\n\n";
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

const MAX_ANALYSIS_LENGTH = 30000; // ~7500 tokens

export function shouldSummarize(text: string): boolean {
    return text.length > MAX_ANALYSIS_LENGTH;
}

export function buildSummarizationPrompt(text: string): string {
    return `Please provide a comprehensive summary of the following document text, preserving key arguments, claims, opinions, and perspectives. This summary will be used for bias analysis, so include details about tone, framing, and notable language choices.\n\nDocument text:\n${text.slice(0, 60000)}`;
}
