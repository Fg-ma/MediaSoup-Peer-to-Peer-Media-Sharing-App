import React, { useState, useEffect, useRef } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgGame from "../../fgElements/fgGame/FgGame";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgSVG from "../../fgElements/fgSVG/FgSVG";
import SnakeGameController from "./lib/SnakeGameController";
import { SnakeColorsType } from "./lib/typeConstant";
import "./lib/snakeGame.css";

import gameOverCard from "../../../public/snakeGameAssets/gameOverCard.jpg";

import snakeColorChangeIcon from "../../../public/svgs/games/snake/snakeColorChangeIcon.svg";
import gridIcon from "../../../public/svgs/games/snake/gridIcon.svg";
import gridOffIcon from "../../../public/svgs/games/snake/gridOffIcon.svg";

export type Directions = "up" | "down" | "left" | "right";

export type Snake = {
  position: { x: number; y: number }[];
  direction: Directions;
};

export type GameState = {
  snakes: { [username: string]: { [instance: string]: Snake } };
  food: { x: number; y: number; class: string }[];
};

function SnakeGame({
  username,
  instance,
  snakeGameId,
  bundleRef,
}: {
  username: string;
  instance: string;
  snakeGameId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const gridSize = 15;

  const [gameState, setGameState] = useState<GameState>({
    snakes: {},
    food: [],
  });
  const [snakeColor, _setSnakeColor] = useState<SnakeColorsType>({
    primary: "blue",
    secondary: "green",
  });
  const [gameOver, _setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [staged, setStaged] = useState(false);
  const [snakeColorPanelActive, setSnakeColorPanelActive] = useState(false);
  const [gridSizePanelActive, setGridSizePanelActive] = useState(false);
  const focused = useRef(true);
  const boardRef = useRef<HTMLDivElement>(null);

  const snakeGameController = new SnakeGameController(
    username,
    instance,
    snakeGameId,
    userMedia,
    gridSize,
    gameState,
    setGameState,
    snakeColor,
    focused,
    started,
    setStarted,
    setStaged
  );

  useEffect(() => {
    document.addEventListener("keydown", snakeGameController.handleKeyPress);

    return () => {
      document.removeEventListener(
        "keydown",
        snakeGameController.handleKeyPress
      );
    };
  }, [started]);

  useEffect(() => {
    boardRef.current?.style.setProperty("--grid-size", `${gridSize}`);
  }, [gridSize, boardRef.current]);

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

    userMedia.current.games.snake[snakeGameId].ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      snakeGameController.handleMessage(message);
    };
  }, [userMedia.current.games.snake?.[snakeGameId]?.ws?.readyState]);

  return (
    <FgGame
      bundleRef={bundleRef}
      content={
        <div
          ref={boardRef}
          className='snake-game-board w-full aspect-square relative rounded overflow-hidden'
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
          {!staged && !started && !gameOver && (
            <div
              className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30'
              onClick={snakeGameController.startGameClick}
            >
              <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl select-none'>
                Press any key to start
              </div>
            </div>
          )}
          {staged && (
            <div
              className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30'
              onClick={snakeGameController.startGameClick}
            >
              <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl select-none'>
                Stagging
              </div>
            </div>
          )}
        </div>
      }
      gameFunctionsSection={
        <div
          className={`flex flex-col items-center justify-center h-max space-y-2 px-2`}
        >
          <FgButton
            className='w-12 aspect-square'
            clickFunction={() => setSnakeColorPanelActive((prev) => !prev)}
            contentFunction={() => (
              <FgSVG
                src={snakeColorChangeIcon}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                  { key: "fill", value: "white" },
                  { key: "stroke", value: "white" },
                ]}
              />
            )}
          />
          <FgButton
            className='w-12 aspect-square'
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
        </div>
      }
      initPosition={{ relativeToBoundaries: "center" }}
    />
  );
}

export default SnakeGame;
