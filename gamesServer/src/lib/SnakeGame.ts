import Broadcaster from "./Broadcaster";

type Directions = "up" | "down" | "left" | "right";
type Snake = { position: { x: number; y: number }[]; direction: Directions };
type GameState = {
  snakes: { [username: string]: { [instance: string]: Snake } };
  food: { x: number; y: number; class: string }[];
};

export const foodClasses = [
  "snake-game-apple",
  "snake-game-banana",
  "snake-game-donut",
  "snake-game-grapes",
  "snake-game-orange",
  "snake-game-pizza",
  "snake-game-strawberry",
  "snake-game-watermelon",
];

class SnakeGame {
  private gridSize = 15;
  private gameSpeed = 150;
  private numPlayers = 1;
  private stagging = false;
  private started = false;
  private ended = false;

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

  addSnake = (username: string, instance: string) => {
    if (!this.stagging) {
      return;
    }

    if (!this.gameState.snakes[username]) {
      this.gameState.snakes[username] = {};
    }

    this.gameState.snakes[username][instance] = {
      position: this.initialSnake,
      direction: "up",
    };
  };

  stageGame = () => {
    this.stagging = true;
  };

  startGame = () => {
    this.started = true;
    this.stagging = false;

    this.gameInterval = setInterval(() => {
      this.gameLoop();
    }, this.gameSpeed);
  };

  changeSnakeDirection = (
    username: string,
    instance: string,
    direction: Directions
  ) => {
    this.gameState.snakes[username][instance].direction = direction;
  };

  private gameLoop = () => {
    for (const username in this.gameState.snakes) {
      for (const instance in this.gameState.snakes[username]) {
        const snake = this.gameState.snakes[username][instance];

        const { newSnake, head } = this.moveSnake(snake);

        this.eatFood(newSnake, head);

        this.checkEndConditions(newSnake, head);

        this.gameState.snakes[username][instance] = newSnake;
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
          if (
            !newSnake.position.some(
              (segment) =>
                segment.x === proposedPosition.x &&
                segment.y === proposedPosition.y
            ) &&
            !this.gameState.food.some(
              (item) =>
                item.x === proposedPosition.x && item.y === proposedPosition.y
            )
          ) {
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
      clearInterval(this.gameInterval);
    }
  };
}

export default SnakeGame;
