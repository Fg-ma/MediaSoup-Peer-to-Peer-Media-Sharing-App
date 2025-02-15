import { Permissions } from "../../../context/permissionsContext/typeConstant";
import {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "./fgLowerVisualMediaControls/FgLowerVisualMediaControls";
import { closedCaptionsSelections } from "./fgLowerVisualMediaControls/lib/fgSettingsButton/lib/ClosedCaptionsPage";

export interface FgVisualMediaOptions {
  isUser?: boolean;
  permissions?: Permissions;
  isStream?: boolean;
  autoPlay?: boolean;
  isSlider?: boolean;
  isPlayPause?: boolean;
  isVolume?: boolean;
  isCurrentTime?: boolean;
  isClosedCaptions?: boolean;
  isPictureInPicture?: boolean;
  isEffects?: boolean;
  isFullScreen?: boolean;
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
  primaryVideoColor?: string;
  initialVolume?: "high" | "low" | "off";
}

export interface Settings {
  closedCaption: {
    value: keyof typeof closedCaptionsSelections;
    closedCaptionOptionsActive: {
      value: "";
      fontFamily: { value: FontFamilies };
      fontColor: { value: FontColors };
      fontOpacity: { value: FontOpacities };
      fontSize: { value: FontSizes };
      backgroundColor: { value: BackgroundColors };
      backgroundOpacity: { value: BackgroundOpacities };
      characterEdgeStyle: { value: CharacterEdgeStyles };
    };
  };
}

export const defaultFgVisualMediaOptions = {
  isUser: false,
  permissions: {
    acceptsCameraEffects: false,
    acceptsScreenEffects: false,
    acceptsAudioEffects: false,
    acceptsScreenAudioEffects: false,
    acceptsPositionScaleRotationManipulation: false,
    acceptsCloseMedia: false,
    acceptsVideoEffects: false,
    acceptsImageEffects: false,
  },
  isStream: false,
  autoPlay: true,
  isSlider: true,
  isPlayPause: true,
  isVolume: true,
  isCurrentTime: true,
  isClosedCaptions: true,
  isPictureInPicture: true,
  isEffects: true,
  isFullScreen: true,
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryVideoColor: "#f56114",
};
