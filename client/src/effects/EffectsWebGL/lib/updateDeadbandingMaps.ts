import { EffectTypes } from "src/context/StreamsContext";
import {
  OneDimensionalVariableTypes,
  TwoDimensionalVariableTypes,
} from "./updateFaceLandmarks";
import {
  BeardsEffectTypes,
  EarsEffectTypes,
  EffectStylesType,
  GlassesEffectTypes,
  MustachesEffectTypes,
} from "src/context/CurrentEffectsStylesContext";

const glassesDeadbandingMap: {
  [glassesEffectType in GlassesEffectTypes]: {
    [oneDimensionalVariableType in
      | OneDimensionalVariableTypes
      | TwoDimensionalVariableTypes]?: number;
  };
} = {
  defaultGlasses: {
    headRotationAngle: 0.05,
    eyesCenterPosition: 0.01,
    eyesWidth: 0.025,
  },
  memeGlasses: {
    headRotationAngle: 0.05,
    eyesCenterPosition: 0.01,
    eyesWidth: 0.025,
  },
  americaGlasses: {
    headRotationAngle: 0.05,
    eyesCenterPosition: 0.01,
    eyesWidth: 0.05,
  },
  threeDGlasses: {
    headRotationAngle: 0.05,
    eyesCenterPosition: 0.01,
    eyesWidth: 0.025,
  },
  shades: {
    headRotationAngle: 0.05,
    eyesCenterPosition: 0.01,
    eyesWidth: 0.05,
  },
};

const earsDeadbandingMap: {
  [earsEffectType in EarsEffectTypes]: {
    [oneDimensionalVariableType in
      | OneDimensionalVariableTypes
      | TwoDimensionalVariableTypes]?: number;
  };
} = {
  dogEars: {
    headRotationAngle: 0.05,
    leftEyePosition: 0.01,
    rightEyePosition: 0.01,
    leftEarWidth: 0.2,
    rightEarWidth: 0.2,
  },
};

const beardsDeadbandingMap: {
  [beardsEffectType in BeardsEffectTypes]: {
    [oneDimensionalVariableType in
      | OneDimensionalVariableTypes
      | TwoDimensionalVariableTypes]?: number;
  };
} = {
  classicalCurlyBeard: {
    headRotationAngle: 0.05,
    chinPosition: 0.015,
    chinWidth: 1.0,
  },
};

const mustachesDeadbandingMap: {
  [mustachesEffectType in MustachesEffectTypes]: {
    [oneDimensionalVariableType in
      | OneDimensionalVariableTypes
      | TwoDimensionalVariableTypes]?: number;
  };
} = {
  mustache1: { headRotationAngle: 0.05, nosePosition: 0.01, eyesWidth: 0.4 },
  mustache2: { headRotationAngle: 0.05, nosePosition: 0.01, eyesWidth: 0.4 },
  mustache3: { headRotationAngle: 0.05, nosePosition: 0.01, eyesWidth: 0.4 },
  mustache4: { headRotationAngle: 0.05, nosePosition: 0.01, eyesWidth: 0.4 },
  disguiseMustache: {
    headRotationAngle: 0.05,
    nosePosition: 0.01,
    eyesWidth: 0.4,
  },
};

export const oneDimensionalDeadbandingMap: {
  [oneDimensionalVariableType in OneDimensionalVariableTypes]: number;
} = {
  leftEarWidth: 0.0,
  rightEarWidth: 0.0,
  eyesWidth: 0.0,
  chinWidth: 0.0,
  headRotationAngle: 0.0,
  headPitchAngle: 0.0,
  headYawAngle: 0.0,
  interocularDistance: 0.0,
};

