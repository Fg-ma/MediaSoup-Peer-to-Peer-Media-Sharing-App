import { Permissions } from "../../../context/permissionsContext/lib/typeConstant";
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
  background: { value: boolean };
  pictureInPicture: { value: boolean };
  captions: { value: boolean };
  closedCaption: {
    value: keyof typeof closedCaptionsSelections;
    closedCaptionOptions: {
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

export const defaultSettings: Settings = {
  background: { value: false },
  pictureInPicture: { value: false },
  captions: { value: false },
  closedCaption: {
    value: "en-US",
    closedCaptionOptions: {
      value: "",
      fontFamily: { value: "K2D" },
      fontColor: { value: "white" },
      fontOpacity: { value: "100%" },
      fontSize: { value: "base" },
      backgroundColor: { value: "black" },
      backgroundOpacity: { value: "75%" },
      characterEdgeStyle: { value: "None" },
    },
  },
};

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
  primaryVideoColor: "#d40213",
};
