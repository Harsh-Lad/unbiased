"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractVideoId } from "@/lib/youtube/youtube";

interface YouTubeInputProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export function YouTubeInput({ onSubmit, isLoading }: YouTubeInputProps) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const videoId = extractVideoId(url);

    const handleSubmit = () => {
        if (!url.trim()) {
            setError("Please enter a YouTube URL.");
            return;
        }
        if (!videoId) {
            setError("Invalid YouTube URL. Please enter a valid link.");
            return;
        }
        setError(null);
        onSubmit(url);
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
                <label className="text-sm font-medium">YouTube Video URL</label>
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSubmit()}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !url.trim()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 px-6"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Analyzing...
                            </span>
                        ) : (
                            "Analyze"
                        )}
                    </Button>
                </div>
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>

            {/* Video Preview */}
            {videoId && (
                <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-border/50">
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video preview"
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
