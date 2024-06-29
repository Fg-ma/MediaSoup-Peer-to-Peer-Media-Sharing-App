import { EffectTypes } from "src/context/StreamsContext";
import updateVideoTexture from "./updateVideoTexture";
import { BaseUniforms } from "./initializeBaseUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import { TriangleUniforms } from "./initializeTriangleUniforms";
import { BaseAttributes } from "./initializeBaseAttributes";
import { TriangleAttributes } from "./initializeTriangleAttributes";
import applyFaceTracker from "./applyFaceTracker";
import landmarksSmoothWithDeadbanding from "./landmarksSmoothWithDeadbanding";

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
  baseUniformLocations: {
    [uniform in BaseUniforms]: WebGLUniformLocation | null | undefined;
  },
  triangleUniformLocations: {
    [uniform in TriangleUniforms]: WebGLUniformLocation | null | undefined;
  },
  baseAttributeLocations: {
    [uniform in BaseAttributes]: number | null | undefined;
  },
  triangleAttributeLocations: {
    [uniform in TriangleAttributes]: number | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  triangleTexture: WebGLTexture | null | undefined,
  videoPositionBuffer: WebGLBuffer,
  videoTexCoordBuffer: WebGLBuffer
) => {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  updateVideoTexture(
    gl,
    videoTexture,
    video,
    videoProgram,
    videoPositionBuffer,
    videoTexCoordBuffer,
    baseAttributeLocations
  );

  if (
    effects.ears ||
    effects.glasses ||
    effects.beards ||
    effects.mustaches ||
    effects.faceMask
  ) {
    await faceMesh.send({ image: video });
    if (!faceMeshResults[0]) {
      return;
    }
    const multiFaceLandmarks = faceMeshResults[0].multiFaceLandmarks;
    if (!multiFaceLandmarks) {
      return;
    }

    const faceIdLandmarksPairs = applyFaceTracker(multiFaceLandmarks);

    const smoothedFaceIdLandmarksPairs =
      landmarksSmoothWithDeadbanding(faceIdLandmarksPairs);

    await updateFaceLandmarks(
      smoothedFaceIdLandmarksPairs,
      gl,
      videoProgram,
      canvas,
      baseUniformLocations,
      effects,
      faceLandmarks,
      currentEffectsStyles
    );

    if (effects.faceMask && triangleTexture) {
      smoothedFaceIdLandmarksPairs.forEach((smoothedFaceIdLandmarksPair) => {
        drawFaceMesh(
          gl,
          triangleProgram,
          smoothedFaceIdLandmarksPair.landmarks.slice(0, -10),
          triangleUniformLocations,
          triangleAttributeLocations,
          triangleTexture
        );
      });
    }
  }

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
      baseUniformLocations,
      triangleUniformLocations,
      baseAttributeLocations,
      triangleAttributeLocations,
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
