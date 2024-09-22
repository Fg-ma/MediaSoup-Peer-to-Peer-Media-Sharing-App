import { Server as SocketIOServer } from "socket.io";
import { tableConsumers } from "../mediasoupVars";

const onResume = async (
  event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
  },
  io: SocketIOServer
) => {
  for (const producerUsername in tableConsumers[event.table_id][event.username][
    event.instance
  ]) {
    for (const producerInstance in tableConsumers[event.table_id][
      event.username
    ][event.instance][producerUsername]) {
      try {
        if (
          tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].camera
        ) {
          const cameras =
            tableConsumers[event.table_id][event.username][event.instance][
              producerUsername
            ][producerInstance].camera;
          for (const cameraId in cameras) {
            await cameras[cameraId].consumer?.resume();
          }
        }
        if (
          tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].screen
        ) {
          const screens =
            tableConsumers[event.table_id][event.username][event.instance][
              producerUsername
            ][producerInstance].screen;
          for (const screenId in screens) {
            await screens[screenId].consumer?.resume();
          }
        }
        if (
          tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].audio
        ) {
          await tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].audio!.consumer?.resume();
        }
      } catch (error) {
        console.error(
          "Failed to resume consumer for user:",
          producerUsername,
          error
        );
      }
    }
  }

  io.to(`instance_${event.table_id}_${event.username}_${event.instance}`).emit(
    "message",
    {
      type: "resumed",
      data: "resumed",
    }
  );
};

export default onResume;
