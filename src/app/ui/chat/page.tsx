"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop } = useChat();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto py-24">
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
        <div className="flex justify-end gap-4">
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
      </form>
    </div>
  );
}
