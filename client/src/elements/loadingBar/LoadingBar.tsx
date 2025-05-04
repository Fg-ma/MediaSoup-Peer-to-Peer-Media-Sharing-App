import React from "react";
import HoverElement from "../hoverElement/HoverElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

export default function LoadingBar({
  className,
  progress,
}: {
  className?: string;
  progress: number;
}) {
  return (
    <HoverElement
      className={`${className} relative overflow-hidden rounded-full bg-fg-off-white`}
      content={
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-fg-red"
          style={{ width: `${progress}%` }}
        ></div>
      }
      hoverContent={
        <FgHoverContentStandard style="light" content={`${progress}%`} />
      }
      options={{
        hoverSpacing: 4,
        hoverType: "right",
        hoverTimeoutDuration: 1750,
      }}
    />
  );
}
