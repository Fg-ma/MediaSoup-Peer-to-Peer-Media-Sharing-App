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
      webcam?: Producer;
      screen?: Producer;
      audio?: Producer;
    };
  };
} = {};
export let roomConsumers: {
  [roomName: string]: {
    [username: string]: {
      [producerUsername: string]: {
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
