import React, { useState, useEffect, useRef } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import SnakeGameController from "./lib/SnakeGameController";
import { SnakeColorsType } from "./lib/typeConstant";
import "./lib/snakeGame.css";

import gameOverCard from "../../../public/snakeGameAssets/gameOverCard.jpg";

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
  tableRef,
  tableTopRef,
}: {
  username: string;
  instance: string;
  snakeGameId: string;
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
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
  const [minDimension, setMinDimension] = useState<"height" | "width">("width");
  const focused = useRef(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const snakeGameRef = useRef<HTMLDivElement>(null);

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
    setMinDimension,
    snakeGameRef,
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

    snakeGameController.getMinDimension();
  }, [gridSize, boardRef.current, snakeGameRef.current]);

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
    <FgPanel
      content={
        <div ref={snakeGameRef} className='w-full h-full'>
          <div
            ref={boardRef}
            className={`snake-game-board aspect-square relative ${
              minDimension === "width" ? "w-full" : "h-full"
            }`}
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
                <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl'>
                  Press any key to start
                </div>
              </div>
            )}
            {staged && (
              <div
                className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30'
                onClick={snakeGameController.startGameClick}
              >
                <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl'>
                  Stagging
                </div>
              </div>
            )}
          </div>
        </div>
      }
      panelBoundariesRef={tableTopRef}
      panelBoundariesScrollingContainerRef={tableRef}
      panelInsertionPointRef={tableRef}
      resizeCallback={snakeGameController.getMinDimension}
      focusCallback={(focus) => (focused.current = focus)}
      initHeight={"400px"}
      initWidth={"400px"}
      minWidth={150}
      minHeight={150}
      initPosition={{ relativeToBoundaries: "center" }}
    />
  );
}

export default SnakeGame;
