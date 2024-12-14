import React, { ReactElement } from "react";
import { SnakeColorsType } from "./typeConstant";

class SnakeGameController {
  private lastKeyPress = 0;
  private debounceKeyPressTime = 150;

  constructor(
    private gridSize: number,
    private snake: {
      x: number;
      y: number;
    }[],
    private setSnake: React.Dispatch<
      React.SetStateAction<
        {
          x: number;
          y: number;
        }[]
      >
    >,
    private initialSnake: {
      x: number;
      y: number;
    }[],
    private snakeColor: SnakeColorsType,
    private food: React.MutableRefObject<
      {
        x: number;
        y: number;
        class: string;
      }[]
    >,
    private initialFood: {
      x: number;
      y: number;
      class: string;
    }[],
    private direction: React.MutableRefObject<"up" | "down" | "right" | "left">,
    private setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    private started: boolean,
    private setStarted: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleKeyPress = (event: KeyboardEvent) => {
    if (!this.started) {
      this.setStarted(true);
    }

    const currentTime = Date.now();

    if (currentTime - this.lastKeyPress < this.debounceKeyPressTime) {
      return;
    }

    this.lastKeyPress = currentTime;

    switch (event.key.toLowerCase()) {
      case "w":
        if (this.direction.current !== "down") {
          this.direction.current = "up";
        }
        break;
      case "arrowup":
        if (this.direction.current !== "down") {
          this.direction.current = "up";
        }
        break;
      case "s":
        if (this.direction.current !== "up") {
          this.direction.current = "down";
        }
        break;
      case "arrowdown":
        if (this.direction.current !== "up") {
          this.direction.current = "down";
        }
        break;
      case "a":
        if (this.direction.current !== "right") {
          this.direction.current = "left";
        }
        break;
      case "arrowleft":
        if (this.direction.current !== "right") {
          this.direction.current = "left";
        }
        break;
      case "d":
        if (this.direction.current !== "left") {
          this.direction.current = "right";
        }
        break;
      case "arrowright":
        if (this.direction.current !== "left") {
          this.direction.current = "right";
        }
        break;
    }
  };

  getSegmentClass = (index: number) => {
    if (index === 0)
      return {
        className: "snake-game-snake-head",
        rotation: this.getRotation(this.snake[index], this.snake[index + 1]),
      };
    if (index === this.snake.length - 1)
      return {
        className: "snake-game-snake-tail",
        rotation: this.getRotation(this.snake[index - 1], this.snake[index]),
      };

    const prev = this.snake[index - 1];
    const curr = this.snake[index];
    const next = this.snake[index + 1];

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
    to: { x: number; y: number }
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
    next: { x: number; y: number }
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

  renderBoard = () => {
    const board: ReactElement[] = [];
    for (let y = 0; y < this.gridSize; y++) {
      const row: ReactElement[] = [];
      for (let x = 0; x < this.gridSize; x++) {
        let cellClass = "";
        let cellBackgroundRotation = "";
        const snakeSegmentIndex = this.snake.findIndex(
          (segment) => segment.x === x && segment.y === y
        );
        if (snakeSegmentIndex !== -1) {
          const { className, rotation } =
            this.getSegmentClass(snakeSegmentIndex);
          cellClass = `${className}-${this.snakeColor.primary}-${this.snakeColor.secondary} snake-game-snake`;
          cellBackgroundRotation = rotation;
        } else {
          const foodIndex = this.food.current.findIndex(
            (item) => item.x === x && item.y === y
          );
          if (foodIndex !== -1) {
            cellClass = `snake-game-food ${this.food.current[foodIndex].class}`;
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
          ></div>
        );
      }
      board.push(
        <div key={y} className='snake-game-row'>
          {row}
        </div>
      );
    }
    return board;
  };

  endScreenClick = () => {
    this.setGameOver(false);
    this.setStarted(true);
    this.setSnake(this.initialSnake);
    this.food.current = this.initialFood;
    this.direction.current = "up";
  };
}

export default SnakeGameController;
