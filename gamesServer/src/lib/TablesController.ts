import { v4 as uuidv4 } from "uuid";
import {
  GameTypes,
  GameWebSocket,
  onJoinTableType,
  onLeaveTableType,
  onNewGameSocketType,
  tables,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  onJoinTable = (ws: GameWebSocket, event: onJoinTableType) => {
    const { tableId, username, instance } = event.header;

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

    const activeGames = this.getUniqueGames(tableId);

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

  onNewGameSocket = (ws: GameWebSocket, event: onNewGameSocketType) => {
    const { tableId, username, instance, gameType, gameId } = event.header;

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

  onLeaveTable = (event: onLeaveTableType) => {
    const { tableId, username, instance, socketType, gameType, gameId } =
      event.header;

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

  private getUniqueGames = (
    tableId: string
  ): { gameType: GameTypes; gameId: string }[] => {
    const uniqueGames = new Set<string>();
    const result: { gameType: GameTypes; gameId: string }[] = [];

    if (!tables[tableId]) return result;

    const usernames = Object.values(tables[tableId]);
    for (const username of usernames) {
      const instances = Object.values(username);
      for (const instance of instances) {
        if (instance.games) {
          for (const [gameType, gamesById] of Object.entries(instance.games)) {
            if (gamesById) {
              for (const gameId of Object.keys(gamesById)) {
                const key = `${gameType}:${gameId}`;
                if (!uniqueGames.has(key)) {
                  uniqueGames.add(key);
                  result.push({ gameType: gameType as GameTypes, gameId });
                }
              }
            }
          }
        }
      }
    }

    return result;
  };
}

export default TablesController;
