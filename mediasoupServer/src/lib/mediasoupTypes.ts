import { Socket } from "socket.io";
import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
  SctpCapabilities,
} from "mediasoup/node/lib/types";
import { Permissions, ProducerTypes } from "./lib/typeConstant";
import { SctpParameters } from "mediasoup/node/lib/fbs/sctp-parameters";
import { DataStreamTypes } from "./mediasoupVars";

export interface MediasoupSocket extends Socket {
  table_id?: string;
  username?: string;
  instance?: string;
}

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

export type onGetRouterRtpCapabilitiesType = {
  type: "getRouterRtpCapabilities";
  data: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onCreateProducerTransportType = {
  type: "createProducerTransport";
  data: {
    table_id: string;
    username: string;
    instance: number;
  };
};

export type onConnectProducerTransportType = {
  type: "connectProducerTransport";
  data: {
    dtlsParameters: DtlsParameters;
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onCreateNewProducerType = {
  type: "createNewProducer";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerId?: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
  };
};

export type onCreateNewJSONProducerType = {
  type: "createNewJSONProducer";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerId: string;
    producerType: "json";
    transportId: string;
    label: string;
    protocol: "json";
    sctpStreamParameters: SctpParameters;
    dataStreamType: DataStreamTypes;
  };
};

export type onCreateConsumerTransportType = {
  type: "createConsumerTransport";
  data: {
    table_id: string;
    username: string;
    instance: string;
    forceTcp: boolean;
  };
};

export type onConnectConsumerTransportType = {
  type: "connectConsumerTransport";
  data: {
    table_id: string;
    username: string;
    instance: string;
    transportId: string;
    dtlsParameters: DtlsParameters;
  };
};

export type onResumeType = {
  type: "resume";
  data: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onConsumeType = {
  type: "consume";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerId?: string;
    rtpCapabilities: RtpCapabilities;
  };
};

export type onNewConsumerType = {
  type: "newConsumer";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    rtpCapabilities: RtpCapabilities;
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
  };
};

export type onNewJSONConsumerType = {
  type: "newJSONConsumer";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "json";
    dataStreamType: DataStreamTypes;
    sctpCapabilities: SctpCapabilities;
    producerUsername: string;
    producerInstance: string;
    incomingProducerId: string;
  };
};

export type onRemoveProducerType = {
  type: "removeProducer";
  data: {
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
  data: {
    table_id: string;
    username: string;
    instance: string;
  };
};

export type onClientMuteType = {
  type: "clientMute";
  data: {
    table_id: string;
    username: string;
    instance: string;
    clientMute: boolean;
  };
};

export type onNewProducerCreatedType = {
  type: "newProducerCreated";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId: string | undefined;
  };
};

export type onNewConsumerCreatedType = {
  type: "newConsumerCreated";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId?: string;
    producerUsername: string;
    producerInstance: string;
  };
};

export type onRequestEffectChangeType = {
  type: "requestEffectChange";
  data: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: ProducerTypes;
    requestedProducerId: string | undefined;
    effect: string;
    blockStateChange: boolean;
    style: string;
    hideBackgroundStyle?: string;
    hideBackgroundColor?: string;
    postProcessStyle?: string;
  };
};

export type onClientEffectChangeType = {
  type: "clientEffectChange";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId: string | undefined;
    effect: string;
    effectStyle: string;
    blockStateChange: boolean;
  };
};

export type onRequestPermissionsType = {
  type: "requestPermissions";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

export type onRequestBundleMetadataType = {
  type: "requestBundleMetadata";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

export type onPermissionsResponseType = {
  type: "permissionsResponse";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    permissions: Permissions;
  };
};

export type onBundleMetadataResponseType = {
  type: "bundleMetadataResponse";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    clientMute: boolean;
    streamEffects: string;
    currentEffectsStyles: string;
  };
};

export type onRequestCatchUpDataType = {
  type: "requestCatchUpData";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: ProducerTypes;
    inquiredProducerId: string;
  };
};

export type onRequestGameCatchUpDataType = {
  type: "requestGameCatchUpData";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
  };
};

export type onResponseCatchUpDataType = {
  type: "responseCatchUpData";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: ProducerTypes;
    inquiredProducerId: string;
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
};

export type onResponseGameCatchUpDataType = {
  type: "responseGameCatchUpData";
  data: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
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
  data: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
    effect: AudioMixEffectsType;
    active: boolean;
  };
};

export type onClientMixEffectActivityChangeType = {
  type: "clientMixEffectActivityChange";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
    effect: AudioMixEffectsType;
    active: boolean;
  };
};

export type onRequestMixEffectValueChangeType = {
  type: "requestMixEffectValueChange";
  data: {
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
    effect: AudioMixEffectsType;
    option: string;
    value: number;
    styleValue: number;
  };
};

export type onClientMixEffectValueChangeType = {
  type: "clientMixEffectValueChange";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
    effect: AudioMixEffectsType;
    option: string;
    value: number;
    styleValue: number;
  };
};

export type onRequestRemoveProducerType = {
  type: "requestRemoveProducer";
  data: {
    table_id: string;
    username: string;
    instance: string;
    producerType: ProducerTypes;
    producerId: string;
  };
};
