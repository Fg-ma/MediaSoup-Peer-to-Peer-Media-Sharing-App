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
  data: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string;
  };
};

export type onNewProducerWasCreatedType = {
  type: "newProducerWasCreated";
  data: {
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string | undefined;
  };
};

export type onNewConsumerWasCreatedType = {
  type: "newConsumerWasCreated";
  data: {
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "camera" | "screen" | "audio" | "screenAudio";
  };
};

export type onClientMuteChangeType = {
  type: "clientMuteChange";
  data: {
    username: string;
    clientMute: boolean;
  };
};

export type onPermissionsResponsedType = {
  type: "permissionsResponsed";
  data: {
    inquiredUsername: string;
    inquiredInstance: string;
    permissions: Permissions;
  };
};

export type onBundleMetadataResponsedType = {
  type: "bundleMetadataResponsed";
  data: {
    inquiredUsername: string;
    inquiredInstance: string;
    clientMute: boolean;
    streamEffects: UserStreamEffectsType;
    userEffectsStyles: UserEffectsStylesType;
  };
};

export type onEffectChangeRequestedType = {
  type: "effectChangeRequested";
  data: {
    requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
    blockStateChange: boolean;
  };
};

export type onClientEffectChangedType = {
  type: "clientEffectChanged";
  data: {
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    producerId: string | undefined;
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
