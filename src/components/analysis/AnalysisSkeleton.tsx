"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AnalysisSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <motion.div
                className="flex items-center gap-4 p-4 mb-4 bg-indigo-100 dark:bg-indigo-900 border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] rounded-2xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-black dark:border-white flex items-center justify-center text-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <motion.span
                        animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.1, 0.95, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🚀
                    </motion.span>
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-black tracking-wide text-black dark:text-white uppercase">
                        Analyzing your content...
                    </p>
                    <p className="text-sm font-semibold text-foreground/80">
                        Gathering clues &amp; evidence (15-30 seconds)
                    </p>
                </div>
            </motion.div>

            {/* Progress dots — wave animation */}
            <div className="flex justify-center gap-3 py-6">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        animate={{
                            y: [0, -10, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: [0.45, 0, 0.55, 1],
                            delay: i * 0.12,
                        }}
                    />
                ))}
            </div>

            {/* Character Dialogue Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
                <Card className="overflow-hidden border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] rounded-2xl bg-amber-50 dark:bg-stone-900">
                    <CardContent className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-4 border-black/20 dark:border-white/20">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full border-2 border-black/20 dark:border-white/20"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                                >
                                    <Skeleton className="h-6 w-6 rounded-full bg-black/10 dark:bg-white/10" />
                                    <Skeleton className="h-3 w-16 bg-black/10 dark:bg-white/10" />
                                </motion.div>
                            ))}
                        </div>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className={`flex gap-4 items-start ${i === 1 ? "flex-row-reverse" : ""}`}
                                initial={{ opacity: 0, x: i === 1 ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                            >
                                <Skeleton className="h-14 w-14 rounded-full shrink-0 bg-black/10 dark:bg-white/10" />
                                <div className={`flex-1 space-y-2 ${i === 1 ? "flex flex-col items-end" : ""}`}>
                                    <Skeleton className="h-4 w-32 bg-black/10 dark:bg-white/10" />
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <Skeleton className={`h-20 w-3/4 rounded-2xl bg-black/10 dark:bg-white/10 ${i === 1 ? "rounded-tr-sm" : "rounded-tl-sm"}`} />
                                        <div className="absolute inset-0 animate-shimmer" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Skeleton Cards */}
            <div className="space-y-6 mt-12">
                <div className="h-8 w-48 bg-black/10 dark:bg-white/10 rounded-lg mb-6" />
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                    >
                        <Card className="overflow-hidden border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] rounded-2xl bg-slate-100 dark:bg-slate-900">
                            <div className="p-4 bg-white/40 dark:bg-black/20 border-b-4 border-black dark:border-white flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl bg-black/10 dark:bg-white/10 border-2 border-black/20" />
                                <Skeleton className="h-6 w-56 bg-black/10 dark:bg-white/10" />
                            </div>
                            <CardContent className="p-6 space-y-4 relative overflow-hidden">
                                <Skeleton className="h-4 w-full bg-black/10 dark:bg-white/10" />
                                <Skeleton className="h-4 w-11/12 bg-black/10 dark:bg-white/10" />
                                <Skeleton className="h-4 w-4/5 bg-black/10 dark:bg-white/10" />
                                <div className="absolute inset-0 animate-shimmer" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
