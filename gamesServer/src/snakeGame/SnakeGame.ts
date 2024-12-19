import Broadcaster from "../lib/Broadcaster";
import {
  Directions,
  foodClasses,
  GameState,
  Snake,
  snakeColors,
  SnakeColorsType,
} from "./lib/typeConstant";

class SnakeGame {
  private gridSize = 15;
  private gameSpeed = 150;
  private stagging = false;
  private started = false;
  private gameOver = false;
  private stageGameTimeout: NodeJS.Timeout | undefined = undefined;

  private initialSnake = [
    { x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) },
    { x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) + 1 },
    { x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) + 2 },
  ];
  private initialFood = [
    {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
      class: "snake-game-apple",
    },
    {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
      class: "snake-game-banana",
    },
    {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
      class: "snake-game-donut",
    },
    {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
      class: "snake-game-orange",
    },
  ];
  private gameState: GameState = { snakes: {}, food: this.initialFood };
  private gameInterval?: NodeJS.Timeout;

  constructor(
    private broadcaster: Broadcaster,
    private table_id: string,
    private snakeGameId: string
  ) {}

  closeGame = () => {
    // Clear game loop interval
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }

    // Clear staging timeout
    if (this.stageGameTimeout) {
      clearTimeout(this.stageGameTimeout);
      this.stageGameTimeout = undefined;
    }
  };

  joinGame = (username: string, instance: string) => {
    if (this.started) {
      return;
    }

    if (!this.gameState.snakes[username]) {
      this.gameState.snakes[username] = {};
    }

    this.gameState.snakes[username][instance] = {
      position: [...this.initialSnake],
      direction: "up",
      color: this.getRandomSnakeColor(),
    };
  };

  getRandomSnakeColor = (): SnakeColorsType => {
    // Collect all used colors in a Set for fast lookup
    const usedColors = new Set<SnakeColorsType>(
      Object.values(this.gameState.snakes)
        .flatMap((instances) => Object.values(instances))
        .map((snake) => snake.color)
    );

    // Filter available colors
    const availableColors = snakeColors.filter(
      (color) => !usedColors.has(color)
    );

    // Return a random available color or fallback to a default if none are available
    if (availableColors.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      return availableColors[randomIndex];
    }

    // Fallback to a random color if all are in use
    return snakeColors[Math.floor(Math.random() * snakeColors.length)];
  };

  leaveGame = (username: string, instance: string) => {
    if (
      this.gameState.snakes[username] &&
      this.gameState.snakes[username][instance]
    ) {
      delete this.gameState.snakes[username][instance];

      if (Object.keys(this.gameState.snakes[username]).length === 0) {
        delete this.gameState.snakes[username];
      }
    }
  };

  changeSnakeColor = (
    username: string,
    instance: string,
    color: SnakeColorsType
  ) => {
    if (
      this.gameState.snakes[username] &&
      this.gameState.snakes[username][instance] &&
      !this.isColorInUse(color)
    ) {
      this.gameState.snakes[username][instance].color = color;
    }
  };

  isColorInUse = (color: SnakeColorsType): boolean => {
    // Collect all used colors in a Set for fast lookup
    const usedColors = new Set<SnakeColorsType>(
      Object.values(this.gameState.snakes)
        .flatMap((instances) => Object.values(instances))
        .map((snake) => snake.color)
    );

    // Check if the given color is in the set
    return usedColors.has(color);
  };

  stageGame = () => {
    if (!this.started && this.stageGameTimeout === undefined) {
      this.stagging = true;
      this.started = false;
      this.gameOver = false;

      this.stageGameTimeout = setTimeout(() => {
        clearTimeout(this.stageGameTimeout);
        this.stageGameTimeout = undefined;

        this.startGame();

        this.broadcaster.broadcastToTable(
          this.table_id,
          "games",
          "snake",
          this.snakeGameId,
          {
            type: "gameStarted",
          }
        );
      }, 1000);
    }
  };

  startGame = () => {
    if (this.started) {
      return;
    }

    this.started = true;
    this.stagging = false;
    this.gameOver = false;

    this.gameInterval = setInterval(() => {
      this.gameLoop();
    }, this.gameSpeed);
  };

  changeSnakeDirection = (
    username: string,
    instance: string,
    direction: Directions
  ) => {
    if (
      this.started &&
      this.gameState.snakes[username] &&
      this.gameState.snakes[username][instance]
    ) {
      this.gameState.snakes[username][instance].direction = direction;
    }
  };

  private gameLoop = () => {
    for (const username in this.gameState.snakes) {
      for (const instance in this.gameState.snakes[username]) {
        const snake = this.gameState.snakes[username][instance];

        const { newSnake, head } = this.moveSnake(snake);

        this.eatFood(newSnake, head);

        const gameOver = this.checkEndConditions(newSnake, head);

        if (gameOver) {
          delete this.gameState.snakes[username][instance];

          if (Object.keys(this.gameState.snakes[username]).length === 0) {
            delete this.gameState.snakes[username];

            if (Object.keys(this.gameState.snakes).length === 0) {
              clearInterval(this.gameInterval);
              this.gameInterval = undefined;
              this.gameOver = true;
              this.started = false;
              this.stagging = false;

              this.broadcaster.broadcastToTable(
                this.table_id,
                "games",
                "snake",
                this.snakeGameId,
                {
                  type: "gameOver",
                }
              );
            }
          }
        } else {
          this.gameState.snakes[username][instance] = newSnake;
        }
      }
    }

    this.broadcaster.broadcastToTable(
      this.table_id,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "gameStateUpdate",
        data: {
          gameState: this.gameState,
        },
      }
    );
  };

  private moveSnake = (snake: Snake) => {
    const newSnake: Snake = {
      direction: snake.direction,
      position: snake.position,
      color: snake.color,
    };
    const head = { ...newSnake.position[0] };

    // Move snake in the chosen direction
    if (snake.direction === "up") head.y -= 1;
    if (snake.direction === "down") head.y += 1;
    if (snake.direction === "left") head.x -= 1;
    if (snake.direction === "right") head.x += 1;

    newSnake.position.unshift(head);

    return { newSnake, head };
  };

  private eatFood = (
    newSnake: Snake,
    head: {
      x: number;
      y: number;
    }
  ) => {
    const foodEatenIndices = this.gameState.food
      .map((item, index) => {
        if (item.x === head.x && item.y === head.y) return index;
      })
      .filter((value) => value !== undefined);
    if (foodEatenIndices.length !== 0) {
      // Remove eaten food
      this.gameState.food = this.gameState.food.filter(
        (_, index) => !foodEatenIndices.includes(index)
      );

      const newFood = [];

      for (const _index of foodEatenIndices) {
        let attempts = 0;
        let validSpotFound = false;

        while (attempts < 10 && !validSpotFound) {
          const proposedPosition = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize),
          };

          // Check if the position is valid
          const isPositionValid =
            !Object.values(this.gameState.snakes).some((instanceSnakes) =>
              Object.values(instanceSnakes).some((snake) =>
                snake.position.some(
                  (segment) =>
                    segment.x === proposedPosition.x &&
                    segment.y === proposedPosition.y
                )
              )
            ) &&
            !this.gameState.food.some(
              (item) =>
                item.x === proposedPosition.x && item.y === proposedPosition.y
            );

          if (isPositionValid) {
            newFood.push({
              ...proposedPosition,
              class:
                foodClasses[Math.floor(Math.random() * foodClasses.length)],
            });
            validSpotFound = true; // Exit loop
          }

          attempts++;
        }
      }

      this.gameState.food.push(...newFood);
    } else {
      // Move snake (remove tail)
      newSnake.position.pop();
    }
  };

  private checkEndConditions = (
    newSnake: Snake,
    head: {
      x: number;
      y: number;
    }
  ) => {
    if (
      head.x < 0 ||
      head.x >= this.gridSize ||
      head.y < 0 ||
      head.y >= this.gridSize ||
      newSnake.position
        .slice(1)
        .some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      return true;
    }

    return false;
  };

  changeGridSize = (gridSize: number) => {
    if (this.started) {
      return;
    }

    this.gridSize = gridSize;

    this.gameState.food = [];

    for (let i = 0; i < 4; i++) {
      let attempts = 0;
      let validSpotFound = false;

      while (attempts < 10 && !validSpotFound) {
        const proposedPosition = {
          x: Math.floor(Math.random() * this.gridSize),
          y: Math.floor(Math.random() * this.gridSize),
        };

        // Check if the position is valid
        const isPositionValid =
          !Object.values(this.gameState.snakes).some((instanceSnakes) =>
            Object.values(instanceSnakes).some((snake) =>
              snake.position.some(
                (segment) =>
                  segment.x === proposedPosition.x &&
                  segment.y === proposedPosition.y
              )
            )
          ) &&
          !this.gameState.food.some(
            (item) =>
              item.x === proposedPosition.x && item.y === proposedPosition.y
          );

        if (isPositionValid) {
          this.gameState.food.push({
            ...proposedPosition,
            class: foodClasses[Math.floor(Math.random() * foodClasses.length)],
          });
          validSpotFound = true; // Exit loop
        }

        attempts++;
      }
    }

    this.initialSnake = [
      { x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) },
      {
        x: Math.floor(this.gridSize / 2),
        y: Math.floor(this.gridSize / 2) + 1,
      },
      {
        x: Math.floor(this.gridSize / 2),
        y: Math.floor(this.gridSize / 2) + 2,
      },
    ];
  };
}

export default SnakeGame;
