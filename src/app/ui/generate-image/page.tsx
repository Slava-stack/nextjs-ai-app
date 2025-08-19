"use client";

import { useState } from "react";
import Image from "next/image";

export default function GenerateImagePage() {
  const [input, setInput] = useState("");
  const [imageSrc, setImageSrc] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setImageSrc(null);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setImageSrc(`data:image/png;base64,${data}`);
    } catch (err) {
      console.error("Error generating image:" + err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setInput("");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col mx-auto items-center w-full max-w-md py-24">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-full mb-20 aspect-square">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-gray-300 rounded-lg"></div>
        ) : (
          imageSrc && (
            <Image
              src={imageSrc}
              alt="Generated Image"
              className="w-full h-full rounded-lg shadow-lg"
              width={1024}
              height={1024}
            />
          )
        )}
      </div>
      <form
        onSubmit={submitHandler}
        className="flex justify-center fixed bottom-0 p-4 border-t-2 flex gap-4 max-w-4xl w-full"
      >
        <input
          type="text"
          placeholder="Describe the image"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="p-4 bg-grey-100 border border-grey-300 rounded-lg max-w-sm w-full text-[20px]"
        />
        <button
          disabled={!input || isLoading}
          className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg text-[20px] rounded-lg hover:bg-blue-600 transition-colors duration-350 cursor-pointer"
        >
          Generate
        </button>
      </form>
    </div>
  );
}
