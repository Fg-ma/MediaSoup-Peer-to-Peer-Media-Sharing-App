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
}) {
  const [gridSizePanelActive, setGridSizePanelActive] = useState(false);
  const tableGridSizeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={tableGridSizeButtonRef}
        className='h-full aspect-square'
        clickFunction={() => setGridSizePanelActive((prev) => !prev)}
        contentFunction={() => (
          <FgSVGElement
            src={distanceIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "black" },
              { key: "stroke", value: "black" },
            ]}
            style={{
              transition: "transform 0.3s ease",
              ...(gridSizePanelActive ? { transform: "rotateX(180deg)" } : {}),
            }}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Change grid size' />}
        options={{ hoverTimeoutDuration: 750, hoverZValue: 500000000000 }}
        aria-label={"Change table grid size"}
      />
      {gridSizePanelActive && (
        <TableGridSizePanel
          tableGridSizeButtonRef={tableGridSizeButtonRef}
          setGridSizePanelActive={setGridSizePanelActive}
          gridSize={gridSize}
          setGridSize={setGridSize}
        />
      )}
    </>
  );
}
