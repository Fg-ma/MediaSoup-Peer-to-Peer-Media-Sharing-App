import React, { ReactNode, createContext, useContext, useRef } from "react";

export type GlassesEffectTypes =
  | "defaultGlasses"
  | "memeGlasses"
  | "americaGlasses"
  | "threeDGlasses"
  | "shades";

export type EarsEffectTypes = "dogEars";

export type BeardsEffectTypes = "classicalCurlyBeard";

export type EffectStylesType = {
  glasses: GlassesEffectTypes;
  ears: EarsEffectTypes;
  beards: BeardsEffectTypes;
};

export interface CurrentEffectsStylesContextProviderProps {
  children: ReactNode;
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
  const currentEffectsStyles = useRef<EffectStylesType>({
    glasses: "defaultGlasses",
    ears: "dogEars",
    beards: "classicalCurlyBeard",
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
