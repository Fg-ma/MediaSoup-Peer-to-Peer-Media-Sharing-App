import React, { useRef, useState } from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import TableGridSizePanel from "./lib/TableGridSizePanel";
import "./lib/tableGridSection.css";

import gridIcon from "../../../../public/svgs/games/snake/gridIcon.svg";
import gridOffIcon from "../../../../public/svgs/games/snake/gridOffIcon.svg";
import distanceIcon from "../../../../public/svgs/distanceIcon.svg";

export default function TableGridSection({
  gridActive,
  setGridActive,
  gridSize,
  setGridSize,
}: {
  gridActive: boolean;
  setGridActive: React.Dispatch<React.SetStateAction<boolean>>;
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
    <div className='flex items-center justify-center h-full'>
      <FgButton
        externalRef={tableGridSizeButtonRef}
        className='h-full aspect-square'
        clickFunction={() => setGridActive((prev) => !prev)}
        contentFunction={() => {
          const src = gridActive ? gridOffIcon : gridIcon;

          return (
            <FgSVG
              src={src}
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "black" },
                { key: "stroke", value: "black" },
              ]}
            />
          );
        }}
      />
      <FgButton
        externalRef={tableGridSizeButtonRef}
        className='h-full aspect-square'
        clickFunction={() => setGridSizePanelActive((prev) => !prev)}
        contentFunction={() => (
          <FgSVG
            src={distanceIcon}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "black" },
              { key: "stroke", value: "black" },
            ]}
            className={
              gridSizePanelActive
                ? "grid-size-icon grid-size-icon-flipped"
                : "grid-size-icon"
            }
          />
        )}
      />
      {gridSizePanelActive && (
        <TableGridSizePanel
          tableGridSizeButtonRef={tableGridSizeButtonRef}
          setGridSizePanelActive={setGridSizePanelActive}
          gridSize={gridSize}
          setGridSize={setGridSize}
        />
      )}
    </div>
  );
}
