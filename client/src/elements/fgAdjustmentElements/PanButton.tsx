import React, { CSSProperties } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const panIcon = nginxAssetServerBaseUrl + "svgs/panIcon.svg";

export default function PanButton({
  externalRef,
  className,
  style,
  dragFunction,
  bundleRef,
  pointerDownFunction,
  pointerUpFunction,
}: {
  externalRef?: React.RefObject<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  pointerDownFunction: () => void;
  pointerUpFunction: () => void;
}) {
  return (
    <FgButton
      externalRef={externalRef}
      className={className}
      style={style}
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
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
    />
  );
}
