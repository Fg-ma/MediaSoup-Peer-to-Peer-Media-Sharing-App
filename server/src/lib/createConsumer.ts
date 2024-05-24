import {
  Consumer,
  Producer,
  RtpCapabilities,
  Router,
} from "mediasoup/node/lib/types";
import { roomConsumerTransports } from "./mediasoupVars";

const createConsumer = async (
  roomName: string,
  username: string,
  producers: {
    [username: string]: {
      webcam?: { [webcamId: string]: Producer };
      screen?: { [screenId: string]: Producer };
      audio?: Producer;
    };
  },
  rtpCapabilities: RtpCapabilities,
  mediasoupRouter: Router
) => {
  if (!producers) {
    return {};
  }

  // Get the consumer transport associated with the user
  const transport = roomConsumerTransports[roomName][username];

  if (!transport) {
    console.error("No transport found for: ", username);
    return;
  }

  let consumers: {
    [username: string]: {
      webcam?: {
        [webcamId: string]: {
          consumer: Consumer;
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
          consumer: Consumer;
          producerId: string;
          id: string;
          kind: string;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
      audio?: {
        consumer: Consumer;
        producerId: string;
        id: string;
        kind: string;
        rtpParameters: any;
        type: string;
        producerPaused: boolean;
      };
    };
  } = {};

  // Iterate over each producer
  for (const producerUsername in producers) {
    if (producerUsername === username) {
      continue;
    }

    const webcamProducers = producers[producerUsername].webcam;

    if (webcamProducers) {
      for (const webcamProducerId in webcamProducers) {
        const webcamProducer = webcamProducers[webcamProducerId];

        // Check if consumer transport can consume from this producer
        if (
          !mediasoupRouter.canConsume({
            producerId: webcamProducer.id,
            rtpCapabilities,
          })
        ) {
          console.error(`Cannot consume from producer ${webcamProducer.id}`);
        }

        try {
          // Create a consumer for the producer
          const consumer = await transport.consume({
            producerId: webcamProducer.id,
            rtpCapabilities,
            paused: webcamProducer.kind === "video",
          });

          // Store the consumer in the consumers object
          if (!consumers[producerUsername]) {
            consumers[producerUsername] = {};
          }
          if (!consumers[producerUsername].webcam) {
            consumers[producerUsername].webcam = {};
          }
          consumers[producerUsername].webcam![webcamProducerId] = {
            consumer: consumer,
            producerId: webcamProducer.id,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerPaused: consumer.producerPaused,
          };
        } catch (error) {
          console.error("consume failed: ", error);
        }
      }
    }

    const screenProducers = producers[producerUsername].screen;

    if (screenProducers) {
      for (const screenProducerId in screenProducers) {
        const screenProducer = screenProducers[screenProducerId];

        // Check if consumer transport can consume from this producer
        if (
          !mediasoupRouter.canConsume({
            producerId: screenProducer.id,
            rtpCapabilities,
          })
        ) {
          console.error(`Cannot consume from producer ${screenProducer.id}`);
          continue;
        }

        try {
          // Create a consumer for the producer
          const consumer = await transport.consume({
            producerId: screenProducer.id,
            rtpCapabilities,
            paused: screenProducer.kind === "video",
          });

          // Store the consumer in the consumers object
          if (!consumers[producerUsername]) {
            consumers[producerUsername] = {};
          }
          if (!consumers[producerUsername].screen) {
            consumers[producerUsername].screen = {};
          }
          consumers[producerUsername].screen![screenProducerId] = {
            consumer: consumer,
            producerId: screenProducer.id,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerPaused: consumer.producerPaused,
          };
        } catch (error) {
          console.error("consume failed: ", error);
          continue;
        }
      }
    }

    const audioProducer = producers[producerUsername].audio;

    if (audioProducer) {
      // Check if consumer transport can consume from this producer
      if (
        !mediasoupRouter.canConsume({
          producerId: audioProducer.id,
          rtpCapabilities,
        })
      ) {
        console.error(`Cannot consume from producer ${audioProducer.id}`);
        continue;
      }

      try {
        // Create a consumer for the producer
        const consumer = await transport.consume({
          producerId: audioProducer.id,
          rtpCapabilities,
          paused: audioProducer.kind === "audio",
        });

        // Store the consumer in the consumers object
        if (!consumers[producerUsername]) {
          consumers[producerUsername] = {};
        }
        consumers[producerUsername].audio = {
          consumer: consumer,
          producerId: audioProducer.id,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
          producerPaused: consumer.producerPaused,
        };
      } catch (error) {
        console.error("consume failed: ", error);
        continue;
      }
    }
  }

  return consumers;
};

export default createConsumer;
