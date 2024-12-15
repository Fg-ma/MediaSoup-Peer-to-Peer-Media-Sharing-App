import { GameTypes, SocketTypes, tables } from "./typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToTable = (
    table_id: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object
  ) => {
    if (tables[table_id]) {
      const msg = JSON.stringify(message);

      Object.values(tables[table_id]).forEach((user) => {
        Object.values(user).forEach((socket) => {
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
    table_id: string,
    username: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object
  ) => {
    if (tables[table_id] && tables[table_id][username]) {
      const msg = JSON.stringify(message);

      Object.values(tables[table_id][username]).forEach((socket) => {
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
    table_id: string,
    username: string,
    socketType: SocketTypes,
    gameType: GameTypes | undefined,
    gameId: string | undefined,
    message: object
  ) => {
    if (tables[table_id] && tables[table_id][username]) {
      const msg = JSON.stringify(message);

      Object.values(tables[table_id][username]).forEach((socket) => {
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
}

export default Broadcaster;
