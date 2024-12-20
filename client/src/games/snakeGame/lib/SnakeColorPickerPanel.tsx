import React, { useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgPanel from "../../../fgElements/fgPanel/FgPanel";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgImage from "../../../fgElements/fgImage/FgImage";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import { snakeColorIconMap, SnakeColorsType } from "./typeConstant";
import { PlayersState } from "../SnakeGame";

export default function SnakeColorPickerPanel({
  username,
  instance,
  snakeGameId,
  snakeColorPickerButtonRef,
  setSnakeColorPanelActive,
  playersState,
  userSnakeColor,
}: {
  username: string;
  instance: string;
  snakeGameId: string;
  snakeColorPickerButtonRef: React.RefObject<HTMLButtonElement>;
  setSnakeColorPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  playersState: PlayersState;
  userSnakeColor: React.MutableRefObject<SnakeColorsType | undefined>;
}) {
  const { userMedia } = useMediaContext();

  const [cols, setCols] = useState(3);
  const snakeColorPickerRef = useRef<HTMLDivElement>(null);

  const usedColors = new Set<SnakeColorsType>(
    Object.values(playersState).flatMap((instances) =>
      Object.values(instances).map((playerState) => playerState.snakeColor)
    )
  );

  const gridColumnsChange = () => {
    if (!snakeColorPickerRef.current) return;

    const width = snakeColorPickerRef.current.clientWidth;
    if (width < 300) {
      if (cols !== 3) setCols(3);
    } else if (width < 500) {
      if (cols !== 4) setCols(4);
    } else if (width < 700) {
      if (cols !== 5) setCols(5);
    } else if (width >= 700) {
      if (cols !== 6) setCols(6);
    }
  };

  return (
    <FgPanel
      content={
        <div
          ref={snakeColorPickerRef}
          className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
            cols === 3
              ? "grid-cols-3"
              : cols === 4
              ? "grid-cols-4"
              : cols === 5
              ? "grid-cols-5"
              : "grid-cols-6"
          }`}
        >
          {Object.entries(snakeColorIconMap).map(
            ([primaryColor, secondaryObject]) =>
              Object.entries(secondaryObject).map(([secondaryColor, src]) => (
                <FgButton
                  key={`${primaryColor}-${secondaryColor}`}
                  scrollingContainerRef={snakeColorPickerRef}
                  className={`flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 ${
                    playersState[username] &&
                    playersState[username][instance] &&
                    playersState[username][instance].snakeColor.primary ===
                      primaryColor &&
                    playersState[username][instance].snakeColor.primary ===
                      secondaryColor
                      ? "border-fg-secondary"
                      : "border-gray-300"
                  }`}
                  contentFunction={() => (
                    <FgImage
                      src={src}
                      style={{ width: "100%", height: "100%" }}
                      alt={`Snake color option: ${primaryColor} ${secondaryColor}`}
                    />
                  )}
                  clickFunction={() => {
                    if (
                      !usedColors.has({
                        primary: primaryColor,
                        secondary: secondaryColor,
                      } as SnakeColorsType)
                    ) {
                      userMedia.current.games.snake?.[
                        snakeGameId
                      ]?.changeSnakeColor({
                        primary: primaryColor,
                        secondary: secondaryColor,
                      } as SnakeColorsType);
                      userSnakeColor.current = {
                        primary: primaryColor,
                        secondary: secondaryColor,
                      } as SnakeColorsType;
                    }
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content={`${
                        primaryColor.charAt(0).toUpperCase() +
                        primaryColor.slice(1)
                      } ${secondaryColor}`}
                    />
                  }
                  options={{ hoverTimeoutDuration: 1750 }}
                />
              ))
          )}
        </div>
      }
      initPosition={{
        referenceElement: snakeColorPickerButtonRef.current ?? undefined,
        placement: "below",
        padding: 8,
      }}
      initWidth={"278px"}
      initHeight={"268px"}
      minWidth={204}
      minHeight={190}
      resizeCallback={gridColumnsChange}
      closeCallback={() => setSnakeColorPanelActive(false)}
      closePosition='topRight'
      shadow={{ top: true, bottom: true }}
    />
  );
}
