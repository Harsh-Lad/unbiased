"use client";

import { useCallback, useState, useRef } from "react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
    accept: string;
    maxSize?: number; // in MB
    onFileSelect: (file: File) => void;
    label: string;
    description: string;
    icon: string;
    selectedFile?: File | null;
}

export function FileUpload({
    accept,
    maxSize = 20,
    onFileSelect,
    label,
    description,
    icon,
    selectedFile,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(
        (file: File): boolean => {
            setError(null);
            if (file.size > maxSize * 1024 * 1024) {
                setError(`File is too large. Maximum size is ${maxSize}MB.`);
                return false;
            }
            return true;
        },
        [maxSize]
    );

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files || files.length === 0) return;
            const file = files[0];
            if (validateFile(file)) {
                onFileSelect(file);
            }
        },
        [onFileSelect, validateFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    return (
        <Card
            className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 cursor-pointer group ${isDragging
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]"
                    : selectedFile
                        ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-800"
                        : "border-border hover:border-indigo-300 hover:bg-indigo-50/30 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/10"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 ${selectedFile
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25"
                            : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50"
                        }`}
                >
                    {selectedFile ? "✅" : icon}
                </div>

                {selectedFile ? (
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            File selected
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                            Click or drop to change file
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                            or click to browse files
                        </p>
                    </div>
                )}

                {error && (
                    <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">
                        {error}
                    </p>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
        </Card>
    );
}
