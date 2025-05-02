import { tables } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToTable = (
    tableId: string,
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
            socket.send(msg);
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        });
      });
    }
  };

  broadcastToUser = (tableId: string, username: string, message: object) => {
    if (tables[tableId] && tables[tableId][username]) {
      const msg = JSON.stringify(message);

      Object.values(tables[tableId][username]).forEach((socket) => {
        try {
          socket.send(msg);
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
    message: object
  ) => {
    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      const msg = JSON.stringify(message);

      const socket = tables[tableId][username][instance];

      socket.send(msg);
    }
  };

  broadcastToFirstFoundInstance = (tableId: string, message: object) => {
    if (tables[tableId]) {
      const user = Object.entries(tables[tableId])[0];
      if (user) {
        const instance = Object.entries(tables[tableId][user[0]])[0];

        if (instance) {
          const msg = JSON.stringify(message);

          const socket = tables[tableId][user[0]][instance[0]];

          socket.send(msg);
        }
      }
    }
  };
}

export default Broadcaster;
