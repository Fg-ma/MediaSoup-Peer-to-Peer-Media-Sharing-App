import React from "react";
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
  return (
    <div
      className={`${(positioning.current.scale.x / 100) * (tableTopRef.current?.clientWidth ?? 1) <= 140 ? "bg-red-500" : ""} flex h-full w-max items-center justify-center space-x-2 py-2`}
    >
      <FgGameButton
        className="aspect-square h-full"
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
      <FgGameButton
        className="aspect-square h-full"
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
        className="aspect-square h-full"
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
    </div>
  );
}
