import { Agent, fetch as undiciFetch } from "undici";

const agent = new Agent({ connect: { timeout: 60_000 } });

export async function transcribeAudioWithGemini(
  audioBuffer: Buffer,
  mimeType: string,
  geminiApiKey: string
): Promise<string> {
  const base64Audio = audioBuffer.toString("base64");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  const res = await undiciFetch(url, {
    method: "POST",
    dispatcher: agent,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: "Transcribe this audio accurately and completely. Output ONLY the transcription text, with no commentary, timestamps, or formatting. If there are multiple speakers, do not label them — just output the spoken words as continuous text.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Audio transcription failed (${res.status}): ${err}`);
  }

  const data: any = await res.json();
  const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!transcript.trim()) {
    throw new Error(
      "Transcription returned empty. The audio may be unclear or contain no speech."
    );
  }

  return transcript.trim();
}
