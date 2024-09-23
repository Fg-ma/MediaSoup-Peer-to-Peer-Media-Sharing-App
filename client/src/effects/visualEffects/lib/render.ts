import {
  FaceMesh,
  NormalizedLandmarkList,
  Results,
} from "@mediapipe/face_mesh";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../../../context/StreamsContext";
import {
  CameraEffectStylesType,
  EffectStylesType,
} from "../../../context/CurrentEffectsStylesContext";
import BaseShader from "./BaseShader";
import FaceLandmarks, { CalculatedLandmarkInterface } from "./FaceLandmarks";

let frameCounter = 0;

class Render {
  constructor(
    private id: string,
    private gl: WebGLRenderingContext | WebGL2RenderingContext,
    private baseShader: BaseShader,
    private faceLandmarks: FaceLandmarks | undefined,
    private video: HTMLVideoElement,
    private canvas: HTMLCanvasElement,
    private animationFrameId: number[],
    private effects: {
      [effectType in
        | CameraEffectTypes
        | ScreenEffectTypes
        | AudioEffectTypes]?: boolean | undefined;
    },
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private faceMesh: FaceMesh | undefined,
    private faceMeshResults: Results[] | undefined
  ) {}

  private detectFaces = async () => {
    if (!this.faceMeshResults || !this.faceLandmarks) {
      return;
    }

    frameCounter = 0;

    const sendVideoFrame = async () => {
      try {
        if (this.faceMesh) await this.faceMesh.send({ image: this.video });
      } catch (error) {
        console.error("Error sending video frame to faceMesh:", error);
        return;
      }
    };

    await sendVideoFrame();

    if (this.faceMeshResults.length === 0) {
      return;
    }

    const multiFaceLandmarks = this.faceMeshResults[0].multiFaceLandmarks;
    const detectionTimedOut = this.faceLandmarks.getTimedOut();

    if (multiFaceLandmarks.length > 0) {
      if (detectionTimedOut) {
        this.faceLandmarks.setTimedOut(false);
      }
      this.faceLandmarks.update(multiFaceLandmarks, this.canvas);
    } else {
      if (!detectionTimedOut) {
        if (this.faceLandmarks.getTimeoutTimer() === undefined) {
          this.faceLandmarks.startTimeout();
        }
      } else {
        this.faceLandmarks.update(multiFaceLandmarks, this.canvas);
      }
    }
  };

