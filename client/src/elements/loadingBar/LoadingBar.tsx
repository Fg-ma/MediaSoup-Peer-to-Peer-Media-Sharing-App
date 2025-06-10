import React from "react";
import HoverElement from "../hoverElement/HoverElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

export default function LoadingBar({
  className,
  loadingBarColor = "bg-fg-red",
  progress,
}: {
  className?: string;
  loadingBarColor?: string;
  progress: number;
}) {
  return (
    <HoverElement
      className={`${className} relative overflow-hidden rounded-full bg-fg-off-white`}
      content={
        <div
          className={`${loadingBarColor} absolute left-0 top-0 h-full rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      }
      hoverContent={
        <FgHoverContentStandard
          style="light"
          content={`${progress.toFixed(2)}%`}
        />
      }
      options={{
        hoverSpacing: 4,
        hoverType: "right",
        hoverTimeoutDuration: 1750,
      }}
    />
  );
}
