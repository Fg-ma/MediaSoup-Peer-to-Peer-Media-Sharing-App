import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgPanel from "../../../fgElements/fgPanel/FgPanel";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

import joystickIcon from "../../../../public/svgs/games/joystickIcon.svg";
import snakeGameIcon from "../../../../public/svgs/games/snake/snakeGameIcon.svg";

export default function GamesSection({
  table_id,
  username,
  instance,
}: {
  table_id: string;
  username: string;
  instance: string;
}) {
  const { userMedia } = useMediaContext();

  const [gamesActive, setGamesActive] = useState(false);
  const [cols, setCols] = useState(3);
  const gamesButtonRef = useRef<HTMLButtonElement>(null);
  const gamesSectionRef = useRef<HTMLDivElement>(null);

  const gridColumnsChange = () => {
    if (!gamesSectionRef.current) return;

    const width = gamesSectionRef.current.clientWidth;
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
    <div className='flex space-x-4 mx-2 h-full'>
      <FgButton
        externalRef={gamesButtonRef}
        clickFunction={() => setGamesActive((prev) => !prev)}
        className={`${
          gamesActive
            ? "bg-orange-500 hover:bg-orange-700"
            : "bg-blue-500 hover:bg-blue-700"
        } text-white font-bold p-1 disabled:opacity-25`}
        contentFunction={() => {
          return (
            <FgSVG
              src={joystickIcon}
              className='h-full aspect-square'
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "white", id: "joystickBottom" },
                { key: "stroke", value: "white" },
                ...(gamesActive
                  ? [{ key: "fill", value: "red", id: "joystickTop" }]
                  : [{ key: "fill", value: "none", id: "joystickTop" }]),
              ]}
            />
          );
        }}
        hoverContent={
          <FgHoverContentStandard
            content={gamesActive ? "Close games" : "Open games"}
          />
        }
      />
      {gamesActive && (
        <FgPanel
          content={
            <div
              ref={gamesSectionRef}
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
              <FgButton
                scrollingContainerRef={gamesSectionRef}
                className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3'
                contentFunction={() => (
                  <FgSVG
                    src={snakeGameIcon}
                    className='h-full aspect-square'
                    attributes={[
                      { key: "width", value: "100%" },
                      { key: "height", value: "100%" },
                    ]}
                  />
                )}
                clickFunction={() => {
                  if (!table_id || !username || !instance) {
                    return;
                  }

                  userMedia.current.gamesSignaling?.initiateGame(
                    "snake",
                    `snake_game_${uuidv4()}`
                  );
                }}
                hoverContent={
                  <FgHoverContentStandard content='Start snake game' />
                }
                options={{ hoverTimeoutDuration: 350 }}
              />
            </div>
          }
          initPosition={{
            referenceElement: gamesButtonRef.current ?? undefined,
            placement: "below",
            padding: 8,
          }}
          initWidth={"278px"}
          initHeight={"268px"}
          minWidth={204}
          minHeight={190}
          resizeCallback={gridColumnsChange}
          closeCallback={() => setGamesActive(false)}
          closePosition='topRight'
          shadow={{ top: true, bottom: true }}
        />
      )}
    </div>
  );
}
