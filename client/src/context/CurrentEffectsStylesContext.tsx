import React, { createContext, useContext, useRef } from "react";

export type GlassesEffectTypes =
  | "defaultGlasses"
  | "memeGlasses"
  | "americaGlasses"
  | "threeDGlasses"
  | "shades";

export type EarsEffectTypes = "dogEars";

export type BeardsEffectTypes = "classicalCurlyBeard";

export const beardChinOffsets: {
  [beardEffectType in BeardsEffectTypes]: number;
} = {
  classicalCurlyBeard: 0.0,
};

export type MustachesEffectTypes =
  | "mustache1"
  | "mustache2"
  | "mustache3"
  | "mustache4"
  | "disguiseMustache";

export const mustacheNoseOffsets: {
  [mustacheEffectType in MustachesEffectTypes]: number;
} = {
  mustache1: 0.135,
  mustache2: 0.115,
  mustache3: 0.13,
  mustache4: 0.115,
  disguiseMustache: 0.025,
};

export type EffectStylesType = {
  glasses: { style: GlassesEffectTypes };
  ears: { style: EarsEffectTypes };
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
  const defaultBeard = "classicalCurlyBeard";
  const defaultMustache = "mustache1";

  const currentEffectsStyles = useRef<EffectStylesType>({
    glasses: { style: "defaultGlasses" },
    ears: { style: "dogEars" },
    beards: { style: defaultBeard, chinOffset: beardChinOffsets[defaultBeard] },
    mustaches: {
      style: defaultMustache,
      noseOffset: mustacheNoseOffsets[defaultMustache],
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
