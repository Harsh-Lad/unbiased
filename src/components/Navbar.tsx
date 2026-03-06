"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useApiKey } from "@/components/ApiKeyProvider";

const navLinks = [
    { href: "/youtube", label: "YouTube", icon: "🎬" },
    { href: "/pdf", label: "PDF / Text", icon: "📄" },
    { href: "/image", label: "Image", icon: "🖼️" },
];

export function Navbar() {
    const pathname = usePathname();
    const { apiKey, setApiKey, isKeySet } = useApiKey();
    const [tempKey, setTempKey] = useState(apiKey);
    const [open, setOpen] = useState(false);

    const handleSave = () => {
        setApiKey(tempKey);
        setOpen(false);
    };

    const getProviderLabel = (key: string) => {
        if (!key) return "Not set";
        if (key.startsWith("sk-ant-")) return "Anthropic (Claude)";
        if (key.startsWith("sk-")) return "OpenAI (GPT-4o)";
        if (key.startsWith("xai-")) return "xAI (Grok)";
        return "Google (Gemini)";
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                        UB
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                        Unbiased
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <span className="text-base">{link.icon}</span>
                            <span className="hidden sm:inline">{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Settings */}
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant={isKeySet ? "outline" : "default"}
                                size="sm"
                                className={`gap-2 ${isKeySet
                                        ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                                    }`}
                            >
                                {isKeySet ? (
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="hidden sm:inline">{getProviderLabel(apiKey)}</span>
                                        <span className="sm:hidden">🔑</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔑</span>
                                        <span className="hidden sm:inline">Set API Key</span>
                                    </>
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>AI Provider Settings</DialogTitle>
                                <DialogDescription>
                                    Enter your API key. The provider is auto-detected from the key format.
                                    Your key is stored only in browser memory and never sent to our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">API Key</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your API key..."
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                    />
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                                    <p className="font-medium text-foreground">Auto-detection:</p>
                                    <p>• <code className="text-indigo-600 dark:text-indigo-400">AIza...</code> → Google Gemini (default)</p>
                                    <p>• <code className="text-indigo-600 dark:text-indigo-400">sk-...</code> → OpenAI GPT-4o</p>
                                    <p>• <code className="text-indigo-600 dark:text-indigo-400">sk-ant-...</code> → Anthropic Claude</p>
                                    <p>• <code className="text-indigo-600 dark:text-indigo-400">xai-...</code> → xAI Grok</p>
                                </div>
                                {tempKey && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                        <span>Detected: <strong>{getProviderLabel(tempKey)}</strong></span>
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                        Save Key
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </nav>
    );
}
