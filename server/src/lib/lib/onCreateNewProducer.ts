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
    producerId?: string;
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
    ((event.producerType === "webcam" || event.producerType === "screen") &&
      event.producerId &&
      roomProducers[event.roomName]?.[event.username]?.[
        event.producerType as "webcam" | "screen"
      ]?.[event.producerId]) ||
    (event.producerType === "audio" &&
      roomProducers[event.roomName]?.[event.username]?.[
        event.producerType as "audio"
      ])
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
  if (
    (event.producerType === "webcam" || event.producerType === "screen") &&
    !roomProducers[event.roomName][event.username][
      event.producerType as "webcam" | "screen"
    ]
  ) {
    roomProducers[event.roomName][event.username][
      event.producerType as "webcam" | "screen"
    ] = {};
  }

  if (
    (event.producerType === "webcam" || event.producerType === "screen") &&
    event.producerId &&
    roomProducers[event.roomName][event.username][
      event.producerType as "webcam" | "screen"
    ]
  ) {
    roomProducers[event.roomName][event.username][
      event.producerType as "webcam" | "screen"
    ]![event.producerId] = newProducer;
  } else {
    roomProducers[event.roomName][event.username][
      event.producerType as "audio"
    ] = newProducer;
  }

  const msg = {
    type: "newProducerAvailable",
    producerUsername: event.username,
    producerType: event.producerType,
    producerId: event.producerId,
  };
  socket.to(event.roomName).emit("message", msg);
  io.to(`${event.roomName}_${event.username}`).emit("newProducerCallback", {
    id: newProducer.id,
  });
};

export default onCreateNewProducer;
