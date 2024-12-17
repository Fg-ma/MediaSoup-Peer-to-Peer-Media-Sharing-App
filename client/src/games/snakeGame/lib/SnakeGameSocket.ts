import { GameState } from "../SnakeGame";

type Messages = onGameStagedType | onGameStartedType | onGameStateUpdateType;

type onGameStagedType = {
  type: "gameStaged";
};

type onGameStartedType = {
  type: "gameStarted";
};

type onGameStateUpdateType = {
  type: "gameStateUpdate";
  data: {
    gameState: GameState;
  };
};

class SnakeGameSocket {
  constructor(
    protected setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    protected setStarted: React.Dispatch<React.SetStateAction<boolean>>,
    protected setStaged: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleMessage = (event: Messages) => {
    switch (event.type) {
      case "gameStaged":
        this.onGameStaged();
        break;
      case "gameStarted":
        this.onGameStarted();
        break;
      case "gameStateUpdate":
        this.onGameStateUpdate(event);
        break;
      default:
        break;
    }
  };

  onGameStaged = () => {
    this.setStaged(true);
  };

  onGameStarted = () => {
    this.setStarted(true);
    this.setStaged(false);
  };

  onGameStateUpdate = (event: onGameStateUpdateType) => {
    this.setGameState(event.data.gameState);
  };
}

export default SnakeGameSocket;
