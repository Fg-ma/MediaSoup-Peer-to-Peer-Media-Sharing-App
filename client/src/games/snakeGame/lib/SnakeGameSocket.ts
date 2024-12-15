type Messages = onSnakeDirectionChangedType | onGameStartedType;

type onSnakeDirectionChangedType = {
  type: "snakeDirectionChanged";
  sender: {
    username: string;
    instance: string;
  };
  direction: "up" | "down" | "left" | "right";
};

type onGameStartedType = {
  type: "gameStarted";
  initialGameState: {
    food: {
      x: number;
      y: number;
      class: string;
    }[];
  };
};

class SnakeGameSocket {
  constructor(
    protected food: React.MutableRefObject<
      {
        x: number;
        y: number;
        class: string;
      }[]
    >,
    protected direction: React.MutableRefObject<
      "up" | "down" | "right" | "left"
    >,
    protected initialSnake: {
      x: number;
      y: number;
    }[],
    protected setSnake: React.Dispatch<
      React.SetStateAction<
        {
          x: number;
          y: number;
        }[]
      >
    >,
    protected setStarted: React.Dispatch<React.SetStateAction<boolean>>,
    protected setGameOver: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleMessage = (event: Messages) => {
    switch (event.type) {
      case "snakeDirectionChanged":
        this.onSnakeDirectionChanged(event);
        break;
      case "gameStarted":
        this.onGameStarted(event);
        break;
      default:
        break;
    }
  };

  onSnakeDirectionChanged = (event: onSnakeDirectionChangedType) => {
    this.direction.current = event.direction;
  };

  onGameStarted = (event: onGameStartedType) => {
    this.resetGame();
    this.food.current = event.initialGameState.food;
  };

  resetGame = () => {
    this.setGameOver(false);
    this.setStarted(true);
    this.setSnake(this.initialSnake);
    this.direction.current = "up";
  };
}

export default SnakeGameSocket;
