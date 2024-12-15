import React, { useState, useEffect, useRef } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import SnakeGameController from "./lib/SnakeGameController";
import { SnakeColorsType } from "./lib/typeConstant";
import "./lib/snakeGame.css";

import gameOverCard from "../../../public/snakeGameAssets/gameOverCard.jpg";

function SnakeGame({
  snakeGameId,
  tableRef,
  tableTopRef,
}: {
  snakeGameId: string;
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const gridSize = 15;
  const gameSpeed = 150;
  const initialSnake = [
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) + 1 },
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) + 2 },
  ];
  const initialFood = [
    {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      class: "snake-game-apple",
    },
    {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      class: "snake-game-banana",
    },
    {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      class: "snake-game-donut",
    },
    {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      class: "snake-game-orange",
    },
  ];

  const [snake, setSnake] = useState(initialSnake);
  const [snakeColor, _setSnakeColor] = useState<SnakeColorsType>({
    primary: "blue",
    secondary: "green",
  });
  const food = useRef(initialFood);
  const direction = useRef<"right" | "left" | "up" | "down">("up");
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [minDimension, setMinDimension] = useState<"height" | "width">("width");
  const focused = useRef(true);
  const gameInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const boardRef = useRef<HTMLDivElement>(null);
  const snakeGameRef = useRef<HTMLDivElement>(null);

  const snakeGameController = new SnakeGameController(
    userMedia,
    snakeGameId,
    gridSize,
    snake,
    setSnake,
    initialSnake,
    snakeColor,
    food,
    direction,
    setGameOver,
    started,
    setStarted,
    focused,
    gameInterval,
    setMinDimension,
    snakeGameRef
  );

  useEffect(() => {
    if (gameOver || !started) return;

    gameInterval.current = setInterval(snakeGameController.gameLoop, gameSpeed);

    return () => clearInterval(gameInterval.current);
  }, [snake, gameOver, started]);

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
            {!started && !gameOver && (
              <div
                className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30'
                onClick={snakeGameController.startGameClick}
              >
                <div className='w-4/5 h-3/5 rounded-lg bg-fg-white-95 flex items-center justify-center font-K2D text-2xl'>
                  Press any key to start
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