  private drawEars = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.ears) {
      return;
    }

    if (!effectsStyles.ears.threeDim) {
      const twoDimEarsOffset = calculatedLandmarks.twoDimEarsOffsets[faceId];
      this.baseShader.drawEffect(
        `${effectsStyles.ears.style}Right`,
        {
          x: 2 * landmarks[this.faceLandmarks.RIGHT_EAR_INDEX].x - 1,
          y: -2 * landmarks[this.faceLandmarks.RIGHT_EAR_INDEX].y + 1,
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

      this.baseShader.drawEffect(
        `${effectsStyles.ears.style}Left`,
        {
          x: 2 * landmarks[this.faceLandmarks.LEFT_EAR_INDEX].x - 1,
          y: -2 * landmarks[this.faceLandmarks.LEFT_EAR_INDEX].y + 1,
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
      if (effectsStyles.mustaches) {
        const threeDimMustacheOffset =
          calculatedLandmarks.threeDimMustacheOffsets[faceId];

        await this.baseShader.drawMesh(
          effectsStyles.mustaches.style,
          {
            x: 2 * landmarks[this.faceLandmarks.NOSE_INDEX].x - 1,
            y: -2 * landmarks[this.faceLandmarks.NOSE_INDEX].y + 1,
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
  };

  private drawGlasses = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.glasses) {
      return;
    }

    if (!effectsStyles.glasses.threeDim) {
      const eyesCenterPosition =
        calculatedLandmarks.eyesCenterPositions[faceId];

      this.baseShader.drawEffect(
        effectsStyles.glasses.style,
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
      if (effectsStyles.mustaches) {
        const threeDimMustacheOffset =
          calculatedLandmarks.threeDimMustacheOffsets[faceId];

        await this.baseShader.drawMesh(
          effectsStyles.mustaches.style,
          {
            x: 2 * landmarks[this.faceLandmarks.NOSE_INDEX].x - 1,
            y: -2 * landmarks[this.faceLandmarks.NOSE_INDEX].y + 1,
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
  };

  private drawBeards = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.beards) {
      return;
    }

    if (!effectsStyles.beards.threeDim) {
      const twoDimBeardOffset = calculatedLandmarks.twoDimBeardOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.beards.style,
        {
          x: 2 * landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX].x - 1,
          y: -2 * landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX].y + 1,
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
      if (effectsStyles.beards) {
        const threeDimBeardOffset =
          calculatedLandmarks.threeDimBeardOffsets[faceId];
        await this.baseShader.drawMesh(
          effectsStyles.beards.style,
          {
            x: 2 * landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX].x - 1,
            y: -2 * landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX].y + 1,
          },
          {
            x: threeDimBeardOffset[0],
            y: threeDimBeardOffset[1],
          },
          0.7,
          calculatedLandmarks.headRotationAngles[faceId],
          calculatedLandmarks.headYawAngles[faceId],
          calculatedLandmarks.headPitchAngles[faceId]
        );
      }
    }
  };

  private drawMustaches = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.mustaches) {
      return;
    }

    if (!effectsStyles.mustaches.threeDim) {
      const twoDimMustacheOffset =
        calculatedLandmarks.twoDimMustacheOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.mustaches.style,
        {
          x: 2 * landmarks[this.faceLandmarks.NOSE_INDEX].x - 1,
          y: -2 * landmarks[this.faceLandmarks.NOSE_INDEX].y + 1,
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

      await this.baseShader.drawMesh(
        effectsStyles.mustaches.style,
        {
          x: 2 * landmarks[this.faceLandmarks.NOSE_INDEX].x - 1,
          y: -2 * landmarks[this.faceLandmarks.NOSE_INDEX].y + 1,
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
  };

  loop = async (
    flipVideo = false,
    MAX_FRAME_PROCESSING_TIME: number,
    MIN_FRAME_INTERVAL: number,
    FACE_MESH_DETECTION_INTERVAL: number
  ) => {
    const startTime = performance.now();

    // Clear the canvas and update the video texture
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.baseShader.updateVideoTexture(this.video, flipVideo);

    // Abort processing if the previous frame took too long
    if (performance.now() - startTime > MAX_FRAME_PROCESSING_TIME) {
      this.animationFrameId[0] = requestAnimationFrame(() =>
        this.loop(
          flipVideo,
          MAX_FRAME_PROCESSING_TIME,
          MIN_FRAME_INTERVAL,
          FACE_MESH_DETECTION_INTERVAL
        )
      );
      return;
    }

    if (
      !this.effects.pause &&
      this.faceMesh &&
      this.faceMeshResults &&
      this.faceLandmarks &&
      (this.effects.ears ||
        this.effects.glasses ||
        this.effects.beards ||
        this.effects.mustaches ||
        this.effects.faceMasks)
    ) {
      // Process every FACE_MESH_DETECTION_INTERVAL frame
      frameCounter++;
      if (
        FACE_MESH_DETECTION_INTERVAL === 1 ||
        frameCounter % FACE_MESH_DETECTION_INTERVAL === 0
      ) {
        await this.detectFaces();
      }

      const calculatedLandmarks = this.faceLandmarks.getCalculatedLandmarks();

      for (const {
        faceId,
        landmarks,
      } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
        const effectsStyles = this.currentEffectsStyles.current.camera[this.id];

        if (this.effects.ears && effectsStyles && effectsStyles.ears) {
          await this.drawEars(
            faceId,
            effectsStyles,
            calculatedLandmarks,
            landmarks
          );
        }

        if (this.effects.glasses && effectsStyles && effectsStyles.glasses) {
          await this.drawGlasses(
            faceId,
            effectsStyles,
            calculatedLandmarks,
            landmarks
          );
        }

        if (this.effects.beards && effectsStyles && effectsStyles.beards) {
          await this.drawBeards(
            faceId,
            effectsStyles,
            calculatedLandmarks,
            landmarks
          );
        }

        if (
          this.effects.mustaches &&
          effectsStyles &&
          effectsStyles.mustaches
        ) {
          await this.drawMustaches(
            faceId,
            effectsStyles,
            calculatedLandmarks,
            landmarks
          );
        }

        if (this.effects.faceMasks) {
          await this.baseShader.drawFaceMesh(
            "baseFaceMask",
            landmarks.slice(0, -10)
          );
        }
      }
    }

    // Throttle frame rendering
    const elapsedTime = performance.now() - startTime;
    const remainingTime = MIN_FRAME_INTERVAL - elapsedTime;
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    this.animationFrameId[0] = requestAnimationFrame(() =>
      this.loop(
        flipVideo,
        MAX_FRAME_PROCESSING_TIME,
        MIN_FRAME_INTERVAL,
        FACE_MESH_DETECTION_INTERVAL
      )
    );
  };
}

export default Render;
