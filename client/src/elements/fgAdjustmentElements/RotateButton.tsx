import React, { CSSProperties } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const rotateIcon = nginxAssetServerBaseUrl + "svgs/rotateIcon.svg";

export default function RotateButton({
  className,
  style,
  dragFunction,
  bundleRef,
  pointerDownFunction,
  pointerUpFunction,
}: {
  className?: string;
  style?: CSSProperties;
  dragFunction: (
    displacement: {
      x: number;
      y: number;
    },
    event: PointerEvent
  ) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  pointerDownFunction: () => void;
  pointerUpFunction: () => void;
}) {
  return (
    <FgButton
      className={className}
      style={style}
      pointerDownFunction={pointerDownFunction}
      pointerUpFunction={pointerUpFunction}
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={rotateIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
    />
  );
}
