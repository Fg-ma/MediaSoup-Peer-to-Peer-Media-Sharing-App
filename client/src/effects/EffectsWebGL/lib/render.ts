import { EffectTypes } from "src/context/StreamsContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import updateVideoTexture from "./updateVideoTexture";
import { Uniforms } from "./setUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarksNew from "./updateFaceLandmarksNew";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { Attributes } from "./setAttributes";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  triangleProgram: WebGLProgram,
  videoTexture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  attributeLocations: {
    [uniform in Attributes]: number | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  triangleTexture: WebGLTexture,
  videoPositionBuffer: WebGLBuffer,
  videoTexCoordBuffer: WebGLBuffer
) => {
  updateVideoTexture(
    gl,
    videoTexture,
    video,
    videoProgram,
    videoPositionBuffer,
    videoTexCoordBuffer
  );

  if (effects.ears || effects.glasses || effects.beards || effects.mustaches) {
    await updateFaceLandmarksNew(
      gl,
      videoProgram,
      triangleProgram,
      video,
      canvas,
      uniformLocations,
      attributeLocations,
      effects,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture
    );
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      videoProgram,
      triangleProgram,
      videoTexture,
      video,
      canvas,
      animationFrameId,
      effects,
      uniformLocations,
      attributeLocations,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture,
      videoPositionBuffer,
      videoTexCoordBuffer
    )
  );
};

export default render;
