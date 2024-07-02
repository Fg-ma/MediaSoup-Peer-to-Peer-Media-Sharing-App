import { EffectTypes } from "src/context/StreamsContext";
import { OneDimensionalVariableTypes } from "./updateFaceLandmarks";
import {
  BeardsEffectTypes,
  EarsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  MustachesEffectTypes,
} from "src/context/CurrentEffectsStylesContext";

const glassesDeadbandingMap: {
  [glassesEffectType in GlassesEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalVariableTypes]?: number;
  };
} = {
  defaultGlasses: {
    headRotationAngle: 0.05,
    eyesWidth: 0.025,
  },
  memeGlasses: {
    headRotationAngle: 0.05,
    eyesWidth: 0.025,
  },
  americaGlasses: {
    headRotationAngle: 0.05,
    eyesWidth: 0.05,
  },
  threeDGlasses: {
    headRotationAngle: 0.05,
    eyesWidth: 0.025,
  },
  shades: {
    headRotationAngle: 0.05,
    eyesWidth: 0.05,
  },
};

const earsDeadbandingMap: {
  [earsEffectType in EarsEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalVariableTypes]?: number;
  };
} = {
  dogEars: {
    headRotationAngle: 0.05,
    leftEarWidth: 0.2,
    rightEarWidth: 0.2,
  },
};

const beardsDeadbandingMap: {
  [beardsEffectType in BeardsEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalVariableTypes]?: number;
  };
} = {
  classicalCurlyBeard: {
    headRotationAngle: 0.05,
    chinWidth: 1.0,
  },
};

const mustachesDeadbandingMap: {
  [mustachesEffectType in MustachesEffectTypes]: {
    [oneDimensionalVariableType in OneDimensionalVariableTypes]?: number;
  };
} = {
  mustache1: { headRotationAngle: 0.05, eyesWidth: 0.4 },
  mustache2: { headRotationAngle: 0.05, eyesWidth: 0.4 },
  mustache3: { headRotationAngle: 0.05, eyesWidth: 0.4 },
  mustache4: { headRotationAngle: 0.05, eyesWidth: 0.4 },
  disguiseMustache: { headRotationAngle: 0.05, eyesWidth: 0.4 },
};

export const oneDimensionalDeadbandingMap: {
  [oneDimensionalVariableType in OneDimensionalVariableTypes]: number;
} = {
  leftEarWidth: 0.0,
  rightEarWidth: 0.0,
  eyesWidth: 0.0,
  chinWidth: 0.0,
  headRotationAngle: 0.0,
  interocularDistance: 0.0,
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
      const deadbandingType = deadbanding as OneDimensionalVariableTypes;

      const earsDeadbandingValue =
        earsDeadbandingMap[currentEffectsStyles.current.ears.style][
          deadbandingType
        ];

      if (earsDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < earsDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] = earsDeadbandingValue;
        }
      }
    }
  }
  if (effects.glasses) {
    for (const deadbanding in glassesDeadbandingMap[
      currentEffectsStyles.current.glasses.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalVariableTypes;

      const glassesDeadbandingValue =
        glassesDeadbandingMap[currentEffectsStyles.current.glasses.style][
          deadbandingType
        ];

      if (glassesDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < glassesDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] = glassesDeadbandingValue;
        }
      }
    }
  }
  if (effects.beards) {
    for (const deadbanding in beardsDeadbandingMap[
      currentEffectsStyles.current.beards.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalVariableTypes;

      const beardsDeadbandingValue =
        beardsDeadbandingMap[currentEffectsStyles.current.beards.style][
          deadbandingType
        ];

      if (beardsDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < beardsDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] = beardsDeadbandingValue;
        }
      }
    }
  }
  if (effects.mustaches) {
    for (const deadbanding in mustachesDeadbandingMap[
      currentEffectsStyles.current.mustaches.style
    ]) {
      const deadbandingType = deadbanding as OneDimensionalVariableTypes;

      const mustachesDeadbandingValue =
        mustachesDeadbandingMap[currentEffectsStyles.current.mustaches.style][
          deadbandingType
        ];

      if (mustachesDeadbandingValue) {
        const oneDimensionalDeadbandingValue =
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] ?? 0;

        if (oneDimensionalDeadbandingValue < mustachesDeadbandingValue) {
          oneDimensionalDeadbandingMap[
            deadbandingType as OneDimensionalVariableTypes
          ] = mustachesDeadbandingValue;
        }
      }
    }
  }
};

export default updateDeadbandingMaps;
