import { MediaKind, RtpParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomProducerTransports, roomProducers } from "../mediasoupVars";

const onSwapProducer = async (
  event: {
    producerType: string;
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    table_id: string;
    username: string;
    producerId?: string;
  },
  io: SocketIOServer
) => {
  const { kind, rtpParameters } = event;

  // Swap old producer for new producer
  const newProducer = await roomProducerTransports[event.table_id][
    event.username
  ].produce({
    kind,
    rtpParameters,
  });

  if (
    (event.producerType === "webcam" || event.producerType === "screen") &&
    event.producerId &&
    roomProducers[event.table_id]?.[event.username]?.[
      event.producerType as "webcam" | "screen"
    ]?.[event.producerId]
  ) {
    delete roomProducers[event.table_id]?.[event.username]?.[
      event.producerType as "webcam" | "screen"
    ]?.[event.producerId];
    roomProducers[event.table_id][event.username][
      event.producerType as "webcam" | "screen"
    ]![event.producerId] = newProducer;
  }

  if (
    event.producerType === "audio" &&
    roomProducers[event.table_id]?.[event.username]?.[
      event.producerType as "audio"
    ]
  ) {
    delete roomProducers[event.table_id]?.[event.username]?.[
      event.producerType as "audio"
    ];
    roomProducers[event.table_id][event.username][
      event.producerType as "audio"
    ] = newProducer;
  }

  const msg = {
    type: "swapedProducer",
    producerUsername: event.username,
    producerType: event.producerType,
    producerId: event.producerId,
  };
  io.to(event.table_id).emit("message", msg);

  const message = {
    type: "newProducerWasCreated",
    producerType: event.producerType,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", message);

  io.to(`${event.table_id}_${event.username}`).emit("newProducerCallback", {
    id: newProducer.id,
  });
};

export default onSwapProducer;
