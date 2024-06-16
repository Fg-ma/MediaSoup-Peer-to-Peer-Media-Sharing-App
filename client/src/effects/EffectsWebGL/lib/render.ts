import { EffectTypes } from "src/context/StreamsContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import updateTexture from "./updateTexture";
import { Uniforms } from "./setUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";

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
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean }
) => {
  updateTexture(gl, texture, video);

  if (effects.dogEars || effects.glasses) {
    await updateFaceLandmarks(
      gl,
      video,
      canvas,
      uniformLocations,
      effects,
      faceLandmarks
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
      faceLandmarks
    )
  );
};

export default render;
