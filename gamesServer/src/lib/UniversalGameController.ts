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
  onUpdateContentPositioningType,
} from "../typeConstant";
import SnakeGame from "../snakeGame/SnakeGame";
import { SnakeColorsType } from "../snakeGame/lib/typeConstant";
import { tableTopMongo } from "src";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  onUpdateContentPositioning = async (
    event: onUpdateContentPositioningType
  ) => {
    const { tableId, gameId } = event.header;
    const { positioning } = event.data;

    await tableTopMongo.tableGames?.uploads.editMetaData(
      { tableId, gameId },
      {
        positioning,
      }
    );
  };

  onInitiateGame = async (event: onInitiateGameType) => {
    const { tableId, gameType, gameId } = event.header;
    const { initiator } = event.data;

    if (gameType === "snake") {
      if (!snakeGames[tableId]) {
        snakeGames[tableId] = {};
      }

      snakeGames[tableId][gameId] = new SnakeGame(
        this.broadcaster,
        tableId,
        gameId
      );

      await tableTopMongo.tableGames?.uploads.uploadMetaData({
        tableId,
        gameId,
        gameType,
        positioning: {
          position: { left: 37.5, top: 37.5 },
          scale: { x: 25, y: 25 },
          rotation: 0,
        },
      });
    }

    this.broadcaster.broadcastToTable(
      tableId,
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
    const { tableId, gameType, gameId } = event.header;

    if (gameType === "snake") {
      snakeGames[tableId][gameId].startGame();
    }

    this.broadcaster.broadcastToTable(tableId, "games", gameType, gameId, {
      type: "gameStarted",
    });
  };

  onCloseGame = async (event: onCloseGameType) => {
    const { tableId, gameType, gameId } = event.header;

    this.broadcaster.broadcastToTable(
      tableId,
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

    await tableTopMongo.tableGames?.deletes.deleteMetaDataBy_TID_GID(
      tableId,
      gameId
    );

    for (const username in tables[tableId]) {
      for (const instance in tables[tableId][username]) {
        if (
          tables[tableId][username][instance].games[gameType] &&
          tables[tableId][username][instance].games[gameType][gameId]
        ) {
          tables[tableId][username][instance].games[gameType][gameId].close();

          delete tables[tableId][username][instance].games[gameType]?.[gameId];

          if (
            Object.keys(
              tables[tableId][username][instance].games[gameType] || {}
            ).length === 0
          ) {
            delete tables[tableId][username][instance].games[gameType];
          }
        }
      }
    }

    switch (gameType) {
      case "snake":
        delete snakeGames[tableId][gameId];

        if (Object.keys(snakeGames[tableId]).length === 0) {
          delete snakeGames[tableId];
        }
        break;
      default:
        break;
    }
  };

  onJoinGame = (event: onJoinGameType) => {
    const { tableId, username, instance, gameType, gameId } = event.header;
    const data = event.data;

    switch (gameType) {
      case "snake":
        snakeGames[tableId][gameId].joinGame(
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
    const { tableId, username, instance, gameType, gameId } = event.header;

    switch (gameType) {
      case "snake":
        snakeGames[tableId][gameId].leaveGame(username, instance);
        break;
      default:
        break;
    }
  };

  onGetPlayersState = (event: onGetPlayersStateType) => {
    const { tableId, username, instance, gameType, gameId } = event.header;

    let playersState = {};

    switch (gameType) {
      case "snake":
        playersState = snakeGames[tableId][gameId].getPlayersState();
        break;
      default:
        break;
    }

    this.broadcaster.broadcastToInstance(
      tableId,
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
    const { tableId, username, instance, gameType, gameId } = event.header;

    let initialGameStates = {};

    switch (gameType) {
      case "snake":
        initialGameStates = snakeGames[tableId][gameId].getIntialGameStates();
        break;
      default:
        break;
    }

    this.broadcaster.broadcastToInstance(
      tableId,
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
