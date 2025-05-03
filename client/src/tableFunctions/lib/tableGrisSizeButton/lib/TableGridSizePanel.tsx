import React, { useState } from "react";
import FgPanel from "../../../../elements/fgPanel/FgPanel";
import FgSlider from "../../../../elements/fgSlider/FgSlider";
import FgToggleButton from "../../../../elements/fgToggleButton/FgToggleButton";

export default function TableGridSizePanel({
  gridSizeSectionRef,
  tableGridSizeButtonRef,
  setGridSizePanelActive,
  gridSize,
  setGridSize,
}: {
  gridSizeSectionRef: React.RefObject<HTMLDivElement>;
  tableGridSizeButtonRef: React.RefObject<HTMLButtonElement>;
  setGridSizePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [squareActive, setSquareActive] = useState(false);
  const [externalStyleValue, setExternalStyleValue] = useState(gridSize);

  return (
    <FgPanel
      externalRef={gridSizeSectionRef}
      content={
        <div className="flex h-full w-full flex-col items-start justify-between space-y-2">
          <div className="h-8 w-[4.5rem]">
            <FgToggleButton
              stateChangeFunction={(state) => {
                setSquareActive(state === 0 ? false : true);
              }}
              btnLabels={["Deactivate square grid", "Activate square grid"]}
              hoverable={true}
            />
          </div>
          <FgSlider
            externalValue={gridSize.rows}
            externalStyleValue={externalStyleValue.rows}
            onValueChange={(event) => {
              if (squareActive) {
                setGridSize({
                  rows: event.value,
                  cols: event.value,
                });
                setExternalStyleValue({
                  rows: event.styleValue,
                  cols: event.styleValue,
                });
              } else {
                setGridSize((prev) => ({ ...prev, rows: event.value }));
                setExternalStyleValue((prev) => ({
                  ...prev,
                  rows: event.styleValue,
                }));
              }
            }}
            options={{
              initValue: 15,
              bottomLabel: "Rows",
              ticks: 6,
              rangeMax: 100,
              rangeMin: 0,
              precision: 0,
              snapToWholeNum: true,
              orientation: "horizontal",
              labelsColor: "#d6d6d6",
            }}
          />
          <FgSlider
            externalValue={gridSize.cols}
            externalStyleValue={externalStyleValue.cols}
            onValueChange={(event) => {
              if (squareActive) {
                setGridSize({
                  rows: event.value,
                  cols: event.value,
                });
                setExternalStyleValue({
                  rows: event.styleValue,
                  cols: event.styleValue,
                });
              } else {
                setGridSize((prev) => ({ ...prev, cols: event.value }));
                setExternalStyleValue((prev) => ({
                  ...prev,
                  cols: event.styleValue,
                }));
              }
            }}
            options={{
              initValue: 15,
              bottomLabel: "Columns",
              ticks: 6,
              rangeMax: 100,
              rangeMin: 0,
              precision: 0,
              snapToWholeNum: true,
              orientation: "horizontal",
              labelsColor: "#d6d6d6",
            }}
          />
        </div>
      }
      initPosition={{
        referenceElement: tableGridSizeButtonRef.current ?? undefined,
        placement: "below",
        padding: 8,
      }}
      initWidth={"370px"}
      initHeight={"180px"}
      minWidth={200}
      minHeight={160}
      closeCallback={() => setGridSizePanelActive(false)}
      closePosition="topRight"
      backgroundColor={"#161616"}
      secondaryBackgroundColor={"#212121"}
    />
  );
}
