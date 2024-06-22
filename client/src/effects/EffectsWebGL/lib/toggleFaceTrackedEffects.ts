import { EffectTypes } from "src/context/StreamsContext";
import { Uniforms } from "./setUniforms";

const toggleFaceTrackedEffects = (
  toggleValue: 0 | 1,
  gl: WebGLRenderingContext,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }
) => {
  if (effects.ears && uniformLocations.uEarsEffectLocation) {
    gl.uniform1i(uniformLocations.uEarsEffectLocation, toggleValue);
  }
  if (effects.glasses && uniformLocations.uGlassesEffectLocation) {
    gl.uniform1i(uniformLocations.uGlassesEffectLocation, toggleValue);
  }
  if (effects.beards && uniformLocations.uBeardEffectLocation) {
    gl.uniform1i(uniformLocations.uBeardEffectLocation, toggleValue);
  }
  if (effects.mustaches && uniformLocations.uMustacheEffectLocation) {
    gl.uniform1i(uniformLocations.uMustacheEffectLocation, toggleValue);
  }
};

export default toggleFaceTrackedEffects;
