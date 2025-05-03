import React from "react";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";

export default function LoadingElement() {
  const polarToCartesian = (angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees + 90) * Math.PI) / 180.0;
    return {
      x: 50 + 50 * Math.cos(angleInRadians),
      y: 50 + 50 * Math.sin(angleInRadians),
    };
  };

  const describeArc = (endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(0);

    const largeArcFlag = endAngle <= 180 ? "0" : "1";

    return [
      "M",
      50,
      50,
      "L",
      start.x,
      start.y,
      "A",
      50,
      50,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  return (
    <HoverElement
      className="h-8 rounded-full bg-fg-off-white"
      content={
        <svg className="h-full w-full fill-fg-red" viewBox="0 0 100 100">
          <path d={describeArc(60)} fill="red" />
        </svg>
      }
      hoverContent={
        <FgHoverContentStandard content="Filename (60%)" style="light" />
      }
      options={{
        hoverSpacing: 2,
        hoverType: "above",
        hoverTimeoutDuration: 750,
      }}
    />
  );
}
