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
  },
  io: SocketIOServer
) => {
  try {
    if (
      roomProducerTransports[event.roomName] &&
      roomProducerTransports[event.roomName][event.username] &&
      Object.keys(roomProducers[event.roomName][event.username] || {}).length ==
        1 &&
      roomProducers[event.roomName][event.username][
        event.producerType as "webcam" | "screen"
      ]
    ) {
      delete roomProducerTransports[event.roomName][event.username];
    }

    if (
      roomProducers[event.roomName] &&
      roomProducers[event.roomName][event.username] &&
      roomProducers[event.roomName][event.username][
        event.producerType as "webcam" | "screen"
      ]
    ) {
      if (
        Object.keys(roomProducers[event.roomName][event.username] || {})
          .length == 1
      ) {
        delete roomProducers[event.roomName][event.username];
      } else {
        delete roomProducers[event.roomName][event.username][
          event.producerType as "webcam" | "screen"
        ];
      }
    }

    for (const username in roomConsumers[event.roomName]) {
      for (const producerUsername in roomConsumers[event.roomName][username]) {
        if (
          producerUsername === event.username &&
          roomConsumers[event.roomName] &&
          roomConsumers[event.roomName][username]
        ) {
          delete roomConsumers[event.roomName][username][event.username];
        }
      }
    }

    if (
      roomProducerTransports[event.roomName] &&
      Object.keys(roomProducerTransports[event.roomName]).length == 0
    ) {
      delete roomProducerTransports[event.roomName];
    }

    if (
      roomProducers[event.roomName] &&
      Object.keys(roomProducers[event.roomName]).length == 0
    ) {
      delete roomProducers[event.roomName];
    }

    io.to(event.roomName).emit(
      "producerDisconnected",
      event.username,
      event.producerType
    );
  } catch (error) {
    console.error(error);
  }
};

export default onRemoveProducer;
