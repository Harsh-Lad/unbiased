"use client";

import { useState } from "react";
import { FileUpload } from "@/components/upload/FileUpload";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { CharacterDialogue } from "@/components/character-dialogue/CharacterDialogue";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { analyzePDFAction } from "@/actions/analyzePDF";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PDFPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [textContent, setTextContent] = useState("");

    const handleAnalyzePDF = async () => {
        if (!selectedFile) {
            setError("Please select a PDF file to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await analyzePDFAction(formData);

            if (response.success && response.data) {
                setResult(response.data);
            } else {
                setError(response.error || "An unexpected error occurred.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeText = async () => {
        if (!textContent.trim()) {
            setError("Please enter some text to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("textContent", textContent);

            const response = await analyzePDFAction(formData);

            if (response.success && response.data) {
                setResult(response.data);
            } else {
                setError(response.error || "An unexpected error occurred.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/20" />
            </div>

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl shadow-lg shadow-blue-500/25">
                            📄
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">PDF & Text Analysis</h1>
                            <p className="text-muted-foreground">
                                Analyze documents and articles for bias and framing techniques
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="pdf" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pdf">📄 Upload PDF</TabsTrigger>
                        <TabsTrigger value="text">✏️ Paste Text</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pdf" className="space-y-4">
                        <FileUpload
                            accept=".pdf"
                            maxSize={20}
                            onFileSelect={setSelectedFile}
                            label="Drop your PDF here"
                            description="Upload articles, essays, or research papers (PDF format, max 20MB)"
                            icon="📄"
                            selectedFile={selectedFile}
                        />
                        <Button
                            onClick={handleAnalyzePDF}
                            disabled={isLoading || !selectedFile}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 h-12 text-base"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Analyzing PDF...
                                </span>
                            ) : (
                                "Analyze PDF"
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="text" className="space-y-4">
                        <Textarea
                            placeholder="Paste your article, essay, or text content here..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="min-h-[200px] resize-y"
                            disabled={isLoading}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{textContent.length} characters</span>
                            <span>Minimum 50 characters for analysis</span>
                        </div>
                        <Button
                            onClick={handleAnalyzeText}
                            disabled={isLoading || textContent.trim().length < 50}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 h-12 text-base"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Analyzing text...
                                </span>
                            ) : (
                                "Analyze Text"
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>

                {error && (
                    <Alert className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
                        <AlertDescription className="text-red-700 dark:text-red-300">
                            ❌ {error}
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading && <AnalysisSkeleton />}

                {result && !isLoading && (
                    <div className="space-y-8">
                        <AnalysisResults result={result} />
                        <CharacterDialogue dialogue={result.characterDialogue} />
                    </div>
                )}
            </div>
        </div>
    );
}
