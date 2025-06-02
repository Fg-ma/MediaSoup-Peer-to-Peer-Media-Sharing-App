import React from "react";

export default function FgHoverContentStandard({
  content,
  style = "light",
}: {
  content: string | React.ReactElement;
  style?: "light" | "dark";
}) {
  return (
    <div
      className={`mb-1 w-max rounded-md px-2 py-1 font-K2D text-base shadow-lg ${
        style === "light"
          ? "bg-fg-white text-fg-tone-black-1"
          : "bg-fg-tone-black-1 text-fg-white"
      }`}
    >
      {content}
    </div>
  );
}
