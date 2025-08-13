"use client";

import { useState } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setPrompt("");

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch completion");

      setCompletion(data.text);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch completion. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="display flex justify-center h-full items-center">
      {completion ? (
        <div className="whitespace-pre-wrap w-xl">{completion}</div>
      ) : null}
      {error && <div className="text-red-500">{error}</div>}
      <form
        onSubmit={complete}
        className="fixed bottom-0 mb-4 px-4 border-t-2 pt-4"
      >
        <div className="flex justify-end gap-4">
          <input
            type="text"
            placeholder="How can I help you?"
            className="bg-grey-100 border border-gray-300 rounded-lg p-4 w-full max-w-sm text-[20px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            disabled={isLoading}
            type="submit"
            className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg text-[20px] hover:bg-blue-600 transition-colors duration-350 cursor-pointer"
          >
            {isLoading ? "Wait" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
