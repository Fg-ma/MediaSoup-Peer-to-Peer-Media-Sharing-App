import { Server as SocketIOServer } from "socket.io";
import { tableConsumers } from "../mediasoupVars";
import { onResumeType } from "../mediasoupTypes";

const onResume = async (event: onResumeType, io: SocketIOServer) => {
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
          const cameraConsumers =
            tableConsumers[event.table_id][event.username][event.instance][
              producerUsername
            ][producerInstance].camera;
          for (const cameraId in cameraConsumers) {
            await cameraConsumers[cameraId].consumer?.resume();
          }
        }
        if (
          tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].screen
        ) {
          const screenConsumers =
            tableConsumers[event.table_id][event.username][event.instance][
              producerUsername
            ][producerInstance].screen;
          for (const screenId in screenConsumers) {
            await screenConsumers[screenId].consumer?.resume();
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
        if (
          tableConsumers[event.table_id][event.username][event.instance][
            producerUsername
          ][producerInstance].json
        ) {
          const jsonConsumers =
            tableConsumers[event.table_id][event.username][event.instance][
              producerUsername
            ][producerInstance].json;
          for (const jsonId in jsonConsumers) {
            // @ts-expect-error: ts doesn't recoginizes keys in loop
            await jsonConsumers[jsonId].consumer?.resume();
          }
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
