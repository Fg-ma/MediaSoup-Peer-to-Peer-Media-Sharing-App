import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

interface SelfieInitEventData {
  message: "INIT";
  canvas: OffscreenCanvas;
  width: number;
  height: number;
}

interface SelfieFrameEventData {
  message: "FRAME";
  bitmap: ImageBitmap;
}

type SelfieWorkerEventData = SelfieInitEventData | SelfieFrameEventData;

class SelfieSegmentationWebWorker {
  nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

  canvas: OffscreenCanvas | undefined;
  context: OffscreenCanvasRenderingContext2D | undefined | null;
  canvasHeight: number | undefined;
  canvasWidth: number | undefined;
  faceDetector: any;
  selfieSegmenter: any = null;
  isInitialized = false;
  isInitializing = false;

  constructor() {
    this.initializeModel();
  }

  initializeModel = async () => {
    if (!this.isInitialized && !this.isInitializing) {
      this.isInitializing = true;

      try {
        // Load the vision tasks WASM files
        const vision = await FilesetResolver.forVisionTasks(
          this.nginxAssetServerBaseUrl + "tasks-vision",
        );

        // Create the ImageSegmenter
        this.selfieSegmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              this.nginxAssetServerBaseUrl +
              "tasks-vision/selfie_segmenter.tflite",
            delegate: "CPU",
          },
          runningMode: "IMAGE",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
        this.isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize the model:", error);
      } finally {
        this.isInitializing = false;
      }
    }
  };

  processFrame = async (event: MessageEvent<SelfieFrameEventData>) => {
    if (
      !this.selfieSegmenter ||
      !this.isInitialized ||
      !this.context ||
      !this.canvasWidth ||
      !this.canvasHeight
    )
      return;

    const bitmap = event.data.bitmap;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.drawImage(bitmap, 0, 0);
    bitmap.close();

    // Run the segmentation model on the input frame
    const segmentationResult = await this.selfieSegmenter.segment(this.canvas);

    const confidenceMask = segmentationResult.confidenceMasks[0];
    const maskData = confidenceMask.g[0];
    const width = confidenceMask.width;
    const height = confidenceMask.height;

    const rgbaData = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const originalIndex = y * width + x;
        const value = maskData[originalIndex];
        const rgbaIndex = (y * width + x) * 4;

        rgbaData[rgbaIndex] = 255; // R
        rgbaData[rgbaIndex + 1] = 255; // G
        rgbaData[rgbaIndex + 2] = 255; // B
        rgbaData[rgbaIndex + 3] = (1 - value) * 255; // Alpha channel
      }
    }

    return new ImageData(rgbaData, width, height);
  };

  setCanvas = (event: MessageEvent<SelfieInitEventData>) => {
    this.canvas = event.data.canvas;
    this.canvasHeight = event.data.height;
    this.canvasWidth = event.data.width;
    this.context = this.canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
  };
}

// Create an instance of the worker
const selfieSegmentationWebWorker = new SelfieSegmentationWebWorker();

// Handle messages from the main thread
onmessage = (event) => {
  switch (event.data.message) {
    case "FRAME":
      // Ensure the model is initialized before processing the frame
      selfieSegmentationWebWorker.processFrame(event).then((results) => {
        // Transfer the OffscreenCanvas back to the main thread
        postMessage({
          message: "PROCESSED_FRAME",
          results,
        });
      });
      break;
    case "INIT":
      selfieSegmentationWebWorker.setCanvas(event);
      break;
    default:
      break;
  }
};
