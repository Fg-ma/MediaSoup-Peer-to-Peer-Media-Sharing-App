import { Permissions } from "../../context/permissionsContext/lib/typeConstant";

export interface BundleOptions {
  isUser?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  initialVolume?: "off" | "low" | "high";
  permissions?: Permissions;
}

export const defaultBundleOptions = {
  isUser: false,
  primaryVolumeSliderColor: "#f2f2f2",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
  permissions: {
    acceptsCameraEffects: false,
    acceptsScreenEffects: false,
    acceptsScreenAudioEffects: false,
    acceptsAudioEffects: false,
    acceptsPositionScaleRotationManipulation: false,
    acceptsCloseMedia: false,
    acceptsVideoEffects: false,
    acceptsImageEffects: false,
  },
};
