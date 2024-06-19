import { EffectTypes } from "src/context/StreamsContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import updateTexture from "./updateTexture";
import { Uniforms } from "./setUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";

const render = async (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  updateTexture(gl, texture, video);

  if (effects.ears || effects.glasses || effects.beards || effects.mustaches) {
    await updateFaceLandmarks(
      gl,
      video,
      canvas,
      uniformLocations,
      effects,
      faceLandmarks,
      currentEffectsStyles
    );
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      texture,
      video,
      canvas,
      animationFrameId,
      effects,
      uniformLocations,
      faceLandmarks,
      currentEffectsStyles
    )
  );
};

export default render;
