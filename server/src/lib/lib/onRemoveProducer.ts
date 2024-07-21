import { Server as SocketIOServer } from "socket.io";
import {
  roomProducerTransports,
  roomProducers,
  roomConsumers,
  roomConsumerTransports,
  workersMap,
} from "../mediasoupVars";
import { releaseWorker } from "../workerManager";

const onRemoveProducer = async (
  event: {
    type: string;
    table_id: string;
    username: string;
    producerType: "camera" | "screen" | "audio";
    producerId?: string;
  },
  io: SocketIOServer
) => {
  try {
    // Remove producers
    if (
      event.producerId &&
      (event.producerType === "camera" || event.producerType === "screen") &&
      roomProducers[event.table_id]?.[event.username]?.[event.producerType]?.[
        event.producerId
      ]
    ) {
      if (
        Object.keys(
          roomProducers[event.table_id][event.username][
            event.producerType as "camera" | "screen"
          ] || {}
        ).length === 1
      ) {
        if (
          Object.keys(roomProducers[event.table_id][event.username] || {})
            .length === 1
        ) {
          if (Object.keys(roomProducers[event.table_id] || {}).length === 1) {
            delete roomProducers[event.table_id];
          } else {
            delete roomProducers[event.table_id][event.username];
          }
        } else {
          delete roomProducers[event.table_id][event.username][
            event.producerType as "camera" | "screen"
          ];
        }
      } else {
        delete roomProducers[event.table_id][event.username][
          event.producerType as "camera" | "screen"
        ]![event.producerId];
      }
    } else if (
      event.producerType === "audio" &&
      roomProducers[event.table_id]?.[event.username]?.[event.producerType]
    ) {
      if (
        Object.keys(roomProducers[event.table_id][event.username] || {})
          .length === 1
      ) {
        if (Object.keys(roomProducers[event.table_id] || {}).length === 1) {
          delete roomProducers[event.table_id];
        } else {
          delete roomProducers[event.table_id][event.username];
        }
      } else {
        delete roomProducers[event.table_id][event.username][
          event.producerType as "audio"
        ];
      }
    }

    // Remove consumers
    for (const username in roomConsumers[event.table_id]) {
      for (const producerUsername in roomConsumers[event.table_id][username]) {
        if (producerUsername === event.username) {
          for (const producerType in roomConsumers[event.table_id][username][
            producerUsername
          ]) {
            if (
              producerType === event.producerType &&
              (producerType === "camera" || producerType === "screen")
            ) {
              for (const producerId in roomConsumers[event.table_id][username][
                producerUsername
              ][producerType as "camera" | "screen"]) {
                if (producerId === event.producerId) {
                  delete roomConsumers[event.table_id][username][
                    producerUsername
                  ][producerType as "camera" | "screen"]![producerId];
                }
                if (
                  Object.keys(
                    roomConsumers[event.table_id][username][producerUsername][
                      producerType as "camera" | "screen"
                    ] || {}
                  ).length === 0
                ) {
                  delete roomConsumers[event.table_id][username][
                    producerUsername
                  ][producerType as "camera" | "screen" | "audio"];
                }
              }
            }
            if (
              producerType === event.producerType &&
              producerType === "audio"
            ) {
              delete roomConsumers[event.table_id][username][producerUsername][
                producerType as "audio"
              ];
            }
            if (
              Object.keys(
                roomConsumers[event.table_id][username][producerUsername]
              ).length === 0
            ) {
              delete roomConsumers[event.table_id][username][producerUsername];
            }
          }
        }
        if (Object.keys(roomConsumers[event.table_id][username]).length === 0) {
          delete roomConsumers[event.table_id][username];
        }
      }
      if (Object.keys(roomConsumers[event.table_id]).length === 0) {
        delete roomConsumers[event.table_id];
      }
    }

    // Remove producer transports
    if (
      (roomProducerTransports[event.table_id] &&
        roomProducerTransports[event.table_id][event.username] &&
        roomProducers[event.table_id] &&
        roomProducers[event.table_id][event.username] &&
        Object.keys(roomProducers[event.table_id][event.username]).length ===
          0) ||
      !roomProducers[event.table_id] ||
      !roomProducers[event.table_id][event.username]
    ) {
      delete roomProducerTransports[event.table_id][event.username];
    }
    if (
      roomProducerTransports[event.table_id] &&
      Object.keys(roomProducerTransports[event.table_id]).length == 0
    ) {
      delete roomProducerTransports[event.table_id];
    }

    // Release workers
    if (
      (!roomProducerTransports ||
        (roomProducerTransports[event.table_id] &&
          Object.keys(roomProducerTransports[event.table_id]).length === 0)) &&
      (!roomConsumerTransports ||
        (roomConsumerTransports[event.table_id] &&
          Object.keys(roomConsumerTransports[event.table_id]).length === 0))
    ) {
      releaseWorker(workersMap[event.table_id]);
      delete workersMap[event.table_id];
    }

    const msg = {
      type: "producerDisconnected",
      producerUsername: event.username,
      producerType: event.producerType,
      producerId: event.producerId,
    };
    io.to(event.table_id).emit("message", msg);
  } catch (error) {
    console.error(error);
  }
};

export default onRemoveProducer;
