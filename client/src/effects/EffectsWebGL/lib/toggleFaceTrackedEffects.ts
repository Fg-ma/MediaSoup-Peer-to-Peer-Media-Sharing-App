import { EffectTypes } from "src/context/StreamsContext";
import { BaseUniforms } from "./initializeBaseUniforms";

const toggleFaceTrackedEffects = (
  toggleValue: 0 | 1,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseUniformLocations: {
    [uniform in BaseUniforms]: WebGLUniformLocation | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }
) => {
  if (effects.ears && baseUniformLocations.uEarsEffectLocation) {
    gl.uniform1i(baseUniformLocations.uEarsEffectLocation, toggleValue);
  }
  if (effects.glasses && baseUniformLocations.uGlassesEffectLocation) {
    gl.uniform1i(baseUniformLocations.uGlassesEffectLocation, toggleValue);
  }
  if (effects.beards && baseUniformLocations.uBeardEffectLocation) {
    gl.uniform1i(baseUniformLocations.uBeardEffectLocation, toggleValue);
  }
  if (effects.mustaches && baseUniformLocations.uMustacheEffectLocation) {
    gl.uniform1i(baseUniformLocations.uMustacheEffectLocation, toggleValue);
  }
};

export default toggleFaceTrackedEffects;
