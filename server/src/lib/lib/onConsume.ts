import { Router, RtpCapabilities, Consumer } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import createConsumer from "../createConsumer";
import { roomProducers, roomConsumers } from "../mediasoupVars";

const onConsume = async (
  event: {
    type: string;
    rtpCapabilities: RtpCapabilities;
    roomName: string;
    username: string;
    producerId?: string;
  },
  io: SocketIOServer,
  mediasoupRouter: Router
) => {
  const consumers = await createConsumer(
    event.roomName,
    event.username,
    roomProducers[event.roomName],
    event.rtpCapabilities,
    mediasoupRouter
  );

  if (!roomConsumers[event.roomName]) {
    roomConsumers[event.roomName] = {};
  }
  if (consumers) {
    roomConsumers[event.roomName][event.username] = consumers;
  } else {
    if (roomConsumers[event.roomName][event.username]) {
      delete roomConsumers[event.roomName][event.username];
    }
  }

  let newConsumers: {
    [username: string]: {
      webcam?: {
        [webcamId: string]: {
          producerId: string;
          id: string;
          kind: string;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
      screen?: {
        [screenId: string]: {
          producerId: string;
          id: string;
          kind: string;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
      audio?: {
        producerId: string;
        id: string;
        kind: string;
        rtpParameters: any;
        type: string;
        producerPaused: boolean;
      };
    };
  } = {};

  for (const producerUsername in consumers) {
    if (consumers[producerUsername].webcam) {
      if (!newConsumers[producerUsername]) {
        newConsumers[producerUsername] = {};
      }
      if (!newConsumers[producerUsername].webcam) {
        newConsumers[producerUsername].webcam = {};
      }
      for (const webcamId in consumers[producerUsername].webcam) {
        const webcam = consumers[producerUsername].webcam?.[webcamId];
        if (webcam)
          newConsumers[producerUsername].webcam![webcamId] = {
            producerId: webcam.producerId,
            id: webcam.id,
            kind: webcam.kind,
            rtpParameters: webcam.rtpParameters,
            type: webcam.type,
            producerPaused: webcam.producerPaused,
          };
      }
    }

    if (consumers[producerUsername].screen) {
      if (!newConsumers[producerUsername]) {
        newConsumers[producerUsername] = {};
      }
      if (!newConsumers[producerUsername].screen) {
        newConsumers[producerUsername].screen = {};
      }
      for (const screenId in consumers[producerUsername].screen) {
        const screen = consumers[producerUsername].screen?.[screenId];
        if (screen)
          newConsumers[producerUsername].screen![screenId] = {
            producerId: screen.producerId,
            id: screen.id,
            kind: screen.kind,
            rtpParameters: screen.rtpParameters,
            type: screen.type,
            producerPaused: screen.producerPaused,
          };
      }
    }

    if (consumers[producerUsername].audio) {
      const audioConsumerData = consumers[producerUsername].audio;

      if (!newConsumers[producerUsername]) {
        newConsumers[producerUsername] = {};
      }
      newConsumers[producerUsername].audio = {
        producerId: audioConsumerData!.producerId,
        id: audioConsumerData!.id,
        kind: audioConsumerData!.kind,
        rtpParameters: audioConsumerData!.rtpParameters,
        type: audioConsumerData!.type,
        producerPaused: audioConsumerData!.producerPaused,
      };
    }
  }

  io.to(`${event.roomName}_${event.username}`).emit("message", {
    type: "subscribed",
    data: newConsumers,
  });
};

export default onConsume;
