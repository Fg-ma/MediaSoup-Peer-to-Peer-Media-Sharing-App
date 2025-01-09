import { tables } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToTable = (
    table_id: string,
    message: object,
    exclude?: { username: string; instance: string }[]
  ) => {
    if (tables[table_id]) {
      const msg = JSON.stringify(message);

      Object.entries(tables[table_id]).forEach(([username, user]) => {
        Object.entries(user).forEach(([instance, socket]) => {
          if (exclude && exclude.includes({ username, instance })) {
            return;
          }

          try {
            console.log(msg, table_id, username, instance);
            socket.send(msg);
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        });
      });
    }
  };

  broadcastToUser = (table_id: string, username: string, message: object) => {
    if (tables[table_id] && tables[table_id][username]) {
      const msg = JSON.stringify(message);

      Object.values(tables[table_id][username]).forEach((socket) => {
        try {
          socket.send(msg);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      });
    }
  };

  broadcastToInstance = (
    table_id: string,
    username: string,
    instance: string,
    message: object
  ) => {
    if (
      tables[table_id] &&
      tables[table_id][username] &&
      tables[table_id][username][instance]
    ) {
      const msg = JSON.stringify(message);

      const socket = tables[table_id][username][instance];

      socket.send(msg);
    }
  };
}

export default Broadcaster;
