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

    const scaleFactor = 1.1; // Adjust this value to scale in x-direction
    const centerX = Math.floor(width / 2); // Calculate the x-center
    const rgbaData = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      let firstFilledIndex = -1;
      let lastFilledIndex = -1;

      for (let x = 0; x < width; x++) {
        const originalIndex = y * width + x;
        const scaledX = centerX + Math.round((x - centerX) * scaleFactor);

        if (scaledX >= 0 && scaledX < width) {
          const value = maskData[originalIndex];
          const rgbaIndex = (y * width + scaledX) * 4;

          rgbaData[rgbaIndex] = 255;
          rgbaData[rgbaIndex + 1] = 255;
          rgbaData[rgbaIndex + 2] = 255;
          rgbaData[rgbaIndex + 3] = (1 - value) * 255;

          // Fill any gaps up to the current scaledX position
          if (lastFilledIndex >= 0 && scaledX > lastFilledIndex + 1) {
            for (let fillX = lastFilledIndex + 1; fillX < scaledX; fillX++) {
              const fillIndex = (y * width + fillX) * 4;
              rgbaData[fillIndex] = 255;
              rgbaData[fillIndex + 1] = 255;
              rgbaData[fillIndex + 2] = 255;
              rgbaData[fillIndex + 3] = (1 - value) * 255;
            }
          }

          // Track the first and last filled indices for edge filling
          if (firstFilledIndex === -1) firstFilledIndex = scaledX;
          lastFilledIndex = scaledX;
        }
      }

      // Fill any remaining gaps on the far left up to the first filled pixel
      if (firstFilledIndex > 0) {
        for (let x = 0; x < firstFilledIndex; x++) {
          const rgbaIndex = (y * width + x) * 4;
          const fillIndex = (y * width + firstFilledIndex) * 4;

          rgbaData[rgbaIndex] = rgbaData[fillIndex];
          rgbaData[rgbaIndex + 1] = rgbaData[fillIndex + 1];
          rgbaData[rgbaIndex + 2] = rgbaData[fillIndex + 2];
          rgbaData[rgbaIndex + 3] = rgbaData[fillIndex + 3];
        }
      }

      // Fill any remaining gaps on the far right based on the last filled pixel
      if (lastFilledIndex >= 0) {
        for (let x = lastFilledIndex + 1; x < width; x++) {
          const rgbaIndex = (y * width + x) * 4;
          const fillIndex = (y * width + lastFilledIndex) * 4;

          rgbaData[rgbaIndex] = rgbaData[fillIndex];
          rgbaData[rgbaIndex + 1] = rgbaData[fillIndex + 1];
          rgbaData[rgbaIndex + 2] = rgbaData[fillIndex + 2];
          rgbaData[rgbaIndex + 3] = rgbaData[fillIndex + 3];
        }
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
