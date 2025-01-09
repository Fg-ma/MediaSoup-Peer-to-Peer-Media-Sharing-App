import React, { useState, useEffect, useRef } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgGame from "../../fgElements/fgGame/FgGame";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgSVG from "../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../fgElements/fgImageElement/FgImageElement";
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

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const gameOverCard =
  nginxAssetSeverBaseUrl + "snakeGameAssets/gameOverCard.jpg";

const snakeColorChangeIcon =
  nginxAssetSeverBaseUrl + "svgs/games/snake/snakeColorChangeIcon.svg";
const gridIcon = nginxAssetSeverBaseUrl + "svgs/games/snake/gridIcon.svg";
const gridOffIcon = nginxAssetSeverBaseUrl + "svgs/games/snake/gridOffIcon.svg";

function SnakeGame({
  table_id,
  username,
  instance,
  snakeGameId,
  sharedBundleRef,
}: {
  table_id: string;
  username: string;
  instance: string;
  snakeGameId: string;
  sharedBundleRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

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

  const snakeGameController = new SnakeGameController(
    snakeGameId,
    userMedia,
    gridSize,
    gameState,
    setGameState,
    focused,
    started,
    setStarted,
    setGameOver,
    setPlayersState,
    playersState,
    setGridSize
  );

  useEffect(() => {
    document.addEventListener("keydown", snakeGameController.handleKeyPress);

    boardRef.current?.style.setProperty(
      "--nginx-asset-server-base-url",
      nginxAssetSeverBaseUrl ?? ""
    );

    return () => {
      document.removeEventListener(
        "keydown",
        snakeGameController.handleKeyPress
      );
    };
  }, [started]);

  useEffect(() => {
    if (
      !userMedia.current.games.snake ||
      !userMedia.current.games.snake[snakeGameId] ||
      !userMedia.current.games.snake[snakeGameId].ws ||
      userMedia.current.games.snake[snakeGameId].ws.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    userMedia.current.games.snake[snakeGameId].getIntialGameStates();

    userMedia.current.games.snake[snakeGameId].ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      snakeGameController.handleMessage(message);
    };
  }, [userMedia.current.games.snake?.[snakeGameId]?.ws?.readyState]);

  useEffect(() => {
    if (userMedia.current.games.snake?.[snakeGameId]?.initiator) {
      userMedia.current.games.snake?.[snakeGameId]?.joinGame({});
    }
  }, [userMedia.current.games.snake?.[snakeGameId]?.initiator]);

  return (
    <>
      <FgGame
        table_id={table_id}
        username={username}
        instance={instance}
        gameId={snakeGameId}
        gameStarted={started}
        sharedBundleRef={sharedBundleRef}
        content={
          <div
            ref={boardRef}
            className='snake-game-board w-full aspect-square relative rounded overflow-hidden flex flex-col'
          >
            {snakeGameController.renderBoard()}
            {gameOver && (
              <div
                className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 cursor-pointer'
                onClick={snakeGameController.startGameClick}
              >
                <div
                  className='w-4/5 h-3/5 rounded-lg flex items-center justify-center font-K2D text-2xl bg-no-repeat bg-cover'
                  style={{ backgroundImage: `url(${gameOverCard})` }}
                ></div>
              </div>
            )}
            {!started && !gameOver && (
              <div
                className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30'
                onClick={snakeGameController.startGameClick}
              >
                <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl select-none'>
                  Press any key to start
                </div>
              </div>
            )}
          </div>
        }
        gameFunctionsSection={
          <div
            className={`flex flex-col items-center justify-center h-max w-full space-y-2 px-2`}
          >
            {playersState[username] && playersState[username][instance] && (
              <>
                <FgButton
                  className='w-full aspect-square rounded-xl bg-white overflow-hidden border-2 border-gray-300'
                  clickFunction={() =>
                    setSnakeColorPanelActive((prev) => !prev)
                  }
                  contentFunction={() => {
                    const { primary, secondary } =
                      playersState[username][instance].snakeColor;

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
                  className='w-full aspect-square'
                  clickFunction={() =>
                    setSnakeColorPanelActive((prev) => !prev)
                  }
                  contentFunction={() => (
                    <FgSVG
                      src={snakeColorChangeIcon}
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "white" },
                        { key: "stroke", value: "white" },
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
                  className='w-full aspect-square'
                  clickFunction={() => setGridSizePanelActive((prev) => !prev)}
                  contentFunction={() => {
                    const src = gridSizePanelActive ? gridOffIcon : gridIcon;

                    return (
                      <FgSVG
                        src={src}
                        attributes={[
                          { key: "width", value: "100%" },
                          { key: "height", value: "100%" },
                          { key: "fill", value: "white" },
                          { key: "stroke", value: "white" },
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
            playersState[username] && playersState[username][instance]
              ? {
                  primaryColor:
                    playersState[username][instance].snakeColor.primary,
                  secondaryColor:
                    playersState[username][instance].snakeColor.secondary,
                  shadowColor:
                    colorMap[
                      playersState[username][instance].snakeColor.primary
                    ],
                }
              : undefined,
          players: Object.entries(playersState)
            .flatMap(([playerUsername, userState]) =>
              Object.entries(userState).map(
                ([playerInstance, instanceState]) => {
                  if (
                    playerUsername !== username ||
                    playerInstance !== instance
                  ) {
                    return {
                      primaryColor: instanceState.snakeColor.primary,
                      secondaryColor: instanceState.snakeColor.secondary,
                      shadowColor: colorMap[instanceState.snakeColor.primary],
                    };
                  }
                }
              )
            )
            .filter((player) => player !== undefined),
        }}
        startGameFunction={() => {
          if (!started) {
            setGameOver(false);
            userMedia.current.games.snake?.[snakeGameId]?.startGame();
          }
        }}
        closeGameFunction={() => {
          userMedia.current.games.snake?.[snakeGameId]?.closeGame();
        }}
        joinGameFunction={() => {
          userMedia.current.games.snake?.[snakeGameId]?.joinGame({
            snakeColor: userSnakeColor.current,
          });
        }}
        leaveGameFunction={() => {
          if (
            Object.keys(playersState).length === 0 ||
            (Object.keys(playersState).length === 1 &&
              Object.keys(Object.values(playersState)[0]).length <= 1)
          ) {
            userMedia.current.games.snake?.[snakeGameId]?.closeGame();
          } else {
            userMedia.current.games.snake?.[snakeGameId]?.leaveGame();
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
