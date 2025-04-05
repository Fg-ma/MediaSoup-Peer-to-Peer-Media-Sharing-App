import React, { useRef } from "react";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgPortal from "../fgPortal/FgPortal";
import "./faceCountButton.css";

export default function FaceCountButton({
  style,
  clickFunctionCallback,
  forceDetectingFaces,
  noFacesDetectedWarning,
}: {
  style: React.CSSProperties;
  clickFunctionCallback?: () => void;
  forceDetectingFaces: React.MutableRefObject<boolean>;
  noFacesDetectedWarning: boolean;
}) {
  const faceCountButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={faceCountButtonRef}
        className={`${
          forceDetectingFaces.current ? "force-detect-face-blink" : ""
        } !aspect-square bg-fg-red-light rounded-full absolute left-1/2 -translate-x-1/2`}
        style={style}
        clickFunction={async () => {
          if (clickFunctionCallback) clickFunctionCallback();
        }}
        hoverContent={
          !forceDetectingFaces.current && !noFacesDetectedWarning ? (
            <FgHoverContentStandard content='No faces detected! Retry face detection?' />
          ) : undefined
        }
        options={{
          hoverZValue: 500000000001,
          hoverTimeoutDuration: 1500,
          disabled: forceDetectingFaces.current,
        }}
      />
      {noFacesDetectedWarning && (
        <FgPortal
          type='above'
          spacing={4}
          content={
            <FgHoverContentStandard style='light' content='No faces detected' />
          }
          externalRef={faceCountButtonRef}
          zValue={500000000002}
        />
      )}
    </>
  );
}
