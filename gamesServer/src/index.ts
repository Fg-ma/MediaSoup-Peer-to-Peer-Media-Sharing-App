import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import { GameWebSocket, snakeGames, SocketData, tables } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";
import UniversalGameController from "./lib/UniversalGameController";
import SnakeGameController from "./snakeGame/lib/SnakeGameController";
import handleMessage from "./lib/websocketMessage";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import SanitizationUtils from "../../universal/SanitizationUtils";

export const sanitizationUtils = new SanitizationUtils();
export const broadcaster = new Broadcaster();
export const tableTopMongo = new TableTopMongo();
export const tablesController = new TablesController(broadcaster);
export const universalGameController = new UniversalGameController(broadcaster);
export const snakeGameController = new SnakeGameController();

const sslOptions = {
  key_file_name: "../certs/tabletop-games-server-key.pem",
  cert_file_name: "../certs/tabletop-games-server.pem",
  dh_params_file_name: "../certs/tabletop-games-server-dhparam.pem",
  ssl_prefer_server_ciphers: true,
  ssl_options: ["NO_SSLv3", "NO_TLSv1", "NO_TLSv1_1"],
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

    close: async (ws) => {
      const gameWS = ws as GameWebSocket;
      const { tableId, username, instance, socketType, gameType, gameId } =
        gameWS;

      if (socketType === "signaling") {
        if (
          tables[tableId] &&
          tables[tableId][username] &&
          tables[tableId][username][instance] &&
          tables[tableId][username][instance].signaling
        ) {
          delete tables[tableId][username][instance].signaling;

          if (
            Object.keys(tables[tableId][username][instance].games).length === 0
          ) {
            delete tables[tableId][username][instance];

            if (Object.keys(tables[tableId][username]).length === 0) {
              delete tables[tableId][username];

              if (Object.keys(tables[tableId]).length === 0) {
                delete tables[tableId];
              }
            }
          }
        }
      } else if (socketType === "games") {
        if (!gameType || !gameId) {
          return;
        }

        if (
          tables[tableId] &&
          tables[tableId][username] &&
          tables[tableId][username][instance].games[gameType] &&
          tables[tableId][username][instance].games[gameType][gameId]
        ) {
          delete tables[tableId][username][instance].games[gameType][gameId];

          if (
            Object.keys(tables[tableId][username][instance].games[gameType])
              .length === 0
          ) {
            delete tables[tableId][username][instance].games[gameType];

            if (
              Object.keys(tables[tableId][username][instance].games).length ===
                0 &&
              !tables[tableId][username][instance].signaling
            ) {
              delete tables[tableId][username][instance];

              if (Object.keys(tables[tableId][username]).length === 0) {
                delete tables[tableId][username];

                if (Object.keys(tables[tableId]).length === 0) {
                  delete tables[tableId];

                  switch (gameType) {
                    case "snake":
                      if (snakeGames[tableId] && snakeGames[tableId][gameId]) {
                        snakeGames[tableId][gameId].closeGame();

                        delete snakeGames[tableId][gameId];

                        if (Object.keys(snakeGames[tableId]).length === 0) {
                          delete snakeGames[tableId];
                        }
                      }
                      break;
                    default:
                      break;
                  }

                  await tableTopMongo.tableGames?.deletes.deleteMetaDataBy_TID_GID(
                    tableId,
                    gameId
                  );
                }
              }
            }
          }
        }
      }
    },
  })
  .listen("127.0.0.1", 8042, (token) => {
    if (token) {
      console.log("uWebSockets.js Game Server listening on port 8042");
    } else {
      console.error("Failed to start server");
    }
  });
