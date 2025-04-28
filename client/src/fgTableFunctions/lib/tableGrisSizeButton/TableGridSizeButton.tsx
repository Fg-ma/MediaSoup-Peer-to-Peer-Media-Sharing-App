import React, { useRef, useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import TableGridSizePanel from "./lib/TableGridSizePanel";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const distanceIcon = nginxAssetServerBaseUrl + "svgs/distanceIcon.svg";

export default function TableGridSizeButton({
  gridSize,
  setGridSize,
  gridSizeSectionRef,
}: {
  gridSize: {
    rows: number;
    cols: number;
  };
  setGridSize: React.Dispatch<
    React.SetStateAction<{
      rows: number;
      cols: number;
    }>
  >;
  gridSizeSectionRef: React.RefObject<HTMLDivElement>;
}) {
  const [gridSizePanelActive, setGridSizePanelActive] = useState(false);
  const tableGridSizeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={tableGridSizeButtonRef}
        className="aspect-square h-full"
        clickFunction={() => setGridSizePanelActive((prev) => !prev)}
        contentFunction={() => (
          <FgSVGElement
            src={distanceIcon}
            className="fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
            style={{
              transition: "transform 0.3s ease",
              ...(gridSizePanelActive ? { transform: "rotateX(180deg)" } : {}),
            }}
          />
        )}
        hoverContent={<FgHoverContentStandard content="Change grid size" />}
        options={{ hoverTimeoutDuration: 750 }}
        aria-label={"Change table grid size"}
      />
      {gridSizePanelActive && (
        <TableGridSizePanel
          gridSizeSectionRef={gridSizeSectionRef}
          tableGridSizeButtonRef={tableGridSizeButtonRef}
          setGridSizePanelActive={setGridSizePanelActive}
          gridSize={gridSize}
          setGridSize={setGridSize}
        />
      )}
    </>
  );
}
