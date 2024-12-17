import Broadcaster from "./Broadcaster";
import {
  onGameStart,
  onInitiateGameType,
  onStageGame,
  snakeGames,
} from "../typeConstant";
import SnakeGame from "./SnakeGame";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onInitiateGame = (event: onInitiateGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

    if (gameType === "snake") {
      if (!snakeGames[table_id]) {
        snakeGames[table_id] = {};
      }

      snakeGames[table_id][gameId] = new SnakeGame(
        this.broadcaster,
        table_id,
        gameId
      );
    }

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

  onStageGame = (event: onStageGame) => {
    const { table_id, gameType, gameId } = event.data;

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStaged",
    });

    if (gameType === "snake") {
      snakeGames[table_id][gameId].stageGame();
    }

    setTimeout(() => {
      if (gameType === "snake") {
        snakeGames[table_id][gameId].startGame();
      }

      this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
        type: "gameStarted",
      });
    }, 500);
  };

  onGameStart = (event: onGameStart) => {
    const { table_id, gameType, gameId } = event.data;

    if (gameType === "snake") {
      snakeGames[table_id][gameId].startGame();
    }

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStarted",
    });
  };
}

export default UniversalGameController;
