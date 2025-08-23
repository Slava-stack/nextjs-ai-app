"use client";

import { useState, useRef } from "react";

interface TranscriptResult {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  language?: string;
  durationInSeconds: number;
}

export default function TranscribeAudioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an audio file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);

      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscript(data);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error transcribing audio", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTranscript(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTranscript(null);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col items-center mx-auto py-24">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {isLoading && (
        <div className="text-center mb-4">Trancribing audio...</div>
      )}
      {transcript && !isLoading && (
        <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-4xl w-full">
          <h3 className="mb-3">Transcript:</h3>
          <p className="whitespace-pre-wrap">{transcript.text}</p>
        </div>
      )}
      <form
        onSubmit={submitHandler}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4"
      >
        <div className="flex flex-col gap-2 pt-4 border-t-2">
          {selectedFile && (
            <div className="flex items-center justify-between text-sm text-grey-600">
              <span className="">Selected: {selectedFile.name}</span>
              <button
                className="text-red-500 hover:text-red-600"
                type="button"
                onClick={resetForm}
              >
                Remove selected file
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio"
              className="hidden"
              id="audio-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="audio-upload"
              className="px-6 py-4 bg-gray-500 rounded-lg text-[20px]"
            >
              {selectedFile ? "Change file" : "Select audio file"}
            </label>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg text-[20px] rounded-lg hover:bg-blue-600 transition-colors duration-350 cursor-pointer"
            >
              Transcribe
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
