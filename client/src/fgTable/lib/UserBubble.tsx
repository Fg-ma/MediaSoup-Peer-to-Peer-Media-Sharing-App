import React from "react";
import FgImage from "../../fgElements/fgImageElement/FgImageElement";

export default function UserBubble({
  src,
  srcLoading,
  primaryColor,
  secondaryColor,
}: {
  src: string;
  srcLoading: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div
      className='h-full aspect-square rounded-full border-2 overflow-hidden'
      style={{
        borderColor: primaryColor,
        boxShadow: `0px 4px 8px ${secondaryColor}`,
      }}
    >
      <FgImage src={src} srcLoading={srcLoading} />
    </div>
  );
}
