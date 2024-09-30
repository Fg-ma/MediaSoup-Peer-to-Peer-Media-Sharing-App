import React, { createContext, useContext, useRef } from "react";

export const defaultBeard = "classicalCurlyBeard";
export const defaultGlasses = "defaultGlasses";
export const defaultMustache = "mustache1";
export const defaultMask = "baseMask";
export const defaultHat = "stylishHat";
export const defaultPet = "beardedDragon";

export const assetSizePositionMap: {
  beards: {
    [beardEffectType in BeardsEffectTypes]: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  mustaches: {
    [mustacheEffectType in MustachesEffectTypes]: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  glasses: {
    [glassesEffectType in GlassesEffectTypes]: {
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  masks: {
    [masksEffectType in MasksEffectTypes]: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  hats: {
    [hatsEffectType in HatsEffectTypes]: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  pets: {
    [petsEffectType in PetsEffectTypes]: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
} = {
  beards: {
    classicalCurlyBeard: {
      twoDimOffset: 0.0,
      threeDimOffset: -0.35,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    chinBeard: {
      twoDimOffset: -0.3,
      threeDimOffset: -0.28,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    fullBeard: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
  },
  mustaches: {
    fullMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    mustache1: {
      twoDimOffset: -0.14,
      threeDimOffset: -0.08,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    mustache2: {
      twoDimOffset: -0.1,
      threeDimOffset: -0.1,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    mustache3: {
      twoDimOffset: -0.15,
      threeDimOffset: -0.11,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    mustache4: {
      twoDimOffset: -0.1,
      threeDimOffset: -0.05,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    disguiseMustache: {
      twoDimOffset: 0.075,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    nicodemusMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    pencilMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    spongebobMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    tinyMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    wingedMustache: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
  },
  glasses: {
    defaultGlasses: { twoDimScale: 1, threeDimScale: 4 },
    AmericaGlasses: { twoDimScale: 1, threeDimScale: 4 },
    aviatorGoggles: { twoDimScale: 1, threeDimScale: 4 },
    bloodyGlasses: { twoDimScale: 1, threeDimScale: 4 },
    eyeProtectionGlasses: { twoDimScale: 1, threeDimScale: 3 },
    glasses1: { twoDimScale: 1, threeDimScale: 4 },
    glasses2: { twoDimScale: 1, threeDimScale: 4 },
    glasses3: { twoDimScale: 1, threeDimScale: 4 },
    glasses4: { twoDimScale: 1, threeDimScale: 4 },
    glasses5: { twoDimScale: 1, threeDimScale: 4 },
    glasses6: { twoDimScale: 1, threeDimScale: 4 },
    memeGlasses: { twoDimScale: 1, threeDimScale: 4 },
    militaryTacticalGlasses: {
      twoDimScale: 1,
      threeDimScale: 5,
    },
    shades: { twoDimScale: 1, threeDimScale: 4 },
    steampunkGlasses: { twoDimScale: 1, threeDimScale: 4 },
    threeDGlasses: { twoDimScale: 1, threeDimScale: 4 },
    toyGlasses: { twoDimScale: 1, threeDimScale: 5 },
    VRGlasses: { twoDimScale: 1, threeDimScale: 4 },
  },
  masks: {
    baseMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    alienMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    clownMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    creatureMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    cyberMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.75,
    },
    darkKnightMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    demonMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    gasMask1: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    gasMask2: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    gasMask3: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    gasMask4: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    masqueradeMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 8,
    },
    metalManMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
    oniMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    plagueDoctorMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    sixEyesMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
    tenguMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
    threeFaceMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 4.5,
    },
    weldingMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 4.5,
    },
    woodlandMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 7,
    },
    woodPaintedMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    zombieMask: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
  },
  hats: {
    AsianConicalHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    aviatorHelmet: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 9,
    },
    bicornHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 7.5,
    },
    bicycleHelmet: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6.5,
    },
    captainsHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    chefHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.75,
    },
    chickenHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 8,
    },
    deadManHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    dogEars: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    flatCap: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
    hardHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    hopliteHelmet: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 14,
    },
    militaryHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    rabbitEars: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.75,
    },
    roundEarsHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    santaHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5,
    },
    seamanHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 5.5,
    },
    stylishHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6,
    },
    superMarioOdysseyHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 7.5,
    },
    ushankaHat: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 6.5,
    },
    vikingHelmet: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 4.5,
    },
  },
  pets: {
    angryHamster: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    axolotl: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    babyDragon: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    beardedDragon: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    bird1: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    bird2: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    boxer: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    brain: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    buddyHamster: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    cat1: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    cat2: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    dodoBird: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    happyHamster: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    mechanicalGrasshopper: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    panda1: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    panda2: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    petRock: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    pig: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    redFox1: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    redFox2: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    roboDog: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    skeletonTRex: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    snail: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    spinosaurus: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
    TRex: {
      twoDimOffset: 0.0,
      threeDimOffset: 0.0,
      twoDimScale: 1,
      threeDimScale: 1,
    },
  },
};

export interface CameraEffectStylesType {
  glasses: {
    style: GlassesEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  beards: {
    style: BeardsEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  mustaches: {
    style: MustachesEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  masks: {
    style: MasksEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  hats: {
    style: HatsEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
  pets: {
    style: PetsEffectTypes;
    threeDim: boolean;
    transforms: {
      twoDimOffset: number;
      threeDimOffset: number;
      twoDimScale: number;
      threeDimScale: number;
    };
  };
}

export type BeardsEffectTypes =
  | "classicalCurlyBeard"
  | "chinBeard"
  | "fullBeard";
export type GlassesEffectTypes =
  | "defaultGlasses"
  | "AmericaGlasses"
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
  | "shades"
  | "steampunkGlasses"
  | "threeDGlasses"
  | "toyGlasses"
  | "VRGlasses";
export type MustachesEffectTypes =
  | "disguiseMustache"
  | "fullMustache"
  | "mustache1"
  | "mustache2"
  | "mustache3"
  | "mustache4"
  | "nicodemusMustache"
  | "pencilMustache"
  | "spongebobMustache"
  | "tinyMustache"
  | "wingedMustache";
export type MasksEffectTypes =
  | "baseMask"
  | "alienMask"
  | "clownMask"
  | "creatureMask"
  | "cyberMask"
  | "darkKnightMask"
  | "demonMask"
  | "gasMask1"
  | "gasMask2"
  | "gasMask3"
  | "gasMask4"
  | "masqueradeMask"
  | "metalManMask"
  | "oniMask"
  | "plagueDoctorMask"
  | "sixEyesMask"
  | "tenguMask"
  | "threeFaceMask"
  | "weldingMask"
  | "woodlandMask"
  | "woodPaintedMask"
  | "zombieMask";
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
  glasses: {
    style: defaultGlasses,
    threeDim: false,
    transforms: assetSizePositionMap.glasses[defaultGlasses],
  },
  beards: {
    style: defaultBeard,
    threeDim: false,
    transforms: assetSizePositionMap.beards[defaultBeard],
  },
  mustaches: {
    style: defaultMustache,
    threeDim: false,
    transforms: assetSizePositionMap.mustaches[defaultMustache],
  },
  masks: {
    style: defaultMask,
    threeDim: false,
    transforms: assetSizePositionMap.masks[defaultMask],
  },
  hats: {
    style: defaultHat,
    threeDim: false,
    transforms: assetSizePositionMap.hats[defaultHat],
  },
  pets: {
    style: defaultPet,
    threeDim: false,
    transforms: assetSizePositionMap.pets[defaultPet],
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
