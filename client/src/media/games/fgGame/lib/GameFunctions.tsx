import React, { useState } from "react";
import PlayersSection from "./playersSection/PlayersSection";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const moreIcon = nginxAssetServerBaseUrl + "svgs/moreIcon.svg";

export default function GameFunctions({
  tableTopRef,
  gameFunctionsSection,
  players,
  positioning,
}: {
  tableTopRef: React.RefObject<HTMLDivElement>;
  gameFunctionsSection: React.ReactNode[] | undefined;
  players?: {
    user?: {
      primaryColor?: string;
      secondaryColor?: string;
      shadowColor?: { r: number; g: number; b: number };
    };
    players: {
      primaryColor?: string;
      secondaryColor?: string;
      shadowColor?: { r: number; g: number; b: number };
    }[];
  };
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

  const slice = Math.max(
    1,
    Math.floor(
      ((positioning.current.scale.y / 100) *
        (tableTopRef.current?.clientHeight ?? 1)) /
        48,
    ),
  );

  return (
    <div
      className="fg-game-left-controls-section absolute bottom-0 right-full flex h-full w-[15%] min-w-14 max-w-24 flex-col items-end justify-between"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className="flex h-max w-full flex-col items-center justify-center space-y-2 px-2">
        {gameFunctionsSection && gameFunctionsSection[0]}
        {gameFunctionsSection &&
          gameFunctionsSection.length > 1 &&
          gameFunctionsSection.slice(
            1,
            hover ? undefined : Math.min(slice, gameFunctionsSection.length),
          )}
        {!hover &&
          (positioning.current.scale.y / 100) *
            (tableTopRef.current?.clientHeight ?? 1) <
            192 && (
            <FgSVGElement
              src={moreIcon}
              className="flex aspect-square w-full items-center justify-center fill-fg-white stroke-fg-white"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
              ]}
            />
          )}
      </div>
      {((positioning.current.scale.y / 100) *
        (tableTopRef.current?.clientHeight ?? 1) >
        192 ||
        hover) && <PlayersSection players={players} />}
    </div>
  );
}
