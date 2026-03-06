"use client";

import { useState, useMemo } from "react";
import { FileUpload } from "@/components/upload/FileUpload";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { CharacterDialogue } from "@/components/character-dialogue/CharacterDialogue";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { useApiKey } from "@/components/ApiKeyProvider";
import { analyzeImageAction } from "@/actions/analyzeImage";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ImagePage() {
    const { apiKey, isKeySet } = useApiKey();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const previewUrl = useMemo(() => {
        if (selectedFile) {
            return URL.createObjectURL(selectedFile);
        }
        return null;
    }, [selectedFile]);

    const handleAnalyze = async () => {
        if (!isKeySet) {
            setError("Please set your API key first using the key icon in the navigation bar.");
            return;
        }

        if (!selectedFile) {
            setError("Please select an image to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("apiKey", apiKey);

            const response = await analyzeImageAction(formData);

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
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-purple-950/20" />
            </div>

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-2xl shadow-lg shadow-purple-500/25">
                            🖼️
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Image Analysis</h1>
                            <p className="text-muted-foreground">
                                Analyze images for visual bias, stereotypes, and persuasion techniques
                            </p>
                        </div>
                    </div>
                </div>

                {/* API Key Warning */}
                {!isKeySet && (
                    <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                            ⚠️ Please set your API key using the <strong>🔑 Set API Key</strong> button in the navigation bar before analyzing content.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload Section */}
                <div className="space-y-4">
                    <FileUpload
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        maxSize={20}
                        onFileSelect={setSelectedFile}
                        label="Drop your image here"
                        description="Upload posters, ads, memes, or social media graphics (JPEG, PNG, WebP, GIF — max 20MB)"
                        icon="🖼️"
                        selectedFile={selectedFile}
                    />

                    {/* Image Preview */}
                    {previewUrl && (
                        <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                            <div className="p-4">
                                <p className="text-sm font-medium mb-3">Preview</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Upload preview"
                                    className="mx-auto max-h-96 rounded-lg object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || !selectedFile}
                        className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/25 h-12 text-base"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Analyzing image...
                            </span>
                        ) : (
                            "Analyze Image"
                        )}
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <Alert className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
                        <AlertDescription className="text-red-700 dark:text-red-300">
                            ❌ {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Loading */}
                {isLoading && <AnalysisSkeleton />}

                {/* Results */}
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
