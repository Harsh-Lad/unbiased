"use client";

import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AnalysisResultsProps {
    result: AnalysisResult;
}

const sections = [
    {
        key: "contentSummary" as const,
        title: "Content Summary",
        icon: "📋",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    },
    {
        key: "biasIndicators" as const,
        title: "Potential Bias Indicators",
        icon: "🔍",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    },
    {
        key: "framingTechniques" as const,
        title: "Framing Techniques",
        icon: "🎯",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50 dark:bg-purple-950/30",
        badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    },
    {
        key: "missingPerspectives" as const,
        title: "Missing Perspectives",
        icon: "👁️",
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    },
    {
        key: "educationalInsight" as const,
        title: "Educational Insight",
        icon: "💡",
        color: "from-indigo-500 to-violet-500",
        bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
        badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
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
            '<strong class="font-semibold text-foreground">$1</strong>'
        );

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
            return (
                <li
                    key={i}
                    className="ml-4 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: withBold.replace(/^[-•*]\s*/, "") }}
                />
            );
        }

        return (
            <p
                key={i}
                className="text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: withBold }}
            />
        );
    });
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
                <h2 className="text-2xl font-bold">Analysis Results</h2>
            </div>

            <div className="grid gap-4">
                {sections.map((section) => {
                    const content = result[section.key];
                    if (!content) return null;

                    return (
                        <Card
                            key={section.key}
                            className={`overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg ${section.bgColor}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} text-white text-lg shadow-sm`}
                                    >
                                        {section.icon}
                                    </div>
                                    <CardTitle className="text-lg">{section.title}</CardTitle>
                                    <Badge variant="secondary" className={section.badgeColor}>
                                        Analysis
                                    </Badge>
                                </div>
                            </CardHeader>
                            <Separator className="opacity-50" />
                            <CardContent className="pt-4">
                                <ul className="space-y-2">{renderMarkdownContent(content)}</ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
