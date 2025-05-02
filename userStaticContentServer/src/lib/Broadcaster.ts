import { userConnections } from "../typeConstant";

class Broadcaster {
  constructor() {}

  broadcastToUser = (userId: string, message: object) => {
    if (userConnections[userId]) {
      const msg = JSON.stringify(message);

      Object.values(userConnections[userId]).forEach((socket) => {
        try {
          socket.send(msg);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      });
    }
  };

  broadcastToInstance = (userId: string, instance: string, message: object) => {
    if (userConnections[userId] && userConnections[userId][instance]) {
      const msg = JSON.stringify(message);

      const socket = userConnections[userId][instance];

      socket.send(msg);
    }
  };
}

export default Broadcaster;
