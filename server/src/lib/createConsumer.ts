import {
  Consumer,
  Producer,
  RtpCapabilities,
  Router,
} from "mediasoup/node/lib/types";
import { roomConsumerTransports } from "./mediasoupVars";

const createConsumer = async (
  table_id: string,
  username: string,
  producers: {
    [username: string]: {
      camera?: { [cameraId: string]: Producer };
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
  const transport = roomConsumerTransports[table_id][username];

  if (!transport) {
    console.error("No transport found for: ", username);
    return;
  }

  let consumers: {
    [username: string]: {
      camera?: {
        [cameraId: string]: {
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

    const cameraProducers = producers[producerUsername].camera;

    if (cameraProducers) {
      for (const cameraProducerId in cameraProducers) {
        const cameraProducer = cameraProducers[cameraProducerId];

        // Check if consumer transport can consume from this producer
        if (
          !mediasoupRouter.canConsume({
            producerId: cameraProducer.id,
            rtpCapabilities,
          })
        ) {
          console.error(`Cannot consume from producer ${cameraProducer.id}`);
        }

        try {
          // Create a consumer for the producer
          const consumer = await transport.consume({
            producerId: cameraProducer.id,
            rtpCapabilities,
            paused: cameraProducer.kind === "video",
          });

          // Store the consumer in the consumers object
          if (!consumers[producerUsername]) {
            consumers[producerUsername] = {};
          }
          if (!consumers[producerUsername].camera) {
            consumers[producerUsername].camera = {};
          }
          consumers[producerUsername].camera![cameraProducerId] = {
            consumer: consumer,
            producerId: cameraProducer.id,
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
