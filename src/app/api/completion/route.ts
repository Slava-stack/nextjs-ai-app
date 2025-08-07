import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const { text } = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt,
    });

    return Response.json({ text });
  } catch (err) {
    console.error("Error in completion route:", err);
    return Response.json(
      { error: "Failed to generate completion. Please try again." },
      { status: 500 }
    );
  }
}
