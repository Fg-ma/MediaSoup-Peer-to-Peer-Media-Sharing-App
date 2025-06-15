import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  GameWebSocket,
  onJoinTableType,
  onLeaveTableType,
  onNewGameSocketType,
  SocketTypesArray,
  tables,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { sanitizationUtils, tableTopMongo } from "src";
import {
  GameTypes,
  GameTypesArray,
} from "../../../universal/contentTypeConstant";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  private joinTableSchema = z.object({
    type: z.literal("joinTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onJoinTable = async (ws: GameWebSocket, event: onJoinTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onJoinTableType;
    const validation = this.joinTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

    if (!tables[tableId]) {
      tables[tableId] = {};
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }
    if (!tables[tableId][username][instance]) {
      tables[tableId][username][instance] = { games: {} };
    }

    tables[tableId][username][instance].signaling = ws;

    ws.id = uuidv4();
    ws.tableId = tableId;
    ws.username = username;
    ws.instance = instance;
    ws.socketType = "signaling";

    const activeGames = await this.getUniqueGames(tableId);

    this.broadcaster.broadcastToInstance(
      tableId,
      username,
      instance,
      "signaling",
      undefined,
      undefined,
      {
        type: "userJoinedTable",
        data: { activeGames },
      }
    );
  };

  private newGameSocketSchema = z.object({
    type: z.literal("newGameSocket"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameType: z.enum(GameTypesArray),
      gameId: z.string(),
    }),
  });

  onNewGameSocket = (ws: GameWebSocket, event: onNewGameSocketType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onNewGameSocketType;
    const validation = this.newGameSocketSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameType, gameId } = safeEvent.header;

    if (!tables[tableId]) {
      tables[tableId] = {};
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }
    if (!tables[tableId][username][instance]) {
      tables[tableId][username][instance] = { games: {} };
    }
    if (!tables[tableId][username][instance].games[gameType]) {
      tables[tableId][username][instance].games[gameType] = {};
    }

    tables[tableId][username][instance].games[gameType][gameId] = ws;

    ws.id = uuidv4();
    ws.tableId = tableId;
    ws.username = username;
    ws.instance = instance;
    ws.socketType = "games";
    ws.gameType = gameType;
    ws.gameId = gameId;
  };

  private leaveTableSchema = z.object({
    type: z.literal("leaveTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      socketType: z.enum(SocketTypesArray),
      gameType: z.enum(GameTypesArray).optional(),
      gameId: z.string().optional(),
    }),
  });

  onLeaveTable = (event: onLeaveTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onLeaveTableType;
    const validation = this.leaveTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, socketType, gameType, gameId } =
      safeEvent.header;

    if (socketType === "signaling") {
      if (
        tables[tableId] &&
        tables[tableId][username] &&
        tables[tableId][username][instance] &&
        tables[tableId][username][instance].signaling
      ) {
        tables[tableId][username][instance].signaling.close();
      }
    } else if (socketType === "games") {
      if (
        gameType &&
        gameId &&
        tables[tableId] &&
        tables[tableId][username] &&
        tables[tableId][username][instance].games[gameType] &&
        tables[tableId][username][instance].games[gameType][gameId]
      ) {
        tables[tableId][username][instance].games[gameType][gameId].close();
      }
    }

    this.broadcaster.broadcastToTable(tableId, "games", gameType, gameId, {
      type: "userLeftTable",
      header: { tableId, username, instance, socketType, gameType, gameId },
    });
  };

  private getUniqueGames = async (
    tableId: string
  ): Promise<
    {
      gameType: GameTypes;
      gameId: string;
      positioning: {
        position: {
          left: number;
          top: number;
        };
        scale: {
          x: number;
          y: number;
        };
        rotation: number;
      };
    }[]
  > => {
    const mongoData = await tableTopMongo.tableGames?.gets.getAllBy_TID(
      tableId
    );

    return mongoData ?? [];
  };
}

export default TablesController;
