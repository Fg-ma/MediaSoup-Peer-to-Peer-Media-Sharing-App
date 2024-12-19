import Broadcaster from "./Broadcaster";
import {
  onStartGameType,
  onInitiateGameType,
  onStageGameType,
  snakeGames,
  tables,
  onCloseGameType,
  onJoinGameType,
  onLeaveGameType,
} from "../typeConstant";
import SnakeGame from "../snakeGame/SnakeGame";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onInitiateGame = (event: onInitiateGameType) => {
    const { table_id, gameType, gameId } = event.data;

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
        gameType,
        gameId,
      }
    );
  };

  onStageGame = (event: onStageGameType) => {
    const { table_id, gameType, gameId } = event.data;

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStaged",
    });

    if (gameType === "snake") {
      snakeGames[table_id][gameId].stageGame();
    }
  };

  onStartGame = (event: onStartGameType) => {
    const { table_id, gameType, gameId } = event.data;

    if (gameType === "snake") {
      snakeGames[table_id][gameId].startGame();
    }

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStarted",
    });
  };

  onCloseGame = (event: onCloseGameType) => {
    const { table_id, gameType, gameId } = event.data;

    if (gameType === "snake") {
      snakeGames[table_id][gameId].closeGame();
    }

    this.broadcaster.broadcastToTable(
      table_id,
      "signaling",
      undefined,
      undefined,
      {
        type: "gameClosed",
        gameType,
        gameId,
      }
    );

    for (const username in tables[table_id]) {
      for (const instance in tables[table_id][username]) {
        if (
          tables[table_id][username][instance].games[gameType] &&
          tables[table_id][username][instance].games[gameType][gameId]
        ) {
          delete tables[table_id][username][instance].games[gameType][gameId];

          if (
            Object.keys(tables[table_id][username][instance].games[gameType])
              .length === 0
          ) {
            delete tables[table_id][username][instance].games[gameType];
          }
        }
      }
    }
  };

  onJoinGame = (event: onJoinGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

    switch (gameType) {
      case "snake":
        snakeGames[table_id][gameId].joinGame(username, instance);
        break;
      default:
        break;
    }
  };

  onLeaveGame = (event: onLeaveGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

    switch (gameType) {
      case "snake":
        snakeGames[table_id][gameId].leaveGame(username, instance);
        break;
      default:
        break;
    }
  };
}

export default UniversalGameController;
