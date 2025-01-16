import Broadcaster from "./Broadcaster";
import {
  onStartGameType,
  onInitiateGameType,
  snakeGames,
  tables,
  onCloseGameType,
  onJoinGameType,
  onLeaveGameType,
  onGetPlayersStateType,
  onGetIntialGameStatesType,
} from "../typeConstant";
import SnakeGame from "../snakeGame/SnakeGame";
import { SnakeColorsType } from "../snakeGame/lib/typeConstant";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onInitiateGame = (event: onInitiateGameType) => {
    const { table_id, gameType, gameId } = event.header;
    const { initiator } = event.data;

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
        header: {
          gameType,
          gameId,
        },
        data: {
          initiator,
        },
      }
    );
  };

  onStartGame = (event: onStartGameType) => {
    const { table_id, gameType, gameId } = event.header;

    if (gameType === "snake") {
      snakeGames[table_id][gameId].startGame();
    }

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "gameStarted",
    });
  };

  onCloseGame = (event: onCloseGameType) => {
    const { table_id, gameType, gameId } = event.header;

    for (const username in tables[table_id]) {
      for (const instance in tables[table_id][username]) {
        if (
          tables[table_id][username][instance].games[gameType] &&
          tables[table_id][username][instance].games[gameType][gameId]
        ) {
          tables[table_id][username][instance].games[gameType][gameId].close();

          delete tables[table_id][username][instance].games[gameType]?.[gameId];

          if (
            Object.keys(
              tables[table_id][username][instance].games[gameType] || {}
            ).length === 0
          ) {
            delete tables[table_id][username][instance].games[gameType];
          }
        }
      }
    }

    this.broadcaster.broadcastToTable(
      table_id,
      "signaling",
      undefined,
      undefined,
      {
        type: "gameClosed",
        header: {
          gameType,
          gameId,
        },
      }
    );
  };

  onJoinGame = (event: onJoinGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.header;
    const data = event.data;

    switch (gameType) {
      case "snake":
        snakeGames[table_id][gameId].joinGame(
          username,
          instance,
          data as { snakeColor?: SnakeColorsType }
        );
        break;
      default:
        break;
    }
  };

  onLeaveGame = (event: onLeaveGameType) => {
    const { table_id, username, instance, gameType, gameId } = event.header;

    switch (gameType) {
      case "snake":
        snakeGames[table_id][gameId].leaveGame(username, instance);
        break;
      default:
        break;
    }
  };

  onGetPlayersState = (event: onGetPlayersStateType) => {
    const { table_id, username, instance, gameType, gameId } = event.header;

    let playersState = {};

    switch (gameType) {
      case "snake":
        playersState = snakeGames[table_id][gameId].getPlayersState();
        break;
      default:
        break;
    }

    this.broadcaster.broadcastToInstance(
      table_id,
      username,
      instance,
      "games",
      gameType,
      gameId,
      {
        type: "playersStateReturned",
        data: {
          playersState,
        },
      }
    );
  };

  onGetIntialGameStates = (event: onGetIntialGameStatesType) => {
    const { table_id, username, instance, gameType, gameId } = event.header;

    let initialGameStates = {};

    switch (gameType) {
      case "snake":
        initialGameStates = snakeGames[table_id][gameId].getIntialGameStates();
        break;
      default:
        break;
    }

    this.broadcaster.broadcastToInstance(
      table_id,
      username,
      instance,
      "games",
      gameType,
      gameId,
      {
        type: "initialGameStatesReturned",
        data: initialGameStates,
      }
    );
  };
}

export default UniversalGameController;
