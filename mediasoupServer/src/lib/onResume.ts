import Broadcaster from "./Broadcaster";
import { onResumeType, tableConsumers } from "../typeConstant";

const onResume = async (broadcaster: Broadcaster, event: onResumeType) => {
  const { tableId, username, instance } = event.header;

  for (const producerUsername in tableConsumers[tableId][username][instance]) {
    for (const producerInstance in tableConsumers[tableId][username][instance][
      producerUsername
    ]) {
      try {
        if (
          tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].camera
        ) {
          const cameraConsumers =
            tableConsumers[tableId][username][instance][producerUsername][
              producerInstance
            ].camera;
          for (const cameraId in cameraConsumers) {
            await cameraConsumers[cameraId].consumer?.resume();
          }
        }
        if (
          tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].screen
        ) {
          const screenConsumers =
            tableConsumers[tableId][username][instance][producerUsername][
              producerInstance
            ].screen;
          for (const screenId in screenConsumers) {
            await screenConsumers[screenId].consumer?.resume();
          }
        }
        if (
          tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].screenAudio
        ) {
          const screenAudioConsumers =
            tableConsumers[tableId][username][instance][producerUsername][
              producerInstance
            ].screenAudio;
          for (const screenAudioId in screenAudioConsumers) {
            await screenAudioConsumers[screenAudioId].consumer?.resume();
          }
        }
        if (
          tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].audio
        ) {
          await tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].audio!.consumer?.resume();
        }
        if (
          tableConsumers[tableId][username][instance][producerUsername][
            producerInstance
          ].json
        ) {
          const jsonConsumers =
            tableConsumers[tableId][username][instance][producerUsername][
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

  broadcaster.broadcastToInstance(tableId, username, instance, {
    type: "resumed",
    data: "resumed",
  });
};

export default onResume;
