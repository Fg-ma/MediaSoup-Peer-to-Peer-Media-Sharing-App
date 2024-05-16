import { MediaKind, RtpParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer, Socket } from "socket.io";
import { roomProducerTransports, roomProducers } from "../mediasoupVars";

const onCreateNewProducer = async (
  event: {
    producerType: string;
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    roomName: string;
    username: string;
  },
  socket: Socket,
  io: SocketIOServer
) => {
  const { kind, rtpParameters } = event;

  if (
    !roomProducerTransports[event.roomName] ||
    !roomProducerTransports[event.roomName][event.username]
  ) {
    console.error("No producer transport found for: ", event.username);
    return;
  }

  if (
    roomProducers[event.roomName] &&
    roomProducers[event.roomName][event.username] &&
    roomProducers[event.roomName][event.username][
      event.producerType as "webcam" | "screen"
    ]
  ) {
    console.error("Producer already created for: ", event.username);
    return;
  }

  const newProducer = await roomProducerTransports[event.roomName][
    event.username
  ].produce({
    kind,
    rtpParameters,
  });

  if (!roomProducers[event.roomName]) {
    roomProducers[event.roomName] = {};
  }
  if (!roomProducers[event.roomName][event.username]) {
    roomProducers[event.roomName][event.username] = {};
  }

  roomProducers[event.roomName][event.username][
    event.producerType as "webcam" | "screen"
  ] = newProducer;

  const msg = {
    type: "newProducerAvailable",
    producerUsername: event.username,
    producerType: event.producerType,
  };
  socket.to(event.roomName).emit("message", msg);
  io.to(`${event.roomName}_${event.username}`).emit("newProducerCreated", {
    id: newProducer.id,
  });
};

export default onCreateNewProducer;
