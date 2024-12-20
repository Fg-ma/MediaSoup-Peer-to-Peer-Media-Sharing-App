import { GameState, PlayersState } from "../SnakeGame";

type Messages =
  | onGameStartedType
  | onGameStateUpdateType
  | onGameOverType
  | onPlayersStateUpdatedType
  | onGridSizeChangedType
  | onPlayersStateReturnedtype;

type onGameStartedType = {
  type: "gameStarted";
};

type onGameStateUpdateType = {
  type: "gameStateUpdate";
  data: {
    gameState: GameState;
  };
};

type onGameOverType = {
  type: "gameOver";
};

type onPlayersStateUpdatedType = {
  type: "playersStateUpdated";
  playersState: PlayersState;
};

type onGridSizeChangedType = {
  type: "gridSizeChanged";
  gridSize: number;
};

type onPlayersStateReturnedtype = {
  type: "playersStateReturned";
  playersState: PlayersState;
};

class SnakeGameSocket {
  constructor(
    protected setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    protected setStarted: React.Dispatch<React.SetStateAction<boolean>>,
    protected setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    protected setPlayersState: React.Dispatch<
      React.SetStateAction<PlayersState>
    >,
    protected setGridSize: React.Dispatch<React.SetStateAction<number>>
  ) {}

  handleMessage = (event: Messages) => {
    switch (event.type) {
      case "gameStarted":
        this.onGameStarted();
        break;
      case "gameStateUpdate":
        this.onGameStateUpdate(event);
        break;
      case "gameOver":
        this.onGameOver();
        break;
      case "playersStateUpdated":
        this.onPlayersStateUpdated(event);
        break;
      case "gridSizeChanged":
        this.onGridSizeChanged(event);
        break;
      case "playersStateReturned":
        this.onPlayersStateReturned(event);
        break;
      default:
        break;
    }
  };

  private onGameStarted = () => {
    this.setGameOver(false);
    this.setStarted(true);
  };

  private onGameStateUpdate = (event: onGameStateUpdateType) => {
    this.setGameState(event.data.gameState);
  };

  private onGameOver = () => {
    this.setGameOver(true);
    this.setStarted(false);
  };

  private onPlayersStateUpdated = (event: onPlayersStateUpdatedType) => {
    console.log(event);
    this.setPlayersState(event.playersState);
  };

  private onGridSizeChanged = (event: onGridSizeChangedType) => {
    this.setGridSize(event.gridSize);
  };

  private onPlayersStateReturned = (event: onPlayersStateReturnedtype) => {
    this.setPlayersState(event.playersState);
  };
}

export default SnakeGameSocket;
