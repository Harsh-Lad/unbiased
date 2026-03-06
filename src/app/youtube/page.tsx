"use client";

import { useState } from "react";
import { YouTubeInput } from "@/components/upload/YouTubeInput";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { CharacterDialogue } from "@/components/character-dialogue/CharacterDialogue";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { analyzeYoutubeAction } from "@/actions/analyzeYoutube";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function YouTubePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (url: string) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await analyzeYoutubeAction(url);

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
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-pink-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-red-950/20" />
            </div>

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-2xl shadow-lg shadow-red-500/25">
                            🎬
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">YouTube Video Analysis</h1>
                            <p className="text-muted-foreground">
                                Analyze video transcripts for bias and framing techniques
                            </p>
                        </div>
                    </div>
                </div>

                <YouTubeInput onSubmit={handleAnalyze} isLoading={isLoading} />

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
