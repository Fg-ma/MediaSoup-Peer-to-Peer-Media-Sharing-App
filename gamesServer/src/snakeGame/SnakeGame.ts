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
  // Game configuration
  private playerCount = 0;
  private gridSize = 15;
  private gameSpeed = 150;
  private started = false;
  private gameOver = false;

  // Game state
  private initialFood = Array(8)
    .fill(null)
    .map(() => ({
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
      class: foodClasses[Math.floor(Math.random() * foodClasses.length)],
    }));
  private gameState: GameState = { snakes: {}, food: this.initialFood };
  private lastRenderedSnakesState: Record<string, Record<string, Snake>> = {};
  private playersState: PlayersState = {};
  private gameInterval?: NodeJS.Timeout;

  constructor(
    private broadcaster: Broadcaster,
    private tableId: string,
    private snakeGameId: string
  ) {}

  // --- Core game lifecycle ---
  startGame = (): void => {
    if (this.started) return;

    const newGridSize = this.calculateGridSize();
    if (this.gridSize < newGridSize) {
      this.changeGridSize(newGridSize);
    }
    const zones = this.generateZones();

    this.setupSnakes(zones);
    this.started = true;
    this.gameOver = false;

    this.gameInterval = setInterval(this.gameLoop, this.gameSpeed);
  };

  closeGame = (): void => {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }
  };

  private gameLoop = (): void => {
    const collisions: Array<{ username: string; instance: string }> = [];
    const headPositions: Record<
      string,
      Array<{ username: string; instance: string }>
    > = {};

    // Move each snake and track head positions
    for (const username in this.gameState.snakes) {
      for (const instance in this.gameState.snakes[username]) {
        const snake = this.gameState.snakes[username][instance];
        const { newSnake, head } = this.moveSnake(snake);

        // Track head positions for collision detection
        const headKey = `${head.x},${head.y}`;
        if (!headPositions[headKey]) {
          headPositions[headKey] = [];
        }
        headPositions[headKey].push({ username, instance });

        this.eatFood(newSnake, head);

        // Track collisions with walls or self
        if (this.checkEndConditions(username, instance, newSnake, head)) {
          collisions.push({ username, instance });
        } else {
          this.gameState.snakes[username][instance] = newSnake;
        }
      }
    }

    for (const headKey in headPositions) {
      const snakesAtPosition = headPositions[headKey];
      if (snakesAtPosition.length > 1) {
        collisions.push(...snakesAtPosition);
      } else if (snakesAtPosition.length === 1) {
        const [attacker] = snakesAtPosition;
        const target = this.findSnakeAtPosition(
          headKey,
          attacker.username,
          attacker.instance
        );
        if (target) {
          this.handleSnakeCollision(target, headKey);
        }
      }
    }

    // Remove all snakes involved in collisions at the end of the frame
    for (const { username, instance } of collisions) {
      this.removeSnake(username, instance);
    }

    this.lastRenderedSnakesState = this.gameState.snakes;

    if (!this.gameOver) {
      this.broadcastGameState();
    }
  };

  private handleSnakeCollision = (
    target: { username: string; instance: string },
    headKey: string
  ): void => {
    const targetSnake = this.gameState.snakes[target.username][target.instance];
    const targetIndex = targetSnake.position.findIndex(
      (segment) => `${segment.x},${segment.y}` === headKey
    );

    if (targetIndex > 1) {
      targetSnake.position = targetSnake.position.slice(0, targetIndex);
      if (targetSnake.position.length < 2) {
        targetSnake.position = targetSnake.position.slice(0, 2);
      }
      this.gameState.snakes[target.username][target.instance] = targetSnake;
    }
  };

  private findSnakeAtPosition = (
    positionKey: string,
    excludeUsername: string,
    excludeInstance: string
  ): { username: string; instance: string } | null => {
    for (const username in this.gameState.snakes) {
      if (username === excludeUsername) continue;
      for (const instance in this.gameState.snakes[username]) {
        if (
          instance === excludeInstance ||
          !this.gameState.snakes[username][instance].position.some(
            (segment) => `${segment.x},${segment.y}` === positionKey
          )
        )
          continue;
        return { username, instance };
      }
    }
    return null;
  };

  // --- Player management ---
  joinGame = (
    username: string,
    instance: string,
    data: { snakeColor?: SnakeColorsType }
  ): void => {
    if (this.playersState[username]?.[instance]) return;

    this.playerCount++;
    if (!this.playersState[username]) this.playersState[username] = {};

    const color = this.getValidSnakeColor(data.snakeColor);
    this.playersState[username][instance] = { snakeColor: color };

    this.broadcastPlayersState();
  };

  leaveGame = (username: string, instance: string): void => {
    delete this.playersState[username]?.[instance];
    if (Object.keys(this.playersState[username] || {}).length === 0) {
      delete this.playersState[username];
    }
    delete this.gameState.snakes[username]?.[instance];
    if (Object.keys(this.gameState.snakes[username] || {}).length === 0) {
      delete this.gameState.snakes[username];
    }

    if (!Object.keys(this.gameState.snakes).length) {
      this.closeGame();
      this.gameOver = true;
      this.started = false;

      this.broadcastGameOver();
    }

    this.broadcastPlayersState();
  };

  changeSnakeColor = (
    username: string,
    instance: string,
    color: SnakeColorsType
  ): void => {
    if (this.isColorInUse(color) || !this.playersState[username]?.[instance])
      return;

    this.playersState[username][instance].snakeColor = color;
    this.broadcastPlayersState();
  };

  changeGridSize = (gridSize: number): void => {
    if (this.started) return;

    this.gridSize = gridSize;
    this.gameState.food = [];
    this.generateFood();
    this.broadcastGridSize();
  };

  changeSnakeDirection = (
    username: string,
    instance: string,
    direction: Directions
  ): void => {
    if (!this.started || !this.gameState.snakes[username]?.[instance]) return;

    const currentDirection =
      this.lastRenderedSnakesState[username]?.[instance]?.direction;
    if (this.isValidDirection(currentDirection, direction)) {
      this.gameState.snakes[username][instance].direction = direction;
    }
  };

  // --- Utility and helpers ---
  private setupSnakes = (
    zones: {
      xStart: number;
      xEnd: number;
      yStart: number;
      yEnd: number;
    }[]
  ): void => {
    let i = 0;
    for (const username in this.playersState) {
      if (!this.gameState.snakes[username])
        this.gameState.snakes[username] = {};
      if (!this.lastRenderedSnakesState[username])
        this.lastRenderedSnakesState[username] = {};

      for (const instance in this.playersState[username]) {
        this.gameState.snakes[username][instance] = this.placeSnake(zones[i]);
        this.lastRenderedSnakesState[username] =
          this.gameState.snakes[username];
        i++;
      }
    }
  };

  private getValidSnakeColor = (preferredColor?: SnakeColorsType) =>
    preferredColor && !this.isColorInUse(preferredColor)
      ? preferredColor
      : this.getRandomSnakeColor();

  private broadcastPlayersState = () => {
    this.broadcaster.broadcastToTable(
      this.tableId,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "playersStateUpdated",
        data: {
          playersState: this.playersState,
        },
      }
    );
  };

  private broadcastGameState = () => {
    this.broadcaster.broadcastToTable(
      this.tableId,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "gameStateUpdate",
        data: { gameState: this.gameState },
      }
    );
  };

  private broadcastGridSize = () => {
    this.broadcaster.broadcastToTable(
      this.tableId,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "gridSizeChanged",
        data: {
          gridSize: this.gridSize,
        },
      }
    );
  };

  private broadcastGameOver = () => {
    this.broadcaster.broadcastToTable(
      this.tableId,
      "games",
      "snake",
      this.snakeGameId,
      {
        type: "gameOver",
      }
    );
  };

  private removeSnake = (username: string, instance: string): void => {
    delete this.gameState.snakes[username]?.[instance];
    if (!Object.keys(this.gameState.snakes[username] || {}).length) {
      delete this.gameState.snakes[username];
      if (!Object.keys(this.gameState.snakes).length) {
        this.closeGame();
        this.gameOver = true;
        this.started = false;

        this.broadcastGameOver();
      }
    }
  };

  getRandomSnakeColor = (): SnakeColorsType => {
    const usedColors = new Set<SnakeColorsType>(
      Object.values(this.playersState).flatMap((instances) =>
        Object.values(instances).map((playerState) => playerState.snakeColor)
      )
    );

    const availableColors = snakeColors.filter(
      (color) => !usedColors.has(color)
    );

    return (
      availableColors[Math.floor(Math.random() * availableColors.length)] ||
      snakeColors[0]
    );
  };

  private isColorInUse = (color: SnakeColorsType): boolean =>
    Object.values(this.playersState).some((instances) =>
      Object.values(instances).some(
        (player) =>
          player.snakeColor.primary === color.primary &&
          player.snakeColor.secondary === color.secondary
      )
    );

  private calculateGridSize = (): number =>
    Math.max(10, Math.ceil(Math.sqrt(this.playerCount * 25)));

  private generateZones = (): Array<{
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
  }> => {
    const zones: Array<{
      xStart: number;
      xEnd: number;
      yStart: number;
      yEnd: number;
    }> = [];
    const zoneSize = Math.floor(
      this.gridSize / Math.ceil(Math.sqrt(this.playerCount))
    );
    const edgeBuffer = 3;

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

    return zones.sort(() => Math.random() - 0.5).slice(0, this.playerCount);
  };

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
    const area = this.gridSize * this.gridSize;
    const density = 0.025;
    const gridFactor = Math.floor(area * density);
    return baseFood + playerFactor + gridFactor;
  };

  private generateFood = (): void => {
    const targetFoodCount = this.calculateFoodCount();

    while (this.gameState.food.length < targetFoodCount) {
      const startX = Math.floor(Math.random() * this.gridSize);
      const startY = Math.floor(Math.random() * this.gridSize);
      let x = startX;
      let y = startY;
      let validSpotFound = false;

      do {
        const isPositionValid =
          !Object.values(this.gameState.snakes).some((instanceSnakes) =>
            Object.values(instanceSnakes).some((snake) =>
              snake.position.some(
                (segment) => segment.x === x && segment.y === y
              )
            )
          ) &&
          !this.gameState.food.some((item) => item.x === x && item.y === y);

        if (isPositionValid) {
          this.gameState.food.push({
            x,
            y,
            class: foodClasses[Math.floor(Math.random() * foodClasses.length)],
          });
          validSpotFound = true;
          break;
        }

        // Move to the next grid position
        x = (x + 1) % this.gridSize;
        if (x === 0) y = (y + 1) % this.gridSize;
      } while (!(x === startX && y === startY)); // Stop when back to the starting point

      // If no valid spot found after traversing the grid, give up
      if (!validSpotFound) break;
    }
  };

  private moveSnake = (snake: Snake) => {
    const newSnake: Snake = {
      ...snake,
      position: [...snake.position],
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
    const foodIndex = this.gameState.food.findIndex(
      (food) => food.x === head.x && food.y === head.y
    );

    if (foodIndex >= 0) {
      this.gameState.food.splice(foodIndex, 1);
      this.generateFood();
    } else {
      newSnake.position.pop();
    }
  };

  private checkEndConditions = (
    username: string,
    instance: string,
    newSnake: Snake,
    head: { x: number; y: number }
  ): boolean => {
    const collidedWithWall =
      head.x < 0 ||
      head.x >= this.gridSize ||
      head.y < 0 ||
      head.y >= this.gridSize;

    const collidedWithSelf = newSnake.position
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y);

    const collidedWithOther = Object.entries(this.gameState.snakes).some(
      ([otherUsername, otherInstances]) =>
        username !== otherUsername &&
        Object.entries(otherInstances).some(
          ([otherInstance, otherSnake]) =>
            instance !== otherInstance &&
            otherSnake.position.some(
              (segment) => segment.x === head.x && segment.y === head.y
            )
        )
    );

    return collidedWithWall || collidedWithSelf || collidedWithOther;
  };

  // --- Public state accessors ---
  getPlayersState = () => {
    return this.playersState;
  };

  getInitialGameStates = () => {
    return {
      started: this.started,
      gameOver: this.gameOver,
      playersState: this.playersState,
    };
  };
}

export default SnakeGame;
