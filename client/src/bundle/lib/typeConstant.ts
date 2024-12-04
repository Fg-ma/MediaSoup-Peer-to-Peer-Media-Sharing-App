import { EffectStylesType } from "src/context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
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
  | {
      type: "producerDisconnected";
      producerUsername: string;
      producerInstance: string;
      producerType: string;
      producerId: string;
    }
  | {
      type: "newProducerWasCreated";
      producerType: "camera" | "screen" | "audio";
      producerId: string | undefined;
    }
  | {
      type: "newConsumerWasCreated";
      producerUsername: string;
      producerInstance: string;
      consumerId?: string;
      consumerType: string;
    }
  | {
      type: "clientMuteChange";
      username: string;
      clientMute: boolean;
    }
  | {
      type: "statesPermissionsResponsed";
      inquiredUsername: string;
      inquiredInstance: string;
      clientMute: boolean;
      permissions: Permissions;
      streamEffects: {
        camera: {
          [cameraId: string]: {
            [effectType in CameraEffectTypes]: boolean;
          };
        };
        screen: {
          [screenId: string]: {
            [effectType in ScreenEffectTypes]: boolean;
          };
        };
        audio: { [effectType in AudioEffectTypes]: boolean };
      };
      currentEffectsStyles: EffectStylesType;
    }
  | {
      type: "effectChangeRequested";
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string | undefined;
      effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
      effectStyle: string;
      blockStateChange: boolean;
    }
  | {
      type: "clientEffectChanged";
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
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
  },
};
