import { EffectTypes } from "src/context/StreamsContext";
import { OneDimensionalLandmarkTypes } from "./FaceLandmarks";
import {
  BeardsEffectTypes,
  EarsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  MustachesEffectTypes,
} from "src/context/CurrentEffectsStylesContext";

const glassesDeadbandingMap: {
  [glassesEffectType in GlassesEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalLandmarkTypes]?: number;
  };
} = {
  defaultGlasses: {
    headRotationAngles: 0.05,
    eyesWidths: 0.025,
  },
  memeGlasses: {
    headRotationAngles: 0.05,
    eyesWidths: 0.025,
  },
  americaGlasses: {
    headRotationAngles: 0.05,
    eyesWidths: 0.05,
  },
  threeDGlasses: {
    headRotationAngles: 0.05,
    eyesWidths: 0.025,
  },
  shades: {
    headRotationAngles: 0.05,
    eyesWidths: 0.05,
  },
};

const earsDeadbandingMap: {
  [earsEffectType in EarsEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalLandmarkTypes]?: number;
  };
} = {
  dogEars: {
    headRotationAngles: 0.05,
    leftEarWidths: 0.02,
    rightEarWidths: 0.02,
  },
};

const beardsDeadbandingMap: {
  [beardsEffectType in BeardsEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalLandmarkTypes]?: number;
  };
} = {
  classicalCurlyBeard: {
    headRotationAngles: 0.05,
    chinWidths: 1.0,
  },
};

const mustachesDeadbandingMap: {
  [mustachesEffectType in MustachesEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalLandmarkTypes]?: number;
  };
} = {
  mustache1: { headRotationAngles: 0.05, eyesWidths: 0.4 },
  mustache2: { headRotationAngles: 0.05, eyesWidths: 0.4 },
  mustache3: { headRotationAngles: 0.05, eyesWidths: 0.4 },
  mustache4: { headRotationAngles: 0.05, eyesWidths: 0.4 },
  disguiseMustache: { headRotationAngles: 0.05, eyesWidths: 0.4 },
};

export const oneDimensionalDeadbandingMap: {
  [oneDimensionalVariableType in OneDimensionalLandmarkTypes]: number;
} = {
  leftEarWidths: 0.0,
  rightEarWidths: 0.0,
  eyesWidths: 0.0,
  chinWidths: 0.0,
  headRotationAngles: 0.0,
  headYawAngles: 0.0,
  interocularDistances: 0.0,
};

const updateDeadbandingMaps = (
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  if (effects.ears) {
    for (const deadbanding in earsDeadbandingMap[
      currentEffectsStyles.current.ears.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalLandmarkTypes;

      const earsDeadbandingValue =
        earsDeadbandingMap[currentEffectsStyles.current.ears.style][
          deadbandingType
        ];

      if (earsDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < earsDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] = earsDeadbandingValue;
        }
      }
    }
  }
  if (effects.glasses) {
    for (const deadbanding in glassesDeadbandingMap[
      currentEffectsStyles.current.glasses.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalLandmarkTypes;

      const glassesDeadbandingValue =
        glassesDeadbandingMap[currentEffectsStyles.current.glasses.style][
          deadbandingType
        ];

      if (glassesDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < glassesDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] = glassesDeadbandingValue;
        }
      }
    }
  }
  if (effects.beards) {
    for (const deadbanding in beardsDeadbandingMap[
      currentEffectsStyles.current.beards.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalLandmarkTypes;

      const beardsDeadbandingValue =
        beardsDeadbandingMap[currentEffectsStyles.current.beards.style][
          deadbandingType
        ];

      if (beardsDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < beardsDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] = beardsDeadbandingValue;
        }
      }
    }
  }
  if (effects.mustaches) {
    for (const deadbanding in mustachesDeadbandingMap[
      currentEffectsStyles.current.mustaches.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalLandmarkTypes;

      const mustachesDeadbandingValue =
        mustachesDeadbandingMap[currentEffectsStyles.current.mustaches.style][
          deadbandingType
        ];

      if (mustachesDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < mustachesDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalLandmarkTypes
          ] = mustachesDeadbandingValue;
        }
      }
    }
  }
};

export default updateDeadbandingMaps;
