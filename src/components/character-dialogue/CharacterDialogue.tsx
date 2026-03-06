"use client";

import { type AnalysisResult } from "@/lib/ai/ai-client";
import { Card, CardContent } from "@/components/ui/card";

interface CharacterDialogueProps {
    dialogue: AnalysisResult["characterDialogue"];
}

const characterStyles: Record<string, { gradient: string; bgColor: string; borderColor: string; avatarBg: string }> = {
    "Detective Dot": {
        gradient: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50/80 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800/50",
        avatarBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    },
    "Professor Owl": {
        gradient: "from-blue-500 to-indigo-500",
        bgColor: "bg-blue-50/80 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800/50",
        avatarBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    },
    "Curious Cat": {
        gradient: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50/80 dark:bg-emerald-950/20",
        borderColor: "border-emerald-200 dark:border-emerald-800/50",
        avatarBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    },
};

export function CharacterDialogue({ dialogue }: CharacterDialogueProps) {
    if (!dialogue || dialogue.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-500 to-emerald-500" />
                <h2 className="text-2xl font-bold">Character Discussion</h2>
            </div>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-950/50 dark:to-indigo-950/30 shadow-lg">
                <CardContent className="p-6 space-y-4">
                    {/* Character Legend */}
                    <div className="flex flex-wrap gap-4 pb-4 border-b border-border/50">
                        {[
                            { name: "Detective Dot", emoji: "🔍", desc: "Finds clues" },
                            { name: "Professor Owl", emoji: "🦉", desc: "Explains concepts" },
                            { name: "Curious Cat", emoji: "🐱", desc: "Asks questions" },
                        ].map((char) => (
                            <div key={char.name} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{char.emoji}</span>
                                <span className="font-medium">{char.name}</span>
                                <span className="text-muted-foreground">— {char.desc}</span>
                            </div>
                        ))}
                    </div>

                    {/* Dialogue Messages */}
                    <div className="space-y-3">
                        {dialogue.map((line, index) => {
                            const styles = characterStyles[line.character] || characterStyles["Curious Cat"];

                            return (
                                <div
                                    key={index}
                                    className={`flex gap-3 items-start p-4 rounded-xl ${styles.bgColor} border ${styles.borderColor} transition-all duration-300 hover:scale-[1.01]`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.avatarBg} text-white text-lg shadow-md`}
                                    >
                                        {line.emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-bold bg-gradient-to-r ${styles.gradient} bg-clip-text text-transparent`}>
                                            {line.character}
                                        </span>
                                        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                                            &ldquo;{line.message}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
