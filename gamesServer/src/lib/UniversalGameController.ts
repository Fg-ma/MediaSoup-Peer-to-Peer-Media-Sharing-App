import Broadcaster from "./Broadcaster";
import { GameTypes, onGameStart, onInitiateGameType } from "../typeConstant";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onInitiateGame = (event: onInitiateGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

    this.broadcaster.broadcastToTable(
      table_id,
      "signaling",
      undefined,
      undefined,
      {
        type: "gameInitiated",
        username,
        instance,
        gameType,
        gameId,
      }
    );
  };

  onGameStart = (event: onGameStart) => {
    const { table_id, gameType, gameId, initialGameState } = event.data;

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStarted",
      initialGameState,
    });
  };
}

export default UniversalGameController;
