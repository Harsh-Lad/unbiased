"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ApiKeyContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
    isKeySet: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType>({
    apiKey: "",
    setApiKey: () => { },
    isKeySet: false,
});

export function useApiKey() {
    return useContext(ApiKeyContext);
}

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
    const [apiKey, setApiKeyState] = useState("");

    const setApiKey = useCallback((key: string) => {
        setApiKeyState(key);
    }, []);

    return (
        <ApiKeyContext.Provider
            value={{ apiKey, setApiKey, isKeySet: apiKey.length > 0 }}
        >
            {children}
        </ApiKeyContext.Provider>
    );
}
