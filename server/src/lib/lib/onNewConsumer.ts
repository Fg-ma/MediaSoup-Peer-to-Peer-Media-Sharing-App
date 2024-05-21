import { Consumer, Router, RtpCapabilities } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import {
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
} from "../mediasoupVars";

const onNewConsumer = async (
  event: {
    type: string;
    consumerType: string;
    rtpCapabilities: RtpCapabilities;
    producerUsername: string;
    roomName: string;
    username: string;
  },
  io: SocketIOServer,
  mediasoupRouter: Router
) => {
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
  const transport = roomConsumerTransports[event.roomName][event.username];
  const producer =
    roomProducers[event.roomName][event.producerUsername][
      event.consumerType as "webcam" | "screen" | "audio"
    ];

  if (!producer) {
    console.error(`No producer found`);
    return;
  }

  // Check if consumer transport can consume from this producer
  if (
    !mediasoupRouter.canConsume({
      producerId: producer.id,
      rtpCapabilities: event.rtpCapabilities,
    })
  ) {
    console.error(`Cannot consume from producer ${producer.id}`);
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

  if (!roomConsumers[event.roomName]) {
    roomConsumers[event.roomName] = {};
  }
  if (!roomConsumers[event.roomName][event.username]) {
    roomConsumers[event.roomName][event.username] = {};
  }
  if (!roomConsumers[event.roomName][event.username][event.producerUsername]) {
    roomConsumers[event.roomName][event.username][event.producerUsername] = {};
  }
  roomConsumers[event.roomName][event.username][event.producerUsername][
    event.consumerType as "webcam" | "screen" | "audio"
  ] = newConsumer;

  io.to(`${event.roomName}_${event.username}`).emit("message", {
    type: "newConsumerSubscribed",
    producerUsername: event.producerUsername,
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
