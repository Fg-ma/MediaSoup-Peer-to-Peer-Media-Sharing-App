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
  | onResponseCatchUpDataType
  | onRequestMixEffectActivityChangeType
  | onClientMixEffectActivityChangeType
  | onRequestMixEffectValueChangeType
  | onClientMixEffectValueChangeType
  | onRequestRemoveProducerType;

export type onGetRouterRtpCapabilitiesType = {
  type: "getRouterRtpCapabilities";
  table_id: string;
  username: string;
  instance: string;
};

export type onCreateProducerTransportType = {
  type: "createProducerTransport";
  table_id: string;
  username: string;
  instance: number;
};

export type onConnectProducerTransportType = {
  type: "connectProducerTransport";
  dtlsParameters: DtlsParameters;
  table_id: string;
  username: string;
  instance: string;
};

export type onCreateNewProducerType = {
  type: "createNewProducer";
  producerType: "camera" | "screen" | "screenAudio" | "audio";
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  table_id: string;
  username: string;
  instance: string;
  producerId?: string;
};

export type onCreateNewJSONProducerType = {
  type: "createNewJSONProducer";
  producerType: "json";
  transportId: string;
  label: string;
  protocol: "json";
  table_id: string;
  username: string;
  instance: string;
  producerId: string;
  sctpStreamParameters: SctpParameters;
  dataStreamType: DataStreamTypes;
};

export type onCreateConsumerTransportType = {
  type: "createConsumerTransport";
  forceTcp: boolean;
  table_id: string;
  username: string;
  instance: string;
};

export type onConnectConsumerTransportType = {
  type: "connectConsumerTransport";
  transportId: string;
  dtlsParameters: DtlsParameters;
  table_id: string;
  username: string;
  instance: string;
};

export type onResumeType = {
  type: "resume";
  table_id: string;
  username: string;
  instance: string;
};

export type onConsumeType = {
  type: "consume";
  rtpCapabilities: RtpCapabilities;
  table_id: string;
  username: string;
  instance: string;
  producerId?: string;
};

export type onNewConsumerType = {
  type: "newConsumer";
  rtpCapabilities: RtpCapabilities;
  table_id: string;
  username: string;
  instance: string;
  producerUsername: string;
  producerInstance: string;
  producerId?: string;
  producerType: "camera" | "screen" | "screenAudio" | "audio";
};

export type onNewJSONConsumerType = {
  type: "newJSONConsumer";
  producerType: "json";
  sctpCapabilities: SctpCapabilities;
  producerUsername: string;
  producerInstance: string;
  incomingProducerId: string;
  table_id: string;
  username: string;
  instance: string;
  dataStreamType: DataStreamTypes;
};

export type onRemoveProducerType = {
  type: "removeProducer";
  table_id: string;
  username: string;
  instance: string;
  producerType: ProducerTypes;
  producerId?: string;
  dataStreamType?: DataStreamTypes;
};

export type onUnsubscribeType = {
  type: "unsubscribe";
  table_id: string;
  username: string;
  instance: string;
};

export type onClientMuteType = {
  type: "clientMute";
  table_id: string;
  username: string;
  instance: string;
  clientMute: boolean;
};

export type onNewProducerCreatedType = {
  type: "newProducerCreated";
  table_id: string;
  username: string;
  instance: string;
  producerType: ProducerTypes;
  producerId: string | undefined;
};

export type onNewConsumerCreatedType = {
  type: "newConsumerCreated";
  table_id: string;
  username: string;
  instance: string;
  producerUsername: string;
  producerInstance: string;
  producerId?: string;
  producerType: ProducerTypes;
};

export type onRequestEffectChangeType = {
  type: "requestEffectChange";
  table_id: string;
  requestedUsername: string;
  requestedInstance: string;
  requestedProducerType: ProducerTypes;
  requestedProducerId: string | undefined;
  effect: string;
  blockStateChange: boolean;
  data: {
    style: string;
    hideBackgroundStyle?: string;
    hideBackgroundColor?: string;
    postProcessStyle?: string;
  };
};

export type onClientEffectChangeType = {
  type: "clientEffectChange";
  table_id: string;
  username: string;
  instance: string;
  producerType: ProducerTypes;
  producerId: string | undefined;
  effect: string;
  effectStyle: string;
  blockStateChange: boolean;
};

export type onRequestPermissionsType = {
  type: "requestPermissions";
  table_id: string;
  inquiringUsername: string;
  inquiringInstance: string;
  inquiredUsername: string;
  inquiredInstance: string;
};

export type onRequestBundleMetadataType = {
  type: "requestBundleMetadata";
  table_id: string;
  inquiringUsername: string;
  inquiringInstance: string;
  inquiredUsername: string;
  inquiredInstance: string;
};

export type onPermissionsResponseType = {
  type: "permissionsResponse";
  table_id: string;
  inquiringUsername: string;
  inquiringInstance: string;
  inquiredUsername: string;
  inquiredInstance: string;
  data: {
    permissions: Permissions;
  };
};

export type onBundleMetadataResponseType = {
  type: "bundleMetadataResponse";
  table_id: string;
  inquiringUsername: string;
  inquiringInstance: string;
  inquiredUsername: string;
  inquiredInstance: string;
  data: {
    clientMute: boolean;
    streamEffects: string;
    currentEffectsStyles: string;
  };
};

export type onRequestCatchUpDataType = {
  type: "requestCatchUpData";
  table_id: string;
  inquiringUsername: string;
  inquiringInstance: string;
  inquiredUsername: string;
  inquiredInstance: string;
  inquiredType: ProducerTypes;
  inquiredProducerId: string;
};

export type onResponseCatchUpDataType = {
  type: "responseCatchUpData";
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

export type onRequestMixEffectActivityChangeType = {
  type: "requestMixEffectActivityChange";
  table_id: string;
  requestedUsername: string;
  requestedInstance: string;
  requestedProducerType: "audio" | "screenAudio";
  requestedProducerId: string | undefined;
  effect: AudioMixEffectsType;
  active: boolean;
};

export type onClientMixEffectActivityChangeType = {
  type: "clientMixEffectActivityChange";
  table_id: string;
  username: string;
  instance: string;
  producerType: "audio" | "screenAudio";
  producerId: string | undefined;
  effect: AudioMixEffectsType;
  active: boolean;
};

export type onRequestMixEffectValueChangeType = {
  type: "requestMixEffectValueChange";
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

export type onClientMixEffectValueChangeType = {
  type: "clientMixEffectValueChange";
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

export type onRequestRemoveProducerType = {
  type: "requestRemoveProducer";
  table_id: string;
  username: string;
  instance: string;
  producerType: ProducerTypes;
  producerId: string;
};
