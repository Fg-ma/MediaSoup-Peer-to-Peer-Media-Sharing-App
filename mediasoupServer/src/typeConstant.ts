import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  SctpCapabilities,
  Consumer,
  Producer,
  Transport,
  Worker,
  Router,
  DataProducer,
  DataConsumer,
  RtpParameters,
  SctpParameters,
  SctpStreamParameters,
} from "mediasoup/node/lib/types";
import uWS from "uWebSockets.js";

interface MediasoupWorker {
  worker: Worker;
  router: Router;
  activeConnections: number;
}

export interface Tables {
  [table_id: string]: {
    [username: string]: {
      [instance: string]: MediasoupWebSocket;
    };
  };
}

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
        screenAudio?: { [screenAudioId: string]: Producer };
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
      id: string;
      producerId: string;
      kind: string;
      rtpParameters: RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  };
  screen?: {
    [screenId: string]: {
      consumer: Consumer;
      id: string;
      producerId: string;
      kind: string;
      rtpParameters: RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  };
  screenAudio?: {
    [screenAudioId: string]: {
      consumer: Consumer;
      id: string;
      producerId: string;
      kind: string;
      rtpParameters: RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  };
  audio?: {
    consumer: Consumer;
    id: string;
    producerId: string;
    kind: string;
    rtpParameters: RtpParameters;
    type: string;
    producerPaused: boolean;
  };
  json?: {
    [dataStreamType in DataStreamTypes]?: {
      consumer: DataConsumer;
      id: string;
      producerId: string;
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

export interface MediasoupWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  table_id: string;
  username: string;
  instance: string;
}

export interface SocketData {
  id: string;
  table_id: string;
  username: string;
  instance: string;
}

export type ProducerTypes =
  | "camera"
  | "screen"
  | "screenAudio"
  | "audio"
  | "json";

export type DataStreamTypes = "positionScaleRotation";

export type Permissions = {
  acceptsCameraEffects: boolean;
  acceptsScreenEffects: boolean;
  acceptsAudioEffects: boolean;
  acceptsPositionScaleRotationManipulation: boolean;
};

export type AudioMixEffectsType =
  | "autoFilter"
  | "autoPanner"
  | "autoWah"
  | "bitCrusher"
  | "chebyshev"
  | "chorus"
  | "distortion"
  | "EQ"
  | "feedbackDelay"
  | "freeverb"
  | "JCReverb"
  | "phaser"
  | "pingPongDelay"
  | "pitchShift"
  | "reverb"
  | "stereoWidener"
  | "tremolo"
  | "vibrato";

export type MediasoupSocketEvents =
  | onJoinTableType
  | onGetRouterRtpCapabilitiesType
  | onCreateProducerTransportType
  | onConnectProducerTransportType
  | onCreateNewProducerType
  | onCreateNewJSONProducerType
  | onCreateConsumerTransportType
  | onConnectConsumerTransportType
  | onResumeType
  | onConsumeType
  | onNewConsumerType
  | onNewJSONConsumerType
  | onRemoveProducerType
  | onUnsubscribeType
  | onClientMuteType
  | onNewProducerCreatedType
  | onNewConsumerCreatedType
  | onRequestEffectChangeType
  | onClientEffectChangeType
  | onRequestPermissionsType
  | onRequestBundleMetadataType
  | onPermissionsResponseType
  | onBundleMetadataResponseType
  | onRequestCatchUpDataType
  | onRequestGameCatchUpDataType
  | onResponseCatchUpDataType
  | onResponseGameCatchUpDataType
  | onRequestMixEffectActivityChangeType
  | onClientMixEffectActivityChangeType
  | onRequestMixEffectValueChangeType
  | onClientMixEffectValueChangeType
  | onRequestRemoveProducerType;

export type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onGetRouterRtpCapabilitiesType = {
  type: "getRouterRtpCapabilities";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onCreateProducerTransportType = {
  type: "createProducerTransport";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onConnectProducerTransportType = {
  type: "connectProducerTransport";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    dtlsParameters: DtlsParameters;
  };
};

export type onCreateNewProducerType = {
  type: "createNewProducer";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId?: string;
  };
  data: {
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  };
};

export type onCreateNewJSONProducerType = {
  type: "createNewJSONProducer";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "json";
    producerId: string;
    dataStreamType: DataStreamTypes;
  };
  data: {
    transportId: string;
    label: string;
    protocol: "json";
    sctpStreamParameters: SctpParameters;
  };
};

export type onCreateConsumerTransportType = {
  type: "createConsumerTransport";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onConnectConsumerTransportType = {
  type: "connectConsumerTransport";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    transportId: string;
    dtlsParameters: DtlsParameters;
  };
};

export type onResumeType = {
  type: "resume";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onConsumeType = {
  type: "consume";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    rtpCapabilities: RtpCapabilities;
  };
};

export type onNewConsumerType = {
  type: "newConsumer";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    rtpCapabilities: RtpCapabilities;
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId?: string;
  };
};

export type onNewJSONConsumerType = {
  type: "newJSONConsumer";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    sctpCapabilities: SctpCapabilities;
    producerUsername: string;
    producerInstance: string;
    producerType: "json";
    incomingProducerId: string;
    dataStreamType: DataStreamTypes;
  };
};

