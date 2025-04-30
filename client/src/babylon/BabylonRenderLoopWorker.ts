import UserDevice from "../lib/UserDevice";
import FaceLandmarks from "./FaceLandmarks";

type Needs = "selfieSegmentation" | "faceDetection" | "smoothFaceLandmarks";

class BabylonRenderLoopWorker {
  private needs: { [need in Needs]: string[] } = {
    selfieSegmentation: [],
    faceDetection: [],
    smoothFaceLandmarks: [],
  };

  private FACE_MESH_DETECTION_INTERVAL: number;
  private SELFIE_SEGMENTATION_DETECTION_INTERVAL: number;

  private frameCounter = 0;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenContext: CanvasRenderingContext2D | null;

  private lastFaceCountCheck: number;

  private hideBackgroundOffscreenCanvas: HTMLCanvasElement;
  private hideBackgroundOffscreenContext: CanvasRenderingContext2D | null;

  private detectFacesTimeout = 1000;

  constructor(
    private flip: boolean,
    private faceLandmarks: FaceLandmarks | undefined,
    private aspect: number,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement,
    private faceMeshWorker: Worker | undefined,
    private faceMeshProcessing: boolean[] | undefined,
    private faceDetectionWorker: Worker | undefined,
    private faceDetectionProcessing: boolean[] | undefined,
    private selfieSegmentationWorker: Worker | undefined,
    private selfieSegmentationProcessing: boolean[] | undefined,
    private userDevice: UserDevice,
  ) {
    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.getFaceMeshDetectionInterval();
    this.SELFIE_SEGMENTATION_DETECTION_INTERVAL =
      this.userDevice.getSelfieSegmentationDetectionInterval();

    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    if (this.aspect > 1) {
      this.offscreenCanvas.width = 320;
      this.offscreenCanvas.height = 320 / this.aspect;
    } else {
      this.offscreenCanvas.width = 320 * this.aspect;
      this.offscreenCanvas.height = 320;
    }

    this.lastFaceCountCheck = 0;

    this.hideBackgroundOffscreenCanvas = document.createElement("canvas");
    this.hideBackgroundOffscreenContext =
      this.hideBackgroundOffscreenCanvas.getContext("2d", {
        alpha: true,
        willReadFrequently: true,
      });
    if (this.aspect > 1) {
      this.hideBackgroundOffscreenCanvas.width = 320;
      this.hideBackgroundOffscreenCanvas.height = 320 / this.aspect;
    } else {
      this.hideBackgroundOffscreenCanvas.width = 320 * this.aspect;
      this.hideBackgroundOffscreenCanvas.height = 320;
    }

    setTimeout(() => {
      this.detectFaces();
    }, 1000);
  }

  renderLoop = () => {
    this.frameCounter++;

    if (
      this.needs.selfieSegmentation.length !== 0 &&
      this.frameCounter % this.SELFIE_SEGMENTATION_DETECTION_INTERVAL === 0
    ) {
      this.hideBackgroundEffect();
    }

    if (
      this.needs.faceDetection.length !== 0 &&
      this.frameCounter % this.FACE_MESH_DETECTION_INTERVAL === 0
    ) {
      this.detectFaces();
    }
  };

  private detectFaces = () => {
    if (
      !this.faceLandmarks ||
      !this.backgroundMedia ||
      !this.offscreenContext
    ) {
      return;
    }

    try {
      // Clear the offscreen canvas before drawing
      this.offscreenContext?.clearRect(
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height,
      );

      // Draw the video frame onto the offscreen canvas at the lower resolution
      this.offscreenContext?.drawImage(
        this.backgroundMedia,
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height,
      );

      // Get ImageData from the offscreen canvas
      const imageData = this.offscreenContext.getImageData(
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height,
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
          smooth: this.needs.smoothFaceLandmarks.length !== 0,
          flipped: this.flip,
        });
      }
      if (
        performance.now() - this.lastFaceCountCheck > this.detectFacesTimeout &&
        this.faceDetectionProcessing &&
        !this.faceDetectionProcessing[0] &&
        this.faceDetectionWorker
      ) {
        this.faceDetectionProcessing[0] = true;
        this.lastFaceCountCheck = performance.now();

        this.faceDetectionWorker?.postMessage({
          message: "FRAME",
          data: buffer,
          width: this.offscreenCanvas.width,
          height: this.offscreenCanvas.height,
        });
      }
    } catch (error) {
      console.error("Error sending video frame to faceMesh:", error);
      return;
    }
  };

  private hideBackgroundEffect = async () => {
    if (
      !this.hideBackgroundOffscreenContext ||
      !this.selfieSegmentationWorker
    ) {
      return;
    }

    // Clear the offscreen canvas before drawing
    this.hideBackgroundOffscreenContext.clearRect(
      0,
      0,
      this.hideBackgroundOffscreenCanvas.width,
      this.hideBackgroundOffscreenCanvas.height,
    );

    // Draw the video frame onto the offscreen canvas at the lower resolution
    this.hideBackgroundOffscreenContext.drawImage(
      this.backgroundMedia,
      0,
      0,
      this.hideBackgroundOffscreenCanvas.width,
      this.hideBackgroundOffscreenCanvas.height,
    );

    // Get ImageData from the offscreen canvas
    const imageData = this.hideBackgroundOffscreenContext.getImageData(
      0,
      0,
      this.hideBackgroundOffscreenCanvas.width,
      this.hideBackgroundOffscreenCanvas.height,
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
        width: this.hideBackgroundOffscreenCanvas.width,
        height: this.hideBackgroundOffscreenCanvas.height,
      });
    }
  };

  addNeed = (need: Needs, instanceId: string) => {
    if (!this.needs[need].some((id) => id === instanceId))
      this.needs[need].push(instanceId);
  };

  removeNeed = (need: Needs, instanceId: string) => {
    this.needs[need] = this.needs[need].filter((id) => id !== instanceId);
  };

  addAllNeed = (instanceId: string) => {
    for (const need in this.needs) {
      if (!this.needs[need as Needs].some((id) => id === instanceId))
        this.needs[need as Needs].push(instanceId);
    }
  };

  removeAllNeed = (instanceId: string) => {
    for (const need in this.needs) {
      this.needs[need as Needs] = this.needs[need as Needs].filter(
        (id) => id !== instanceId,
      );
    }
  };
}

export default BabylonRenderLoopWorker;
