"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AnalysisSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Analyzing content...
                    </p>
                    <p className="text-xs text-muted-foreground">
                        This may take 15-30 seconds depending on content length
                    </p>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 py-4">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                ))}
            </div>

            {/* Skeleton Cards */}
            {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
