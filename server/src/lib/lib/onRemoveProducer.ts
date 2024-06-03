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
    producerType: string;
    producerId?: string;
  },
  io: SocketIOServer
) => {
  try {
    if (
      roomProducerTransports[event.table_id] &&
      roomProducerTransports[event.table_id][event.username] &&
      Object.keys(roomProducers[event.table_id][event.username] || {})
        .length === 1 &&
      Object.keys(
        roomProducers[event.table_id][event.username][
          event.producerType as "webcam" | "screen" | "audio"
        ] || {}
      ).length === 1 &&
      ((event.producerId &&
        (event.producerType === "webcam" || event.producerType === "screen") &&
        roomProducers[event.table_id]?.[event.username]?.[event.producerType]?.[
          event.producerId
        ]) ||
        (event.producerType === "audio" &&
          roomProducers[event.table_id]?.[event.username]?.[
            event.producerType
          ]))
    ) {
      delete roomProducerTransports[event.table_id][event.username];
    }

    if (
      roomProducerTransports[event.table_id] &&
      Object.keys(roomProducerTransports[event.table_id]).length == 0
    ) {
      delete roomProducerTransports[event.table_id];
    }

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

    if (
      event.producerId &&
      (event.producerType === "webcam" || event.producerType === "screen") &&
      roomProducers[event.table_id]?.[event.username]?.[event.producerType]?.[
        event.producerId
      ]
    ) {
      if (
        Object.keys(
          roomProducers[event.table_id][event.username][
            event.producerType as "webcam" | "screen"
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
            event.producerType as "webcam" | "screen"
          ];
        }
      } else {
        delete roomProducers[event.table_id][event.username][
          event.producerType as "webcam" | "screen"
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

    for (const username in roomConsumers[event.table_id]) {
      for (const producerUsername in roomConsumers[event.table_id][username]) {
        if (producerUsername === event.username) {
          for (const producerType in roomConsumers[event.table_id][username][
            producerUsername
          ]) {
            if (
              producerType === event.producerType &&
              (producerType === "webcam" || producerType === "screen")
            ) {
              for (const producerId in roomConsumers[event.table_id][username][
                producerUsername
              ][producerType as "webcam" | "screen"]) {
                if (producerId === event.producerId) {
                  delete roomConsumers[event.table_id][username][
                    producerUsername
                  ][producerType as "webcam" | "screen"]![producerId];
                }
                if (
                  Object.keys(
                    roomConsumers[event.table_id][username][producerUsername][
                      producerType as "webcam" | "screen"
                    ] || {}
                  ).length === 0
                ) {
                  delete roomConsumers[event.table_id][username][
                    producerUsername
                  ][producerType as "webcam" | "screen" | "audio"];
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
