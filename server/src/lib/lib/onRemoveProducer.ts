import { Server as SocketIOServer } from "socket.io";
import {
  roomProducerTransports,
  roomProducers,
  roomConsumers,
} from "../mediasoupVars";

const onRemoveProducer = async (
  event: {
    type: string;
    roomName: string;
    username: string;
    producerType: string;
    producerId?: string;
  },
  io: SocketIOServer
) => {
  try {
    if (
      roomProducerTransports[event.roomName] &&
      roomProducerTransports[event.roomName][event.username] &&
      Object.keys(roomProducers[event.roomName][event.username] || {})
        .length === 1 &&
      Object.keys(
        roomProducers[event.roomName][event.username][
          event.producerType as "webcam" | "screen" | "audio"
        ] || {}
      ).length === 1 &&
      ((event.producerId &&
        (event.producerType === "webcam" || event.producerType === "screen") &&
        roomProducers[event.roomName]?.[event.username]?.[event.producerType]?.[
          event.producerId
        ]) ||
        (event.producerType === "audio" &&
          roomProducers[event.roomName]?.[event.username]?.[
            event.producerType
          ]))
    ) {
      delete roomProducerTransports[event.roomName][event.username];
    }

    if (
      roomProducerTransports[event.roomName] &&
      Object.keys(roomProducerTransports[event.roomName]).length == 0
    ) {
      delete roomProducerTransports[event.roomName];
    }

    if (
      event.producerId &&
      (event.producerType === "webcam" || event.producerType === "screen") &&
      roomProducers[event.roomName]?.[event.username]?.[event.producerType]?.[
        event.producerId
      ]
    ) {
      if (
        Object.keys(
          roomProducers[event.roomName][event.username][
            event.producerType as "webcam" | "screen"
          ] || {}
        ).length === 1
      ) {
        if (
          Object.keys(roomProducers[event.roomName][event.username] || {})
            .length === 1
        ) {
          if (Object.keys(roomProducers[event.roomName] || {}).length === 1) {
            delete roomProducers[event.roomName];
          } else {
            delete roomProducers[event.roomName][event.username];
          }
        } else {
          delete roomProducers[event.roomName][event.username][
            event.producerType as "webcam" | "screen"
          ];
        }
      } else {
        delete roomProducers[event.roomName][event.username][
          event.producerType as "webcam" | "screen"
        ]![event.producerId];
      }
    } else if (
      event.producerType === "audio" &&
      roomProducers[event.roomName]?.[event.username]?.[event.producerType]
    ) {
      if (
        Object.keys(roomProducers[event.roomName][event.username] || {})
          .length === 1
      ) {
        if (Object.keys(roomProducers[event.roomName] || {}).length === 1) {
          delete roomProducers[event.roomName];
        } else {
          delete roomProducers[event.roomName][event.username];
        }
      } else {
        delete roomProducers[event.roomName][event.username][
          event.producerType as "audio"
        ];
      }
    }

    for (const username in roomConsumers[event.roomName]) {
      for (const producerUsername in roomConsumers[event.roomName][username]) {
        if (producerUsername === event.username) {
          for (const producerType in roomConsumers[event.roomName][username][
            producerUsername
          ]) {
            if (
              producerType === event.producerType &&
              (producerType === "webcam" || producerType === "screen")
            ) {
              for (const producerId in roomConsumers[event.roomName][username][
                producerUsername
              ][producerType as "webcam" | "screen"]) {
                if (producerId === event.producerId) {
                  delete roomConsumers[event.roomName][username][
                    producerUsername
                  ][producerType as "webcam" | "screen"]![producerId];
                }
                if (
                  Object.keys(
                    roomConsumers[event.roomName][username][producerUsername][
                      producerType as "webcam" | "screen"
                    ] || {}
                  ).length === 0
                ) {
                  delete roomConsumers[event.roomName][username][
                    producerUsername
                  ][producerType as "webcam" | "screen" | "audio"];
                }
              }
            }
            if (
              producerType === event.producerType &&
              producerType === "audio"
            ) {
              delete roomConsumers[event.roomName][username][producerUsername][
                producerType as "audio"
              ];
            }
            if (
              Object.keys(
                roomConsumers[event.roomName][username][producerUsername]
              ).length === 0
            ) {
              delete roomConsumers[event.roomName][username][producerUsername];
            }
          }
        }
        if (Object.keys(roomConsumers[event.roomName][username]).length === 0) {
          delete roomConsumers[event.roomName][username];
        }
      }
      if (Object.keys(roomConsumers[event.roomName]).length === 0) {
        delete roomConsumers[event.roomName];
      }
    }

    const msg = {
      type: "producerDisconnected",
      producerUsername: event.username,
      producerType: event.producerType,
      producerId: event.producerId,
    };

    io.to(event.roomName).emit("message", msg);
  } catch (error) {
    console.error(error);
  }
};

export default onRemoveProducer;
