import { Server as SocketIOServer } from "socket.io";
import { roomConsumers } from "../mediasoupVars";

const onResume = async (
  event: {
    type: string;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  for (const producerUsername in roomConsumers[event.table_id][
    event.username
  ]) {
    try {
      if (
        roomConsumers[event.table_id][event.username][producerUsername].webcam
      ) {
        const webcams =
          roomConsumers[event.table_id][event.username][producerUsername]
            .webcam;
        for (const webcamId in webcams) {
          await webcams[webcamId].consumer?.resume();
        }
      }
      if (
        roomConsumers[event.table_id][event.username][producerUsername].screen
      ) {
        const screens =
          roomConsumers[event.table_id][event.username][producerUsername]
            .screen;
        for (const screenId in screens) {
          await screens[screenId].consumer?.resume();
        }
      }
      if (
        roomConsumers[event.table_id][event.username][producerUsername].audio
      ) {
        await roomConsumers[event.table_id][event.username][
          producerUsername
        ].audio!.consumer?.resume();
      }
    } catch (error) {
      console.error(
        "Failed to resume consumer for user:",
        producerUsername,
        error
      );
    }
  }

  io.to(`${event.table_id}_${event.username}`).emit("message", {
    type: "resumed",
    data: "resumed",
  });
};

export default onResume;
