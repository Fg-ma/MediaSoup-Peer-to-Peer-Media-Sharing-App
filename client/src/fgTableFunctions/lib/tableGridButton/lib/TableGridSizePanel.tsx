import React, { useState } from "react";
import FgPanel from "../../../../fgElements/fgPanel/FgPanel";
import FgSlider from "../../../../fgElements/fgSlider/FgSlider";
import FgToggleButton from "../../../../fgElements/fgToggleButton/FgToggleButton";

export default function TableGridSizePanel({
  tableGridSizeButtonRef,
  setGridSizePanelActive,
  gridSize,
  setGridSize,
}: {
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
      content={
        <div className='h-full w-full flex flex-col items-start justify-center'>
          <div className='w-[4.5rem] h-8'>
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
      closePosition='topRight'
    />
  );
}
