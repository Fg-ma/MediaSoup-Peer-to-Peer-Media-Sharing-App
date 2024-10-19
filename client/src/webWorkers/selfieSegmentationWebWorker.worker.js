import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

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
        const vision = await FilesetResolver.forVisionTasks("/tasks-vision");

        // Define options for the ImageSegmenter
        const options = {
          baseOptions: {
            modelAssetPath: "/tasks-vision/selfie_segmenter.tflite",
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

    for (let i = 0; i < maskData.length; i++) {
      const value = maskData[i];
      const rgbaIndex = i * 4;
      rgbaData[rgbaIndex] = 255;
      rgbaData[rgbaIndex + 1] = 255;
      rgbaData[rgbaIndex + 2] = 255;
      rgbaData[rgbaIndex + 3] = (1 - value) * 255;
    }

    // Return ImageData directly instead of drawing it to a canvas
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
