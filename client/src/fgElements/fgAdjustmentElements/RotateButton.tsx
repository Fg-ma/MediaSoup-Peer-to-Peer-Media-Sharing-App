import React from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const rotateIcon = nginxAssetSeverBaseUrl + "svgs/rotateIcon.svg";

export default function RotateButton({
  className,
  dragFunction,
  bundleRef,
  pointerDownFunction,
  pointerUpFunction,
}: {
  className?: string;
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
      pointerDownFunction={pointerDownFunction}
      pointerUpFunction={pointerUpFunction}
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVG
            src={rotateIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
    />
  );
}
