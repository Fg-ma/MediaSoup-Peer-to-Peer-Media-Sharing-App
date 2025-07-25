import React, { CSSProperties } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const scaleIcon = nginxAssetServerBaseUrl + "svgs/scaleIcon.svg";

export default function ScaleButton({
  externalRef,
  className,
  style,
  dragFunction,
  bundleRef,
  pointerDownFunction,
  pointerUpFunction,
  onPointerEnter,
  onPointerLeave,
}: {
  externalRef?: React.RefObject<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  pointerDownFunction: () => void;
  pointerUpFunction: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <FgButton
      externalRef={externalRef}
      className={className}
      style={style}
      startDragFunction={pointerDownFunction}
      stopDragFunction={pointerUpFunction}
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={scaleIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}
