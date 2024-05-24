import {
  Consumer,
  Producer,
  Transport,
  Router,
} from "mediasoup/node/lib/types";

export let roomProducerTransports: {
  [roomName: string]: { [username: string]: Transport };
} = {};
export let roomConsumerTransports: {
  [roomName: string]: { [username: string]: Transport };
} = {};
export let roomProducers: {
  [roomName: string]: {
    [username: string]: {
      webcam?: { [webcamId: string]: Producer };
      screen?: { [screenId: string]: Producer };
      audio?: Producer;
    };
  };
} = {};
export let roomConsumers: {
  [roomName: string]: {
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
