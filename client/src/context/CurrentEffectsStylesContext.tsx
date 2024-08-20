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

export type BeardsEffectTypes = "classicalCurlyBeard";

export const beardChinOffsetsMap: {
  [beardEffectType in BeardsEffectTypes]: number;
} = {
  classicalCurlyBeard: 0.0,
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

export interface EffectStylesType {
  camera: {
    [id: string]: {
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
        chinOffset: number;
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
    };
  };
  screen: {
    [id: string]: {};
  };
  audio: {};
}

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
