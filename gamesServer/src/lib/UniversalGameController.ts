import { z } from "zod";
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
  onGetInitialGameStatesType,
  onUpdateContentPositioningType,
} from "../typeConstant";
import SnakeGame from "../snakeGame/SnakeGame";
import {
  SnakeColorsSchema,
  SnakeColorsType,
} from "../snakeGame/lib/typeConstant";
import { sanitizationUtils, tableTopMongo } from "src";
import { GameTypesArray } from "../../../universal/contentTypeConstant";

class UniversalGameController {
  constructor(private broadcaster: Broadcaster) {}

  private updateContentPositioningSchema = z.object({
    type: z.literal("updateContentPositioning"),
    header: z.object({
      tableId: z.string(),
      gameId: z.string(),
    }),
    data: z.object({
      positioning: z.object({
        position: z
          .object({
            left: z.number(),
            top: z.number(),
          })
          .optional(),
        scale: z
          .object({
            x: z.number(),
            y: z.number(),
          })
          .optional(),
        rotation: z.number().optional(),
      }),
    }),
  });

  onUpdateContentPositioning = async (
    event: onUpdateContentPositioningType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onUpdateContentPositioningType;
    const validation = this.updateContentPositioningSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, gameId } = safeEvent.header;
    const { positioning } = safeEvent.data;

    await tableTopMongo.tableGames?.uploads.editMetaData(
      { tableId, gameId },
      {
        positioning,
      }
    );
  };

  private initiateGameSchema = z.object({
    type: z.literal("initiateGame"),
    header: z.object({
      tableId: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
    data: z.object({
      initiator: z.object({
        username: z.string(),
        instance: z.string(),
      }),
    }),
  });

  onInitiateGame = async (event: onInitiateGameType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onInitiateGameType;
    const validation = this.initiateGameSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, gameType, gameId } = safeEvent.header;
    const { initiator } = safeEvent.data;

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

  private startGameSchema = z.object({
    type: z.literal("startGame"),
    header: z.object({
      tableId: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onStartGame = (event: onStartGameType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onStartGameType;
    const validation = this.startGameSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, gameType, gameId } = safeEvent.header;

    if (gameType === "snake") {
      snakeGames[tableId][gameId].startGame();
    }

    this.broadcaster.broadcastToTable(tableId, "games", gameType, gameId, {
      type: "gameStarted",
    });
  };

  private closeGameSchema = z.object({
    type: z.literal("closeGame"),
    header: z.object({
      tableId: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onCloseGame = async (event: onCloseGameType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onCloseGameType;
    const validation = this.closeGameSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, gameType, gameId } = safeEvent.header;

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

  private joinGameSchema = z.object({
    type: z.literal("joinGame"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
    data: z.object({ snakeColor: SnakeColorsSchema.optional() }),
  });

  onJoinGame = (event: onJoinGameType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event) as onJoinGameType;
    const validation = this.joinGameSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameType, gameId } = safeEvent.header;
    const data = safeEvent.data;

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

  private leaveGameSchema = z.object({
    type: z.literal("leaveGame"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onLeaveGame = (event: onLeaveGameType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onLeaveGameType;
    const validation = this.leaveGameSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameType, gameId } = safeEvent.header;

    switch (gameType) {
      case "snake":
        snakeGames[tableId][gameId].leaveGame(username, instance);
        break;
      default:
        break;
    }
  };

  private getPlayersStateSchema = z.object({
    type: z.literal("getPlayersState"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onGetPlayersState = (event: onGetPlayersStateType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetPlayersStateType;
    const validation = this.getPlayersStateSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameType, gameId } = safeEvent.header;

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

  private getInitialGameStatesSchema = z.object({
    type: z.literal("getInitialGameStates"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onGetInitialGameStates = (event: onGetInitialGameStatesType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetInitialGameStatesType;
    const validation = this.getInitialGameStatesSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameType, gameId } = safeEvent.header;

    let initialGameStates = {};

    switch (gameType) {
      case "snake":
        initialGameStates = snakeGames[tableId][gameId].getInitialGameStates();
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
