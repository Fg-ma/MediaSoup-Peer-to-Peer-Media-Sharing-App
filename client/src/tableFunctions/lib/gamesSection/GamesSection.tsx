import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const joystickIcon = nginxAssetServerBaseUrl + "svgs/games/joystickIcon.svg";
const snakeGameIcon =
  nginxAssetServerBaseUrl + "svgs/games/snake/snakeGameIcon.svg";

export default function GamesSection({
  gamesSectionRef,
}: {
  gamesSectionRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { tableId, username, instance } = useUserInfoContext();

  const [gamesActive, setGamesActive] = useState(false);
  const gamesButtonRef = useRef<HTMLButtonElement>(null);
  const gamesScrollingContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <FgButton
        externalRef={gamesButtonRef}
        clickFunction={() => setGamesActive((prev) => !prev)}
        className="flex aspect-square h-full items-center justify-center"
        contentFunction={() => {
          return (
            <FgSVGElement
              src={joystickIcon}
              className="aspect-square h-full"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "#d6d6d6", id: "joystickBottom" },
                { key: "stroke", value: "#d6d6d6" },
                ...(gamesActive
                  ? [{ key: "fill", value: "#e62833", id: "joystickTop" }]
                  : [
                      {
                        key: "fill",
                        value: "none",
                        id: "joystickTop",
                      },
                    ]),
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
          externalRef={gamesSectionRef}
          className="border border-fg-white shadow-md shadow-fg-white"
          content={
            <LazyScrollingContainer
              externalRef={gamesScrollingContainerRef}
              className="small-vertical-scroll-bar grid h-full items-center justify-center gap-1 overflow-y-auto py-2"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(3rem, 5rem))",
                gridAutoRows: "max-content",
              }}
              items={[
                <FgButton
                  scrollingContainerRef={gamesScrollingContainerRef}
                  className="flex aspect-square items-center justify-center rounded bg-fg-tone-black-1 hover:bg-fg-red-light"
                  contentFunction={() => (
                    <FgSVGElement
                      src={snakeGameIcon}
                      className="aspect-square h-full"
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  )}
                  clickFunction={() => {
                    if (
                      !tableId.current ||
                      !username.current ||
                      !instance.current
                    ) {
                      return;
                    }

                    staticContentMedia.current.gamesSignaling?.initiateGame(
                      "snake",
                      `snake_game_${uuidv4()}`,
                    );
                  }}
                  hoverContent={
                    <FgHoverContentStandard content="Start snake game" />
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
          initWidth={"308px"}
          initHeight={"268px"}
          minWidth={150}
          minHeight={190}
          closeCallback={() => setGamesActive(false)}
          closePosition="topRight"
          shadow={{ top: true, bottom: true }}
          backgroundColor={"#090909"}
          secondaryBackgroundColor={"#161616"}
        />
      )}
    </>
  );
}
