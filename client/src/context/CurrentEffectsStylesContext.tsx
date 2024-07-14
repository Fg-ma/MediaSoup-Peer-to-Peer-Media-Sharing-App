import React, { createContext, useContext, useRef } from "react";

export type GlassesEffectTypes =
  | "defaultGlasses"
  | "memeGlasses"
  | "americaGlasses"
  | "threeDGlasses"
  | "shades";

export type EarsEffectTypes = "dogEars";

export const earsWidthFactorMap: {
  [earEffectType in EarsEffectTypes]: {
    leftEarWidthFactor: number;
    rightEarWidthFactor: number;
  };
} = {
  dogEars: { leftEarWidthFactor: 0.75, rightEarWidthFactor: 0.75 },
};

export type BeardsEffectTypes = "classicalCurlyBeard";

export const beardChinOffsetsMap: {
  [beardEffectType in BeardsEffectTypes]: number;
} = {
  classicalCurlyBeard: 0.05,
};

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
  mustache1: { twoDim: -0.09, threeDim: -0.05 },
  mustache2: { twoDim: -0.07, threeDim: 0.0 },
  mustache3: { twoDim: -0.09, threeDim: 0.0 },
  mustache4: { twoDim: -0.07, threeDim: 0.0 },
  disguiseMustache: { twoDim: 0.075, threeDim: 0.0 },
};

export type EffectStylesType = {
  glasses: { style: GlassesEffectTypes; threeDim: boolean };
  ears: {
    style: EarsEffectTypes;
    threeDim: boolean;
    leftEarWidthFactor: number;
    rightEarWidthFactor: number;
  };
  beards: { style: BeardsEffectTypes; threeDim: boolean; chinOffset: number };
  mustaches: {
    style: MustachesEffectTypes;
    threeDim: boolean;
    noseOffset: { twoDim: number; threeDim: number };
  };
};

export interface CurrentEffectsStylesContextProviderProps {
  children: React.ReactNode;
}

export interface CurrentEffectsStylesContextType {
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
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
  const defaultGlasses = "defaultGlasses";
  const defaultBeard = "classicalCurlyBeard";
  const defaultMustache = "mustache1";
  const defaultEars = "dogEars";

  const currentEffectsStyles = useRef<EffectStylesType>({
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
  });

  return (
    <CurrentEffectsStylesContext.Provider
      value={{
        currentEffectsStyles,
      }}
    >
      {children}
    </CurrentEffectsStylesContext.Provider>
  );
}

export default CurrentEffectsStylesContext;
