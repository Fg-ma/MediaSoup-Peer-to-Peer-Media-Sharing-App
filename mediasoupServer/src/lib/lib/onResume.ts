import { Server as SocketIOServer } from "socket.io";
import { tableConsumers } from "../mediasoupVars";
import { onResumeType } from "../mediasoupTypes";

const onResume = async (event: onResumeType, io: SocketIOServer) => {
  const { table_id, username, instance } = event.header;

  for (const producerUsername in tableConsumers[table_id][username][instance]) {
    for (const producerInstance in tableConsumers[table_id][username][instance][
      producerUsername
    ]) {
      try {
        if (
          tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].camera
        ) {
          const cameraConsumers =
            tableConsumers[table_id][username][instance][producerUsername][
              producerInstance
            ].camera;
          for (const cameraId in cameraConsumers) {
            await cameraConsumers[cameraId].consumer?.resume();
          }
        }
        if (
          tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].screen
        ) {
          const screenConsumers =
            tableConsumers[table_id][username][instance][producerUsername][
              producerInstance
            ].screen;
          for (const screenId in screenConsumers) {
            await screenConsumers[screenId].consumer?.resume();
          }
        }
        if (
          tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].screenAudio
        ) {
          const screenAudioConsumers =
            tableConsumers[table_id][username][instance][producerUsername][
              producerInstance
            ].screenAudio;
          for (const screenAudioId in screenAudioConsumers) {
            await screenAudioConsumers[screenAudioId].consumer?.resume();
          }
        }
        if (
          tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].audio
        ) {
          await tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].audio!.consumer?.resume();
        }
        if (
          tableConsumers[table_id][username][instance][producerUsername][
            producerInstance
          ].json
        ) {
          const jsonConsumers =
            tableConsumers[table_id][username][instance][producerUsername][
              producerInstance
            ].json;
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

  io.to(`instance_${table_id}_${username}_${instance}`).emit("message", {
    type: "resumed",
    data: "resumed",
  });
};

export default onResume;
