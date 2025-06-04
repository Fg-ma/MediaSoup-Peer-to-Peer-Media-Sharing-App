import {
  onGameStateUpdateType,
  onGridSizeChangedType,
  onInitialGameStatesReturnedType,
  onPlayersStateUpdatedType,
  SnakeGameListenerTypes,
} from "../SnakeGameMedia";
import { GameState, PlayersState } from "./typeConstant";

class SnakeGameSocket {
  constructor(
    protected setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    protected setStarted: React.Dispatch<React.SetStateAction<boolean>>,
    protected setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    protected playersState: React.MutableRefObject<PlayersState>,
    protected setGridSize: React.Dispatch<React.SetStateAction<number>>,
    protected setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleSnakeGameMessage = (event: SnakeGameListenerTypes) => {
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
    this.playersState.current = event.data.playersState;
    this.setRerender((prev) => !prev);
  };

  private onGridSizeChanged = (event: onGridSizeChangedType) => {
    this.setGridSize(event.data.gridSize);
  };

  private onInitialGameStatesReturned = (
    event: onInitialGameStatesReturnedType,
  ) => {
    const { started, gameOver, playersState } = event.data;

    this.setStarted(started);
    this.setGameOver(gameOver);
    this.playersState.current = playersState;
    this.setRerender((prev) => !prev);
  };
}

export default SnakeGameSocket;
