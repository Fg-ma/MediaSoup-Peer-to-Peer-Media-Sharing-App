import React, { createContext, useContext, useRef } from "react";

export const defaultEars = "dogEars";
export const defaultBeard = "classicalCurlyBeard";
export const defaultGlasses = "defaultGlasses";
export const defaultMustache = "mustache1";
export const defaultFaceMask = "faceMask1";

export type EarsEffectTypes = "dogEars";

export const earsWidthFactorMap: {
  [earEffectType in EarsEffectTypes]: {
    leftEarWidthFactor: number;
    rightEarWidthFactor: number;
  };
} = {
  dogEars: { leftEarWidthFactor: 0.6, rightEarWidthFactor: 0.6 },
};

export type BeardsEffectTypes = "classicalCurlyBeard" | "chinBeard";

export const beardChinOffsetsMap: {
  [beardEffectType in BeardsEffectTypes]: {
    twoDim: number;
    threeDim: number;
  };
} = {
  classicalCurlyBeard: { twoDim: 0.0, threeDim: -0.35 },
  chinBeard: { twoDim: -0.3, threeDim: -0.28 },
};

export type GlassesEffectTypes =
  | "defaultGlasses"
  | "memeGlasses"
  | "americaGlasses"
  | "threeDGlasses"
  | "shades";

export type MustachesEffectTypes =
  | "mustache1"
  | "mustache2"
  | "mustache3"
  | "mustache4"
  | "disguiseMustache";

export const mustacheNoseOffsetsMap: {
  [mustacheEffectType in MustachesEffectTypes]: {
    twoDim: number;
    threeDim: number;
  };
} = {
  mustache1: { twoDim: -0.14, threeDim: -0.08 },
  mustache2: { twoDim: -0.1, threeDim: -0.1 },
  mustache3: { twoDim: -0.15, threeDim: -0.11 },
  mustache4: { twoDim: -0.1, threeDim: -0.05 },
  disguiseMustache: { twoDim: 0.075, threeDim: 0.0 },
};

export type FaceMasksEffectTypes = "faceMask1";

export interface CameraEffectStylesType {
  glasses?: { style: GlassesEffectTypes; threeDim: boolean };
  ears?: {
    style: EarsEffectTypes;
    threeDim: boolean;
    leftEarWidthFactor: number;
    rightEarWidthFactor: number;
  };
  beards?: {
    style: BeardsEffectTypes;
    threeDim: boolean;
    chinOffset: { twoDim: number; threeDim: number };
  };
  mustaches?: {
    style: MustachesEffectTypes;
    threeDim: boolean;
    noseOffset: { twoDim: number; threeDim: number };
  };
  faceMasks?: {
    style: FaceMasksEffectTypes;
    threeDim: true;
  };
}

export interface ScreenEffectStylesType {}

export interface AudioEffectStylesType {}

export interface EffectStylesType {
  camera: {
    [id: string]: CameraEffectStylesType;
  };
  screen: {
    [id: string]: ScreenEffectStylesType;
  };
  audio: AudioEffectStylesType;
}

export const defaultCameraCurrentEffectsStyles: CameraEffectStylesType = {
  glasses: { style: defaultGlasses, threeDim: false },
  ears: {
    style: defaultEars,
    threeDim: false,
    leftEarWidthFactor: earsWidthFactorMap[defaultEars].leftEarWidthFactor,
    rightEarWidthFactor: earsWidthFactorMap[defaultEars].rightEarWidthFactor,
  },
  beards: {
    style: defaultBeard,
    threeDim: false,
    chinOffset: beardChinOffsetsMap[defaultBeard],
  },
  mustaches: {
    style: defaultMustache,
    threeDim: false,
    noseOffset: mustacheNoseOffsetsMap[defaultMustache],
  },
  faceMasks: {
    style: defaultFaceMask,
    threeDim: true,
  },
};

export const defaultScreenCurrentEffectsStyles: ScreenEffectStylesType = {};

export const defaultAudioCurrentEffectsStyles: AudioEffectStylesType = {};

export interface CurrentEffectsStylesContextProviderProps {
  children: React.ReactNode;
}

export interface CurrentEffectsStylesContextType {
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  remoteCurrentEffectsStyles: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: EffectStylesType;
    };
  }>;
}

const CurrentEffectsStylesContext = createContext<
  CurrentEffectsStylesContextType | undefined
>(undefined);

export const useCurrentEffectsStylesContext = () => {
  const context = useContext(CurrentEffectsStylesContext);
  if (!context) {
    throw new Error(
      "useCurrentEffectsStylesContext must be used within an CurrentEffectsStylesContextProvider"
    );
  }
  return context;
};

export function CurrentEffectsStylesContextProvider({
  children,
}: CurrentEffectsStylesContextProviderProps) {
  const currentEffectsStyles = useRef<EffectStylesType>({
    camera: {},
    screen: {},
    audio: {},
  });
  const remoteCurrentEffectsStyles = useRef<{
    [username: string]: {
      [instance: string]: EffectStylesType;
    };
  }>({});

  return (
    <CurrentEffectsStylesContext.Provider
      value={{
        currentEffectsStyles,
        remoteCurrentEffectsStyles,
      }}
    >
      {children}
    </CurrentEffectsStylesContext.Provider>
  );
}

export default CurrentEffectsStylesContext;
