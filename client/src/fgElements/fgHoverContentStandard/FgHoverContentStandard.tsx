import React from "react";

export default function FgHoverContentStandard({
  content,
  style = "light",
}: {
  content: string;
  style?: "light" | "dark";
}) {
  return (
    <div
      className={`mb-1 w-max py-1 px-2 font-K2D text-base shadow-lg rounded-md ${
        style === "light"
          ? "text-black bg-white"
          : "text-white bg-black bg-opacity-75"
      }`}
    >
      {content}
    </div>
  );
}
