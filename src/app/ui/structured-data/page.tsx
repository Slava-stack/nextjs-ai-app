"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

export default function StructuredDataPaga() {
  const [input, setInput] = useState("");
  const { submit, error, stop, isLoading, object } = useObject({
    api: "/api/structured-data",
    schema: recipeSchema,
  });

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit({ dish: input });
    setInput("");
  };

  return (
    <div className="flex flex-col items-center mx-auto pt-10">
      {error && <div className="text-[15px] text-red">{error.message}</div>}
      {isLoading && (
        <div className="w-4 border-b-2 border-blue-400 rounded-full animate-spin"></div>
      )}
      {object?.recipe && (
        <div className="w-full max-w-4xl">
          <h2>{object.recipe.name}</h2>
          <div>Ingredience:</div>
          <ul className="list-disc marker:text-orange-500 pl-10">
            {object.recipe.ingredience?.map((el, index) => {
              if (el) return <li key={index}>{`${el.name} - ${el.amount}`}</li>;
            })}
          </ul>
          <div>
            <div>Steps</div>
            {object.steps?.map((step, index) => (
              <div key={index}>{`${index + 1}. ${step}`}</div>
            ))}
          </div>
        </div>
      )}
      <form
        onSubmit={submitHandler}
        className="flex justify-center fixed bottom-0 p-4 border-t-2 flex gap-4 max-w-4xl w-full"
      >
        <input
          type="text"
          placeholder="Enter a dish name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="p-4 bg-grey-100 border border-grey-300 rounded-lg max-w-sm w-full text-[20px]"
        />
        {isLoading ? (
          <button
            onClick={stop}
            className="px-6 py-4 bg-red-500 text-white text-bold rounded-lg text-[20px] rounded-lg hover:bg-red-600 transition-colors duration-350 cursor-pointer"
          >
            Stop
          </button>
        ) : (
          <button
            disabled={!input}
            className="px-6 py-4 bg-blue-500 text-white text-bold rounded-lg text-[20px] rounded-lg hover:bg-blue-600 transition-colors duration-350 cursor-pointer"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
