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
  [mustacheEffectType in MustachesEffectTypes]: number;
} = {
  mustache1: -0.09,
  mustache2: -0.07,
  mustache3: -0.09,
  mustache4: -0.07,
  disguiseMustache: -0.075,
};

export type EffectStylesType = {
  glasses: { style: GlassesEffectTypes };
  ears: {
    style: EarsEffectTypes;
    leftEarWidthFactor: number;
    rightEarWidthFactor: number;
  };
  beards: { style: BeardsEffectTypes; chinOffset: number };
  mustaches: { style: MustachesEffectTypes; noseOffset: number };
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
    glasses: { style: defaultGlasses },
    ears: {
      style: defaultEars,
      leftEarWidthFactor: earsWidthFactorMap[defaultEars].leftEarWidthFactor,
      rightEarWidthFactor: earsWidthFactorMap[defaultEars].rightEarWidthFactor,
    },
    beards: {
      style: defaultBeard,
      chinOffset: beardChinOffsetsMap[defaultBeard],
    },
    mustaches: {
      style: defaultMustache,
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
