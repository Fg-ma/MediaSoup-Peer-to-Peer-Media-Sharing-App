import { EffectTypes } from "src/context/StreamsContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import updateTexture from "./updateTexture";
import { Uniforms } from "./setUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarksNew from "./updateFaceLandmarksNew";
import { FaceMesh, Results } from "@mediapipe/face_mesh";

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
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[]
) => {
  updateTexture(gl, texture, video);

  if (effects.ears || effects.glasses || effects.beards || effects.mustaches) {
    await updateFaceLandmarksNew(
      gl,
      video,
      canvas,
      uniformLocations,
      effects,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults
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
      currentEffectsStyles,
      faceMesh,
      faceMeshResults
    )
  );
};

export default render;
