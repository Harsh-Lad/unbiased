"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/upload/FileUpload";
import { AnalysisContainer } from "@/components/analysis/AnalysisContainer";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { analyzeImageAction } from "@/actions/analyzeImage";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    pageIconEntrance,
    pageTitleEntrance,
    pageSubtitleEntrance,
    pageContentEntrance,
} from "@/lib/animation-variants";

export default function ImagePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to results when analysis completes
    useEffect(() => {
        if (result && !isLoading && resultsRef.current) {
            const t = setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
            return () => clearTimeout(t);
        }
    }, [result, isLoading]);

    const previewUrl = useMemo(() => {
        if (selectedFile) {
            return URL.createObjectURL(selectedFile);
        }
        return null;
    }, [selectedFile]);

    const handleAnalyze = async () => {
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
        <div className="relative min-h-[calc(100vh-4rem)] bg-yellow-50 dark:bg-slate-900 font-sans overflow-hidden">
            {/* Comic dots pattern overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
                <div className="space-y-6 text-center mt-4">
                    <div className="flex flex-col items-center justify-center gap-4 mb-4">
                        <motion.div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] border-4 border-black dark:border-white transition-transform hover:rotate-12 duration-300"
                            variants={pageIconEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            🖼️
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white dark:text-slate-900 mt-2"
                            style={{ WebkitTextStroke: '3px black', textShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                            variants={pageTitleEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            What&apos;s In This Image?!
                        </motion.h1>
                    </div>
                    <motion.p
                        className="text-lg md:text-xl font-bold text-black/80 dark:text-white/90 max-w-2xl mx-auto bg-white/70 dark:bg-black/40 px-6 py-4 rounded-2xl border-4 border-black/20 dark:border-white/20 shadow-sm backdrop-blur-sm"
                        variants={pageSubtitleEntrance}
                        initial="hidden"
                        animate="visible"
                    >
                        Upload an image below and our detective AI team will investigate it for visual bias, stereotypes, and persuasion techniques! 🕵️‍♂️✨
                    </motion.p>
                </div>

                <motion.div
                    className="relative z-20 space-y-6"
                    variants={pageContentEntrance}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="transform transition-transform duration-300 hover:-translate-y-1 rounded-2xl border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-800 overflow-hidden">
                        <FileUpload
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            maxSize={20}
                            onFileSelect={setSelectedFile}
                            label="Drop your image here"
                            description="Upload posters, ads, memes, or social media graphics (JPEG, PNG, WebP, GIF — max 20MB)"
                            icon="🖼️"
                            selectedFile={selectedFile}
                        />
                    </div>

                    {previewUrl && (
                        <div className="rounded-2xl overflow-hidden border-4 border-black dark:border-white bg-white dark:bg-slate-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-transform duration-300 hover:-translate-y-1">
                            <div className="p-4 border-b-4 border-black dark:border-white bg-purple-100 dark:bg-purple-900/50">
                                <p className="text-lg font-black tracking-wide uppercase">Preview 👀</p>
                            </div>
                            <div className="p-4 bg-muted/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Upload preview"
                                    className="mx-auto max-h-96 rounded-xl border-2 border-black/10 dark:border-white/10 object-contain shadow-md"
                                />
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || !selectedFile}
                        className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-black uppercase tracking-wider text-xl hover:from-purple-600 hover:to-violet-700 border-4 border-transparent hover:border-black dark:hover:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,1)] h-16 transition-all duration-200 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-3">
                                <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                Analyzing Image...
                            </span>
                        ) : (
                            "Analyze Image 🚀"
                        )}
                    </Button>
                </motion.div>

                {error && (
                    <Alert className="border-4 border-black dark:border-white bg-red-100 dark:bg-red-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] rounded-2xl">
                        <AlertDescription className="text-red-900 dark:text-red-100 font-black text-lg p-2">
                            ❌ {error}
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading && <AnalysisSkeleton />}

                {result && !isLoading && (
                    <div ref={resultsRef}>
                        <AnalysisContainer result={result} />
                    </div>
                )}
            </div>
        </div>
    );
}
