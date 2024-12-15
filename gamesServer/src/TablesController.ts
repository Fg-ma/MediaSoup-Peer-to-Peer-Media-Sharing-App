import { v4 as uuidv4 } from "uuid";
import { GameTypes, GameWebSocket, SocketTypes, tables } from "./typeConstant";
import Broadcaster from "./Broadcaster";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  joinTable = (
    ws: GameWebSocket,
    table_id: string,
    username: string,
    instance: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined
  ) => {
    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }
    if (!tables[table_id][username][instance]) {
      tables[table_id][username][instance] = { games: {} };
    }

    if (socketType === "signaling") {
      tables[table_id][username][instance].signaling = ws;
    } else if (socketType === "games" && gameType && gameId) {
      if (!tables[table_id][username][instance].games[gameType]) {
        tables[table_id][username][instance].games[gameType] = {};
      }

      tables[table_id][username][instance].games[gameType][gameId] = ws;
    }
    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;
    ws.socketType = socketType;
    ws.gameType = gameType;
    ws.gameId = gameId;

    this.broadcaster.broadcastToTable(
      table_id,
      "signaling",
      undefined,
      undefined,
      {
        type: "userJoined",
        data: { table_id, username, instance, socketType, gameType, gameId },
      }
    );
  };

  leaveTable = (
    table_id: string,
    username: string,
    instance: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined
  ) => {
    if (socketType === "signaling") {
      if (
        tables[table_id] &&
        tables[table_id][username] &&
        tables[table_id][username][instance] &&
        tables[table_id][username][instance].signaling
      ) {
        delete tables[table_id][username][instance].signaling;

        if (
          Object.keys(tables[table_id][username][instance].games).length === 0
        ) {
          delete tables[table_id][username][instance];

          if (Object.keys(tables[table_id][username]).length === 0) {
            delete tables[table_id][username];

            if (Object.keys(tables[table_id]).length === 0) {
              delete tables[table_id];
            }
          }
        }
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
        delete tables[table_id][username][instance].games[gameType][gameId];

        if (
          Object.keys(tables[table_id][username][instance].games[gameType])
            .length === 0
        ) {
          delete tables[table_id][username][instance].games[gameType];

          if (
            Object.keys(tables[table_id][username][instance].games).length ===
              0 &&
            !tables[table_id][username][instance].signaling
          ) {
            delete tables[table_id][username][instance];

            if (Object.keys(tables[table_id][username]).length === 0) {
              delete tables[table_id][username];

              if (Object.keys(tables[table_id]).length === 0) {
                delete tables[table_id];
              }
            }
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
        type: "userLeft",
        data: { table_id, username, instance, socketType, gameType, gameId },
      }
    );
  };
}

export default TablesController;
