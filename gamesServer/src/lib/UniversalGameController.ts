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
import { SnakeColorsType } from "src/snakeGame/lib/typeConstant";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onInitiateGame = (event: onInitiateGameType) => {
    const { table_id, gameType, gameId, initiator } = event.data;

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
        initiator,
      }
    );
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

    for (const username in tables[table_id]) {
      for (const instance in tables[table_id][username]) {
        if (
          tables[table_id][username][instance].games[gameType] &&
          tables[table_id][username][instance].games[gameType][gameId]
        ) {
          tables[table_id][username][instance].games[gameType][gameId].close();
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
        gameType,
        gameId,
      }
    );
  };

  onJoinGame = (event: onJoinGameType) => {
    const { table_id, username, instance, gameType, gameId, data } = event.data;

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
    const { table_id, username, instance, gameType, gameId } = event.data;

    switch (gameType) {
      case "snake":
        snakeGames[table_id][gameId].leaveGame(username, instance);
        break;
      default:
        break;
    }
  };

  onGetPlayersState = (event: onGetPlayersStateType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

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
        playersState,
      }
    );
  };

  onGetIntialGameStates = (event: onGetIntialGameStatesType) => {
    const { table_id, username, instance, gameType, gameId } = event.data;

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
        initialGameStates,
      }
    );
  };
}

export default UniversalGameController;