export type onRemoveProducerType = {
  type: "removeProducer";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId?: string;
    dataStreamType?: DataStreamTypes;
  };
};

export type onUnsubscribeType = {
  type: "unsubscribe";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onClientMuteType = {
  type: "clientMute";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    clientMute: boolean;
  };
};

export type onNewProducerCreatedType = {
  type: "newProducerCreated";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId?: string;
  };
};

export type onNewConsumerCreatedType = {
  type: "newConsumerCreated";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: {
    producerUsername: string;
    producerInstance: string;
    producerType: ProducerTypes;
    producerId?: string;
  };
};

export type onRequestEffectChangeType = {
  type: "requestEffectChange";
  header: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: ProducerTypes;
    requestedProducerId: string | undefined;
  };
  data: {
    effect: string;
    blockStateChange: boolean;
    style?: string;
    hideBackgroundStyle?: string;
    hideBackgroundColor?: string;
    postProcessStyle?: string;
  };
};

export type onClientEffectChangeType = {
  type: "clientEffectChange";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId: string | undefined;
  };
  data: {
    effect: string;
    effectStyle?: string;
    blockStateChange: boolean;
  };
};

export type onRequestPermissionsType = {
  type: "requestPermissions";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

export type onRequestBundleMetadataType = {
  type: "requestBundleMetadata";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

export type onPermissionsResponseType = {
  type: "permissionsResponse";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    permissions: Permissions;
  };
};

export type onBundleMetadataResponseType = {
  type: "bundleMetadataResponse";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    clientMute: boolean;
    streamEffects: string;
    userEffectsStyles: string;
  };
};

export type onRequestCatchUpDataType = {
  type: "requestCatchUpData";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: ProducerTypes;
    inquiredProducerId?: string;
  };
};

export type onRequestGameCatchUpDataType = {
  type: "requestGameCatchUpData";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
  };
};

export type onResponseCatchUpDataType = {
  type: "responseCatchUpData";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: ProducerTypes;
    inquiredProducerId?: string;
  };
  data:
    | {
        paused: boolean;
        timeEllapsed: number;
        positioning: {
          position: {
            left: number;
            top: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        };
      }
    | {
        paused: boolean;
        timeEllapsed: number;
        positioning: {
          position: {
            left: number;
            top: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        };
      }
    | {
        positioning: {
          position: {
            left: number;
            top: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        };
      }
    | undefined;
};

export type onResponseGameCatchUpDataType = {
  type: "responseGameCatchUpData";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
  };
  data: {
    positioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    };
  };
};

export type onRequestMixEffectActivityChangeType = {
  type: "requestMixEffectActivityChange";
  header: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    active: boolean;
  };
};

export type onClientMixEffectActivityChangeType = {
  type: "clientMixEffectActivityChange";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    active: boolean;
  };
};

export type onRequestMixEffectValueChangeType = {
  type: "requestMixEffectValueChange";
  header: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    option: string;
    value: number;
    styleValue: number;
  };
};

export type onClientMixEffectValueChangeType = {
  type: "clientMixEffectValueChange";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    option: string;
    value: number;
    styleValue: number;
  };
};

export type onRequestRemoveProducerType = {
  type: "requestRemoveProducer";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId: string;
  };
};

export const tables: Tables = {};

export const tableProducerTransports: TableProducerTransports = {};
export const tableConsumerTransports: TableConsumerTransports = {};

export const tableProducers: TableProducers = {};
export const tableConsumers: TableConsumers = {};

export const workers: MediasoupWorker[] = [];
export const workersMap: {
  [table_id: string]: number;
} = {};
