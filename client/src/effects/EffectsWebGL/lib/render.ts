import { EffectTypes } from "src/context/StreamsContext";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import drawFaceMesh from "./drawFaceMesh";
import drawMustacheMesh from "./drawMustacheMesh";
import BaseShader from "./BaseShader";
import TriangleShader from "./TriangleShader";
import FaceLandmarks from "./FaceLandmarks";
import { URLsTypes } from "../handleEffectWebGL";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  triangleShader: TriangleShader,
  faceLandmarks: FaceLandmarks,
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
  urls: { [URLType in URLsTypes]: string | null }
) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  baseShader.updateVideoTexture(video);

  if (
    effects.ears ||
    effects.glasses ||
    effects.beards ||
    effects.mustaches ||
    effects.faceMask
  ) {
    await faceMesh.send({ image: video });
    if (faceMeshResults.length === 0) {
      return;
    }
    const multiFaceLandmarks = faceMeshResults[0].multiFaceLandmarks;

    const detectionTimedOut = faceLandmarks.getTimedOut();

    // Update landmarks based on state of dection timeout
    if (multiFaceLandmarks.length > 0) {
      if (detectionTimedOut) {
        faceLandmarks.setTimedOut(false);
      }
      faceLandmarks.update(multiFaceLandmarks);
    } else {
      if (!detectionTimedOut) {
        if (faceLandmarks.getTimeoutTimer() === undefined) {
          faceLandmarks.startTimeout();
        }
      } else {
        faceLandmarks.update(multiFaceLandmarks);
      }
    }

    const calculatedLandmarks = faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of faceLandmarks.getFaceIdLandmarksPairs()) {
      if (effects.ears) {
        const twoDimEarsOffset = calculatedLandmarks.twoDimEarsOffsets[faceId];

        if (urls.rightEar) {
          baseShader.drawEffect(
            urls.rightEar,
            {
              x: 2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].y + 1,
            },
            {
              x: twoDimEarsOffset[0],
              y: twoDimEarsOffset[1],
            },
            calculatedLandmarks.rightEarWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId]
          );
        }

        if (urls.leftEar) {
          baseShader.drawEffect(
            urls.leftEar,
            {
              x: 2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].y + 1,
            },
            {
              x: twoDimEarsOffset[0],
              y: twoDimEarsOffset[1],
            },
            calculatedLandmarks.leftEarWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId]
          );
        }
      }
      if (effects.glasses) {
        const eyesCenterPosition =
          calculatedLandmarks.eyesCenterPositions[faceId];

        if (urls.glasses) {
          baseShader.drawEffect(
            urls.glasses,
            {
              x: 2 * eyesCenterPosition[0] - 1,
              y: -2 * eyesCenterPosition[1] + 1,
            },
            {
              x: 0,
              y: 0,
            },
            calculatedLandmarks.eyesWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId]
          );
        }
      }
      if (effects.beards) {
        const twoDimBeardOffset =
          calculatedLandmarks.twoDimBeardOffsets[faceId];

        if (urls.beards) {
          baseShader.drawEffect(
            urls.beards,
            {
              x: 2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].y + 1,
            },
            {
              x: twoDimBeardOffset[0],
              y: twoDimBeardOffset[1],
            },
            calculatedLandmarks.chinWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId]
          );
        }
      }
      if (effects.mustaches) {
        const twoDimMustacheOffset =
          calculatedLandmarks.twoDimMustacheOffsets[faceId];

        if (urls.mustaches) {
          baseShader.drawEffect(
            urls.mustaches,
            {
              x: 2 * landmarks[faceLandmarks.NOSE_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.NOSE_INDEX].y + 1,
            },
            {
              x: twoDimMustacheOffset[0],
              y: twoDimMustacheOffset[1],
            },
            calculatedLandmarks.eyesWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId]
          );
        }
      }
    }

    if (effects.faceMask) {
      faceLandmarks
        .getFaceIdLandmarksPairs()
        .forEach(({ faceId, landmarks }) => {
          // drawFaceMesh(
          //   gl,
          //   faceLandmarks.getFaceIdLandmarksPairs()[0].landmarks.slice(0, -10),
          //   triangleShader
          // );
          // drawMustacheMesh(gl, triangleShader);

          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          baseShader.drawMesh(
            "mustache1",
            {
              x: 2 * landmarks[faceLandmarks.NOSE_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.NOSE_INDEX].y + 1,
            },
            {
              x: threeDimMustacheOffset[0],
              y: threeDimMustacheOffset[1],
            },
            0.4,
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId]
          );
        });
    }
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      baseShader,
      triangleShader,
      faceLandmarks,
      video,
      canvas,
      animationFrameId,
      effects,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      urls
    )
  );
};

export default render;
