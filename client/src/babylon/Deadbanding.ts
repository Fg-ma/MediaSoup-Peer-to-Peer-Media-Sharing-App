import {
  BeardsEffectTypes,
  UserEffectsStylesType,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
  CameraEffectTypes,
} from "../context/effectsContext/typeConstant";
import { LandmarkTypes } from "./FaceLandmarks";

type DeadbandingTypes =
  | "glasses"
  | "beards"
  | "mustaches"
  | "masks"
  | "hats"
  | "pets";

interface DeadbandingValues {
  glasses: {
    [glassesEffectType in GlassesEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
  beards: {
    [beardEffectType in BeardsEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
  mustaches: {
    [mustachesEffectType in MustachesEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
  masks: {
    [maskEffectType in MasksEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
  hats: {
    [hatEffectType in HatsEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
  pets: {
    [petEffectType in PetsEffectTypes]: {
      [landmarkType in LandmarkTypes]?: number;
    };
  };
}

const deadbandingValues: DeadbandingValues = {
  glasses: {
    defaultGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    AmericaGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    aviatorGoggles: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    bloodyGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    eyeProtectionGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses3: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses4: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses5: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    glasses6: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    memeGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    militaryTacticalGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    steampunkGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    threeDGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    toyGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    shades: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    VRGlasses: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
  beards: {
    classicalCurlyBeard: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    chinBeard: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    fullBeard: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
  mustaches: {
    disguiseMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    fullMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    mustache1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    mustache2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    mustache3: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    mustache4: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    nicodemusMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    pencilMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    spongebobMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    tinyMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    wingedMustache: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
  masks: {
    baseMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    alienMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    clownMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    creatureMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    cyberMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    darkKnightMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    demonMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    gasMask1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    gasMask2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    gasMask3: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    gasMask4: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    masqueradeMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    metalManMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    oniMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    plagueDoctorMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    sixEyesMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    tenguMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    threeFaceMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    weldingMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    woodlandMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    woodPaintedMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    zombieMask: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
  hats: {
    AsianConicalHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    aviatorHelmet: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    bicornHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    bicycleHelmet: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    captainsHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    chefHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    chickenHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    deadManHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    dogEars: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    flatCap: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    hardHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    hopliteHelmet: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    militaryHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    rabbitEars: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    santaHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    seamanHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    stylishHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    ushankaHat: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    vikingHelmet: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
  pets: {
    angryHamster: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    axolotl: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    babyDragon: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    beardedDragon: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
      foreheadPositions: 0.1,
    },
    bird1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    bird2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    boxer: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    brain: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    buddyHamster: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    cat1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    cat2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    dodoBird: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    happyHamster: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    mechanicalGrasshopper: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    panda1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    panda2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    petRock: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    pig: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    redFox1: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    redFox2: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    roboDog: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    skeletonTRex: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    snail: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    spinosaurus: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
    TRex: {
      headRotationAngles: 0.08,
      headYawAngles: 0.08,
      headPitchAngles: 0.08,
      interocularDistances: 0.01,
    },
  },
};

class Deadbanding {
  private deadbandingMap: {
    [cameraId in string]: {
      [landmarkType in LandmarkTypes]: number;
    };
  } = {};

  constructor(
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>
  ) {}

  update = (
    id: string,
    effects: {
      [effectType in CameraEffectTypes]?: boolean | undefined;
    }
  ) => {
    if (!this.deadbandingMap[id]) {
      this.deadbandingMap[id] = {
        interocularDistances: 0.0,
        headRotationAngles: 0.0,
        headYawAngles: 0.0,
        headPitchAngles: 0.0,
        eyesCenterPositions: 0.0,
        chinPositions: 0.0,
        nosePositions: 0.0,
        foreheadPositions: 0.0,
      };
    }

    for (const type in deadbandingValues) {
      const effectType = type as DeadbandingTypes;
      if (
        effects[effectType] &&
        this.userEffectsStyles.current.camera[id][effectType]
      ) {
        const style =
          this.userEffectsStyles.current.camera[id][effectType].style;

        // @ts-expect-error: no enforcement between effectType and style
        for (const deadbanding in deadbandingValues[effectType][style]) {
          const deadbandingType = deadbanding as LandmarkTypes;

          const newDeadbandingValue =
            // @ts-expect-error: no enforcement between effectType and style
            deadbandingValues[effectType][style][deadbandingType];

          if (newDeadbandingValue) {
            const currentDeadbandingValue =
              this.deadbandingMap[id][deadbandingType as LandmarkTypes] ?? 0;

            if (currentDeadbandingValue < newDeadbandingValue) {
              this.deadbandingMap[id][deadbandingType as LandmarkTypes] =
                newDeadbandingValue;
            }
          }
        }
      }
    }
  };

  getDeadbandingMaps() {
    return this.deadbandingMap;
  }

  getDeadbandingMapById(id: string) {
    return this.deadbandingMap[id];
  }
}

export default Deadbanding;
