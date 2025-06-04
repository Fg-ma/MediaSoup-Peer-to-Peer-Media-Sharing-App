import React from "react";
import SnakeGameSocket from "./SnakeGameSocket";
import { GameState, PlayersState } from "./typeConstant";
import SnakeGameMedia from "../SnakeGameMedia";

class SnakeGameController extends SnakeGameSocket {
  constructor(
    private snakeGame: React.MutableRefObject<SnakeGameMedia | undefined>,
    private gridSize: number,
    private gameState: GameState,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    private focused: React.MutableRefObject<boolean>,
    private started: boolean,
    setStarted: React.Dispatch<React.SetStateAction<boolean>>,
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    playersState: React.MutableRefObject<PlayersState>,
    setGridSize: React.Dispatch<React.SetStateAction<number>>,
    setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {
    super(
      setGameState,
      setStarted,
      setGameOver,
      playersState,
      setGridSize,
      setRerender,
    );
  }

  handleKeyPress = (event: KeyboardEvent) => {
    if (!this.focused.current) {
      return;
    }

    const key = event.key.toLowerCase();

    if (
      key === "arrowup" ||
      key === "arrowdown" ||
      key === "arrowleft" ||
      key === "arrowright" ||
      key === " "
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    if (
      !this.started &&
      key !== "p" &&
      key !== "l" &&
      key !== "j" &&
      key !== "g" &&
      key !== "y" &&
      key !== "r"
    ) {
      this.setGameOver(false);
      this.snakeGame.current?.startGame();
    }

    let newDirection: "up" | "down" | "left" | "right" | undefined = undefined;

    switch (key) {
      case "w":
        newDirection = "up";
        break;
      case "arrowup":
        newDirection = "up";
        break;
      case "s":
        newDirection = "down";
        break;
      case "arrowdown":
        newDirection = "down";
        break;
      case "a":
        newDirection = "left";
        break;
      case "arrowleft":
        newDirection = "left";
        break;
      case "d":
        newDirection = "right";
        break;
      case "arrowright":
        newDirection = "right";
        break;
    }

    if (newDirection) {
      this.snakeGame.current?.snakeDirectionChange(newDirection);
    }
  };

  getSegmentClass = (
    snakeSegments: { x: number; y: number }[],
    index: number,
  ) => {
    if (index === 0)
      return {
        className: "snake-game-snake-head",
        rotation: this.getRotation(
          snakeSegments[index],
          snakeSegments[index + 1],
        ),
      };
    if (index === snakeSegments.length - 1)
      return {
        className: "snake-game-snake-tail",
        rotation: this.getRotation(
          snakeSegments[index - 1],
          snakeSegments[index],
        ),
      };

    const prev = snakeSegments[index - 1];
    const curr = snakeSegments[index];
    const next = snakeSegments[index + 1];

    const isHorizontal = prev.x === curr.x && curr.x === next.x;
    const isVertical = prev.y === curr.y && curr.y === next.y;

    if (isHorizontal)
      return {
        className: "snake-game-snake-body-horizontal",
        rotation: "0deg",
      };
    if (isVertical)
      return { className: "snake-game-snake-body-vertical", rotation: "90deg" };

    const rotation = this.getCurveRotation(prev, curr, next);
    return { className: "snake-game-snake-body-curve", rotation };
  };

  getRotation = (
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    if (to.x > from.x) return "90deg"; // Right
    if (to.x < from.x) return "-90deg"; // Left
    if (to.y > from.y) return "180deg"; // Down
    if (to.y < from.y) return "0deg"; // Up
    return "0deg";
  };

  getCurveRotation = (
    prev: { x: number; y: number },
    curr: { x: number; y: number },
    next: { x: number; y: number },
  ) => {
    // Right to Down (Default orientation of PNG)
    if (
      (prev.x < curr.x && next.y > curr.y) ||
      (next.x < curr.x && prev.y > curr.y)
    ) {
      return "90deg";
    }

    // Down to Left (Curve rotates 90° clockwise)
    if (
      (prev.y > curr.y && next.x > curr.x) ||
      (next.y > curr.y && prev.x > curr.x)
    ) {
      return "0deg";
    }

    // Left to Up (Curve rotates 180°)
    if (
      (prev.x > curr.x && next.y < curr.y) ||
      (next.x > curr.x && prev.y < curr.y)
    ) {
      return "-90deg";
    }

    // Up to Right (Curve rotates 270° or -90°)
    if (
      (prev.y < curr.y && next.x < curr.x) ||
      (next.y < curr.y && prev.x < curr.x)
    ) {
      return "180deg";
    }

    // Default fallback (not a curve)
    return "0deg";
  };

  renderBoard = (): React.ReactElement[] => {
    const board: React.ReactElement[] = [];

    for (let y = 0; y < this.gridSize; y++) {
      const row: React.ReactElement[] = [];
      for (let x = 0; x < this.gridSize; x++) {
        let cellClass = "";
        let cellBackgroundRotation = "";

        // Check if the cell is part of a snake
        let isSnakeCell = false;
        for (const [playerUsername, instances] of Object.entries(
          this.gameState.snakes,
        )) {
          for (const [playerInstance, snakeSegments] of Object.entries(
            instances,
          )) {
            const { position } = snakeSegments;
            const segmentIndex = position.findIndex(
              (segment) => segment.x === x && segment.y === y,
            );
            if (segmentIndex !== -1) {
              const { className, rotation } = this.getSegmentClass(
                position,
                segmentIndex,
              );

              if (
                this.playersState.current[playerUsername] &&
                this.playersState.current[playerUsername][playerInstance]
              ) {
                const { primary, secondary } =
                  this.playersState.current[playerUsername][playerInstance]
                    .snakeColor;

                cellClass = `${className}-${primary}-${secondary} snake-game-snake`;
              }
              cellBackgroundRotation = rotation;
              isSnakeCell = true;
              break;
            }
          }
          if (isSnakeCell) break;
        }

        // Check if the cell contains food
        if (!isSnakeCell) {
          const foodIndex = this.gameState.food.findIndex(
            (item) => item.x === x && item.y === y,
          );
          if (foodIndex !== -1) {
            cellClass = `snake-game-food ${this.gameState.food[foodIndex].class}`;
          }
        }

        row.push(
          <div
            key={`${x},${y}`}
            className={`snake-game-cell ${
              (-1) ** (x + y) === 1
                ? "snake-game-cell-even"
                : "snake-game-cell-odd"
            } ${cellClass}`}
            style={{
              rotate: cellBackgroundRotation,
            }}
          ></div>,
        );
      }
      board.push(
        <div key={y} className="snake-game-row">
          {row}
        </div>,
      );
    }

    return board;
  };

  startGameClick = () => {
    if (!this.started) {
      this.setGameOver(false);
      this.snakeGame.current?.startGame();
    }
  };
}

export default SnakeGameController;
