import { EffectTypes } from "src/context/StreamsContext";
import updateBaseVideoTexture from "./updateBaseVideoTexture";
import { BaseUniformsLocations } from "./initializeBaseUniforms";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import { TriangleUniformsLocations } from "./initializeTriangleUniforms";
import { BaseAttributesLocations } from "./initializeBaseAttributes";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";
import applyFaceTracker from "./applyFaceTracker";
import landmarksSmoothWithDeadbanding from "./landmarksSmoothWithDeadbanding";
import drawMustacheMesh from "./drawMustacheMesh";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  triangleProgram: WebGLProgram,
  baseVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  baseUniformLocations: {
    [uniform in BaseUniformsLocations]: WebGLUniformLocation | null | undefined;
  },
  triangleUniformLocations: {
    [uniform in TriangleUniformsLocations]:
      | WebGLUniformLocation
      | null
      | undefined;
  },
  baseAttributeLocations: {
    [attribute in BaseAttributesLocations]: number | null | undefined;
  },
  triangleAttributeLocations: {
    [attribute in TriangleAttributesLocations]: number | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  triangleTexture: WebGLTexture | null | undefined,
  basePositionBuffer: WebGLBuffer,
  baseTexCoordBuffer: WebGLBuffer,
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  triangleIndexBuffer: WebGLBuffer
) => {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  updateBaseVideoTexture(
    gl,
    baseVideoTexture,
    video,
    baseProgram,
    basePositionBuffer,
    baseTexCoordBuffer,
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
      baseProgram,
      canvas,
      baseUniformLocations,
      effects,
      faceLandmarks,
      currentEffectsStyles
    );

    if (effects.faceMask && triangleTexture) {
      smoothedFaceIdLandmarksPairs.forEach((smoothedFaceIdLandmarksPair) => {
        // drawFaceMesh(
        //   gl,
        //   triangleProgram,
        //   smoothedFaceIdLandmarksPair.landmarks.slice(0, -10),
        //   triangleAttributeLocations,
        //   trianglePositionBuffer,
        //   triangleTexCoordBuffer,
        //   triangleIndexBuffer
        // );
        drawMustacheMesh(
          gl,
          triangleProgram,
          smoothedFaceIdLandmarksPair.landmarks.slice(0, -10),
          triangleAttributeLocations,
          trianglePositionBuffer,
          triangleTexCoordBuffer,
          triangleIndexBuffer
        );
      });
    }
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      baseProgram,
      triangleProgram,
      baseVideoTexture,
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
      basePositionBuffer,
      baseTexCoordBuffer,
      trianglePositionBuffer,
      triangleTexCoordBuffer,
      triangleIndexBuffer
    )
  );
};

export default render;
