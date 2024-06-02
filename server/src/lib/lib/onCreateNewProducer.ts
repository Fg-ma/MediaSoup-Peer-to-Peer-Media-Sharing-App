import { MediaKind, RtpParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer, Socket } from "socket.io";
import { roomProducerTransports, roomProducers } from "../mediasoupVars";

const onCreateNewProducer = async (
  event: {
    producerType: string;
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    table_id: string;
    username: string;
    producerId?: string;
  },
  socket: Socket,
  io: SocketIOServer
) => {
  const { kind, rtpParameters } = event;

  if (
    !roomProducerTransports[event.table_id] ||
    !roomProducerTransports[event.table_id][event.username]
  ) {
    console.error("No producer transport found for: ", event.username);
    return;
  }

  if (
    ((event.producerType === "webcam" || event.producerType === "screen") &&
      event.producerId &&
      roomProducers[event.table_id]?.[event.username]?.[
        event.producerType as "webcam" | "screen"
      ]?.[event.producerId]) ||
    (event.producerType === "audio" &&
      roomProducers[event.table_id]?.[event.username]?.[
        event.producerType as "audio"
      ])
  ) {
    console.error("Producer already created for: ", event.username);
    return;
  }

  const newProducer = await roomProducerTransports[event.table_id][
    event.username
  ].produce({
    kind,
    rtpParameters,
  });

  if (!roomProducers[event.table_id]) {
    roomProducers[event.table_id] = {};
  }
  if (!roomProducers[event.table_id][event.username]) {
    roomProducers[event.table_id][event.username] = {};
  }
  if (
    (event.producerType === "webcam" || event.producerType === "screen") &&
    !roomProducers[event.table_id][event.username][
      event.producerType as "webcam" | "screen"
    ]
  ) {
    roomProducers[event.table_id][event.username][
      event.producerType as "webcam" | "screen"
    ] = {};
  }

  if (
    (event.producerType === "webcam" || event.producerType === "screen") &&
    event.producerId &&
    roomProducers[event.table_id][event.username][
      event.producerType as "webcam" | "screen"
    ]
  ) {
    roomProducers[event.table_id][event.username][
      event.producerType as "webcam" | "screen"
    ]![event.producerId] = newProducer;
  } else {
    roomProducers[event.table_id][event.username][
      event.producerType as "audio"
    ] = newProducer;
  }

  const msg = {
    type: "newProducerAvailable",
    producerUsername: event.username,
    producerType: event.producerType,
    producerId: event.producerId,
  };
  socket.to(event.table_id).emit("message", msg);
  io.to(`${event.table_id}_${event.username}`).emit("newProducerCallback", {
    id: newProducer.id,
  });
};

export default onCreateNewProducer;
