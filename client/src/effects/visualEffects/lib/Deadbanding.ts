import { CameraEffectTypes } from "../../../context/StreamsContext";
import { LandmarkTypes } from "./FaceLandmarks";
import {
  BeardsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "../../../context/CurrentEffectsStylesContext";

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
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.025,
    },
    AmericaGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    aviatorGoggles: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    bloodyGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    eyeProtectionGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses3: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses4: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses5: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    glasses6: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    memeGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.025,
    },
    militaryTacticalGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    steampunkGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    threeDGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.025,
    },
    toyGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    shades: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
    VRGlasses: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.05,
    },
  },
  beards: {
    classicalCurlyBeard: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      chinWidths: 0.01,
    },
    chinBeard: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      chinWidths: 0.01,
    },
    fullBeard: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      chinWidths: 0.01,
    },
  },
  mustaches: {
    disguiseMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    fullMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    mustache1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    mustache2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    mustache3: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    mustache4: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    nicodemusMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    pencilMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    spongebobMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    tinyMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
    wingedMustache: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
      eyesWidths: 0.01,
    },
  },
  masks: {
    baseMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    alienMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    clownMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    creatureMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    cyberMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    darkKnightMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    demonMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    gasMask1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    gasMask2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    gasMask3: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    gasMask4: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    masqueradeMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    metalManMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    oniMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    plagueDoctorMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    sixEyesMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    tenguMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    threeFaceMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    weldingMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    woodlandMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    woodPaintedMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    zombieMask: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
  },
  hats: {
    AsianConicalHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    aviatorHelmet: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    bicornHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    bicycleHelmet: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    captainsHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    chefHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    chickenHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    deadManHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    dogEars: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    flatCap: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    hardHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    hopliteHelmet: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    militaryHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    rabbitEars: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    roundEarsHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    santaHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    seamanHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    stylishHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    superMarioOdysseyHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    ushankaHat: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    vikingHelmet: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
  },
  pets: {
    angryHamster: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    axolotl: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    babyDragon: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    beardedDragon: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    bird1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    bird2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    boxer: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    brain: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    buddyHamster: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    cat1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    cat2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    dodoBird: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    happyHamster: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    mechanicalGrasshopper: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    panda1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    panda2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    petRock: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    pig: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    redFox1: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    redFox2: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    roboDog: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    skeletonTRex: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    snail: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    spinosaurus: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
    },
    TRex: {
      headRotationAngles: 0.05,
      headYawAngles: 0.05,
      headPitchAngles: 0.05,
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
        leftEarWidths: 0.0,
        rightEarWidths: 0.0,
        eyesWidths: 0.0,
        chinWidths: 0.0,
        headRotationAngles: 0.0,
        headYawAngles: 0.0,
        headPitchAngles: 0.0,
        interocularDistances: 0.0,
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
