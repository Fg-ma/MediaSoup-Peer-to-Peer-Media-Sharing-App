import {
  UserEffectsStylesType,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
  UserStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import { Permissions } from "../../context/permissionsContext/typeConstant";

export interface BundleOptions {
  isUser?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  initialVolume?: "off" | "low" | "high";
  permissions?: Permissions;
}

export type BundleControllerMessageType =
  | onProducerDisconnectedType
  | onNewProducerWasCreatedType
  | onNewConsumerWasCreatedType
  | onClientMuteChangeType
  | onPermissionsResponsedType
  | onBundleMetadataResponsedType
  | onEffectChangeRequestedType
  | onClientEffectChangedType;

export type onProducerDisconnectedType = {
  type: "producerDisconnected";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string;
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
    producerType: "camera" | "screen" | "audio" | "screenAudio";
    producerId?: string;
  };
};

export type onClientMuteChangeType = {
  type: "clientMuteChange";
  header: {
    username: string;
  };
  data: {
    clientMute: boolean;
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
    streamEffects: UserStreamEffectsType;
    userEffectsStyles: UserEffectsStylesType;
  };
};

export type onEffectChangeRequestedType = {
  type: "effectChangeRequested";
  header: {
    requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
    requestedProducerId: string | undefined;
  };
  data: {
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
    blockStateChange: boolean;
  };
};

export type onClientEffectChangedType = {
  type: "clientEffectChanged";
  header: {
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string | undefined;
  };
  data: {
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
    blockStateChange: boolean;
  };
};

export const defaultBundleOptions = {
  isUser: false,
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
  permissions: {
    acceptsCameraEffects: false,
    acceptsScreenEffects: false,
    acceptsScreenAudioEffects: false,
    acceptsAudioEffects: false,
    acceptsPositionScaleRotationManipulation: false,
    acceptsCloseMedia: false,
  },
};
