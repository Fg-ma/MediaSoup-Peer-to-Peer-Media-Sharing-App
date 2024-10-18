import {
  NormalizedLandmarkList,
  NormalizedLandmarkListList,
} from "@mediapipe/face_mesh";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../../../context/StreamsContext";
import {
  assetSizePositionMap,
  CameraEffectStylesType,
  EffectStylesType,
  HideBackgroundEffectTypes,
} from "../../../context/CurrentEffectsStylesContext";
import BaseShader from "./BaseShader";
import FaceLandmarks, { CalculatedLandmarkInterface } from "./FaceLandmarks";
import UserDevice from "../../../UserDevice";
import { hideBackgroundEffectImagesMap } from "../../../lib/CameraMedia";

class Render {
  private MAX_FRAME_PROCESSING_TIME: number;
  private FACE_MESH_DETECTION_INTERVAL: number;

  private finishedProcessingEffects = true;

  private frameCounter = 0;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenContext: CanvasRenderingContext2D | null;

  private lastFaceCountCheck: number;

  private hideBackgroundCanvas: HTMLCanvasElement;
  private hideBackgroundCtx: CanvasRenderingContext2D | null;
  private hideBackgroundEffectImage: HTMLImageElement;
  private hideBackgroundCtxFillStyle = "#F56114";

  private tempHideBackgroundCanvas: OffscreenCanvas;
  private tempHideBackgroundCtx: OffscreenCanvasRenderingContext2D | null;

  constructor(
    private id: string,
    private gl: WebGLRenderingContext | WebGL2RenderingContext,
    private baseShader: BaseShader,
    private faceLandmarks: FaceLandmarks | undefined,
    private video: HTMLVideoElement,
    private animationFrameId: number[],
    private effects: {
      [effectType in
        | CameraEffectTypes
        | ScreenEffectTypes
        | AudioEffectTypes]?: boolean | undefined;
    },
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private faceMeshWorker: Worker | undefined,
    private faceMeshResults: NormalizedLandmarkListList[] | undefined,
    private faceMeshProcessing: boolean[] | undefined,
    private faceDetectionWorker: Worker | undefined,
    private faceDetectionProcessing: boolean[] | undefined,
    private selfieSegmentationWorker: Worker | undefined,
    private selfieSegmentationResults: ImageData[] | undefined,
    private selfieSegmentationProcessing: boolean[] | undefined,
    private userDevice: UserDevice,
    private flipVideo: boolean
  ) {
    this.MAX_FRAME_PROCESSING_TIME =
      this.userDevice.getMaxFrameProcessingTime();
    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.getFaceMeshDetectionInterval();

    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.lastFaceCountCheck = performance.now();

    this.hideBackgroundEffectImage = new Image();

    this.hideBackgroundCanvas = document.createElement("canvas");
    this.hideBackgroundCtx = this.hideBackgroundCanvas.getContext("2d");

    this.tempHideBackgroundCanvas = new OffscreenCanvas(160, 120);
    this.tempHideBackgroundCtx = this.tempHideBackgroundCanvas.getContext("2d");
  }

