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

export const tableProducerTransports: {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        transport: Transport;
        isConnected: boolean;
      };
    };
  };
} = {};
export const tableConsumerTransports: {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        transport: Transport;
        isConnected: boolean;
      };
    };
  };
} = {};

export const tableProducers: {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        camera?: { [cameraId: string]: Producer };
        screen?: { [screenId: string]: Producer };
        audio?: Producer;
      };
    };
  };
} = {};
export const tableConsumers: {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
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
      };
    };
  };
} = {};
