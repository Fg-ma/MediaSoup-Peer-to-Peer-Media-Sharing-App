import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const joystickIcon = nginxAssetSeverBaseUrl + "svgs/games/joystickIcon.svg";
const snakeGameIcon =
  nginxAssetSeverBaseUrl + "svgs/games/snake/snakeGameIcon.svg";

export default function GamesSection() {
  const { userMedia } = useMediaContext();
  const { table_id, username, instance } = useUserInfoContext();

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
    <div className='flex w-full aspect-square'>
      <FgButton
        externalRef={gamesButtonRef}
        clickFunction={() => setGamesActive((prev) => !prev)}
        className='flex h-full aspect-square items-center justify-center'
        contentFunction={() => {
          return (
            <FgSVG
              src={joystickIcon}
              className='h-full aspect-square'
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "black", id: "joystickBottom" },
                { key: "stroke", value: "black" },
                ...(gamesActive
                  ? [{ key: "fill", value: "#e80110", id: "joystickTop" }]
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
        options={{ hoverTimeoutDuration: 750 }}
        aria-label={"Games"}
      />
      {gamesActive && (
        <FgPanel
          content={
            <LazyScrollingContainer
              externalRef={gamesSectionRef}
              className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
                cols === 3
                  ? "grid-cols-3"
                  : cols === 4
                  ? "grid-cols-4"
                  : cols === 5
                  ? "grid-cols-5"
                  : "grid-cols-6"
              }`}
              items={[
                <FgButton
                  scrollingContainerRef={gamesSectionRef}
                  className='flex border-gray-300 items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3'
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
                    if (
                      !table_id.current ||
                      !username.current ||
                      !instance.current
                    ) {
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
                  options={{ hoverTimeoutDuration: 750 }}
                  aria-label={"Snake game"}
                />,
              ]}
            />
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
