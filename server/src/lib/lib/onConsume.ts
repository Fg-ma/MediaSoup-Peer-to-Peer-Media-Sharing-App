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
    roomConsumers[event.roomName][event.username] = {};
  }

  let newConsumers: {
    [username: string]: {
      webcam?: {
        producerId: string;
        id: string;
        kind: string;
        rtpParameters: any;
        type: string;
        producerPaused: boolean;
      };
      screen?: {
        producerId: string;
        id: string;
        kind: string;
        rtpParameters: any;
        type: string;
        producerPaused: boolean;
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
      const webcamConsumerData = consumers[producerUsername].webcam;

      if (!newConsumers[producerUsername]) {
        newConsumers[producerUsername] = {};
      }
      newConsumers[producerUsername].webcam = {
        producerId: webcamConsumerData!.producerId,
        id: webcamConsumerData!.id,
        kind: webcamConsumerData!.kind,
        rtpParameters: webcamConsumerData!.rtpParameters,
        type: webcamConsumerData!.type,
        producerPaused: webcamConsumerData!.producerPaused,
      };
    }

    if (consumers[producerUsername].screen) {
      const screenConsumerData = consumers[producerUsername].screen;

      if (!newConsumers[producerUsername]) {
        newConsumers[producerUsername] = {};
      }
      newConsumers[producerUsername].screen = {
        producerId: screenConsumerData!.producerId,
        id: screenConsumerData!.id,
        kind: screenConsumerData!.kind,
        rtpParameters: screenConsumerData!.rtpParameters,
        type: screenConsumerData!.type,
        producerPaused: screenConsumerData!.producerPaused,
      };
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
