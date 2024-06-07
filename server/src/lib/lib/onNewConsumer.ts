import { Consumer, RtpCapabilities } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import {
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
  workersMap,
} from "../mediasoupVars";
import { getWorkerByIdx } from "../workerManager";

const onNewConsumer = async (
  event: {
    type: string;
    consumerType: string;
    rtpCapabilities: RtpCapabilities;
    producerUsername: string;
    incomingProducerId?: string;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  // Get the worker and router by idx
  const { router: mediasoupRouter } = getWorkerByIdx(
    workersMap[event.table_id]
  );

  let newConsumer: {
    consumer: Consumer;
    producerId: string;
    id: string;
    kind: string;
    rtpParameters: any;
    type: string;
    producerPaused: boolean;
  };

  // Get the consumer transport associated with the user
  const transport = roomConsumerTransports[event.table_id][event.username];
  const producer =
    event.consumerType === "webcam" || event.consumerType === "screen"
      ? event.incomingProducerId
        ? roomProducers[event.table_id][event.producerUsername][
            event.consumerType as "webcam" | "screen"
          ]?.[event.incomingProducerId]
        : undefined
      : roomProducers[event.table_id][event.producerUsername][
          event.consumerType as "audio"
        ];

  if (!producer) {
    console.error(`No producer found`);
    return;
  }

  try {
    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: event.rtpCapabilities,
      paused: producer.kind === "video",
    });

    newConsumer = {
      consumer: consumer,
      producerId: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused,
    };
  } catch (error) {
    console.error("consume failed: ", error);
    return;
  }

  if (!roomConsumers[event.table_id]) {
    roomConsumers[event.table_id] = {};
  }
  if (!roomConsumers[event.table_id][event.username]) {
    roomConsumers[event.table_id][event.username] = {};
  }
  if (!roomConsumers[event.table_id][event.username][event.producerUsername]) {
    roomConsumers[event.table_id][event.username][event.producerUsername] = {};
  }
  if (
    (event.consumerType === "webcam" || event.consumerType === "screen") &&
    !roomConsumers[event.table_id][event.username][event.producerUsername][
      event.consumerType as "webcam" | "screen"
    ]
  ) {
    roomConsumers[event.table_id][event.username][event.producerUsername][
      event.consumerType as "webcam" | "screen"
    ] = {};
  }

  if (
    (event.consumerType === "webcam" || event.consumerType === "screen") &&
    event.incomingProducerId
  ) {
    roomConsumers[event.table_id][event.username][event.producerUsername][
      event.consumerType as "webcam" | "screen"
    ]![event.incomingProducerId] = newConsumer;
  } else {
    roomConsumers[event.table_id][event.username][event.producerUsername][
      event.consumerType as "audio"
    ] = newConsumer;
  }

  io.to(`${event.table_id}_${event.username}`).emit("message", {
    type: "newConsumerSubscribed",
    producerUsername: event.producerUsername,
    consumerId: event.incomingProducerId,
    consumerType: event.consumerType,
    data: {
      producerId: newConsumer.producerId,
      id: newConsumer.id,
      kind: newConsumer.kind,
      rtpParameters: newConsumer.rtpParameters,
      type: newConsumer.type,
      producerPaused: newConsumer.producerPaused,
    },
  });
};

export default onNewConsumer;
