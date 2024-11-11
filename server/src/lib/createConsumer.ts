import {
  Consumer,
  Producer,
  RtpCapabilities,
  Router,
} from "mediasoup/node/lib/types";
import { tableConsumerTransports } from "./mediasoupVars";

const createConsumer = async (
  table_id: string,
  username: string,
  instance: string,
  producers: {
    [username: string]: {
      [instance: string]: {
        camera?: { [cameraId: string]: Producer };
        screen?: { [screenId: string]: Producer };
        audio?: Producer;
      };
    };
  },
  rtpCapabilities: RtpCapabilities,
  mediasoupRouter: Router
) => {
  if (!producers) {
    return {};
  }

  // Get the consumer transport associated with the user
  const transport =
    tableConsumerTransports[table_id][username][instance].transport;

  if (!transport) {
    console.error("No transport found for: ", username);
    return;
  }

  const consumers: {
    [producerUsername: string]: {
      [producerInstance: string]: {
        camera?: {
          [cameraId: string]: {
            consumer: Consumer;
            producerId: string;
            id: string;
            kind: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
    };
  } = {};

  // Iterate over each producer
  for (const producerUsername in producers) {
    if (producerUsername === username) {
      continue;
    }

    for (const producerInstance in producers[producerUsername]) {
      const cameraProducers =
        producers[producerUsername][producerInstance].camera;

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
            if (!consumers[producerUsername][producerInstance]) {
              consumers[producerUsername][producerInstance] = {};
            }
            if (!consumers[producerUsername][producerInstance].camera) {
              consumers[producerUsername][producerInstance].camera = {};
            }
            consumers[producerUsername][producerInstance].camera![
              cameraProducerId
            ] = {
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

      const screenProducers =
        producers[producerUsername][producerInstance].screen;

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
            if (!consumers[producerUsername][producerInstance]) {
              consumers[producerUsername][producerInstance] = {};
            }
            if (!consumers[producerUsername][producerInstance].screen) {
              consumers[producerUsername][producerInstance].screen = {};
            }
            consumers[producerUsername][producerInstance].screen![
              screenProducerId
            ] = {
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

      const audioProducer = producers[producerUsername][producerInstance].audio;

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
          if (!consumers[producerUsername][producerInstance]) {
            consumers[producerUsername][producerInstance] = {};
          }
          consumers[producerUsername][producerInstance].audio = {
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
  }

  return consumers;
};

export default createConsumer;
