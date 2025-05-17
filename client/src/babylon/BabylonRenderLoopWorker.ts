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

  private offscreenCanvas: OffscreenCanvas;
  private faceMeshOffscreenCanvas: OffscreenCanvas;
  private faceDetectionOffscreenCanvas: OffscreenCanvas;
  private selfieSegmentationOffscreenCanvas: OffscreenCanvas;
  private offscreenContext: OffscreenCanvasRenderingContext2D | null;

  private lastFaceCountCheck: number;

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
    private userDevice: React.MutableRefObject<UserDevice>,
  ) {
    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.current.getFaceMeshDetectionInterval();
    this.SELFIE_SEGMENTATION_DETECTION_INTERVAL =
      this.userDevice.current.getSelfieSegmentationDetectionInterval();

    this.offscreenCanvas = new OffscreenCanvas(
      this.aspect > 1 ? 320 : 320 * this.aspect,
      this.aspect > 1 ? 320 / this.aspect : 320,
    );
    this.offscreenContext = this.offscreenCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
    this.faceMeshOffscreenCanvas = new OffscreenCanvas(
      this.aspect > 1 ? 320 : 320 * this.aspect,
      this.aspect > 1 ? 320 / this.aspect : 320,
    );
    this.faceDetectionOffscreenCanvas = new OffscreenCanvas(
      this.aspect > 1 ? 320 : 320 * this.aspect,
      this.aspect > 1 ? 320 / this.aspect : 320,
    );
    this.selfieSegmentationOffscreenCanvas = new OffscreenCanvas(
      this.aspect > 1 ? 320 : 320 * this.aspect,
      this.aspect > 1 ? 320 / this.aspect : 320,
    );

    this.faceMeshWorker?.postMessage(
      {
        message: "INIT",
        canvas: this.faceMeshOffscreenCanvas,
        width: this.faceMeshOffscreenCanvas.width,
        height: this.faceMeshOffscreenCanvas.height,
      },
      [this.faceMeshOffscreenCanvas],
    );
    this.faceDetectionWorker?.postMessage(
      {
        message: "INIT",
        canvas: this.faceDetectionOffscreenCanvas,
        width: this.faceDetectionOffscreenCanvas.width,
        height: this.faceDetectionOffscreenCanvas.height,
      },
      [this.faceDetectionOffscreenCanvas],
    );
    this.selfieSegmentationWorker?.postMessage(
      {
        message: "INIT",
        canvas: this.selfieSegmentationOffscreenCanvas,
        width: this.selfieSegmentationOffscreenCanvas.width,
        height: this.selfieSegmentationOffscreenCanvas.height,
      },
      [this.selfieSegmentationOffscreenCanvas],
    );

    this.lastFaceCountCheck = 0;

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

      // Send video frames to the worker for processing
      if (this.faceMeshProcessing && !this.faceMeshProcessing[0]) {
        this.faceMeshProcessing[0] = true;

        createImageBitmap(this.offscreenCanvas).then((bitmap) => {
          this.faceMeshWorker!.postMessage(
            {
              message: "FRAME",
              bitmap,
              smooth: this.needs.smoothFaceLandmarks.length !== 0,
              flipped: this.flip,
            },
            [bitmap],
          );
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

        createImageBitmap(this.offscreenCanvas).then((bitmap) => {
          this.faceDetectionWorker!.postMessage(
            {
              message: "FRAME",
              bitmap,
            },
            [bitmap],
          );
        });
      }
    } catch (error) {
      console.error("Error sending video frame to faceMesh:", error);
      return;
    }
  };

  private hideBackgroundEffect = async () => {
    if (!this.offscreenContext || !this.selfieSegmentationWorker) {
      return;
    }

    // Clear the offscreen canvas before drawing
    this.offscreenContext.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height,
    );

    // Draw the video frame onto the offscreen canvas at the lower resolution
    this.offscreenContext.drawImage(
      this.backgroundMedia,
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height,
    );

    // Send video frames to the worker for processing
    if (
      this.selfieSegmentationProcessing &&
      !this.selfieSegmentationProcessing[0]
    ) {
      this.selfieSegmentationProcessing[0] = true;

      createImageBitmap(this.offscreenCanvas).then((bitmap) => {
        this.selfieSegmentationWorker!.postMessage(
          {
            message: "FRAME",
            bitmap,
          },
          [bitmap],
        );
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
