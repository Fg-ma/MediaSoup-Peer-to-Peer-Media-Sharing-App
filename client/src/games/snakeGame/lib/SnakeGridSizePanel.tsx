import React from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import FgSlider from "../../../elements/fgSlider/FgSlider";

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
  const { staticContentMedia } = useMediaContext();

  return (
    <FgPanel
      externalRef={externalRef}
      content={
        <div className="flex h-full w-full items-center justify-center">
          <FgSlider
            onValueChange={(event) => {
              if (started) {
                return;
              }

              staticContentMedia.current.games.snake?.[
                snakeGameId
              ].changeGridSize(event.value);
              setGridSize(event.value);
            }}
            disabled={started}
            options={{
              initValue: 15,
              bottomLabel: "Grid size",
              ticks: 6,
              rangeMax: 60,
              rangeMin: 10,
              precision: 0,
              snapToWholeNum: true,
              orientation: "vertical",
            }}
          />
        </div>
      }
      initPosition={{
        referenceElement: snakeGridSizeButtonRef.current ?? undefined,
        placement: "left",
        padding: 8,
      }}
      initWidth={"80px"}
      initHeight={"370px"}
      minWidth={60}
      minHeight={200}
      closeCallback={() => setGridSizePanelActive(false)}
      closePosition="topRight"
    />
  );
}
