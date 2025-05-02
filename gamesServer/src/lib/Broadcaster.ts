import { GameTypes, SocketTypes, tables } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToTable = (
    tableId: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object,
    exclude?: { username: string; instance: string }[]
  ) => {
    if (tables[tableId]) {
      const msg = JSON.stringify(message);

      Object.entries(tables[tableId]).forEach(([username, user]) => {
        Object.entries(user).forEach(([instance, socket]) => {
          if (exclude && exclude.includes({ username, instance })) {
            return;
          }

          try {
            if (socketType === "signaling" && socket.signaling) {
              socket.signaling.send(msg);
            } else if (
              socketType === "games" &&
              gameType &&
              socket.games[gameType] &&
              gameId &&
              socket.games[gameType][gameId]
            ) {
              socket.games[gameType][gameId].send(msg);
            }
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        });
      });
    }
  };

  broadcastToUser = (
    tableId: string,
    username: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object
  ) => {
    if (tables[tableId] && tables[tableId][username]) {
      const msg = JSON.stringify(message);

      Object.values(tables[tableId][username]).forEach((socket) => {
        try {
          if (socketType === "signaling" && socket.signaling) {
            socket.signaling.send(msg);
          } else if (
            socketType === "games" &&
            gameType &&
            socket.games[gameType] &&
            gameId &&
            socket.games[gameType][gameId]
          ) {
            socket.games[gameType][gameId].send(msg);
          }
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      });
    }
  };

  broadcastToInstance = (
    tableId: string,
    username: string,
    instance: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object
  ) => {
    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      const msg = JSON.stringify(message);

      const socket = tables[tableId][username][instance];

      if (socketType === "signaling" && socket.signaling) {
        socket.signaling.send(msg);
      } else if (
        socketType === "games" &&
        gameType &&
        socket.games[gameType] &&
        gameId &&
        socket.games[gameType][gameId]
      ) {
        socket.games[gameType][gameId].send(msg);
      }
    }
  };
}

export default Broadcaster;
