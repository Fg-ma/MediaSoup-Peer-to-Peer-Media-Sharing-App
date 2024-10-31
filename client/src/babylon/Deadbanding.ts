import {
  BeardsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "../context/currentEffectsStylesContext/typeConstant";
import { CameraEffectTypes } from "../context/streamsContext/typeConstant";
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
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    AmericaGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    aviatorGoggles: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    bloodyGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    eyeProtectionGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses3: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses4: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses5: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    glasses6: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    memeGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    militaryTacticalGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    steampunkGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    threeDGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    toyGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    shades: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    VRGlasses: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
  beards: {
    classicalCurlyBeard: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    chinBeard: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    fullBeard: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
  mustaches: {
    disguiseMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    fullMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    mustache1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    mustache2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    mustache3: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    mustache4: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    nicodemusMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    pencilMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    spongebobMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    tinyMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    wingedMustache: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
  masks: {
    baseMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    alienMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    clownMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    creatureMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    cyberMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    darkKnightMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    demonMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    gasMask1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    gasMask2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    gasMask3: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    gasMask4: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    masqueradeMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    metalManMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    oniMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    plagueDoctorMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    sixEyesMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    tenguMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    threeFaceMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    weldingMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    woodlandMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    woodPaintedMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    zombieMask: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
  hats: {
    AsianConicalHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    aviatorHelmet: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    bicornHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    bicycleHelmet: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    captainsHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    chefHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    chickenHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    deadManHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    dogEars: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    flatCap: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    hardHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    hopliteHelmet: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    militaryHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    rabbitEars: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    roundEarsHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    santaHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    seamanHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    stylishHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    superMarioOdysseyHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    ushankaHat: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    vikingHelmet: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
  pets: {
    angryHamster: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    axolotl: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    babyDragon: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    beardedDragon: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
      foreheadPositions: 0.1,
    },
    bird1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    bird2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    boxer: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    brain: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    buddyHamster: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    cat1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    cat2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    dodoBird: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    happyHamster: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    mechanicalGrasshopper: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    panda1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    panda2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    petRock: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    pig: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    redFox1: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    redFox2: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    roboDog: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    skeletonTRex: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    snail: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    spinosaurus: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
    TRex: {
      headRotationAngles: 0.12,
      headYawAngles: 0.12,
      headPitchAngles: 0.12,
      interocularDistances: 0.03,
    },
  },
};

class Deadbanding {
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;

  private deadbandingMap: {
    [cameraId in string]: {
      [landmarkType in LandmarkTypes]: number;
    };
  } = {};

  constructor(currentEffectsStyles: React.MutableRefObject<EffectStylesType>) {
    this.currentEffectsStyles = currentEffectsStyles;
  }

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
        twoDimBeardOffsets: 0.0,
        twoDimMustacheOffsets: 0.0,
        threeDimBeardOffsets: 0.0,
        threeDimMustacheOffsets: 0.0,
      };
    }

    for (const type in deadbandingValues) {
      const effectType = type as DeadbandingTypes;
      if (
        effects[effectType] &&
        this.currentEffectsStyles.current.camera[id][effectType]
      ) {
        const style =
          this.currentEffectsStyles.current.camera[id][effectType].style;

        // @ts-ignore
        for (const deadbanding in deadbandingValues[effectType][style]) {
          const deadbandingType = deadbanding as LandmarkTypes;

          const newDeadbandingValue =
            // @ts-ignore
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
