import { SctpStreamParameters } from "mediasoup/node/lib/fbs/sctp-parameters";
import {
  Consumer,
  Producer,
  Transport,
  Worker,
  Router,
  DataProducer,
  DataConsumer,
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

export type DataStreamTypes = "positionScaleRotation";

export type TableProducerTransports = {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        transport: Transport;
        isConnected: boolean;
      };
    };
  };
};
export type TableConsumerTransports = {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        transport: Transport;
        isConnected: boolean;
      };
    };
  };
};

export type TableProducers = {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        camera?: { [cameraId: string]: Producer };
        screen?: { [screenId: string]: Producer };
        audio?: Producer;
        json?: { [dataStreamType in DataStreamTypes]?: DataProducer };
      };
    };
  };
};
export type ConsumerInstance = {
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
  json?: {
    [dataStreamType in DataStreamTypes]?: {
      consumer: DataConsumer;
      producerId: string;
      id: string;
      label: string;
      sctpStreamParameters: SctpStreamParameters | undefined;
      type: string;
      producerPaused: boolean;
      protocol: string;
    };
  };
};
export type TableConsumers = {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: {
        [producerUsername: string]: {
          [producerInstance: string]: ConsumerInstance;
        };
      };
    };
  };
};

export const tableProducerTransports: TableProducerTransports = {};
export const tableConsumerTransports: TableConsumerTransports = {};

export const tableProducers: TableProducers = {};
export const tableConsumers: TableConsumers = {};
