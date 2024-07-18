import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { EffectTypes } from "src/context/StreamsContext";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import BaseShader from "./BaseShader";
import FaceLandmarks from "./FaceLandmarks";

const render = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  faceLandmarks: FaceLandmarks,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh,
  faceMeshResults: Results[]
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
      await faceLandmarks.update(multiFaceLandmarks, canvas);
    } else {
      if (!detectionTimedOut) {
        if (faceLandmarks.getTimeoutTimer() === undefined) {
          faceLandmarks.startTimeout();
        }
      } else {
        await faceLandmarks.update(multiFaceLandmarks, canvas);
      }
    }

    const calculatedLandmarks = faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of faceLandmarks.getFaceIdLandmarksPairs()) {
      if (effects.ears) {
        if (!currentEffectsStyles.current.ears.threeDim) {
          const twoDimEarsOffset =
            calculatedLandmarks.twoDimEarsOffsets[faceId];

          baseShader.drawEffect(
            `${currentEffectsStyles.current.ears.style}Right`,
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

          baseShader.drawEffect(
            `${currentEffectsStyles.current.ears.style}Left`,
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
        } else {
          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          await baseShader.drawMesh(
            currentEffectsStyles.current.mustaches.style,
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
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        }
      }
      if (effects.glasses) {
        if (!currentEffectsStyles.current.glasses.threeDim) {
          const eyesCenterPosition =
            calculatedLandmarks.eyesCenterPositions[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.glasses.style,
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
        } else {
          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          await baseShader.drawMesh(
            currentEffectsStyles.current.mustaches.style,
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
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        }
      }
      if (effects.beards) {
        if (!currentEffectsStyles.current.beards.threeDim) {
          const twoDimBeardOffset =
            calculatedLandmarks.twoDimBeardOffsets[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.beards.style,
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
        } else {
          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          await baseShader.drawMesh(
            currentEffectsStyles.current.mustaches.style,
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
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        }
      }
      if (effects.mustaches) {
        if (!currentEffectsStyles.current.mustaches.threeDim) {
          const twoDimMustacheOffset =
            calculatedLandmarks.twoDimMustacheOffsets[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.mustaches.style,
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
        } else {
          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          await baseShader.drawMesh(
            currentEffectsStyles.current.mustaches.style,
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
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        }
      }
      if (effects.faceMask) {
        await baseShader.drawFaceMesh("faceMask1", landmarks.slice(0, -10));
      }
    }
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      gl,
      baseShader,
      faceLandmarks,
      video,
      canvas,
      animationFrameId,
      effects,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults
    )
  );
};

export default render;
