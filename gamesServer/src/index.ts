import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import { GameWebSocket, snakeGames, SocketData, tables } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";
import UniversalGameController from "./lib/UniversalGameController";
import SnakeGameController from "./snakeGame/lib/SnakeGameController";
import handleMessage from "./lib/websocketMessage";

export const broadcaster = new Broadcaster();
export const tablesController = new TablesController(broadcaster);
export const universalGameController = new UniversalGameController(broadcaster);
export const snakeGameController = new SnakeGameController();

const sslOptions = {
  key_file_name: "../certs/tabletop-games-server-key.pem",
  cert_file_name: "../certs/tabletop-games-server.pem",
};

uWS
  .SSLApp(sslOptions)
  .ws<SocketData>("/*", {
    message: (ws, message, _isBinary) => {
      const gameWS = ws as GameWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(gameWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: (ws) => {
      const gameWS = ws as GameWebSocket;
      const { table_id, username, instance, socketType, gameType, gameId } =
        gameWS;

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
        if (!gameType || !gameId) {
          return;
        }

        if (
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

        switch (gameType) {
          case "snake":
            if (snakeGames[table_id] && snakeGames[table_id][gameId]) {
              snakeGames[table_id][gameId].closeGame();

              delete snakeGames[table_id][gameId];

              if (Object.keys(snakeGames[table_id]).length === 0) {
                delete snakeGames[table_id];
              }
            }
            break;
          default:
            break;
        }
      }
    },
  })
  .listen(8042, (token) => {
    if (token) {
      console.log("uWebSockets.js Game Server listening on port 8042");
    } else {
      console.error("Failed to start server");
    }
  });
