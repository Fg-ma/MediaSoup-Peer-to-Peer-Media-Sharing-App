import { EffectTypes } from "src/context/StreamsContext";
import updateBaseVideoTexture from "./updateBaseVideoTexture";
// import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateFaceLandmarks from "./updateFaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import applyFaceTracker from "./applyFaceTracker";
import landmarksSmoothWithDeadbanding from "./landmarksSmoothWithDeadbanding";
import drawMustacheMesh from "./drawMustacheMesh";
import { BaseShader, BaseShader2 } from "./createBaseShader";
import TriangleShader from "./createTriangleShader";
import FaceLandmarks from "./FaceLandmarks";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader2,
  triangleShader: TriangleShader,
  faceLandmarks: FaceLandmarks,
  baseVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  // faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[],
  triangleTexture: WebGLTexture | null | undefined,
  urls: string[]
) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // updateBaseVideoTexture(gl, baseVideoTexture, video, baseShader);

  baseShader.updateVideoTexture(video);

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

    if (
      effects.ears ||
      effects.glasses ||
      effects.beards ||
      effects.mustaches
    ) {
      faceLandmarks.update(multiFaceLandmarks);
    }

    for (const {
      faceId,
      landmarks,
    } of faceLandmarks.getFaceIdLandmarksPairs()) {
      if (effects.ears) {
        const earsImageOffset =
          faceLandmarks.getCalculatedLandmarks().earsImageOffsets[faceId];

        baseShader.drawEffect(
          urls[1],
          {
            x: 2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].x - 1,
            y: -2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].y + 1,
          },
          {
            x: earsImageOffset[0],
            y: earsImageOffset[1],
          },
          faceLandmarks.getCalculatedLandmarks().rightEarWidths[faceId],
          faceLandmarks.getCalculatedLandmarks().headRotationAngles[faceId]
        );

        baseShader.drawEffect(
          urls[0],
          {
            x: 2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].x - 1,
            y: -2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].y + 1,
          },
          {
            x: earsImageOffset[0],
            y: earsImageOffset[1],
          },
          faceLandmarks.getCalculatedLandmarks().leftEarWidths[faceId],
          faceLandmarks.getCalculatedLandmarks().headRotationAngles[faceId]
        );
      }
      if (effects.glasses) {
        const eyesCenterPosition =
          faceLandmarks.getCalculatedLandmarks().eyesCenterPositions[faceId];

        baseShader.drawEffect(
          urls[2],
          {
            x: 2 * eyesCenterPosition[0] - 1,
            y: -2 * eyesCenterPosition[1] + 1,
          },
          {
            x: 0,
            y: 0,
          },
          faceLandmarks.getCalculatedLandmarks().eyesWidths[faceId],
          faceLandmarks.getCalculatedLandmarks().headRotationAngles[faceId]
        );
      }
      if (effects.beards) {
        baseShader.drawEffect(
          urls[3],
          {
            x: 2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].x - 1,
            y: -2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].y + 1,
          },
          {
            x: faceLandmarks.getCalculatedLandmarks().beardImageOffsets[
              faceId
            ][0],
            y: faceLandmarks.getCalculatedLandmarks().beardImageOffsets[
              faceId
            ][1],
          },
          faceLandmarks.getCalculatedLandmarks().chinWidths[faceId],
          faceLandmarks.getCalculatedLandmarks().headRotationAngles[faceId]
        );
      }
      if (effects.mustaches) {
        baseShader.drawEffect(
          urls[4],
          {
            x: 2 * landmarks[faceLandmarks.NOSE_INDEX].x - 1,
            y: -2 * landmarks[faceLandmarks.NOSE_INDEX].y + 1,
          },
          {
            x: faceLandmarks.getCalculatedLandmarks().mustacheImageOffsets[
              faceId
            ][0],
            y: faceLandmarks.getCalculatedLandmarks().mustacheImageOffsets[
              faceId
            ][1],
          },
          faceLandmarks.getCalculatedLandmarks().eyesWidths[faceId],
          faceLandmarks.getCalculatedLandmarks().headRotationAngles[faceId]
        );
      }
    }

    if (effects.faceMask && triangleTexture) {
      faceLandmarks
        .getFaceIdLandmarksPairs()
        .forEach((smoothedFaceIdLandmarksPair) => {
          // drawFaceMesh(
          //   gl,
          //   smoothedFaceIdLandmarksPair.landmarks.slice(0, -10),
          //   triangleShader
          // );
          drawMustacheMesh(gl, triangleShader);
        });
    }
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      baseShader,
      triangleShader,
      faceLandmarks,
      baseVideoTexture,
      video,
      canvas,
      animationFrameId,
      effects,
      // faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture,
      urls
    )
  );
};

export default render;
