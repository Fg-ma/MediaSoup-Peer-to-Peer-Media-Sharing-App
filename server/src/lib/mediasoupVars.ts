import { Consumer, Producer, Transport } from "mediasoup/node/lib/types";

export let workersMap: {
  [table_id: string]: number;
} = {};
export let roomProducerTransports: {
  [table_id: string]: { [username: string]: Transport };
} = {};
export let roomConsumerTransports: {
  [table_id: string]: { [username: string]: Transport };
} = {};
export let roomProducers: {
  [table_id: string]: {
    [username: string]: {
      webcam?: { [webcamId: string]: Producer };
      screen?: { [screenId: string]: Producer };
      audio?: Producer;
    };
  };
} = {};
export let roomConsumers: {
  [table_id: string]: {
    [username: string]: {
      [producerUsername: string]: {
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
    };
  };
} = {};
