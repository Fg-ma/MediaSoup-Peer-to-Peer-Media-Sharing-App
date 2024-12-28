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
    const { table_id, username, instance } = event.header;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }
    if (!tables[table_id][username][instance]) {
      tables[table_id][username][instance] = { games: {} };
    }

    tables[table_id][username][instance].signaling = ws;

    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;
    ws.socketType = "signaling";

    const activeGames = this.getUniqueGames(table_id);

    this.broadcaster.broadcastToInstance(
      table_id,
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
    const { table_id, username, instance, gameType, gameId } = event.header;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }
    if (!tables[table_id][username][instance]) {
      tables[table_id][username][instance] = { games: {} };
    }
    if (!tables[table_id][username][instance].games[gameType]) {
      tables[table_id][username][instance].games[gameType] = {};
    }

    tables[table_id][username][instance].games[gameType][gameId] = ws;

    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;
    ws.socketType = "games";
    ws.gameType = gameType;
    ws.gameId = gameId;
  };

  onLeaveTable = (event: onLeaveTableType) => {
    const { table_id, username, instance, socketType, gameType, gameId } =
      event.header;

    if (socketType === "signaling") {
      if (
        tables[table_id] &&
        tables[table_id][username] &&
        tables[table_id][username][instance] &&
        tables[table_id][username][instance].signaling
      ) {
        tables[table_id][username][instance].signaling.close();
      }
    } else if (socketType === "games") {
      if (
        gameType &&
        gameId &&
        tables[table_id] &&
        tables[table_id][username] &&
        tables[table_id][username][instance].games[gameType] &&
        tables[table_id][username][instance].games[gameType][gameId]
      ) {
        tables[table_id][username][instance].games[gameType][gameId].close();
      }
    }

    this.broadcaster.broadcastToTable(table_id, "games", gameType, gameId, {
      type: "userLeftTable",
      header: { table_id, username, instance, socketType, gameType, gameId },
    });
  };

  private getUniqueGames = (
    table_id: string
  ): { gameType: GameTypes; gameId: string }[] => {
    const uniqueGames = new Set<string>();
    const result: { gameType: GameTypes; gameId: string }[] = [];

    if (!tables[table_id]) return result;

    const usernames = Object.values(tables[table_id]);
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
