import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import CaptureMediaController from "./CaptureMediaController";
import { captureMediaTypeMeta, CaptureMediaTypes } from "./typeConstant";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

export default function MediaTypeButton({
  mediaType,
  recordingCount,
  captureMediaController,
  captureMediaEffectsActive,
  captureMediaTypeActive,
}: {
  mediaType: CaptureMediaTypes;
  recordingCount: number;
  captureMediaController: CaptureMediaController;
  captureMediaEffectsActive: boolean;
  captureMediaTypeActive: boolean;
}) {
  const [fontSize, setFontSize] = useState("16px");
  const [paddingTop, setPaddingTop] = useState("2px");

  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateFontSize = () => {
      if (counterRef.current) {
        const height = counterRef.current.clientHeight;
        setFontSize(`${height * 0.9}px`);
        setPaddingTop(`${height * 0.15}px`);
      }
    };

    const observer = new ResizeObserver(updateFontSize);
    if (counterRef.current) observer.observe(counterRef.current);

    return () => observer.disconnect();
  }, [mediaType]);

  return (
    <FgButton
      className='max-h-full h-full w-max relative overflow-hidden'
      clickFunction={captureMediaController.handleCaptureMediaType}
      contentFunction={() =>
        mediaType === "camera" || mediaType === "video" ? (
          <FgSVG
            src={captureMediaTypeMeta[mediaType].icon}
            className='h-full aspect-square'
            attributes={[
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
              { key: "height", value: "100%" },
              { key: "width", value: "100%" },
            ]}
          />
        ) : (
          <div
            ref={counterRef}
            className='flex h-full w-max aspect-square font-Josefin text-fg-white items-center justify-center'
            style={{ fontSize, lineHeight: "0.8lh", paddingTop }}
          >
            {recordingCount}
          </div>
        )
      }
      hoverContent={
        !captureMediaEffectsActive && !captureMediaTypeActive ? (
          <FgHoverContentStandard content='Capture type (h)' style='light' />
        ) : undefined
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000,
      }}
    />
  );
}
