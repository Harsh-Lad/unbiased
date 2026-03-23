import ytdl from "@distube/ytdl-core";

const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB — Gemini inline data limit

export async function downloadAudioBuffer(
  videoId: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const info = await ytdl.getInfo(url);

  const format = ytdl.chooseFormat(info.formats, {
    quality: "lowestaudio",
    filter: "audioonly",
  });

  if (!format) {
    throw new Error(
      "No audio format available for this video. It may be restricted or unavailable."
    );
  }

  const stream = ytdl(url, { format });
  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of stream) {
    totalSize += chunk.length;
    if (totalSize > MAX_AUDIO_SIZE) {
      stream.destroy();
      throw new Error(
        "Audio file too large for transcription (>20MB). Try a shorter video."
      );
    }
    chunks.push(Buffer.from(chunk));
  }

  const mimeType = format.mimeType?.split(";")[0] || "audio/webm";

  return {
    buffer: Buffer.concat(chunks),
    mimeType,
  };
}
