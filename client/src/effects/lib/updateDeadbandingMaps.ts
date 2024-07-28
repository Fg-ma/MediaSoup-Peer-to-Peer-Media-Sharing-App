import { CameraEffectTypes } from "../../context/StreamsContext";
import { LandmarkTypes } from "./FaceLandmarks";
import {
  BeardsEffectTypes,
  EarsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  MustachesEffectTypes,
} from "../../context/CurrentEffectsStylesContext";

const glassesDeadbandingMap: {
  [glassesEffectType in GlassesEffectTypes]: {
    [landmarkType in LandmarkTypes]?: number;
  };
} = {
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
};

const earsDeadbandingMap: {
  [earsEffectType in EarsEffectTypes]: {
    [landmarkType in LandmarkTypes]?: number;
  };
} = {
  dogEars: {
    headRotationAngles: 0.05,
    headYawAngles: 0.05,
    headPitchAngles: 0.05,
    leftEarWidths: 0.02,
    rightEarWidths: 0.02,
  },
};

const beardsDeadbandingMap: {
  [beardsEffectType in BeardsEffectTypes]: {
    [landmarkType in LandmarkTypes]?: number;
  };
} = {
  classicalCurlyBeard: {
    headRotationAngles: 0.05,
    headYawAngles: 0.05,
    headPitchAngles: 0.05,
    chinWidths: 0.01,
  },
};

const mustachesDeadbandingMap: {
  [mustachesEffectType in MustachesEffectTypes]: {
    [landmarkType in LandmarkTypes]?: number;
  };
} = {
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
};

export const deadbandingMap: {
  [landmarkType in LandmarkTypes]: number;
} = {
  leftEarWidths: 0.0,
  rightEarWidths: 0.0,
  eyesWidths: 0.0,
  chinWidths: 0.0,
  headRotationAngles: 0.0,
  headYawAngles: 0.0,
  headPitchAngles: 0.0,
  interocularDistances: 0.0,
};

const updateDeadbandingMaps = (
  id: string,
  effects: {
    [effectType in CameraEffectTypes]?: boolean | undefined;
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  if (effects.ears && currentEffectsStyles.current.camera[id].ears) {
    for (const deadbanding in earsDeadbandingMap[
      currentEffectsStyles.current.camera[id].ears.style
    ]) {
      const deadbandingType = deadbanding as LandmarkTypes;

      const earsDeadbandingValue =
        earsDeadbandingMap[currentEffectsStyles.current.camera[id].ears.style][
          deadbandingType
        ];

      if (earsDeadbandingValue) {
        const currentDeadbandingValue =
          deadbandingMap[deadbandingType as LandmarkTypes] ?? 0;

        if (currentDeadbandingValue < earsDeadbandingValue) {
          deadbandingMap[deadbandingType as LandmarkTypes] =
            earsDeadbandingValue;
        }
      }
    }
  }
  if (effects.glasses && currentEffectsStyles.current.camera[id].glasses) {
    for (const deadbanding in glassesDeadbandingMap[
      currentEffectsStyles.current.camera[id].glasses.style
    ]) {
      const deadbandingType = deadbanding as LandmarkTypes;

      const glassesDeadbandingValue =
        glassesDeadbandingMap[
          currentEffectsStyles.current.camera[id].glasses.style
        ][deadbandingType];

      if (glassesDeadbandingValue) {
        const currentDeadbandingValue =
          deadbandingMap[deadbandingType as LandmarkTypes] ?? 0;

        if (currentDeadbandingValue < glassesDeadbandingValue) {
          deadbandingMap[deadbandingType as LandmarkTypes] =
            glassesDeadbandingValue;
        }
      }
    }
  }
  if (effects.beards && currentEffectsStyles.current.camera[id].beards) {
    for (const deadbanding in beardsDeadbandingMap[
      currentEffectsStyles.current.camera[id].beards.style
    ]) {
      const deadbandingType = deadbanding as LandmarkTypes;

      const beardsDeadbandingValue =
        beardsDeadbandingMap[
          currentEffectsStyles.current.camera[id].beards.style
        ][deadbandingType];

      if (beardsDeadbandingValue) {
        const currentDeadbandingValue =
          deadbandingMap[deadbandingType as LandmarkTypes] ?? 0;

        if (currentDeadbandingValue < beardsDeadbandingValue) {
          deadbandingMap[deadbandingType as LandmarkTypes] =
            beardsDeadbandingValue;
        }
      }
    }
  }
  if (effects.mustaches && currentEffectsStyles.current.camera[id].mustaches) {
    for (const deadbanding in mustachesDeadbandingMap[
      currentEffectsStyles.current.camera[id].mustaches.style
    ]) {
      const deadbandingType = deadbanding as LandmarkTypes;

      const mustachesDeadbandingValue =
        mustachesDeadbandingMap[
          currentEffectsStyles.current.camera[id].mustaches.style
        ][deadbandingType];

      if (mustachesDeadbandingValue) {
        const currentDeadbandingValue =
          deadbandingMap[deadbandingType as LandmarkTypes] ?? 0;

        if (currentDeadbandingValue < mustachesDeadbandingValue) {
          deadbandingMap[deadbandingType as LandmarkTypes] =
            mustachesDeadbandingValue;
        }
      }
    }
  }
};

export default updateDeadbandingMaps;
