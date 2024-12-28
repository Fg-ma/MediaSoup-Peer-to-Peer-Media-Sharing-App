import React from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const panIcon = nginxAssetSeverBaseUrl + "svgs/panIcon.svg";

export default function PanButton({
  externalRef,
  className,
  dragFunction,
  bundleRef,
  pointerDownFunction,
  pointerUpFunction,
}: {
  externalRef?: React.RefObject<HTMLButtonElement>;
  className?: string;
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  pointerDownFunction: () => void;
  pointerUpFunction: () => void;
}) {
  return (
    <FgButton
      externalRef={externalRef}
      className={className}
      pointerDownFunction={pointerDownFunction}
      pointerUpFunction={pointerUpFunction}
      dragFunction={dragFunction}
      referenceDragElement={bundleRef}
      contentFunction={() => {
        return (
          <FgSVG
            src={panIcon}
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
