import { tables } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToTable = (
    tableId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    exclude?: { username: string; instance: string }[],
    binary: boolean = false
  ) => {
    if (tables[tableId]) {
      let msg = message;
      if (!binary) {
        msg = JSON.stringify(message);
      }

      Object.entries(tables[tableId]).forEach(([username, user]) => {
        Object.entries(user).forEach(([instance, socket]) => {
          if (exclude && exclude.includes({ username, instance })) {
            return;
          }

          try {
            socket.send(msg, binary);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    binary: boolean = false
  ) => {
    if (tables[tableId] && tables[tableId][username]) {
      let msg = message;
      if (!binary) {
        msg = JSON.stringify(message);
      }

      Object.values(tables[tableId][username]).forEach((socket) => {
        try {
          socket.send(msg, binary);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    binary: boolean = false
  ) => {
    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      let msg = message;
      if (!binary) {
        msg = JSON.stringify(message);
      }

      const socket = tables[tableId][username][instance];

      socket.send(msg, binary);
    }
  };
}

export default Broadcaster;
