import { Server as SocketIOServer } from "socket.io";
import { roomConsumers } from "../mediasoupVars";

const onResume = async (
  event: {
    type: string;
    roomName: string;
    username: string;
  },
  io: SocketIOServer
) => {
  for (const producerUsername in roomConsumers[event.roomName][
    event.username
  ]) {
    try {
      if (
        roomConsumers[event.roomName][event.username][producerUsername].webcam
      ) {
        await roomConsumers[event.roomName][event.username][
          producerUsername
        ].webcam?.consumer.resume();
      }
      if (
        roomConsumers[event.roomName][event.username][producerUsername].screen
      ) {
        await roomConsumers[event.roomName][event.username][
          producerUsername
        ].screen?.consumer.resume();
      }
    } catch (error) {
      console.error(
        "Failed to resume consumer for user:",
        producerUsername,
        error
      );
    }
  }

  io.to(`${event.roomName}_${event.username}`).emit("message", {
    type: "resumed",
    data: "resumed",
  });
};

export default onResume;
