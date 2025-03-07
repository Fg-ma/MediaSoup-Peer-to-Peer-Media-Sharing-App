import React from "react";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import "./faceCountButton.css";

export default function FaceCountButton({
  scrollingContainerRef,
  clickFunctionCallback,
  forceDetectingFaces,
}: {
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  clickFunctionCallback?: () => void;
  forceDetectingFaces: boolean;
}) {
  return (
    <FgButton
      className={`${
        forceDetectingFaces ? "force-detect-face-blink" : ""
      } h-3 !aspect-square bg-fg-red-light rounded-full absolute left-1/2 -translate-x-1/2 top-0 mb-1`}
      clickFunction={async () => {
        if (clickFunctionCallback) clickFunctionCallback();
      }}
      hoverContent={
        !forceDetectingFaces ? (
          <FgHoverContentStandard content='No faces detected! Retry face detection?' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      options={{
        hoverZValue: 500000000001,
        hoverTimeoutDuration: 1500,
        disabled: forceDetectingFaces,
      }}
    />
  );
}
