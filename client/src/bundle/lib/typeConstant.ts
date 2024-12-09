import { EffectStylesType } from "src/context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
  UserStreamEffectsType,
} from "../../context/streamsContext/typeConstant";
import { Permissions } from "../../context/permissionsContext/PermissionsContext";

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
  producerUsername: string;
  producerInstance: string;
  producerType: "camera" | "screen" | "screenAudio" | "audio";
  producerId: string;
};

export type onNewProducerWasCreatedType = {
  type: "newProducerWasCreated";
  producerType: "camera" | "screen" | "screenAudio" | "audio";
  producerId: string | undefined;
};

export type onNewConsumerWasCreatedType = {
  type: "newConsumerWasCreated";
  producerUsername: string;
  producerInstance: string;
  consumerId?: string;
  consumerType: "camera" | "screen" | "audio" | "screenAudio";
};

export type onClientMuteChangeType = {
  type: "clientMuteChange";
  username: string;
  clientMute: boolean;
};

export type onPermissionsResponsedType = {
  type: "permissionsResponsed";
  inquiredUsername: string;
  inquiredInstance: string;
  data: {
    permissions: Permissions;
  };
};

export type onBundleMetadataResponsedType = {
  type: "bundleMetadataResponsed";
  inquiredUsername: string;
  inquiredInstance: string;
  data: {
    clientMute: boolean;
    streamEffects: UserStreamEffectsType;
    currentEffectsStyles: EffectStylesType;
  };
};

export type onEffectChangeRequestedType = {
  type: "effectChangeRequested";
  requestedProducerType: "camera" | "screen" | "screenAudio" | "audio";
  requestedProducerId: string | undefined;
  effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
  effectStyle: string;
  blockStateChange: boolean;
};

export type onClientEffectChangedType = {
  type: "clientEffectChanged";
  username: string;
  instance: string;
  producerType: "camera" | "screen" | "screenAudio" | "audio";
  producerId: string | undefined;
  effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
  effectStyle: string;
  blockStateChange: boolean;
};

export const defaultBundleOptions = {
  isUser: false,
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
  permissions: {
    acceptsCameraEffects: false,
    acceptsScreenEffects: false,
    acceptsAudioEffects: false,
    acceptsPositionScaleRotationManipulation: false,
    acceptsCloseMedia: false,
  },
};
