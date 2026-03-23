export type AIProvider = "gemini" | "openai" | "anthropic" | "xai";

export interface AnalysisResult {
    rawText: string;
    contentSummary: string;
    biasIndicators: string;
    framingTechniques: string;
    missingPerspectives: string;
    educationalInsight: string;
    characterDialogue: {
        character: string;
        message: string;
        emoji: string;
    }[];
}

export function detectProvider(apiKey: string): AIProvider {
    if (!apiKey) return "gemini";
    if (apiKey.startsWith("sk-ant-")) return "anthropic";
    if (apiKey.startsWith("sk-")) return "openai";
    if (apiKey.startsWith("xai-")) return "xai";
    return "gemini"; // default
}

interface ProviderConfig {
    url: string;
    headers: Record<string, string>;
    model: string;
}

function getProviderConfig(provider: AIProvider, apiKey: string, isImage: boolean = false): ProviderConfig {
    switch (provider) {
        case "openai":
            return {
                url: "https://api.openai.com/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                model: "gpt-4o",
            };
        case "anthropic":
            return {
                url: "https://api.anthropic.com/v1/messages",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
                model: "claude-sonnet-4-20250514",
            };
        case "xai":
            return {
                url: "https://api.x.ai/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                model: isImage ? "grok-3" : "grok-3", // grok-3 natively supports vision, but we can explicitly document it here
            };
        case "gemini":
        default:
            return {
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                headers: {
                    "Content-Type": "application/json",
                },
                model: "gemini-2.0-flash",
            };
    }
}

export async function analyzeText(
    systemPrompt: string,
    userContent: string,
    apiKey: string
): Promise<string> {
    const provider = detectProvider(apiKey);
    const config = getProviderConfig(provider, apiKey, false);

    if (provider === "gemini") {
        return callGemini(config, systemPrompt, userContent);
    } else if (provider === "anthropic") {
        return callAnthropic(config, systemPrompt, userContent);
    } else {
        return callOpenAICompatible(config, systemPrompt, userContent);
    }
}

export async function analyzeImage(
    systemPrompt: string,
    imageBase64: string,
    mimeType: string,
    apiKey: string
): Promise<string> {
    const provider = detectProvider(apiKey);
    const config = getProviderConfig(provider, apiKey, true);

    if (provider === "gemini") {
        return callGeminiWithImage(config, systemPrompt, imageBase64, mimeType);
    } else if (provider === "anthropic") {
        return callAnthropicWithImage(config, systemPrompt, imageBase64, mimeType);
    } else {
        return callOpenAICompatibleWithImage(
            config,
            systemPrompt,
            imageBase64,
            mimeType
        );
    }
}

// --- Gemini ---
async function callGemini(
    config: ProviderConfig,
    systemPrompt: string,
    userContent: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userContent }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGeminiWithImage(
    config: ProviderConfig,
    systemPrompt: string,
    imageBase64: string,
    mimeType: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
                {
                    parts: [
                        { inlineData: { mimeType, data: imageBase64 } },
                        { text: "Analyze this image for bias, stereotypes, and persuasion techniques." },
                    ],
                },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// --- OpenAI-Compatible (OpenAI & xAI/Grok) ---
async function callOpenAICompatible(
    config: ProviderConfig,
    systemPrompt: string,
    userContent: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`${config.model} API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
}

async function callOpenAICompatibleWithImage(
    config: ProviderConfig,
    systemPrompt: string,
    imageBase64: string,
    mimeType: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
                        },
                        {
                            type: "text",
                            text: "Analyze this image for bias, stereotypes, and persuasion techniques.",
                        },
                    ],
                },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`${config.model} API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
}

// --- Anthropic ---
async function callAnthropic(
    config: ProviderConfig,
    systemPrompt: string,
    userContent: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            model: config.model,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }],
            max_tokens: 4096,
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
}

async function callAnthropicWithImage(
    config: ProviderConfig,
    systemPrompt: string,
    imageBase64: string,
    mimeType: string
): Promise<string> {
    const res = await fetch(config.url, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
            model: config.model,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType,
                                data: imageBase64,
                            },
                        },
                        {
                            type: "text",
                            text: "Analyze this image for bias, stereotypes, and persuasion techniques.",
                        },
                    ],
                },
            ],
            max_tokens: 4096,
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
}

// --- Response Parser ---
export function parseAnalysisResponse(rawText: string): AnalysisResult {
    const sections = {
        contentSummary: "",
        biasIndicators: "",
        framingTechniques: "",
        missingPerspectives: "",
        educationalInsight: "",
    };

    // Extract sections from numbered headers
    const sectionPatterns: [keyof typeof sections, RegExp][] = [
        [
            "contentSummary",
            /(?:^|\n)#+?\s*1[\.\)]\s*Content\s*Summary\s*\n([\s\S]*?)(?=\n#+?\s*2[\.\)]|\n---CHARACTER)/i,
        ],
        [
            "biasIndicators",
            /(?:^|\n)#+?\s*2[\.\)]\s*Potential\s*Bias\s*Indicators?\s*\n([\s\S]*?)(?=\n#+?\s*3[\.\)]|\n---CHARACTER)/i,
        ],
        [
            "framingTechniques",
            /(?:^|\n)#+?\s*3[\.\)]\s*Framing\s*Techniques?\s*\n([\s\S]*?)(?=\n#+?\s*4[\.\)]|\n---CHARACTER)/i,
        ],
        [
            "missingPerspectives",
            /(?:^|\n)#+?\s*4[\.\)]\s*Missing\s*Perspectives?\s*\n([\s\S]*?)(?=\n#+?\s*5[\.\)]|\n---CHARACTER)/i,
        ],
        [
            "educationalInsight",
            /(?:^|\n)#+?\s*5[\.\)]\s*Educational\s*Insights?\s*\n([\s\S]*?)(?=\n---CHARACTER|$)/i,
        ],
    ];

    for (const [key, pattern] of sectionPatterns) {
        const match = rawText.match(pattern);
        if (match) {
            sections[key] = match[1].trim();
        }
    }

    // If structured parsing fails, fall back to splitting on numbered headers
    if (!sections.contentSummary && !sections.biasIndicators) {
        // Fallback: just use the raw text
        sections.contentSummary = rawText;
    }

    // Parse character dialogue
    const dialogueMatch = rawText.match(
        /---CHARACTER_DIALOGUE_START---([\s\S]*?)---CHARACTER_DIALOGUE_END---/
    );

    const characterDialogue: AnalysisResult["characterDialogue"] = [];

    if (dialogueMatch) {
        const dialogueLines = dialogueMatch[1].trim().split("\n");
        for (const line of dialogueLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("Detective Dot:")) {
                characterDialogue.push({
                    character: "Detective Dot",
                    message: trimmed.replace("Detective Dot:", "").trim().replace(/^"|"$/g, ""),
                    emoji: "🔍",
                });
            } else if (trimmed.startsWith("Professor Owl:")) {
                characterDialogue.push({
                    character: "Professor Owl",
                    message: trimmed.replace("Professor Owl:", "").trim().replace(/^"|"$/g, ""),
                    emoji: "🦉",
                });
            } else if (trimmed.startsWith("Curious Cat:")) {
                characterDialogue.push({
                    character: "Curious Cat",
                    message: trimmed.replace("Curious Cat:", "").trim().replace(/^"|"$/g, ""),
                    emoji: "🐱",
                });
            }
        }
    }

    return {
        rawText,
        ...sections,
        characterDialogue,
    };
}
