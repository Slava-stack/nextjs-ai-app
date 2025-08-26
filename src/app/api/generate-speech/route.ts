import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as gerateSpeech } from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const { audio } = await gerateSpeech({
      model: openai.speech("tts-1"),
      text,
    });

    const fixed = new Uint8Array(audio.uint8Array);
    const blob = new Blob([fixed], { type: audio.mediaType || "audio/mpeg" });

    return new Response(blob, {
      headers: { "Content-Type": audio.mediaType || "audio/mpeg" },
    });
  } catch (err) {
    console.error("Error generating speech:", err);
    return new Response("Failed to generate speech", { status: 500 });
  }
}
