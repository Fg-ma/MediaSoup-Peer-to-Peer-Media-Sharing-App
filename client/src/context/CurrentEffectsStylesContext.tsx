import React, { createContext, useContext, useRef } from "react";

export const defaultBeard = "classicalCurlyBeard";
export const defaultGlasses = "defaultGlasses";
export const defaultMustache = "mustache1";
export const defaultFaceMask = "baseFaceMask";
export const defaultHat = "stylishHat";
export const defaultPet = "beardedDragon";

export const beardChinOffsetsMap: {
  [beardEffectType in BeardsEffectTypes]: {
    twoDim: number;
    threeDim: number;
  };
} = {
  classicalCurlyBeard: { twoDim: 0.0, threeDim: -0.35 },
  chinBeard: { twoDim: -0.3, threeDim: -0.28 },
};

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
  nicodemusMustache: { twoDim: 0.0, threeDim: 0.0 },
  pencilMustache: { twoDim: 0.0, threeDim: 0.0 },
  spongebobMustache: { twoDim: 0.0, threeDim: 0.0 },
  tinyMustache: { twoDim: 0.0, threeDim: 0.0 },
};

export interface CameraEffectStylesType {
  glasses?: { style: GlassesEffectTypes; threeDim: boolean };
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
  hats?: {
    style: HatsEffectTypes;
    threeDim: boolean;
  };
  pets?: {
    style: PetsEffectTypes;
    threeDim: boolean;
  };
}

export type BeardsEffectTypes =
  | "classicalCurlyBeard"
  | "chinBeard"
  | "fullBeard";
export type GlassesEffectTypes =
  | "defaultGlasses"
  | "americaGlasses"
  | "aviatorGoggles"
  | "bloodyGlasses"
  | "eyeProtectionGlasses"
  | "glasses1"
  | "glasses2"
  | "glasses3"
  | "glasses4"
  | "glasses5"
  | "glasses6"
  | "memeGlasses"
  | "militaryTacticalGlasses"
  | "steampunkGlasses"
  | "threeDGlasses"
  | "toyGlasses"
  | "shades"
  | "VRGlasses";
export type MustachesEffectTypes =
  | "fullMustache"
  | "mustache1"
  | "mustache2"
  | "mustache3"
  | "mustache4"
  | "disguiseMustache"
  | "nicodemusMustache"
  | "pencilMustache"
  | "spongebobMustache"
  | "tinyMustache"
  | "wingedMustache";
export type FaceMasksEffectTypes =
  | "baseFaceMask"
  | "alienFaceMask"
  | "clownFaceMask"
  | "creatureFaceMask"
  | "cyberFaceMask"
  | "darkKnightFaceMask"
  | "demonFaceMask"
  | "gasMask1"
  | "gasMask2"
  | "gasMask3"
  | "gasMask4"
  | "masqueradeFaceMask"
  | "metalManFaceMask"
  | "oniMask"
  | "plagueDoctorFaceMask"
  | "sixEyesFaceMask"
  | "tenguMask"
  | "threeFaceMask"
  | "weldingMask"
  | "woodlandFaceMask"
  | "woodPaintedFaceMask"
  | "zombieFaceMask";
export type HatsEffectTypes =
  | "AsianConicalHat"
  | "aviatorHelmet"
  | "bicornHat"
  | "bicycleHelmet"
  | "captainsHat"
  | "chefHat"
  | "chickenHat"
  | "deadManHat"
  | "dogEars"
  | "flatCap"
  | "hardHat"
  | "hopliteHelmet"
  | "militaryHat"
  | "rabbitEars"
  | "roundEarsHat"
  | "santaHat"
  | "seamanHat"
  | "stylishHat"
  | "superMarioOdysseyHat"
  | "ushankaHat"
  | "vikingHelmet";
export type PetsEffectTypes =
  | "angryHamster"
  | "axolotl"
  | "babyDragon"
  | "beardedDragon"
  | "bird1"
  | "bird2"
  | "boxer"
  | "brain"
  | "buddyHamster"
  | "cat1"
  | "cat2"
  | "dodoBird"
  | "happyHamster"
  | "mechanicalGrasshopper"
  | "panda1"
  | "panda2"
  | "petRock"
  | "pig"
  | "redFox1"
  | "redFox2"
  | "roboDog"
  | "skeletonTRex"
  | "snail"
  | "spinosaurus"
  | "TRex";

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
  hats: {
    style: defaultHat,
    threeDim: false,
  },
  pets: {
    style: defaultPet,
    threeDim: false,
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
