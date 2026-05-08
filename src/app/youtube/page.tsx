"use client";

export const maxDuration = 60;

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { YouTubeInput } from "@/components/upload/YouTubeInput";
import { AnalysisContainer } from "@/components/analysis/AnalysisContainer";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { analyzeYoutubeAction } from "@/actions/analyzeYoutube";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    pageIconEntrance,
    pageTitleEntrance,
    pageSubtitleEntrance,
    pageContentEntrance,
} from "@/lib/animation-variants";

export default function YouTubePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
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

    const handleAnalyze = async (url: string) => {
        setIsLoading(true);
        setError(null);
        setErrorCode(null);
        setResult(null);

        try {
            const response = await analyzeYoutubeAction(url);

            if (response.success && response.data) {
                setResult(response.data);
            } else {
                setError(response.error || "An unexpected error occurred.");
                setErrorCode(response.errorCode || "UNKNOWN");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setErrorCode("UNKNOWN");
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
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] border-4 border-black dark:border-white transition-transform hover:rotate-12 duration-300"
                            variants={pageIconEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            🎬
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white dark:text-slate-900 mt-2"
                            style={{ WebkitTextStroke: '3px black', textShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                            variants={pageTitleEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            Let&apos;s Find The Truth!
                        </motion.h1>
                    </div>
                    <motion.p
                        className="text-lg md:text-xl font-bold text-black/80 dark:text-white/90 max-w-2xl mx-auto bg-white/70 dark:bg-black/40 px-6 py-4 rounded-2xl border-4 border-black/20 dark:border-white/20 shadow-sm backdrop-blur-sm"
                        variants={pageSubtitleEntrance}
                        initial="hidden"
                        animate="visible"
                    >
                        Paste a YouTube link below and our detective AI team will investigate it for bias and framing techniques! 🕵️‍♂️✨
                    </motion.p>
                </div>

                <motion.div
                    className="relative z-20"
                    variants={pageContentEntrance}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="transform transition-transform duration-300 hover:-translate-y-1 focus-within:-translate-y-1">
                        <YouTubeInput onSubmit={handleAnalyze} isLoading={isLoading} />
                    </div>
                </motion.div>

                {error && (
                    <Alert className="border-4 border-black dark:border-white bg-red-100 dark:bg-red-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] rounded-2xl">
                        <AlertDescription className="text-red-900 dark:text-red-100 font-black text-base p-2 space-y-3">
                            <div className="text-lg">❌ {error}</div>

                            {errorCode === "NO_TRANSCRIPT" && (
                                <div className="font-bold text-sm bg-white/60 dark:bg-black/40 rounded-xl p-3 border-2 border-red-900/30 dark:border-red-100/30">
                                    <div className="mb-2 text-base">💡 Try a video that:</div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Has the <b>CC</b> button on YouTube (captions enabled)</li>
                                        <li>Is in English (or has English subtitles)</li>
                                        <li>Is not age-restricted, private, or members-only</li>
                                        <li>Is not a YouTube Short or livestream</li>
                                    </ul>
                                    <div className="mt-2 text-xs opacity-80">
                                        Tip: open the video on YouTube, click the <b>...</b> menu →
                                        &quot;Show transcript&quot;. If nothing appears, this app can&apos;t analyze it.
                                    </div>
                                </div>
                            )}

                            {errorCode === "INVALID_URL" && (
                                <div className="font-bold text-sm bg-white/60 dark:bg-black/40 rounded-xl p-3 border-2 border-red-900/30 dark:border-red-100/30">
                                    Paste a full URL like <code className="bg-black/10 dark:bg-white/10 px-1 rounded">https://www.youtube.com/watch?v=...</code> or <code className="bg-black/10 dark:bg-white/10 px-1 rounded">https://youtu.be/...</code>
                                </div>
                            )}

                            {errorCode === "RATE_LIMITED" && (
                                <div className="font-bold text-sm bg-white/60 dark:bg-black/40 rounded-xl p-3 border-2 border-red-900/30 dark:border-red-100/30">
                                    YouTube is throttling us. Wait a minute, then try again.
                                </div>
                            )}
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
