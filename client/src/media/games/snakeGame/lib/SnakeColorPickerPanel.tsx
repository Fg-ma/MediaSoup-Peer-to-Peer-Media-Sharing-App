import React, { useRef } from "react";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import FgPanel from "../../../../elements/fgPanel/FgPanel";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgImageElement from "../../../../elements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../../elements/lazyScrollingContainer/LazyScrollingContainer";
import {
  PlayersState,
  snakeColorIconMap,
  SnakeColorsType,
} from "./typeConstant";

export default function SnakeColorPickerPanel({
  externalRef,
  snakeGameId,
  snakeColorPickerButtonRef,
  setSnakeColorPanelActive,
  playersState,
  userSnakeColor,
}: {
  externalRef: React.RefObject<HTMLDivElement>;
  snakeGameId: string;
  snakeColorPickerButtonRef: React.RefObject<HTMLButtonElement>;
  setSnakeColorPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  playersState: React.MutableRefObject<PlayersState>;
  userSnakeColor: React.MutableRefObject<SnakeColorsType | undefined>;
}) {
  const { staticContentMedia } = useMediaContext();

  const snakeColorPickerRef = useRef<HTMLDivElement>(null);

  const usedColors = Object.values(playersState.current).flatMap((instances) =>
    Object.values(instances).map((playerState) => playerState.snakeColor),
  );

  return (
    <FgPanel
      className="border-2 border-fg-white shadow-md shadow-fg-tone-black-8"
      externalRef={externalRef}
      content={
        <LazyScrollingContainer
          externalRef={snakeColorPickerRef}
          className="grid small-vertical-scroll-bar h-full w-full items-center justify-center gap-1 overflow-y-auto py-2"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(3rem, 5rem))",
            gridAutoRows: "max-content",
          }}
          items={[
            ...Object.entries(snakeColorIconMap).flatMap(
              ([primaryColor, secondaryObject]) =>
                Object.entries(secondaryObject).map(([secondaryColor, src]) => (
                  <FgButton
                    key={`${primaryColor}-${secondaryColor}`}
                    scrollingContainerRef={snakeColorPickerRef}
                    className={`flex aspect-square w-full items-center justify-center rounded hover:bg-fg-red-light ${
                      usedColors.some(
                        (color) =>
                          color.primary === primaryColor &&
                          color.secondary === secondaryColor,
                      )
                        ? "bg-fg-red-light"
                        : "bg-fg-tone-black-1"
                    }`}
                    contentFunction={() => (
                      <FgImageElement
                        src={src}
                        style={{
                          width: "100%",
                          height: "100%",
                          ...(usedColors.some(
                            (color) =>
                              color.primary === primaryColor &&
                              color.secondary === secondaryColor,
                          )
                            ? { filter: "grayscale(100%)" }
                            : {}),
                        }}
                        alt={`Snake color option: ${primaryColor} ${secondaryColor}`}
                      />
                    )}
                    clickFunction={() => {
                      if (
                        !usedColors.some(
                          (color) =>
                            color.primary === primaryColor &&
                            color.secondary === secondaryColor,
                        )
                      ) {
                        staticContentMedia.current.games.snake?.[
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
                )),
            ),
          ]}
        />
      }
      initPosition={{
        referenceElement: snakeColorPickerButtonRef.current ?? undefined,
        placement: "left",
        padding: 8,
      }}
      initWidth={"308px"}
      initHeight={"268px"}
      minWidth={150}
      minHeight={190}
      closeCallback={() => setSnakeColorPanelActive(false)}
      closePosition="topRight"
      shadow={{ top: true, bottom: true }}
      backgroundColor={"#090909"}
      secondaryBackgroundColor={"#161616"}
    />
  );
}
