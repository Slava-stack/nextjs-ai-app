"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Image } from "@imagekit/next";
import { ChatMessage } from "@/app/api/client-side-tools/route";

function buildTransformationUrl(
  baseUrl: string,
  transformation: string
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}tr=${transformation}`;
}

export default function ClientSideToolsPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, stop, addToolResult } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({ api: "/api/client-side-tools" }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      async onToolCall({ toolCall }) {
        if (toolCall.dynamic) {
          return;
        }
        switch (toolCall.toolName) {
          case "changeBackground":
            {
              const { imageUrl, backgroundPrompt } = toolCall.input;
              const transformation = `e-changebg-prompt-${backgroundPrompt}`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );
              addToolResult({
                tool: "changeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
          case "removeBackground":
            {
              const { imageUrl } = toolCall.input;
              const transformation = `e-bgremove`;
              const transformedUrl = buildTransformationUrl(
                imageUrl,
                transformation
              );
              addToolResult({
                tool: "removeBackground",
                toolCallId: toolCall.toolCallId,
                output: transformedUrl,
              });
            }
            break;
        }
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input, files });
    setInput("");
    setFiles(undefined);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto pt-16 pb-36">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}
      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === "user" ? "You:" : "Assistant:"}
          </div>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="whitespace-pre-wrap"
                  >
                    {part.text}
                  </div>
                );
              case "file":
                if (part.mediaType?.startsWith("image/")) {
                  return (
                    <Image
                      urlEndpoint={
                        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                      }
                      key={`${message.id}-${index}`}
                      src={part.url}
                      alt={part.filename || `attachment-${index}`}
                      width={500}
                      height={500}
                    />
                  );
                }
                if (part.mediaType?.startsWith("application/pdf")) {
                  return (
                    <iframe
                      key={`${message.id}-${index}`}
                      src={part.url}
                      width="500"
                      height="500"
                      title={part.filename ?? `attachment-${index + 1}`}
                    ></iframe>
                  );
                }
                return null;
              case "tool-generateImage":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          Receiving image generation request...
                        </div>
                        <pre className="text-xs text-zinc-600 mt-1">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </div>
                    );
                  case "input-available":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-400">
                          Generating image for: {part.input.prompt}
                        </div>
                      </div>
                    );
                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>
                          <Image
                            urlEndpoint={
                              process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                            }
                            src={`${part.output}`}
                            alt="Generated image"
                            width={500}
                            height={500}
                          />
                        </div>
                      </div>
                    );
                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-red-400">
                          Error: {part.errorText}
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              case "tool-changeBackground":
                switch (part.state) {
                  case "input-available":
                    <div
                      key={`${message.id}-changeBackground-${index}`}
                      className="bg-zinc-800/50 border border-zinc-700 p2 rounded mt-1 mb-2"
                    >
                      <div className="text-sm text-zinc-400">
                        Changing background to: {part.input?.backgroundPrompt}
                      </div>
                    </div>;

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>Backgroun has been changed:</div>
                        <Image
                          urlEndpoint={
                            process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                          }
                          src={`${part.output}`}
                          alt="Transformed Image"
                          width={500}
                          height={500}
                        />
                      </div>
                    );

                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-red-400">
                          Error: {part.errorText}
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              case "tool-removeBackground":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-500">
                          Receiving image transformation request...
                        </div>
                        <pre className="text-xs text-zinc-600 mt-1">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </div>
                    );

                  case "input-available":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-zinc-400">
                          Removing background...
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div>
                          <Image
                            urlEndpoint={
                              process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                            }
                            src={part.output}
                            alt="Generated image"
                            width={500}
                            height={500}
                          />
                        </div>
                      </div>
                    );

                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-getImage-${index}`}
                        className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                      >
                        <div className="text-sm text-red-400">
                          Error: {part.errorText}
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              default:
                return null;
            }
          })}
        </div>
      ))}
      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex item-center gap-2">
            <div className="h-4 w-4 border-b-2 border-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 mb-4 px-4 border-t-2 pt-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-4 text-[20px] text-zinc-600 dark:text-zinc-400  hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              {files?.length
                ? `${files.length} file(s) attached`
                : "Attach file"}
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files) setFiles(files);
              }}
              multiple
              ref={fileInputRef}
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="How can I help you?"
              className="p-4 bg-grey-100 border border-grey-300 rounded-lg max-w-sm w-full text-[20px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {status === "submitted" || status === "streaming" ? (
              <button
                onClick={stop}
                className="px-6 py-4 bg-red-500 text-white text-bold rounded-lg
          text-[20px] hover:bg-red-600 transition-colors duration-350
          cursor-pointer"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={status !== "ready"}
                className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg
          text-[20px] hover:bg-blue-600 transition-colors duration-350
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
