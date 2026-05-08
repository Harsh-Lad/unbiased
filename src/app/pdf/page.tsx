"use client";

export const maxDuration = 60;

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/upload/FileUpload";
import { AnalysisContainer } from "@/components/analysis/AnalysisContainer";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisSkeleton";
import { analyzePDFAction } from "@/actions/analyzePDF";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    pageIconEntrance,
    pageTitleEntrance,
    pageSubtitleEntrance,
} from "@/lib/animation-variants";

export default function PDFPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [textContent, setTextContent] = useState("");
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
        <div className="relative min-h-[calc(100vh-4rem)] bg-yellow-50 dark:bg-slate-900 font-sans overflow-hidden">
            {/* Comic dots pattern overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
                <div className="space-y-6 text-center mt-4">
                    <div className="flex flex-col items-center justify-center gap-4 mb-4">
                        <motion.div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-5xl shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] border-4 border-black dark:border-white transition-transform hover:rotate-12 duration-300"
                            variants={pageIconEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            📄
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white dark:text-slate-900 mt-2"
                            style={{ WebkitTextStroke: '3px black', textShadow: '6px 6px 0px rgba(0,0,0,1)' }}
                            variants={pageTitleEntrance}
                            initial="hidden"
                            animate="visible"
                        >
                            Let&apos;s Read This!
                        </motion.h1>
                    </div>
                    <motion.p
                        className="text-lg md:text-xl font-bold text-black/80 dark:text-white/90 max-w-2xl mx-auto bg-white/70 dark:bg-black/40 px-6 py-4 rounded-2xl border-4 border-black/20 dark:border-white/20 shadow-sm backdrop-blur-sm"
                        variants={pageSubtitleEntrance}
                        initial="hidden"
                        animate="visible"
                    >
                        Upload an article or paste text below, and our detective AI team will investigate it for bias and framing techniques! 🕵️‍♂️✨
                    </motion.p>
                </div>

                <Tabs defaultValue="pdf" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-white/50 dark:bg-black/20 ">
                        <TabsTrigger value="pdf" className="text-sm md:text-lg font-black uppercase tracking-wider rounded-xl data-[state=active]:bg-cyan-200 dark:data-[state=active]:bg-cyan-800 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black dark:data-[state=active]:border-white drop-shadow-none data-[state=active]:shadow-none transition-all">📄 Upload PDF</TabsTrigger>
                        <TabsTrigger value="text" className="text-sm md:text-lg font-black uppercase tracking-wider rounded-xl data-[state=active]:bg-amber-200 dark:data-[state=active]:bg-amber-800 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black dark:data-[state=active]:border-white drop-shadow-none data-[state=active]:shadow-none transition-all">✏️ Paste Text</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pdf" className="space-y-6">
                        <div className="transform transition-transform duration-300 hover:-translate-y-1 rounded-2xl border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-800 overflow-hidden">
                            <FileUpload
                                accept=".pdf"
                                maxSize={20}
                                onFileSelect={setSelectedFile}
                                label="Drop your PDF here"
                                description="Upload articles, essays, or research papers (PDF format, max 20MB)"
                                icon="📄"
                                selectedFile={selectedFile}
                            />
                        </div>
                        <Button
                            onClick={handleAnalyzePDF}
                            disabled={isLoading || !selectedFile}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black uppercase tracking-wider text-xl hover:from-blue-600 hover:to-cyan-600 border-4 border-transparent hover:border-black dark:hover:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,1)] h-16 transition-all duration-200 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-3">
                                    <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                    Analyzing PDF...
                                </span>
                            ) : (
                                "Analyze PDF 🚀"
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="text" className="space-y-6">
                        <div className="transform transition-transform duration-300 hover:-translate-y-1 rounded-2xl border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-800 overflow-hidden">
                            <Textarea
                                placeholder="Paste your article, essay, or text content here... Let's see what's hidden!"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                className="min-h-[250px] resize-y border-0 focus-visible:ring-0 p-6 text-lg font-medium leading-relaxed bg-transparent"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm md:text-base font-bold text-black/60 dark:text-white/60 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl border-2 border-black/20 dark:border-white/20">
                            <span>{textContent.length} characters</span>
                            <span>Minimum 50 required</span>
                        </div>
                        <Button
                            onClick={handleAnalyzeText}
                            disabled={isLoading || textContent.trim().length < 50}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-wider text-xl hover:from-amber-600 hover:to-orange-600 border-4 border-transparent hover:border-black dark:hover:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,1)] h-16 transition-all duration-200 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-3">
                                    <span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                    Analyzing Text...
                                </span>
                            ) : (
                                "Analyze Text 🚀"
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>

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
