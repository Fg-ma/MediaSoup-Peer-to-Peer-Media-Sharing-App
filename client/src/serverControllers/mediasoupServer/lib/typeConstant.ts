import { types } from "mediasoup-client";
import {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  SctpCapabilities,
  SctpParameters,
} from "mediasoup-client/lib/types";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../../audioEffects/typeConstant";
import { DataStreamTypes } from "../../../context/mediaContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  HideBackgroundEffectTypes,
  PostProcessEffectTypes,
  ScreenEffectTypes,
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../../../universal/effectsTypeConstant";
import { Permissions } from "../../../context/permissionsContext/lib/typeConstant";

export type OutGoingMediasoupMessages =
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
  | onRequestRemoveProducerType
  | onRequestClientMuteStateType
  | onRequestClearEffectsType
  | onClientClearEffectsType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onGetRouterRtpCapabilitiesType = {
  type: "getRouterRtpCapabilities";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onCreateProducerTransportType = {
  type: "createProducerTransport";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onConnectProducerTransportType = {
  type: "connectProducerTransport";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
  data: {
    dtlsParameters: DtlsParameters;
  };
};

type onCreateNewProducerType = {
  type: "createNewProducer";
  header: {
    tableId: string;
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

type onCreateNewJSONProducerType = {
  type: "createNewJSONProducer";
  header: {
    tableId: string;
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

type onCreateConsumerTransportType = {
  type: "createConsumerTransport";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onConnectConsumerTransportType = {
  type: "connectConsumerTransport";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
  data: {
    transportId: string;
    dtlsParameters: DtlsParameters;
  };
};

type onResumeType = {
  type: "resume";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onConsumeType = {
  type: "consume";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
  data: {
    rtpCapabilities: RtpCapabilities;
  };
};

type onNewConsumerType = {
  type: "newConsumer";
  header: {
    tableId: string;
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

type onNewJSONConsumerType = {
  type: "newJSONConsumer";
  header: {
    tableId: string;
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

type onRemoveProducerType = {
  type: "removeProducer";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId?: string;
    dataStreamType?: DataStreamTypes;
  };
};

type onUnsubscribeType = {
  type: "unsubscribe";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onClientMuteType = {
  type: "clientMute";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
  data: {
    clientMute: boolean;
  };
};

type onNewProducerCreatedType = {
  type: "newProducerCreated";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId?: string;
  };
};

type onNewConsumerCreatedType = {
  type: "newConsumerCreated";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
  data: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId?: string;
  };
};

type onRequestEffectChangeType = {
  type: "requestEffectChange";
  header: {
    tableId: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType:
      | "camera"
      | "screen"
      | "audio"
      | "screenAudio"
      | "json";
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

type onClientEffectChangeType = {
  type: "clientEffectChange";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId: string | undefined;
  };
  data: {
    effect: string;
    effectStyle?: string;
    blockStateChange: boolean;
  };
};

type onRequestPermissionsType = {
  type: "requestPermissions";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

type onRequestBundleMetadataType = {
  type: "requestBundleMetadata";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
};

type onPermissionsResponseType = {
  type: "permissionsResponse";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    permissions: Permissions;
  };
};

type onBundleMetadataResponseType = {
  type: "bundleMetadataResponse";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    clientMute: boolean;
    streamEffects: UserEffectsType;
    userEffectsStyles: UserEffectsStylesType;
  };
};

type onRequestCatchUpDataType = {
  type: "requestCatchUpData";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    inquiredProducerId?: string;
  };
};

type onRequestGameCatchUpDataType = {
  type: "requestGameCatchUpData";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
  };
};

type onResponseCatchUpDataType = {
  type: "responseCatchUpData";
  header: {
    tableId: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen" | "audio" | "screenAudio" | "json";
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

type onResponseGameCatchUpDataType = {
  type: "responseGameCatchUpData";
  header: {
    tableId: string;
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

type onRequestMixEffectActivityChangeType = {
  type: "requestMixEffectActivityChange";
  header: {
    tableId: string;
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

type onClientMixEffectActivityChangeType = {
  type: "clientMixEffectActivityChange";
  header: {
    tableId: string;
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

type onRequestMixEffectValueChangeType = {
  type: "requestMixEffectValueChange";
  header: {
    tableId: string;
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

type onClientMixEffectValueChangeType = {
  type: "clientMixEffectValueChange";
  header: {
    tableId: string;
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

type onRequestRemoveProducerType = {
  type: "requestRemoveProducer";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId?: string;
  };
};

type onRequestClientMuteStateType = {
  type: "requestClientMuteState";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerUsername: string;
    producerInstance: string;
  };
};

type onRequestClearEffectsType = {
  type: "requestClearEffects";
  header: {
    tableId: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
    requestedProducerId: string;
  };
};

type onClientClearEffectsType = {
  type: "clientClearEffects";
  header: {
    tableId: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string;
  };
};

export type IncomingMediasoupMessages =
  | onProducerTransportCreatedType
  | onConsumerTransportCreatedType
  | onResumedType
  | onSubscribedType
  | onNewConsumerSubscribedType
  | onNewJSONConsumerSubscribedType
  | onNewProducerAvailableType
  | onNewJSONProducerAvailableType
  | onProducerDisconnectedType
  | onPermissionsRequestedType
  | onBundleMetadataRequestedType
  | onRequestedCatchUpDataType
  | onRemoveProducerRequestedType
  | onUserLeftTableType
  | onNewJSONProducerCallbackType
  | onNewProducerCallbackType
  | onProducerConnectedType
  | onConsumerTransportConnectedType
  | onEffectChangeRequestedType
  | onClientEffectChangedType
  | onClientMuteChangeType
  | onClientMixEffectActivityChangedType
  | onMixEffectActivityChangeRequestedType
  | onClientMixEffectValueChangedType
  | onMixEffectValueChangeRequestedType
  | onNewProducerWasCreatedType
  | onNewConsumerWasCreatedType
  | onPermissionsResponsedType
  | onBundleMetadataResponsedType
  | onResponsedCatchUpDataType
  | onRequestedGameCatchUpDataType
  | onResponsedGameCatchUpDataType
  | onRouterCapabilitiesType
  | onLocalMuteChangeType
  | onClientMuteStateResponsedType
  | onRequestedClearEffectsType
  | onClientClearedEffectsType;

export type onProducerTransportCreatedType = {
  type: "producerTransportCreated";
  data: {
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
    };
  };
  error?: unknown;
};

export type onConsumerTransportCreatedType = {
  type: "consumerTransportCreated";
  data: {
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
    };
  };
  error?: unknown;
};

export type onResumedType = { type: "resumed" };

export type onSubscribedType = {
  type: "subscribed";
  data: {
    [username: string]: {
      [instance: string]: {
        camera?: {
          [cameraId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screen?: {
          [screenId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screenAudio?: {
          [screenAudioId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: RtpParameters;
            type: string;
            producerPaused: boolean;
          };
        };
        audio?: {
          id: string;
          producerId: string;
          kind: "audio" | "video" | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
        json?: {
          [dataStreamType in DataStreamTypes]?: {
            id: string;
            producerId: string;
            label: string;
            sctpStreamParameters: SctpStreamParameters;
            type: string;
            producerPaused: boolean;
            protocol: string;
          };
        };
      };
    };
  };
};

export type onNewConsumerSubscribedType = {
  type: "newConsumerSubscribed";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
  };
  data: {
    id: string;
    producerId: string;
    kind: "audio" | "video" | undefined;
    rtpParameters: types.RtpParameters;
    type: string;
    producerPaused: boolean;
  };
};

export type onNewJSONConsumerSubscribedType = {
  type: "newJSONConsumerSubscribed";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "json";
  };
  data: {
    id: string;
    producerId: string;
    label: string;
    sctpStreamParameters: SctpStreamParameters;
    type: string;
    producerPaused: boolean;
    protocol: string;
  };
};

export type onNewProducerAvailableType = {
  type: "newProducerAvailable";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio";
    producerId?: string;
  };
};

export type onNewJSONProducerAvailableType = {
  type: "newJSONProducerAvailable";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "json";
    producerId: string;
    dataStreamType: DataStreamTypes;
  };
};

export type onProducerDisconnectedType = {
  type: "producerDisconnected";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId?: string;
    dataStreamType?: DataStreamTypes;
  };
};

export type onPermissionsRequestedType = {
  type: "permissionsRequested";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
  };
};

export type onBundleMetadataRequestedType = {
  type: "bundleMetadataRequested";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
  };
};

export type onRequestedCatchUpDataType = {
  type: "requestedCatchUpData";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredType: "camera" | "screen" | "audio";
    inquiredProducerId?: string;
  };
};

export type onRemoveProducerRequestedType = {
  type: "removeProducerRequested";
  header: {
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId: string;
  };
};

export type onUserLeftTableType = {
  type: "userLeftTable";
  header: {
    username: string;
    instance: string;
  };
};

export type onNewJSONProducerCallbackType = {
  type: "newJSONProducerCallback";
  data: { id: string };
};

export type onNewProducerCallbackType = {
  type: "newProducerCallback";
  data: { id: string };
};

export type onProducerConnectedType = {
  type: "producerConnected";
};

export type onConsumerTransportConnectedType = {
  type: "consumerTransportConnected";
};

export type onEffectChangeRequestedType = {
  type: "effectChangeRequested";
  header: {
    requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
    requestedProducerId?: string | undefined;
  };
  data: {
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    blockStateChange: boolean;
    style?: string;
    hideBackgroundStyle?: HideBackgroundEffectTypes;
    hideBackgroundColor?: string;
    postProcessStyle?: PostProcessEffectTypes;
  };
};

export type onClientEffectChangedType = {
  type: "clientEffectChanged";
  header: {
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId?: string | undefined;
  };
  data: {
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle?: string;
    blockStateChange: boolean;
  };
};

export type onClientMuteChangeType = {
  type: "clientMuteChange";
  header: {
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
  data: {
    clientMute: boolean;
  };
};

export type onClientMixEffectActivityChangedType = {
  type: "clientMixEffectActivityChanged";
  header: {
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

export type onMixEffectActivityChangeRequestedType = {
  type: "mixEffectActivityChangeRequested";
  header: {
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    active: boolean;
  };
};

export type onClientMixEffectValueChangedType = {
  type: "clientMixEffectValueChanged";
  header: {
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    option: MixEffectsOptionsType;
    value: number;
    styleValue: number;
  };
};

export type onMixEffectValueChangeRequestedType = {
  type: "mixEffectValueChangeRequested";
  header: {
    requestedProducerType: "audio" | "screenAudio";
    requestedProducerId: string | undefined;
  };
  data: {
    effect: AudioMixEffectsType;
    option: MixEffectsOptionsType;
    value: number;
    styleValue: number;
  };
};

export type onNewProducerWasCreatedType = {
  type: "newProducerWasCreated";
  header: {
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string | undefined;
  };
};

export type onNewConsumerWasCreatedType = {
  type: "newConsumerWasCreated";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio" | "json";
    producerId?: string;
  };
};

export type onPermissionsResponsedType = {
  type: "permissionsResponsed";
  header: {
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    permissions: Permissions;
  };
};

export type onBundleMetadataResponsedType = {
  type: "bundleMetadataResponsed";
  header: {
    inquiredUsername: string;
    inquiredInstance: string;
  };
  data: {
    clientMute: boolean;
    streamEffects: UserEffectsType;
    userEffectsStyles: UserEffectsStylesType;
  };
};

export type onResponsedCatchUpDataType = {
  type: "responsedCatchUpData";
  header: {
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen" | "audio";
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

export type onRequestedGameCatchUpDataType = {
  type: "requestedGameCatchUpData";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
    gameId: string;
  };
};

export type onResponsedGameCatchUpDataType = {
  type: "responsedGameCatchUpData";
  header: {
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

export type onRouterCapabilitiesType = {
  type: "routerCapabilities";
  data: {
    rtpCapabilities: types.RtpCapabilities;
  };
};

export type onLocalMuteChangeType = { type: "localMuteChange" };

export type onClientMuteStateResponsedType = {
  type: "clientMuteStateResponsed";
  header: {
    producerUsername: string;
    producerInstance: string;
  };
};

export type onRequestedClearEffectsType = {
  type: "requestedClearEffects";
  header: {
    requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
    requestedProducerId: string;
  };
};

export type onClientClearedEffectsType = {
  type: "clientClearedEffects";
  header: {
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string;
  };
};
