import { GameState, PlayersState } from "./typeConstant";

type Messages =
  | onGameStartedType
  | onGameStateUpdateType
  | onGameOverType
  | onPlayersStateUpdatedType
  | onGridSizeChangedType
  | onInitialGameStatesReturnedType;

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
  data: {
    playersState: PlayersState;
  };
};

type onGridSizeChangedType = {
  type: "gridSizeChanged";
  data: {
    gridSize: number;
  };
};

type onInitialGameStatesReturnedType = {
  type: "initialGameStatesReturned";
  data: {
    started: boolean;
    gameOver: boolean;
    playersState: PlayersState;
  };
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
      case "initialGameStatesReturned":
        this.onInitialGameStatesReturned(event);
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
    this.setPlayersState(event.data.playersState);
  };

  private onGridSizeChanged = (event: onGridSizeChangedType) => {
    this.setGridSize(event.data.gridSize);
  };

  private onInitialGameStatesReturned = (
    event: onInitialGameStatesReturnedType
  ) => {
    const { started, gameOver, playersState } = event.data;

    this.setStarted(started);
    this.setGameOver(gameOver);
    this.setPlayersState(playersState);
  };
}

export default SnakeGameSocket;
