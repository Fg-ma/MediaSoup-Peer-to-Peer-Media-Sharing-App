import { FaceMesh, Results } from "@mediapipe/face_mesh";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../../context/StreamsContext";
import { EffectStylesType } from "../../context/CurrentEffectsStylesContext";
import BaseShader from "./BaseShader";
import FaceLandmarks from "./FaceLandmarks";

let frameCounter = 0;

const render = async (
  id: string,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  faceLandmarks: FaceLandmarks | undefined,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  animationFrameId: number[],
  effects: {
    [effectType in CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes]?:
      | boolean
      | undefined;
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
  faceMesh: FaceMesh | undefined,
  faceMeshResults: Results[] | undefined,
  pause = false,
  flipVideo = false,
  MAX_FRAME_PROCESSING_TIME: number,
  MIN_FRAME_INTERVAL: number,
  FACE_MESH_DETECTION_INTERVAL: number
) => {
  const startTime = performance.now();

  // Clear the canvas and update the video texture
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  baseShader.updateVideoTexture(video, flipVideo);

  if (
    !pause &&
    faceMesh &&
    faceMeshResults &&
    faceLandmarks &&
    (effects.ears ||
      effects.glasses ||
      effects.beards ||
      effects.mustaches ||
      effects.faceMasks)
  ) {
    // Abort processing if the previous frame took too long
    if (performance.now() - startTime > MAX_FRAME_PROCESSING_TIME) {
      animationFrameId[0] = requestAnimationFrame(() =>
        render(
          id,
          gl,
          baseShader,
          faceLandmarks,
          video,
          canvas,
          animationFrameId,
          effects,
          currentEffectsStyles,
          faceMesh,
          faceMeshResults,
          pause,
          flipVideo,
          MAX_FRAME_PROCESSING_TIME,
          MIN_FRAME_INTERVAL,
          FACE_MESH_DETECTION_INTERVAL
        )
      );
      return;
    }

    // Process every second frame
    frameCounter++;
    if (
      FACE_MESH_DETECTION_INTERVAL === 1 ||
      frameCounter % FACE_MESH_DETECTION_INTERVAL === 0
    ) {
      frameCounter = 0;

      const sendVideoFrame = async () => {
        try {
          await faceMesh.send({ image: video });
        } catch (error) {
          console.error("Error sending video frame to faceMesh:", error);
          return;
        }
      };

      await sendVideoFrame();
      if (faceMeshResults.length === 0) {
        return;
      }

      const multiFaceLandmarks = faceMeshResults[0].multiFaceLandmarks;
      const detectionTimedOut = faceLandmarks.getTimedOut();

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
    }

    const calculatedLandmarks = faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of faceLandmarks.getFaceIdLandmarksPairs()) {
      if (effects.ears && currentEffectsStyles.current.camera[id].ears) {
        if (!currentEffectsStyles.current.camera[id].ears.threeDim) {
          const twoDimEarsOffset =
            calculatedLandmarks.twoDimEarsOffsets[faceId];
          baseShader.drawEffect(
            `${currentEffectsStyles.current.camera[id].ears.style}Right`,
            {
              x: 2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.RIGHT_EAR_INDEX].y + 1,
            },
            {
              x: twoDimEarsOffset[0],
              y: twoDimEarsOffset[1],
            },
            calculatedLandmarks.rightEarWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );

          baseShader.drawEffect(
            `${currentEffectsStyles.current.camera[id].ears.style}Left`,
            {
              x: 2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.LEFT_EAR_INDEX].y + 1,
            },
            {
              x: twoDimEarsOffset[0],
              y: twoDimEarsOffset[1],
            },
            calculatedLandmarks.leftEarWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        } else {
          if (currentEffectsStyles.current.camera[id].mustaches) {
            const threeDimMustacheOffset =
              calculatedLandmarks.threeDimMustacheOffsets[faceId];

            await baseShader.drawMesh(
              currentEffectsStyles.current.camera[id].mustaches.style,
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
      }

      if (effects.glasses && currentEffectsStyles.current.camera[id].glasses) {
        if (!currentEffectsStyles.current.camera[id].glasses.threeDim) {
          const eyesCenterPosition =
            calculatedLandmarks.eyesCenterPositions[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.camera[id].glasses.style,
            {
              x: 2 * eyesCenterPosition[0] - 1,
              y: -2 * eyesCenterPosition[1] + 1,
            },
            {
              x: 0,
              y: 0,
            },
            calculatedLandmarks.eyesWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        } else {
          if (currentEffectsStyles.current.camera[id].mustaches) {
            const threeDimMustacheOffset =
              calculatedLandmarks.threeDimMustacheOffsets[faceId];

            await baseShader.drawMesh(
              currentEffectsStyles.current.camera[id].mustaches.style,
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
      }

      if (effects.beards && currentEffectsStyles.current.camera[id].beards) {
        if (!currentEffectsStyles.current.camera[id].beards.threeDim) {
          const twoDimBeardOffset =
            calculatedLandmarks.twoDimBeardOffsets[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.camera[id].beards.style,
            {
              x: 2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.JAW_MID_POINT_INDEX].y + 1,
            },
            {
              x: twoDimBeardOffset[0],
              y: twoDimBeardOffset[1],
            },
            calculatedLandmarks.chinWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        } else {
          if (currentEffectsStyles.current.camera[id].mustaches) {
            const threeDimMustacheOffset =
              calculatedLandmarks.threeDimMustacheOffsets[faceId];

            await baseShader.drawMesh(
              currentEffectsStyles.current.camera[id].mustaches.style,
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
      }

      if (
        effects.mustaches &&
        currentEffectsStyles.current.camera[id].mustaches
      ) {
        if (!currentEffectsStyles.current.camera[id].mustaches.threeDim) {
          const twoDimMustacheOffset =
            calculatedLandmarks.twoDimMustacheOffsets[faceId];

          baseShader.drawEffect(
            currentEffectsStyles.current.camera[id].mustaches.style,
            {
              x: 2 * landmarks[faceLandmarks.NOSE_INDEX].x - 1,
              y: -2 * landmarks[faceLandmarks.NOSE_INDEX].y + 1,
            },
            {
              x: twoDimMustacheOffset[0],
              y: twoDimMustacheOffset[1],
            },
            calculatedLandmarks.eyesWidths[faceId],
            calculatedLandmarks.headRotationAngles[faceId],
            calculatedLandmarks.headYawAngles[faceId],
            calculatedLandmarks.headPitchAngles[faceId]
          );
        } else {
          const threeDimMustacheOffset =
            calculatedLandmarks.threeDimMustacheOffsets[faceId];

          await baseShader.drawMesh(
            currentEffectsStyles.current.camera[id].mustaches.style,
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

      if (effects.faceMasks) {
        await baseShader.drawFaceMesh("faceMask1", landmarks.slice(0, -10));
      }
    }
  }

  // Throttle frame rendering
  const elapsedTime = performance.now() - startTime;
  const remainingTime = MIN_FRAME_INTERVAL - elapsedTime;
  if (remainingTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
  }

  animationFrameId[0] = requestAnimationFrame(() =>
    render(
      id,
      gl,
      baseShader,
      faceLandmarks,
      video,
      canvas,
      animationFrameId,
      effects,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      pause,
      flipVideo,
      MAX_FRAME_PROCESSING_TIME,
      MIN_FRAME_INTERVAL,
      FACE_MESH_DETECTION_INTERVAL
    )
  );
};

export default render;
