import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../fgButton/FgButton";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import CaptureMediaController from "../../CaptureMediaController";
import { captureMediaTypeMeta, CaptureMediaTypes } from "../../typeConstant";
import FgHoverContentStandard from "../../../../fgHoverContentStandard/FgHoverContentStandard";

export default function TypeButton({
  mediaType,
  recording,
  recordingCount,
  captureMediaController,
  captureMediaEffectsActive,
  captureMediaTypeActive,
}: {
  mediaType: React.MutableRefObject<CaptureMediaTypes>;
  recording: React.MutableRefObject<boolean>;
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
  }, [mediaType.current, recording.current]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (time < 60) {
      return `${seconds}`;
    }

    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <FgButton
      className="pointer-events-auto relative z-20 h-full max-h-full w-max overflow-hidden"
      clickFunction={(event) => {
        event.stopPropagation();
        captureMediaController.handleCaptureMediaType();
      }}
      contentFunction={() =>
        mediaType.current === "camera" ||
        (mediaType.current === "video" && !recording.current) ? (
          <FgSVGElement
            src={captureMediaTypeMeta[mediaType.current].icon}
            className="aspect-square h-full"
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
            className="flex h-full w-max items-center justify-center font-Josefin text-fg-white"
            style={{ fontSize, lineHeight: "0.8lh", paddingTop }}
          >
            {recording.current && mediaType.current === "video"
              ? formatTime(recordingCount)
              : recordingCount}
          </div>
        )
      }
      hoverContent={
        !captureMediaEffectsActive && !captureMediaTypeActive ? (
          <FgHoverContentStandard content="Capture type (h)" style="light" />
        ) : undefined
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
      }}
    />
  );
}
