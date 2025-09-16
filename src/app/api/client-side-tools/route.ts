import {
  UIMessage,
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  experimental_generateImage as generateImage,
  UIDataTypes,
  InferUITools,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import ImageKit from "imagekit";

const uploadImage = async (img: string) => {
  const imagekit = new ImageKit({
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_API_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_API_KEY as string,
  });

  const response = await imagekit.upload({
    file: img,
    fileName: "generated_image.jpg",
  });

  return response.url;
};

const tools = {
  generateImage: tool({
    description: "Generate image from a prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate an image for"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: openai.imageModel("dall-e-3"),
        prompt,
        size: "1024x1024",
        providerOptions: {
          openai: { style: "vivid", quality: "hd" },
        },
      });

      const url = await uploadImage(image.base64);

      return url;
    },
  }),
  changeBackground: tool({
    description: "Change image background based on text prompt",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded images"),
      backgroundPrompt: z
        .string()
        .describe(
          `The prompt for changing image background (e.g., "modern office", "mountain landscape", "tropical beach")`
        ),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
  removeBackground: tool({
    description: "Remove the background of an image",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-5-nano"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("Error streaming chat completion:", err);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