  private processEffects = async () => {
    if (
      !this.faceMeshWorker ||
      !this.faceMeshResults ||
      !this.faceLandmarks ||
      !(
        this.effects.glasses ||
        this.effects.beards ||
        this.effects.mustaches ||
        this.effects.masks ||
        this.effects.hats ||
        this.effects.pets
      )
    ) {
      this.finishedProcessingEffects = true;
      return;
    }

    this.frameCounter++;

    if (
      this.FACE_MESH_DETECTION_INTERVAL === 1 ||
      this.frameCounter % this.FACE_MESH_DETECTION_INTERVAL === 0
    ) {
      await this.detectFaces();
    }

    const calculatedLandmarks = this.faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
      const effectsStyles = this.currentEffectsStyles.current.camera[this.id];

      if (this.effects.glasses && effectsStyles.glasses) {
        await this.drawGlasses(faceId, effectsStyles, calculatedLandmarks);
      }

      if (this.effects.beards && effectsStyles.beards) {
        await this.drawBeards(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.mustaches && effectsStyles.mustaches) {
        await this.drawMustaches(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.masks) {
        await this.drawMasks(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.hats) {
        await this.drawHats(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.pets) {
        await this.drawPets(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }
    }

    this.finishedProcessingEffects = true;
  };

  private detectFaces = async () => {
    if (
      !this.faceMeshResults ||
      !this.faceLandmarks ||
      !this.video ||
      !this.offscreenContext
    ) {
      return;
    }

    this.frameCounter = 0;

    try {
      // Set the dimensions of the offscreen canvas to a lower resolution
      const scaleFactor = 0.1; // Scale down to 25% of the original size
      this.offscreenCanvas.width = this.video.videoWidth * scaleFactor;
      this.offscreenCanvas.height = this.video.videoHeight * scaleFactor;

      // Clear the offscreen canvas before drawing
      this.offscreenContext?.clearRect(
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height
      );

      // Draw the video frame onto the offscreen canvas at the lower resolution
      this.offscreenContext?.drawImage(
        this.video,
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height
      );

      // Get ImageData from the offscreen canvas
      const imageData = this.offscreenContext.getImageData(
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height
      );

      // Create a new ArrayBuffer
      const buffer = new ArrayBuffer(imageData.data.length);
      const uint8Array = new Uint8Array(buffer);
      uint8Array.set(imageData.data);

      // Send video frames to the worker for processing
      if (this.faceMeshProcessing && !this.faceMeshProcessing[0]) {
        this.faceMeshProcessing[0] = true;
        this.faceMeshWorker?.postMessage({
          message: "FRAME",
          data: buffer, // Send the ArrayBuffer
          width: this.offscreenCanvas.width,
          height: this.offscreenCanvas.height,
        });
      }
      if (
        performance.now() - this.lastFaceCountCheck > 2000 &&
        this.faceDetectionProcessing &&
        !this.faceDetectionProcessing[0] &&
        this.faceDetectionWorker
      ) {
        this.faceDetectionProcessing[0] = true;
        this.lastFaceCountCheck = performance.now();

        this.faceDetectionWorker?.postMessage({
          message: "FRAME",
          data: buffer, // Send the ArrayBuffer
          width: this.offscreenCanvas.width,
          height: this.offscreenCanvas.height,
        });
      }
    } catch (error) {
      console.error("Error sending video frame to faceMesh:", error);
      return;
    }

    if (this.faceMeshResults.length === 0) {
      return;
    }

    const multiFaceLandmarks = this.faceMeshResults[0];
    const detectionTimedOut = this.faceLandmarks.getTimedOut();

    if (multiFaceLandmarks.length > 0) {
      if (detectionTimedOut) {
        this.faceLandmarks.setTimedOut(false);
      }
      this.faceLandmarks.update(multiFaceLandmarks);
    } else {
      if (!detectionTimedOut) {
        if (this.faceLandmarks.getTimeoutTimer() === undefined) {
          this.faceLandmarks.startTimeout();
        }
      } else {
        this.faceLandmarks.update(multiFaceLandmarks);
      }
    }
  };

  private drawGlasses = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface
  ) => {
    if (!this.faceLandmarks || !effectsStyles.glasses) {
      return;
    }

    const eyesCenterPosition = calculatedLandmarks.eyesCenterPositions[faceId];

    if (!effectsStyles.glasses.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.glasses.style,
        {
          x: eyesCenterPosition[0],
          y: eyesCenterPosition[1],
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.glasses[
            this.currentEffectsStyles.current.camera[this.id].glasses.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      if (effectsStyles.glasses) {
        await this.baseShader.drawMesh(
          effectsStyles.glasses.style,
          {
            x: eyesCenterPosition[0],
            y: eyesCenterPosition[1],
          },
          {
            x: 0,
            y: 0,
          },
          calculatedLandmarks.interocularDistances[faceId] *
            assetSizePositionMap.glasses[
              this.currentEffectsStyles.current.camera[this.id].glasses.style
            ].threeDimScale,
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

    const chinPosition = landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX];

    if (!effectsStyles.beards.threeDim) {
      const twoDimBeardOffset = calculatedLandmarks.twoDimBeardOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.beards.style,
        {
          x: chinPosition.x,
          y: chinPosition.y,
        },
        {
          x: twoDimBeardOffset[0],
          y: twoDimBeardOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.beards[
            this.currentEffectsStyles.current.camera[this.id].beards.style
          ].twoDimScale,
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
            x: chinPosition.x,
            y: chinPosition.y,
          },
          {
            x: threeDimBeardOffset[0],
            y: threeDimBeardOffset[1],
          },
          calculatedLandmarks.interocularDistances[faceId] *
            assetSizePositionMap.beards[
              this.currentEffectsStyles.current.camera[this.id].beards.style
            ].threeDimScale,
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

    const nosePosition = landmarks[this.faceLandmarks.NOSE_INDEX];

    if (!effectsStyles.mustaches.threeDim) {
      const twoDimMustacheOffset =
        calculatedLandmarks.twoDimMustacheOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.mustaches.style,
        {
          x: nosePosition.x,
          y: nosePosition.y,
        },
        {
          x: twoDimMustacheOffset[0],
          y: twoDimMustacheOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.mustaches[
            this.currentEffectsStyles.current.camera[this.id].mustaches.style
          ].twoDimScale,
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
          x: nosePosition.x,
          y: nosePosition.y,
        },
        {
          x: threeDimMustacheOffset[0],
          y: threeDimMustacheOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.mustaches[
            this.currentEffectsStyles.current.camera[this.id].mustaches.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawMasks = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.masks) {
      return;
    }

    const nosePosition = landmarks[this.faceLandmarks.NOSE_INDEX];

    if (effectsStyles.masks.style === "baseMask") {
      await this.baseShader.drawFaceMesh("baseMask", landmarks.slice(0, -10));
      return;
    }

    if (!effectsStyles.masks.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.masks.style,
        {
          x: nosePosition.x,
          y: nosePosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.masks[
            this.currentEffectsStyles.current.camera[this.id].masks.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.masks.style,
        {
          x: nosePosition.x,
          y: nosePosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.masks[
            this.currentEffectsStyles.current.camera[this.id].masks.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawHats = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.hats) {
      return;
    }

    const foreheadPosition = landmarks[this.faceLandmarks.FOREHEAD_INDEX];

    if (!effectsStyles.hats.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.hats.style,
        {
          x: foreheadPosition.x,
          y: foreheadPosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.hats[
            this.currentEffectsStyles.current.camera[this.id].hats.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.hats.style,
        {
          x: foreheadPosition.x,
          y: foreheadPosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.hats[
            this.currentEffectsStyles.current.camera[this.id].hats.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawPets = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.pets) {
      return;
    }

    const foreheadPosition = landmarks[this.faceLandmarks.FOREHEAD_INDEX];

    if (!effectsStyles.pets.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.pets.style,
        {
          x: foreheadPosition.x,
          y: foreheadPosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.pets[
            this.currentEffectsStyles.current.camera[this.id].pets.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.pets.style,
        {
          x: foreheadPosition.x,
          y: foreheadPosition.y,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.pets[
            this.currentEffectsStyles.current.camera[this.id].pets.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private hideBackgroundEffect = async () => {
    if (!this.offscreenContext || !this.selfieSegmentationWorker) {
      return;
    }

    // Set the dimensions of the offscreen canvas to a lower resolution
    const scaleFactor = 0.25; // Scale down to 25% of the original size
    this.offscreenCanvas.width = this.video.videoWidth * scaleFactor;
    this.offscreenCanvas.height = this.video.videoHeight * scaleFactor;

    // Clear the offscreen canvas before drawing
    this.offscreenContext.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Draw the video frame onto the offscreen canvas at the lower resolution
    this.offscreenContext.drawImage(
      this.video,
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Get ImageData from the offscreen canvas
    const imageData = this.offscreenContext.getImageData(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Create a new ArrayBuffer
    const buffer = new ArrayBuffer(imageData.data.length);
    const uint8Array = new Uint8Array(buffer);
    uint8Array.set(imageData.data);

    // Send video frames to the worker for processing
    if (
      this.selfieSegmentationProcessing &&
      !this.selfieSegmentationProcessing[0]
    ) {
      this.selfieSegmentationProcessing[0] = true;
      this.selfieSegmentationWorker.postMessage({
        message: "FRAME",
        data: buffer, // Send the ArrayBuffer
        width: this.offscreenCanvas.width,
        height: this.offscreenCanvas.height,
      });
    }
  };

  private updateHideBackgroundCanvas = () => {
    if (
      !this.hideBackgroundCanvas ||
      !this.hideBackgroundCtx ||
      !this.tempHideBackgroundCtx ||
      !this.selfieSegmentationResults ||
      !this.selfieSegmentationResults[0]
    ) {
      return;
    }

    if (
      this.hideBackgroundCanvas.width === 0 ||
      this.hideBackgroundCanvas.height === 0
    ) {
      this.hideBackgroundCanvas.width = this.video.videoWidth;
      this.hideBackgroundCanvas.height = this.video.videoHeight;
    }

    this.hideBackgroundCtx.clearRect(
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );

    this.tempHideBackgroundCtx.clearRect(
      0,
      0,
      this.tempHideBackgroundCanvas.width,
      this.tempHideBackgroundCanvas.height
    );

    // Step 1: Draw the ImageData onto the canvas at its original size (at 0,0)
    this.tempHideBackgroundCtx.putImageData(
      this.selfieSegmentationResults[0],
      0,
      0
    );

    // Step 2: Scale the canvas content to fit the full canvas using drawImage
    this.hideBackgroundCtx.drawImage(
      this.tempHideBackgroundCanvas, // Draw the entire canvas content as an image
      0,
      0,
      this.tempHideBackgroundCanvas.width,
      this.tempHideBackgroundCanvas.height,
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );
    this.hideBackgroundCtx.globalCompositeOperation = "source-in";
    this.hideBackgroundCtx.drawImage(
      this.video,
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );

    this.hideBackgroundCtx.globalCompositeOperation = "destination-over";

    if (
      this.currentEffectsStyles.current.camera[this.id].hideBackground.style !==
      "color"
    ) {
      this.hideBackgroundCtx.drawImage(
        this.hideBackgroundEffectImage,
        0,
        0,
        this.hideBackgroundCanvas.width,
        this.hideBackgroundCanvas.height
      );
    } else {
      if (
        this.hideBackgroundCtx.fillStyle !== this.hideBackgroundCtxFillStyle
      ) {
        this.hideBackgroundCtx.fillStyle = this.hideBackgroundCtxFillStyle;
      }

      this.hideBackgroundCtx.fillRect(
        0,
        0,
        this.hideBackgroundCanvas.width,
        this.hideBackgroundCanvas.height
      );
    }
  };

  loop = () => {
    const startTime = performance.now();

    // Clear the canvas and update the video texture
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (!this.effects.hideBackground) {
      this.baseShader.updateVideoTexture(this.video, this.flipVideo);
    } else {
      this.hideBackgroundEffect();
      this.updateHideBackgroundCanvas();
      if (this.hideBackgroundCanvas) {
        this.baseShader.updateVideoTexture(
          this.hideBackgroundCanvas,
          this.flipVideo
        );
      }
    }

    // Abort processing if the previous frame took too long
    if (performance.now() - startTime > this.MAX_FRAME_PROCESSING_TIME) {
      this.animationFrameId[0] = requestAnimationFrame(this.loop);
      return;
    }

    if (!this.effects.pause && this.finishedProcessingEffects) {
      this.finishedProcessingEffects = false;
      this.processEffects();
    }

    this.animationFrameId[0] = requestAnimationFrame(this.loop);
  };

  updateFlipVideo = (newFlipVideo: boolean) => {
    this.flipVideo = newFlipVideo;
  };

  swapHideBackgroundEffectImage = (
    hideBackgroundEffect: HideBackgroundEffectTypes
  ) => {
    const src = hideBackgroundEffectImagesMap[hideBackgroundEffect];
    if (src) this.hideBackgroundEffectImage.src = src;
  };

  swapHideBackgroundContextFillColor = (color: string) => {
    if (this.hideBackgroundCtx) {
      this.hideBackgroundCtx.fillStyle = color;
      this.hideBackgroundCtxFillStyle = color;
    }
  };
}

export default Render;
