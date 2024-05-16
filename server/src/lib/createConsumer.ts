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
  producers: { [username: string]: { webcam?: Producer; screen?: Producer } },
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

  const consumers: {
    [username: string]: {
      webcam?: {
        consumer: Consumer;
        producerId: string;
        id: string;
        kind: string;
        rtpParameters: any;
        type: string;
        producerPaused: boolean;
      };
      screen?: {
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

    const webcamProducer = producers[producerUsername].webcam;

    if (webcamProducer) {
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
        consumers[producerUsername].webcam = {
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

    const screenProducer = producers[producerUsername].screen;

    if (screenProducer) {
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
        consumers[producerUsername].screen = {
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

  return consumers;
};

export default createConsumer;
