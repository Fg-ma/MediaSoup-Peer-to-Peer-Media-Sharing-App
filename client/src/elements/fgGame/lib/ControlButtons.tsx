import React from "react";
import FgGameButton from "../../fgGameButton/FgGameButton";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

export default function ControlButtons({
  startGameFunction,
  joinGameFunction,
  leaveGameFunction,
  userPlaying,
  playerCount,
}: {
  startGameFunction?: () => void;
  joinGameFunction?: () => void;
  leaveGameFunction?: () => void;
  userPlaying: boolean;
  playerCount: number;
}) {
  return (
    <div className='flex items-center justify-center w-max h-full space-x-2 py-2'>
      <FgGameButton
        className='h-full aspect-square'
        clickFunction={startGameFunction}
        hoverContent={<FgHoverContentStandard content='Start (p)' />}
        options={{
          primaryColor: "#3cf599",
          secondaryColor: "#00e359",
          hoverTimeoutDuration: 750,
          hoverType: "above",
          hoverSpacing: 4,
        }}
      />
      <FgGameButton
        className='h-full aspect-square'
        clickFunction={joinGameFunction}
        hoverContent={<FgHoverContentStandard content='Join game (j)' />}
        options={{
          primaryColor: "#3991ff",
          secondaryColor: "#095dcc",
          hoverTimeoutDuration: 750,
          hoverType: "above",
          hoverSpacing: 4,
        }}
      />
      <FgGameButton
        className='h-full aspect-square'
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
