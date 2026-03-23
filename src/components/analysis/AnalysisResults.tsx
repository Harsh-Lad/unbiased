"use client";

import { motion } from "framer-motion";
import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, analysisCardVariants } from "@/lib/animation-variants";

interface AnalysisResultsProps {
    result: AnalysisResult;
}

const sections = [
    {
        key: "contentSummary" as const,
        title: "Content Summary",
        icon: "📋",
        color: "from-blue-400 to-cyan-400",
        bgColor: "bg-blue-100 dark:bg-blue-900",
        badgeColor: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 border-2 border-black dark:border-white",
    },
    {
        key: "biasIndicators" as const,
        title: "Potential Bias Indicators",
        icon: "🔍",
        color: "from-amber-400 to-orange-400",
        bgColor: "bg-amber-100 dark:bg-amber-900",
        badgeColor: "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 border-2 border-black dark:border-white",
    },
    {
        key: "framingTechniques" as const,
        title: "Framing Techniques",
        icon: "🎯",
        color: "from-purple-400 to-pink-400",
        bgColor: "bg-purple-100 dark:bg-purple-900",
        badgeColor: "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 border-2 border-black dark:border-white",
    },
    {
        key: "missingPerspectives" as const,
        title: "Missing Perspectives",
        icon: "👁️",
        color: "from-emerald-400 to-teal-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900",
        badgeColor: "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 border-2 border-black dark:border-white",
    },
    {
        key: "educationalInsight" as const,
        title: "Educational Insight",
        icon: "💡",
        color: "from-indigo-400 to-violet-400",
        bgColor: "bg-indigo-100 dark:bg-indigo-900",
        badgeColor: "bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 border-2 border-black dark:border-white",
    },
];

function renderMarkdownContent(content: string) {
    // Simple markdown renderer for bullet points and bold text
    const lines = content.split("\n");
    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Bold text
        const withBold = trimmed.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-black text-foreground">$1</strong>'
        );

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
            return (
                <li
                    key={i}
                    className="ml-6 text-sm md:text-base leading-relaxed text-foreground font-medium list-disc"
                    dangerouslySetInnerHTML={{ __html: withBold.replace(/^[-•*]\s*/, "") }}
                />
            );
        }

        return (
            <p
                key={i}
                className="text-sm md:text-base leading-relaxed text-foreground font-medium mb-3 last:mb-0"
                dangerouslySetInnerHTML={{ __html: withBold }}
            />
        );
    });
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 border-b-4 border-black dark:border-white pb-4">
                <div className="h-10 w-10 flex text-3xl items-center justify-center animate-bounce">
                    ✨
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                    Analysis Details
                </h2>
            </div>

            <motion.div
                className="grid gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
            >
                {sections.map((section) => {
                    const content = result[section.key];
                    if (!content) return null;

                    return (
                        <motion.div key={section.key} variants={analysisCardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                            <Card
                                className={`overflow-hidden border-4 border-black dark:border-white shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_rgba(255,255,255,1)] transition-shadow duration-300 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,1)] rounded-2xl ${section.bgColor}`}
                            >
                                <CardHeader className="pb-4 bg-white/40 dark:bg-black/20 border-b-4 border-black dark:border-white">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} text-white text-2xl border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
                                        >
                                            {section.icon}
                                        </div>
                                        <CardTitle className="text-xl md:text-2xl font-black tracking-wide text-black dark:text-white">
                                            {section.title}
                                        </CardTitle>
                                        <Badge variant="secondary" className={`ml-auto hidden sm:inline-flex ${section.badgeColor} font-bold tracking-wider`}>
                                            INFO
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <ul className="space-y-3">{renderMarkdownContent(content)}</ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

