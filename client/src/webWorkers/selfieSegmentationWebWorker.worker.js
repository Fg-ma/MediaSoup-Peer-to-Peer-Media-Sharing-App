import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

class SelfieSegmentationWebWorker {
  selfieSegmenter = null;
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
          nginxAssetServerBaseUrl + "tasks-vision"
        );

        // Define options for the ImageSegmenter
        const options = {
          baseOptions: {
            modelAssetPath:
              nginxAssetServerBaseUrl + "tasks-vision/selfie_segmenter.tflite",
            delegate: "CPU",
          },
          runningMode: "IMAGE",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
          outputQualityScores: true,
        };

        // Create the ImageSegmenter
        this.selfieSegmenter = await ImageSegmenter.createFromOptions(
          vision,
          options
        );
        this.isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize the model:", error);
      } finally {
        this.isInitializing = false;
      }
    }
  };

  processFrame = async (event) => {
    if (!this.selfieSegmenter || !this.isInitialized) {
      return;
    }

    const buffer = event.data.data;
    const array = new Uint8ClampedArray(buffer);
    const imData = new ImageData(array, event.data.width, event.data.height);

    // Run the segmentation model on the input frame
    const segmentationResult = await this.selfieSegmenter.segment(imData);

    const confidenceMask = segmentationResult.confidenceMasks[0];
    const maskData = confidenceMask.g[0]; // Extract grayscale mask (Uint8Array)
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
    default:
      break;
  }
};
