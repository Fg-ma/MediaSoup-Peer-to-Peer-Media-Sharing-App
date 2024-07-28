import { CameraEffectTypes } from "../../../context/StreamsContext";
import { LandmarkTypes } from "./FaceLandmarks";
import {
  BeardsEffectTypes,
  EarsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  MustachesEffectTypes,
} from "../../../context/CurrentEffectsStylesContext";

type DeadbandingTypes = "glasses" | "ears" | "beards" | "mustaches";

class Deadbanding {
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;

  private deadbandingValues: {
    glasses: {
      [glassesEffectType in GlassesEffectTypes]: {
        [landmarkType in LandmarkTypes]?: number;
      };
    };
    ears: {
      [earsEffectType in EarsEffectTypes]: {
        [landmarkType in LandmarkTypes]?: number;
      };
    };
    beards: {
      [beardsEffectType in BeardsEffectTypes]: {
        [landmarkType in LandmarkTypes]?: number;
      };
    };
    mustaches: {
      [mustachesEffectType in MustachesEffectTypes]: {
        [landmarkType in LandmarkTypes]?: number;
      };
    };
  } = {
    glasses: {
      defaultGlasses: {
        headRotationAngles: 0.05,
        eyesWidths: 0.025,
      },
      memeGlasses: {
        headRotationAngles: 0.05,
        headYawAngles: 0.05,
        headPitchAngles: 0.05,
        eyesWidths: 0.025,
      },
      americaGlasses: {
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
      shades: {
        headRotationAngles: 0.05,
        headYawAngles: 0.05,
        headPitchAngles: 0.05,
        eyesWidths: 0.05,
      },
    },
    ears: {
      dogEars: {
        headRotationAngles: 0.05,
        headYawAngles: 0.05,
        headPitchAngles: 0.05,
        leftEarWidths: 0.02,
        rightEarWidths: 0.02,
      },
    },
    beards: {
      classicalCurlyBeard: {
        headRotationAngles: 0.05,
        headYawAngles: 0.05,
        headPitchAngles: 0.05,
        chinWidths: 0.01,
      },
    },
    mustaches: {
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
      disguiseMustache: {
        headRotationAngles: 0.05,
        headYawAngles: 0.05,
        headPitchAngles: 0.05,
        eyesWidths: 0.01,
      },
    },
  };

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

    for (const type in this.deadbandingValues) {
      const effectType = type as DeadbandingTypes;
      if (
        effects[effectType] &&
        this.currentEffectsStyles.current.camera[id][effectType]
      ) {
        const style =
          this.currentEffectsStyles.current.camera[id][effectType].style;

        // @ts-ignore
        for (const deadbanding in this.deadbandingValues[effectType][style]) {
          const deadbandingType = deadbanding as LandmarkTypes;

          const newDeadbandingValue =
            // @ts-ignore
            this.deadbandingValues[effectType][style][deadbandingType];

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
