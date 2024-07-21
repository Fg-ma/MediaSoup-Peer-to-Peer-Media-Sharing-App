import { RtpCapabilities } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import {
  roomConsumerTransports,
  roomConsumers,
  roomProducers,
} from "../mediasoupVars";

const onSwapConsumer = async (
  event: {
    consumerType: string;
    swappingProducerId: string;
    swappingUsername: string;
    table_id: string;
    username: string;
    rtpCapabilities: RtpCapabilities;
  },
  io: SocketIOServer
) => {
  const consumerTransport =
    roomConsumerTransports[event.table_id][event.username];
  const producer =
    event.consumerType === "camera" || event.consumerType === "screen"
      ? event.swappingProducerId
        ? roomProducers[event.table_id][event.swappingUsername][
            event.consumerType as "camera" | "screen"
          ]?.[event.swappingProducerId]
        : undefined
      : roomProducers[event.table_id][event.swappingUsername][
          event.consumerType as "audio"
        ];

  if (!producer) {
    console.error("No producer found");
    return;
  }

  const consumer = await consumerTransport.consume({
    producerId: producer.id,
    rtpCapabilities: event.rtpCapabilities,
    paused: producer.kind === "video",
  });

  const newConsumer = {
    consumer: consumer,
    producerId: producer.id,
    id: consumer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused,
  };

  // Replace old consumers
  for (const producerUsername in roomConsumers[event.table_id][
    event.username
  ]) {
    if (producerUsername === event.swappingUsername) {
      for (const producerType in roomConsumers[event.table_id][event.username][
        producerUsername
      ]) {
        if (
          producerType === event.consumerType &&
          (producerType === "camera" || producerType === "screen")
        ) {
          for (const producerId in roomConsumers[event.table_id][
            event.username
          ][producerUsername][producerType as "camera" | "screen"]) {
            if (producerId === event.swappingProducerId) {
              delete roomConsumers[event.table_id][event.username][
                producerUsername
              ][producerType as "camera" | "screen"]![producerId];
              roomConsumers[event.table_id][event.username][producerUsername][
                producerType as "camera" | "screen"
              ]![producerId] = newConsumer;
            }
          }
        }
        if (producerType === event.consumerType && producerType === "audio") {
          delete roomConsumers[event.table_id][event.username][
            producerUsername
          ][producerType as "audio"];
          roomConsumers[event.table_id][event.username][producerUsername][
            producerType as "audio"
          ] = newConsumer;
        }
      }
    }
  }

  const msg = {
    type: "swapedConsumer",
    consumerType: event.consumerType,
    swappingProducerId: event.swappingProducerId,
    swappingUsername: event.swappingUsername,
    data: {
      producerId: newConsumer.producerId,
      id: newConsumer.id,
      kind: newConsumer.kind,
      rtpParameters: newConsumer.rtpParameters,
      type: newConsumer.type,
      producerPaused: newConsumer.producerPaused,
    },
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onSwapConsumer;
