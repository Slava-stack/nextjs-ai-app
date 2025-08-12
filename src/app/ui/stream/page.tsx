"use client";

import { useCompletion } from "@ai-sdk/react";

export default function StreamPage() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    stop,
  } = useCompletion({
    api: "/api/stream",
  });

  return (
    <div className="flex flex-col h-full items-center pt-20">
      {error && <div className="text-red-500">{error.message}</div>}
      {isLoading && !completion && <div>Loading...</div>}
      {completion && (
        <div className="w-xl whitespace-pre-wrap">{completion}</div>
      )}
      <form
        action="submit"
        className="fixed bottom-0 mb-4 px-4 border-t-2 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
          setInput("");
        }}
      >
        <div className="flex justify-end gap-4">
          <input
            type="text"
            placeholder="How can I help you?"
            className="p-4 bg-grey-100 border border-grey-300 rounded-lg max-w-sm w-full text-[20px]"
            value={input}
            onChange={handleInputChange}
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="px-6 py-4 bg-red-500 text-white text-bold rounded-lg text-[20px] hover:bg-red-600 transition-colors duration-350 cursor-pointer"
            >
              Stop
            </button>
          ) : (
            <button className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg text-[20px] hover:bg-blue-600 transition-colors duration-350 cursor-pointer">
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
