import React, { useState, useEffect, useRef } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import FgGame from "../../elements/fgGame/FgGame";
import FgButton from "../../elements/fgButton/FgButton";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgImageElement from "../../elements/fgImageElement/FgImageElement";
import SnakeGameController from "./lib/SnakeGameController";
import SnakeColorPickerPanel from "./lib/SnakeColorPickerPanel";
import SnakeGridSizePanel from "./lib/SnakeGridSizePanel";
import {
  colorMap,
  GameState,
  PlayersState,
  snakeColorIconMap,
  SnakeColorsType,
} from "./lib/typeConstant";
import "./lib/snakeGame.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const gameOverCard =
  nginxAssetServerBaseUrl + "snakeGameAssets/gameOverCard.jpg";

const snakeColorChangeIcon =
  nginxAssetServerBaseUrl + "svgs/games/snake/snakeColorChangeIcon.svg";
const gridIcon = nginxAssetServerBaseUrl + "svgs/games/snake/gridIcon.svg";
const gridOffIcon =
  nginxAssetServerBaseUrl + "svgs/games/snake/gridOffIcon.svg";

function SnakeGame({
  snakeGameId,
  sharedBundleRef,
}: {
  snakeGameId: string;
  sharedBundleRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { username, instance } = useUserInfoContext();

  const [gridSize, setGridSize] = useState(15);

  const [gameState, setGameState] = useState<GameState>({
    snakes: {},
    food: [],
  });
  const [playersState, setPlayersState] = useState<PlayersState>({});
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [snakeColorPanelActive, setSnakeColorPanelActive] = useState(false);
  const [gridSizePanelActive, setGridSizePanelActive] = useState(false);
  const focused = useRef(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const snakeColorPickerButtonRef = useRef<HTMLButtonElement>(null);
  const snakeGridSizeButtonRef = useRef<HTMLButtonElement>(null);
  const snakeColorPickerPanelRef = useRef<HTMLDivElement>(null);
  const snakeGridSizePanelRef = useRef<HTMLDivElement>(null);
  const userSnakeColor = useRef<SnakeColorsType | undefined>(undefined);

  const snakeGameController = useRef(
    new SnakeGameController(
      snakeGameId,
      staticContentMedia,
      gridSize,
      gameState,
      setGameState,
      focused,
      started,
      setStarted,
      setGameOver,
      setPlayersState,
      playersState,
      setGridSize,
    ),
  );

  useEffect(() => {
    document.addEventListener(
      "keydown",
      snakeGameController.current.handleKeyPress,
    );

    boardRef.current?.style.setProperty(
      "--nginx-asset-server-base-url",
      nginxAssetServerBaseUrl ?? "",
    );

    return () => {
      document.removeEventListener(
        "keydown",
        snakeGameController.current.handleKeyPress,
      );
    };
  }, [started]);

  useEffect(() => {
    if (
      !staticContentMedia.current.games.snake ||
      !staticContentMedia.current.games.snake[snakeGameId] ||
      !staticContentMedia.current.games.snake[snakeGameId].ws ||
      staticContentMedia.current.games.snake[snakeGameId].ws.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    staticContentMedia.current.games.snake[snakeGameId].getIntialGameStates();

    staticContentMedia.current.games.snake[snakeGameId].ws.onmessage = (
      event,
    ) => {
      const message = JSON.parse(event.data);
      snakeGameController.current.handleMessage(message);
    };
  }, [staticContentMedia.current.games.snake?.[snakeGameId]?.ws?.readyState]);

  useEffect(() => {
    if (staticContentMedia.current.games.snake?.[snakeGameId]?.initiator) {
      staticContentMedia.current.games.snake?.[snakeGameId]?.joinGame({});
    }
  }, [staticContentMedia.current.games.snake?.[snakeGameId]?.initiator]);

  return (
    <>
      <FgGame
        gameId={snakeGameId}
        gameStarted={started}
        sharedBundleRef={sharedBundleRef}
        content={
          <div
            ref={boardRef}
            className="selectable snake-game-board relative flex aspect-square w-full flex-col overflow-hidden rounded"
            data-selectable-type="game"
            data-selectable-id={snakeGameId}
          >
            {snakeGameController.current.renderBoard()}
            {gameOver && (
              <div
                className="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-black bg-opacity-30"
                onClick={snakeGameController.current.startGameClick}
              >
                <div
                  className="flex h-3/5 w-4/5 items-center justify-center rounded-lg bg-cover bg-no-repeat font-K2D text-2xl"
                  style={{ backgroundImage: `url(${gameOverCard})` }}
                ></div>
              </div>
            )}
            {!started && !gameOver && (
              <div
                className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-30"
                onClick={snakeGameController.current.startGameClick}
              >
                <div className="flex h-3/5 w-4/5 select-none items-center justify-center rounded-lg bg-fg-white-95 font-K2D text-2xl">
                  Press any key to start
                </div>
              </div>
            )}
          </div>
        }
        gameFunctionsSection={
          <div
            className={`flex h-max w-full flex-col items-center justify-center space-y-2 px-2`}
          >
            {playersState[username.current] &&
              playersState[username.current][instance.current] && (
                <>
                  <FgButton
                    className="aspect-square w-full overflow-hidden rounded-xl border-2 border-gray-300 bg-white"
                    clickFunction={() =>
                      setSnakeColorPanelActive((prev) => !prev)
                    }
                    contentFunction={() => {
                      const { primary, secondary } =
                        playersState[username.current][instance.current]
                          .snakeColor;

                      return (
                        <FgImageElement
                          // @ts-expect-error: can't correlate primary with secondary color
                          src={snakeColorIconMap[primary][secondary]}
                          style={{ width: "100%", height: "100%" }}
                          alt={`Snake color option: ${primary} ${secondary}`}
                        />
                      );
                    }}
                  />
                  <FgButton
                    externalRef={snakeColorPickerButtonRef}
                    className="aspect-square w-full"
                    clickFunction={() =>
                      setSnakeColorPanelActive((prev) => !prev)
                    }
                    contentFunction={() => (
                      <FgSVGElement
                        src={snakeColorChangeIcon}
                        attributes={[
                          { key: "width", value: "100%" },
                          { key: "height", value: "100%" },
                          { key: "fill", value: "#f2f2f2" },
                          { key: "stroke", value: "#f2f2f2" },
                          ...(snakeColorPanelActive
                            ? [
                                {
                                  key: "stroke",
                                  value: "#3cf599",
                                  id: "circle1",
                                },
                                {
                                  key: "stroke",
                                  value: "#3991ff",
                                  id: "circle2",
                                },
                                {
                                  key: "stroke",
                                  value: "#fd473c",
                                  id: "circle3",
                                },
                              ]
                            : []),
                        ]}
                      />
                    )}
                  />
                  <FgButton
                    externalRef={snakeGridSizeButtonRef}
                    className="aspect-square w-full"
                    clickFunction={() =>
                      setGridSizePanelActive((prev) => !prev)
                    }
                    contentFunction={() => {
                      const src = gridSizePanelActive ? gridOffIcon : gridIcon;

                      return (
                        <FgSVGElement
                          src={src}
                          attributes={[
                            { key: "width", value: "100%" },
                            { key: "height", value: "100%" },
                            { key: "fill", value: "#f2f2f2" },
                            { key: "stroke", value: "#f2f2f2" },
                          ]}
                        />
                      );
                    }}
                  />
                </>
              )}
          </div>
        }
        players={{
          user:
            playersState[username.current] &&
            playersState[username.current][instance.current]
              ? {
                  primaryColor:
                    playersState[username.current][instance.current].snakeColor
                      .primary,
                  secondaryColor:
                    playersState[username.current][instance.current].snakeColor
                      .secondary,
                  shadowColor:
                    colorMap[
                      playersState[username.current][instance.current]
                        .snakeColor.primary
                    ],
                }
              : undefined,
          players: Object.entries(playersState)
            .flatMap(([playerUsername, userState]) =>
              Object.entries(userState).map(
                ([playerInstance, instanceState]) => {
                  if (
                    playerUsername !== username.current ||
                    playerInstance !== instance.current
                  ) {
                    return {
                      primaryColor: instanceState.snakeColor.primary,
                      secondaryColor: instanceState.snakeColor.secondary,
                      shadowColor: colorMap[instanceState.snakeColor.primary],
                    };
                  }
                },
              ),
            )
            .filter((player) => player !== undefined),
        }}
        startGameFunction={() => {
          if (!started) {
            setGameOver(false);
            staticContentMedia.current.games.snake?.[snakeGameId]?.startGame();
          }
        }}
        closeGameFunction={() => {
          staticContentMedia.current.games.snake?.[snakeGameId]?.closeGame();
        }}
        joinGameFunction={() => {
          staticContentMedia.current.games.snake?.[snakeGameId]?.joinGame({
            snakeColor: userSnakeColor.current,
          });
        }}
        leaveGameFunction={() => {
          if (
            Object.keys(playersState).length === 0 ||
            (Object.keys(playersState).length === 1 &&
              Object.keys(Object.values(playersState)[0]).length <= 1)
          ) {
            staticContentMedia.current.games.snake?.[snakeGameId]?.closeGame();
          } else {
            staticContentMedia.current.games.snake?.[snakeGameId]?.leaveGame();
          }
        }}
        popupRefs={[snakeColorPickerPanelRef, snakeGridSizePanelRef]}
        initPosition={{ relativeToBoundaries: "center" }}
      />
      {snakeColorPanelActive && (
        <SnakeColorPickerPanel
          externalRef={snakeColorPickerPanelRef}
          snakeGameId={snakeGameId}
          snakeColorPickerButtonRef={snakeColorPickerButtonRef}
          setSnakeColorPanelActive={setSnakeColorPanelActive}
          playersState={playersState}
          userSnakeColor={userSnakeColor}
        />
      )}
      {gridSizePanelActive && (
        <SnakeGridSizePanel
          externalRef={snakeGridSizePanelRef}
          started={started}
          snakeGameId={snakeGameId}
          snakeGridSizeButtonRef={snakeGridSizeButtonRef}
          setGridSizePanelActive={setGridSizePanelActive}
          setGridSize={setGridSize}
        />
      )}
    </>
  );
}

export default SnakeGame;
