import { userConnections } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToUser = (
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    binary: boolean = false
  ) => {
    if (userConnections[userId]) {
      let msg = message;
      if (!binary) {
        msg = JSON.stringify(message);
      }

      Object.values(userConnections[userId]).forEach((socket) => {
        try {
          socket.send(msg, binary);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      });
    }
  };

  broadcastToInstance = (
    userId: string,
    instance: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    binary: boolean = false
  ) => {
    if (userConnections[userId] && userConnections[userId][instance]) {
      let msg = message;
      if (!binary) {
        msg = JSON.stringify(message);
      }

      const socket = userConnections[userId][instance];

      socket.send(msg, binary);
    }
  };
}

export default Broadcaster;
