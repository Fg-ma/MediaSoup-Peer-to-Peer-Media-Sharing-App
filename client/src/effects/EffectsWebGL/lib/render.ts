import { EffectTypes } from "src/context/StreamsContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import updateTexture from "./updateTexture";

const render = async (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement,
  animationFrameId: number[],
  program: WebGLProgram,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }
) => {
  updateTexture(gl, texture, video);

  if (effects.dogEars) {
    await updateFaceLandmarks(gl, video, program);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  animationFrameId[0] = requestAnimationFrame(() =>
    render(gl, texture, video, animationFrameId, program, effects)
  );
};

export default render;
