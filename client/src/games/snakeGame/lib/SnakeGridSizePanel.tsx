import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgPanel from "../../../fgElements/fgPanel/FgPanel";
import FgSlider from "../../../fgElements/fgSlider/FgSlider";

export default function SnakeGridSizePanel({
  externalRef,
  snakeGameId,
  started,
  snakeGridSizeButtonRef,
  setGridSizePanelActive,
  setGridSize,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  snakeGameId: string;
  started: boolean;
  snakeGridSizeButtonRef: React.RefObject<HTMLButtonElement>;
  setGridSizePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { userMedia } = useMediaContext();

  return (
    <FgPanel
      externalRef={externalRef}
      content={
        <div className='h-full w-full flex items-center justify-center'>
          <FgSlider
            onValueChange={(event) => {
              if (started) {
                return;
              }

              userMedia.current.games.snake?.[snakeGameId].changeGridSize(
                event.value
              );
              setGridSize(event.value);
            }}
            disabled={started}
            options={{
              initValue: 15,
              topLabel: "Grid size",
              ticks: 6,
              rangeMax: 60,
              rangeMin: 10,
              precision: 1,
              snapToWholeNum: true,
              orientation: "horizontal",
            }}
          />
        </div>
      }
      initPosition={{
        referenceElement: snakeGridSizeButtonRef.current ?? undefined,
        placement: "below",
        padding: 8,
      }}
      initWidth={"370px"}
      initHeight={"80px"}
      minWidth={200}
      minHeight={60}
      closeCallback={() => setGridSizePanelActive(false)}
      closePosition='topRight'
    />
  );
}
