import {
  AbstractMesh,
  Scene,
  UniversalCamera,
  Vector3,
  StandardMaterial,
  DynamicTexture,
} from "@babylonjs/core";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  EffectStylesType,
  HideBackgroundEffectTypes,
} from "../context/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import UserDevice from "../UserDevice";
import { hideBackgroundEffectImagesMap } from "./meshes";

class BabylonRenderLoop {
  private FACE_MESH_DETECTION_INTERVAL: number;

  private finishedProcessingEffects = true;

  private frameCounter = 0;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenContext: CanvasRenderingContext2D | null;

  private lastFaceCountCheck: number;

  hideBackgroundCanvas: HTMLCanvasElement;
  private hideBackgroundCtx: CanvasRenderingContext2D | null;
  private hideBackgroundEffectImage: HTMLImageElement;
  private hideBackgroundCtxFillStyle = "#F56114";

  private tempHideBackgroundCanvas: OffscreenCanvas;
  private tempHideBackgroundCtx: OffscreenCanvasRenderingContext2D | null;

  constructor(
    private id: string,
    private scene: Scene,
    private camera: UniversalCamera,
    private faceLandmarks: FaceLandmarks | undefined,
    private canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
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
    private hideBackgroundTexture: DynamicTexture | undefined,
    private hideBackgroundMaterial: StandardMaterial | undefined
  ) {
    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.getFaceMeshDetectionInterval();

    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    this.lastFaceCountCheck = performance.now();

    this.hideBackgroundEffectImage = new Image();

    this.hideBackgroundCanvas = document.createElement("canvas");
    this.hideBackgroundCtx = this.hideBackgroundCanvas.getContext("2d", {
      alpha: true,
    });

    this.tempHideBackgroundCanvas = new OffscreenCanvas(256, 256);
    this.tempHideBackgroundCtx = this.tempHideBackgroundCanvas.getContext(
      "2d",
      { alpha: true }
    );
  }

  renderLoop = () => {
    if (this.effects.hideBackground) {
      this.hideBackgroundEffect();
      this.updateHideBackgroundCanvas();
    }

    if (!this.effects.pause && this.finishedProcessingEffects) {
      this.finishedProcessingEffects = false;
      this.processEffects();
    }
  };

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
      this.updateMeshPositions();
    } else {
      if (!detectionTimedOut) {
        if (this.faceLandmarks.getTimeoutTimer() === undefined) {
          this.faceLandmarks.startTimeout();
        }
      } else {
        this.updateMeshPositions();
        this.faceLandmarks.update(multiFaceLandmarks);
      }
    }
  };

  private hideBackgroundEffect = async () => {
    if (!this.offscreenContext || !this.selfieSegmentationWorker) {
      return;
    }

    // Set the dimensions of the offscreen canvas to a lower resolution
    const scaleFactor = 0.25; // Scale down to 25% of the original size
    this.offscreenCanvas.width = 256;
    this.offscreenCanvas.height = 256;

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
    this.hideBackgroundCtx.globalCompositeOperation = "source-over";
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

    this.hideBackgroundCtx.globalCompositeOperation = "source-atop";

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

    // Step 3: Update the texture of the background plane material
    if (this.hideBackgroundTexture && this.hideBackgroundMaterial) {
      const textureCtx = this.hideBackgroundTexture.getContext();
      if (textureCtx) {
        textureCtx.clearRect(
          0,
          0,
          this.hideBackgroundCanvas.width,
          this.hideBackgroundCanvas.height
        );

        // Transfer the content of the canvas to the texture
        textureCtx.drawImage(
          this.hideBackgroundCanvas,
          0,
          0,
          this.hideBackgroundCanvas.width,
          this.hideBackgroundCanvas.height
        );

        // Mark texture as dirty to trigger an update in the rendering engine
        this.hideBackgroundTexture.update();
      }

      // Assign the updated texture to the material
      this.hideBackgroundMaterial.diffuseTexture = this.hideBackgroundTexture;
    }
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

  private screenSpaceToSceenSpace = (
    mesh: AbstractMesh,
    position: [number, number]
  ) => {
    const zPosition = mesh.position.z; // distance from camera
    const cameraFOV = this.camera.fov; // FOV in radians
    const aspectRatio = this.canvas.width / this.canvas.height;

    // Calculate the vertical and horizontal extents at the current zPosition
    const verticalExtent = Math.tan(cameraFOV / 2) * (Math.abs(zPosition) + 1);
    const horizontalExtent = verticalExtent * aspectRatio;

    // Convert normalized screen coordinates to world coordinates
    return [
      position[0] * horizontalExtent * -1,
      position[1] * verticalExtent,
      zPosition,
    ];
  };

  private updateMeshPositions = () => {
    if (!this.faceLandmarks) {
      return;
    }

    const calculatedLandmarks = this.faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
      for (const mesh of this.scene.meshes) {
        const meshMetadata = mesh.metadata;
        if (meshMetadata && meshMetadata.faceId === faceId) {
          if (meshMetadata.defaultMeshPlacement === "forehead") {
            const foreheadPosition = this.screenSpaceToSceenSpace(
              mesh,
              calculatedLandmarks.foreheadPositions[faceId]
            );

            if (!foreheadPosition) {
              continue;
            }

            // Set the mesh position in world space
            mesh.position = new Vector3(
              foreheadPosition[0],
              foreheadPosition[1],
              foreheadPosition[2]
            );

            mesh.rotation = new Vector3(
              calculatedLandmarks.headPitchAngles[faceId] * -1,
              calculatedLandmarks.headYawAngles[faceId],
              calculatedLandmarks.headRotationAngles[faceId] * -1
            );
          } else if (meshMetadata.defaultMeshPlacement === "nose") {
            const nosePosition = this.screenSpaceToSceenSpace(
              mesh,
              calculatedLandmarks.nosePositions[faceId]
            );

            if (!nosePosition) {
              continue;
            }

            // Set the mesh position in world space
            mesh.position = new Vector3(
              nosePosition[0],
              nosePosition[1],
              nosePosition[2]
            );
          } else if (meshMetadata.defaultMeshPlacement === "chin") {
            const chinPosition = this.screenSpaceToSceenSpace(
              mesh,
              calculatedLandmarks.chinPositions[faceId]
            );

            if (!chinPosition) {
              continue;
            }

            // Set the mesh position in world space
            mesh.position = new Vector3(
              chinPosition[0],
              chinPosition[1],
              chinPosition[2]
            );
          } else if (meshMetadata.defaultMeshPlacement === "eyesCenter") {
            const eyesCenterPosition = this.screenSpaceToSceenSpace(
              mesh,
              calculatedLandmarks.eyesCenterPositions[faceId]
            );

            if (!eyesCenterPosition) {
              continue;
            }

            // Set the mesh position in world space
            mesh.position = new Vector3(
              eyesCenterPosition[0],
              eyesCenterPosition[1],
              eyesCenterPosition[2]
            );
          }
        }
      }
    }
  };
}

export default BabylonRenderLoop;
