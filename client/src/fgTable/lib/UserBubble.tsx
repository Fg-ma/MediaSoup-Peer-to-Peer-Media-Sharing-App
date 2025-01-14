import React from "react";
import FgImage from "../../fgElements/fgImageElement/FgImageElement";

export default function UserBubble({
  fullDim,
  src,
  srcLoading,
  primaryColor,
  secondaryColor,
}: {
  fullDim: "width" | "height";
  src: string;
  srcLoading: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div
      className={`aspect-square rounded-full border-2 overflow-hidden ${
        fullDim === "height" ? "h-full" : "w-full"
      }`}
      style={{
        borderColor: primaryColor,
        boxShadow: `0px 4px 8px ${secondaryColor}`,
      }}
    >
      <FgImage src={src} srcLoading={srcLoading} />
    </div>
  );
}
