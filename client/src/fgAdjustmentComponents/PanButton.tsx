import React from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import panIcon from "../../public/svgs/panIcon.svg";

export default function PanButton({
  externalRef,
  className,
  dragFunction,
  bundleRef,
  mouseDownFunction,
  mouseUpFunction,
}: {
  externalRef?: React.RefObject<HTMLButtonElement>;
  className?: string;
  dragFunction: (displacement: { x: number; y: number }) => void;
  bundleRef: React.RefObject<HTMLDivElement>;
  mouseDownFunction: () => void;
  mouseUpFunction: () => void;
}) {
  return (
    <FgButton
      externalRef={externalRef}
      className={className}
      mouseDownFunction={mouseDownFunction}
      mouseUpFunction={mouseUpFunction}
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
