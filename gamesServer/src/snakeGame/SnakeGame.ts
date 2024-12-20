import Broadcaster from "../lib/Broadcaster";
import {
  Directions,
  foodClasses,
  GameState,
  PlayersState,
  Snake,
  snakeColors,
  SnakeColorsType,
} from "./lib/typeConstant";

class SnakeGame {
  private playerCount = 0;
  private gridSize = 15;
  private gameSpeed = 150;
  private started = false;
  private gameOver = false;

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
  private lastRenderedSnakesState: {
    [username: string]: { [instance: string]: Snake };
  } = {};
  private playersState: PlayersState = {};
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
  };

  joinGame = (
    username: string,
    instance: string,
    data: { snakeColor?: SnakeColorsType }
  ) => {
    if (this.playersState[username] && this.playersState[username][instance]) {
      return;
    }

    this.playerCount++;

    if (!this.playersState[username]) {
      this.playersState[username] = {};
    }

    const color =
      data.snakeColor && !this.isColorInUse(data.snakeColor)
        ? data.snakeColor
        : this.getRandomSnakeColor();

    this.playersState[username][instance] = { snakeColor: color };

    this.broadcaster.broadcastToTable(
      this.table_id,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "playersStateUpdated",
        playersState: this.playersState,
      }
    );
  };

  getRandomSnakeColor = (): SnakeColorsType => {
    // Collect all used colors in a Set for fast lookup
    const usedColors = new Set<SnakeColorsType>(
      Object.values(this.playersState).flatMap((instances) =>
        Object.values(instances).map((playerState) => playerState.snakeColor)
      )
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

    if (this.playersState[username] && this.playersState[username][instance]) {
      delete this.playersState[username][instance];

      if (Object.keys(this.playersState[username]).length === 0) {
        delete this.playersState[username];
      }
    }

    this.broadcaster.broadcastToTable(
      this.table_id,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "playersStateUpdated",
        playersState: this.playersState,
      }
    );
  };

  changeSnakeColor = (
    username: string,
    instance: string,
    color: SnakeColorsType
  ) => {
    if (this.isColorInUse(color)) {
      return;
    }

    if (!this.playersState[username][instance]) {
      return;
    }

    this.playersState[username][instance].snakeColor = color;

    this.broadcaster.broadcastToTable(
      this.table_id,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "playersStateUpdated",
        playersState: this.playersState,
      }
    );
  };

  isColorInUse = (color: SnakeColorsType): boolean => {
    // Collect all used colors in a Set for fast lookup
    const usedColors = new Set<SnakeColorsType>(
      Object.values(this.playersState).flatMap((instances) =>
        Object.values(instances).map((playerState) => playerState.snakeColor)
      )
    );

    // Check if the given color is in the set
    return usedColors.has(color);
  };

  startGame = () => {
    if (this.started) {
      return;
    }

    const newGridSize = this.calculateGridSize();
    if (this.gridSize < newGridSize) {
      this.changeGridSize(newGridSize);
    }
    const zones = this.generateZones();

    let i = 0;
    for (const username in this.playersState) {
      if (!this.gameState.snakes[username]) {
        this.gameState.snakes[username] = {};
      }
      if (!this.lastRenderedSnakesState[username]) {
        this.lastRenderedSnakesState[username] = {};
      }

      for (const instance in this.playersState[username]) {
        this.gameState.snakes[username][instance] = this.placeSnake(zones[i]);
        this.lastRenderedSnakesState[username][instance] =
          this.gameState.snakes[username][instance];
        i++;
      }
    }

    this.started = true;
    this.gameOver = false;

    this.gameInterval = setInterval(() => {
      this.gameLoop();
    }, this.gameSpeed);
  };

  calculateGridSize = () => {
    const baseArea = 25;
    return Math.max(15, Math.ceil(Math.sqrt(this.playerCount * baseArea)));
  };

  generateZones() {
    const zones = [];
    const zoneSize = Math.floor(
      this.gridSize / Math.ceil(Math.sqrt(this.playerCount))
    );
    const edgeBuffer = 3; // No spawn area around edges

    for (let x = edgeBuffer; x < this.gridSize - edgeBuffer; x += zoneSize) {
      for (let y = edgeBuffer; y < this.gridSize - edgeBuffer; y += zoneSize) {
        zones.push({
          xStart: x,
          xEnd: Math.min(x + zoneSize - 1, this.gridSize - edgeBuffer - 1),
          yStart: y,
          yEnd: Math.min(y + zoneSize - 1, this.gridSize - edgeBuffer - 1),
        });
      }
    }

    // Shuffle the zones array
    for (let i = zones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [zones[i], zones[j]] = [zones[j], zones[i]];
    }

    return zones.slice(0, this.playerCount); // Only return zones needed for players
  }

  placeSnake = (zone: {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
  }) => {
    const snake = [];
    const startX = Math.floor((zone.xStart + zone.xEnd) / 2);
    const startY = Math.floor((zone.yStart + zone.yEnd) / 2);

    // Randomly determine the initial direction
    const directions: Directions[] = ["up", "down", "left", "right"];
    const initialDirection =
      directions[Math.floor(Math.random() * directions.length)];

    // Place the snake based on the random orientation
    for (let i = 0; i < 3; i++) {
      if (initialDirection === "up") {
        snake.push({ x: startX, y: startY + i });
      } else if (initialDirection === "down") {
        snake.push({ x: startX, y: startY - i });
      } else if (initialDirection === "left") {
        snake.push({ x: startX + i, y: startY });
      } else if (initialDirection === "right") {
        snake.push({ x: startX - i, y: startY });
      }
    }

    return { position: snake, direction: initialDirection };
  };

  private isValidDirection = (
    current: Directions,
    next: Directions
  ): boolean => {
    return !(
      (current === "up" && next === "down") ||
      (current === "down" && next === "up") ||
      (current === "left" && next === "right") ||
      (current === "right" && next === "left")
    );
  };

  private calculateFoodCount = (): number => {
    // Base food count is 2 + 1 food per player, scaled by grid size
    const baseFood = 2;
    const playerFactor = this.playerCount;
    const gridFactor = Math.floor(this.gridSize / 10);
    return baseFood + playerFactor + gridFactor;
  };

  private generateFood = (): void => {
    const targetFoodCount = this.calculateFoodCount();
    while (this.gameState.food.length < targetFoodCount) {
      let validSpotFound = false;
      let attempts = 0;

      while (!validSpotFound && attempts < 10) {
        const proposedPosition = {
          x: Math.floor(Math.random() * this.gridSize),
          y: Math.floor(Math.random() * this.gridSize),
        };

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
          validSpotFound = true;
        }
        attempts++;
      }
    }
  };

  changeSnakeDirection = (
    username: string,
    instance: string,
    direction: Directions
  ) => {
    if (
      !this.started ||
      !this.gameState.snakes[username] ||
      !this.gameState.snakes[username][instance]
    ) {
      return;
    }

    const currentDirection =
      this.lastRenderedSnakesState[username][instance].direction;

    if (this.isValidDirection(currentDirection, direction)) {
      this.gameState.snakes[username][instance].direction = direction;
    }
  };

  private gameLoop = () => {
    for (const username in this.gameState.snakes) {
      for (const instance in this.gameState.snakes[username]) {
        const snake = this.gameState.snakes[username][instance];

        const { newSnake, head } = this.moveSnake(snake);

        this.eatFood(newSnake, head);

        const gameOver = this.checkEndConditions(
          username,
          instance,
          newSnake,
          head
        );

        if (gameOver) {
          delete this.gameState.snakes[username][instance];

          if (Object.keys(this.gameState.snakes[username]).length === 0) {
            delete this.gameState.snakes[username];

            if (Object.keys(this.gameState.snakes).length === 0) {
              clearInterval(this.gameInterval);
              this.gameInterval = undefined;
              this.gameOver = true;
              this.started = false;

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

    this.lastRenderedSnakesState = this.gameState.snakes;

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

  private eatFood = (newSnake: Snake, head: { x: number; y: number }): void => {
    const foodEatenIndices = this.gameState.food
      .map((item, index) =>
        item.x === head.x && item.y === head.y ? index : undefined
      )
      .filter((value) => value !== undefined);

    if (foodEatenIndices.length > 0) {
      // Remove the eaten food
      this.gameState.food = this.gameState.food.filter(
        (_, index) => !foodEatenIndices.includes(index)
      );

      // Generate new food up to the target count
      this.generateFood();
    } else {
      // Move snake (remove tail if no food eaten)
      newSnake.position.pop();
    }
  };

  private checkEndConditions = (
    username: string,
    instance: string,
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

    for (const snakeUsername in this.gameState.snakes) {
      for (const snakeInstance in this.gameState.snakes[snakeUsername]) {
        const snake = this.gameState.snakes[snakeUsername][snakeInstance];
        if (username !== snakeUsername && instance !== snakeInstance) {
          if (
            snake.position.some(
              (segment) => segment.x === head.x && segment.y === head.y
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  };

  changeGridSize = (gridSize: number) => {
    if (this.started) {
      return;
    }

    this.gridSize = gridSize;
    this.gameState.food = [];
    this.generateFood();

    this.broadcaster.broadcastToTable(
      this.table_id,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "gridSizeChanged",
        gridSize,
      }
    );
  };

  getPlayersState = () => {
    return this.playersState;
  };

  getIntialGameStates = () => {
    return {
      started: this.started,
      gameOver: this.gameOver,
      playersState: this.playersState,
    };
  };
}

export default SnakeGame;
