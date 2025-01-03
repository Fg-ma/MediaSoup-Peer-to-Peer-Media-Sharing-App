import { Permissions } from "../../../context/permissionsContext/typeConstant";
import {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "./fgLowerVideoControls/FgLowerVideoControls";
import { closedCaptionsSelections } from "./fgLowerVideoControls/lib/fgSettingsButton/lib/ClosedCaptionsPage";

export interface FgVideoOptions {
  permissions?: Permissions;
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

export const defaultFgVideoOptions: {
  permissions: Permissions;
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryVideoColor: string;
  initialVolume: "high" | "low" | "off";
} = {
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
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryVideoColor: "#f56114",
  initialVolume: "high",
};
