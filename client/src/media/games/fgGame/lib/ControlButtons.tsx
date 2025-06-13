import React, { useState } from "react";
import FgGameButton from "../../../../elements/fgGameButton/FgGameButton";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

export default function ControlButtons({
  tableTopRef,
  startGameFunction,
  joinGameFunction,
  leaveGameFunction,
  userPlaying,
  playerCount,
  positioning,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
  startGameFunction?: () => void;
  joinGameFunction?: () => void;
  leaveGameFunction?: () => void;
  userPlaying: boolean;
  playerCount: number;
  positioning: React.MutableRefObject<{
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }>;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`${(positioning.current.scale.x / 100) * (tableTopRef.current?.clientWidth ?? 1) <= 140 ? `${hover ? "h-[108px]" : "h-[36px]"} absolute bottom-0 left-0 flex-col-reverse` : "h-full space-x-2 py-2"} flex w-max items-center justify-center transition-all`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <FgGameButton
        className={`${(positioning.current.scale.x / 100) * (tableTopRef.current?.clientWidth ?? 1) <= 140 ? "h-[26px]" : "h-full"} aspect-square`}
        clickFunction={startGameFunction}
        hoverContent={<FgHoverContentStandard content="Start (p)" />}
        options={{
          primaryColor: "#3cf599",
          secondaryColor: "#00e359",
          hoverTimeoutDuration: 750,
          hoverType: "above",
          hoverSpacing: 4,
        }}
      />
      {!hover &&
        (positioning.current.scale.x / 100) *
          (tableTopRef.current?.clientWidth ?? 1) <
          140 && (
          <div className="absolute right-[-2px] top-[-2px] aspect-square h-[6px] rounded-full bg-fg-red-light"></div>
        )}
      {(hover ||
        (positioning.current.scale.x / 100) *
          (tableTopRef.current?.clientWidth ?? 1) >
          140) && (
        <>
          <FgGameButton
            className={`${(positioning.current.scale.x / 100) * (tableTopRef.current?.clientWidth ?? 1) <= 140 ? "my-2 h-[26px]" : "h-full"} aspect-square`}
            clickFunction={joinGameFunction}
            hoverContent={<FgHoverContentStandard content="Join game (j)" />}
            options={{
              primaryColor: "#3991ff",
              secondaryColor: "#095dcc",
              hoverTimeoutDuration: 750,
              hoverType: "above",
              hoverSpacing: 4,
            }}
          />
          <FgGameButton
            className={`${(positioning.current.scale.x / 100) * (tableTopRef.current?.clientWidth ?? 1) <= 140 ? "h-[26px]" : "h-full"} aspect-square`}
            clickFunction={leaveGameFunction}
            hoverContent={
              <FgHoverContentStandard
                content={
                  userPlaying
                    ? playerCount > 1
                      ? "Leave game (l)"
                      : "End game (l)"
                    : "End game (l)"
                }
              />
            }
            options={{
              primaryColor: "#fd473c",
              secondaryColor: "#e11008",
              hoverTimeoutDuration: 750,
              hoverType: "above",
              hoverSpacing: 4,
            }}
          />
        </>
      )}
    </div>
  );
}