export const twoDimensionalDeadbandingMap: {
  [oneDimensionalVariableType in TwoDimensionalVariableTypes]: number;
} = {
  eyesCenterPosition: 0.0,
  leftEyePosition: 0.0,
  rightEyePosition: 0.0,
  nosePosition: 0.0,
  chinPosition: 0.0,
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
      const deadbandingType = deadbanding as
        | OneDimensionalVariableTypes
        | TwoDimensionalVariableTypes;

      const earsDeadbandingValue =
        earsDeadbandingMap[currentEffectsStyles.current.ears.style][
          deadbandingType
        ];

      if (earsDeadbandingValue) {
        if (deadbandingType in oneDimensionalDeadbandingMap) {
          const oneDimensionalDeadbandingValue =
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] ?? 0;

          if (oneDimensionalDeadbandingValue < earsDeadbandingValue) {
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] = earsDeadbandingValue;
          }
        } else if (deadbandingType in twoDimensionalDeadbandingMap) {
          const twoDimensionalDeadbandingValue =
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] ?? 0;

          if (twoDimensionalDeadbandingValue < earsDeadbandingValue) {
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] = earsDeadbandingValue;
          }
        }
      }
    }
  }
  if (effects.glasses) {
    for (const deadbanding in glassesDeadbandingMap[
      currentEffectsStyles.current.glasses.style
    ]) {
      const deadbandingType = deadbanding as
        | OneDimensionalVariableTypes
        | TwoDimensionalVariableTypes;

      const glassesDeadbandingValue =
        glassesDeadbandingMap[currentEffectsStyles.current.glasses.style][
          deadbandingType
        ];

      if (glassesDeadbandingValue) {
        if (deadbandingType in oneDimensionalDeadbandingMap) {
          const oneDimensionalDeadbandingValue =
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] ?? 0;

          if (oneDimensionalDeadbandingValue < glassesDeadbandingValue) {
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] = glassesDeadbandingValue;
          }
        } else if (deadbandingType in twoDimensionalDeadbandingMap) {
          const twoDimensionalDeadbandingValue =
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] ?? 0;

          if (twoDimensionalDeadbandingValue < glassesDeadbandingValue) {
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] = glassesDeadbandingValue;
          }
        }
      }
    }
  }
  if (effects.beards) {
    for (const deadbanding in beardsDeadbandingMap[
      currentEffectsStyles.current.beards.style
    ]) {
      const deadbandingType = deadbanding as
        | OneDimensionalVariableTypes
        | TwoDimensionalVariableTypes;

      const beardsDeadbandingValue =
        beardsDeadbandingMap[currentEffectsStyles.current.beards.style][
          deadbandingType
        ];

      if (beardsDeadbandingValue) {
        if (deadbandingType in oneDimensionalDeadbandingMap) {
          const oneDimensionalDeadbandingValue =
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] ?? 0;

          if (oneDimensionalDeadbandingValue < beardsDeadbandingValue) {
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] = beardsDeadbandingValue;
          }
        } else if (deadbandingType in twoDimensionalDeadbandingMap) {
          const twoDimensionalDeadbandingValue =
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] ?? 0;

          if (twoDimensionalDeadbandingValue < beardsDeadbandingValue) {
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] = beardsDeadbandingValue;
          }
        }
      }
    }
  }
  if (effects.mustaches) {
    for (const deadbanding in mustachesDeadbandingMap[
      currentEffectsStyles.current.mustaches.style
    ]) {
      const deadbandingType = deadbanding as
        | OneDimensionalVariableTypes
        | TwoDimensionalVariableTypes;

      const mustachesDeadbandingValue =
        mustachesDeadbandingMap[currentEffectsStyles.current.mustaches.style][
          deadbandingType
        ];

      if (mustachesDeadbandingValue) {
        if (deadbandingType in oneDimensionalDeadbandingMap) {
          const oneDimensionalDeadbandingValue =
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] ?? 0;

          if (oneDimensionalDeadbandingValue < mustachesDeadbandingValue) {
            oneDimensionalDeadbandingMap[
              deadbandingType as OneDimensionalVariableTypes
            ] = mustachesDeadbandingValue;
          }
        } else if (deadbandingType in twoDimensionalDeadbandingMap) {
          const twoDimensionalDeadbandingValue =
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] ?? 0;

          if (twoDimensionalDeadbandingValue < mustachesDeadbandingValue) {
            twoDimensionalDeadbandingMap[
              deadbandingType as TwoDimensionalVariableTypes
            ] = mustachesDeadbandingValue;
          }
        }
      }
    }
  }
};

export default updateDeadbandingMaps;
