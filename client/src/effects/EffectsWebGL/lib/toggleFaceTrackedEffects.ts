import { EffectTypes } from "src/context/StreamsContext";
import BaseShader from "./createBaseShader";
import {
  BEARD_EFFECT,
  BLUR_EFFECT,
  GLASSES_EFFECT,
  LEFT_EAR_EFFECT,
  MUSTACHE_EFFECT,
  RIGHT_EAR_EFFECT,
  TINT_EFFECT,
} from "./initializeBaseUniforms";

const toggleFaceTrackedEffects = (
  toggleValue: 0 | 1,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader
) => {
  let effectFlags = 0;

  // Set the corresponding bits based on the active effects
  if (toggleValue) effectFlags |= 1 << LEFT_EAR_EFFECT;
  if (toggleValue) effectFlags |= 1 << RIGHT_EAR_EFFECT;
  if (toggleValue) effectFlags |= 1 << GLASSES_EFFECT;
  if (toggleValue) effectFlags |= 1 << BEARD_EFFECT;
  if (toggleValue) effectFlags |= 1 << MUSTACHE_EFFECT;
  if (toggleValue) effectFlags |= 1 << BLUR_EFFECT;
  if (toggleValue) effectFlags |= 1 << TINT_EFFECT;

  // Set the uniform value
  gl.uniform1i(baseShader.effectFlagsLocation, effectFlags);
};

export default toggleFaceTrackedEffects;
