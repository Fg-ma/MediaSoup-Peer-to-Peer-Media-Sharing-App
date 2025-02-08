import {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "./lowerVideoControls/LowerVideoControls";
import { closedCaptionsSelections } from "./lowerVideoControls/lib/settingsButton/lib/ClosedCaptionsPage";

export interface VideoOptions {
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

export const defaultVideoOptions: {
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryVideoColor: string;
  initialVolume: "high" | "low" | "off";
} = {
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryVideoColor: "#f56114",
  initialVolume: "high",
};
