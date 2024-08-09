import {
  Consumer,
  Producer,
  Transport,
  Worker,
  Router,
} from "mediasoup/node/lib/types";

interface MediasoupWorker {
  worker: Worker;
  router: Router;
  activeConnections: number;
}

export const workers: MediasoupWorker[] = [];
export const workersMap: {
  [table_id: string]: number;
} = {};
export const roomProducerTransports: {
  [table_id: string]: {
    [username: string]: { transport: Transport; isConnected: boolean };
  };
} = {};
export const roomConsumerTransports: {
  [table_id: string]: {
    [username: string]: { transport: Transport; isConnected: boolean };
  };
} = {};
export const roomProducers: {
  [table_id: string]: {
    [username: string]: {
      camera?: { [cameraId: string]: Producer };
      screen?: { [screenId: string]: Producer };
      audio?: Producer;
    };
  };
} = {};
export const roomConsumers: {
  [table_id: string]: {
    [username: string]: {
      [producerUsername: string]: {
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
    };
  };
} = {};
