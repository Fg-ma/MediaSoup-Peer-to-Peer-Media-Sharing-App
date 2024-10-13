import "../../public/selfieSegmentationModel/tf-core.js";
import "../../public/selfieSegmentationModel/tf-converter.js";
import "../../public/selfieSegmentationModel/tf-backend-wasm.js";
import "../../public/selfieSegmentationModel/selfie_segmentation.js";
import * as bodySegmentation from "@tensorflow-models/body-segmentation"; // Import the body segmentation library

class SelfieSegmentationWebWorker {
  segmenter;
  modelType = "general"; // Default model type

  constructor() {
    this.loadModel();
  }

  loadModel = async () => {
    tf.wasm.setWasmPaths("/selfieSegmentationModel/"); // Set local WASM path for TensorFlow.js
    await tf.ready(); // Ensure TensorFlow.js is ready

    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // Model type
    this.segmenter = await bodySegmentation.createSegmenter(model, {
      runtime: "mediapipe", // Using MediaPipe runtime
      solutionPath: "/selfieSegmentationModel/", // Local path to MediaPipe assets
      modelType: this.modelType, // Model type: 'general' or 'landscape'
    });
  };

  processFrame = async (event) => {
    if (!this.segmenter) {
      return;
    }

    // Parse passed ArrayBuffer into image data
    const buffer = event.data.data;
    const array = new Uint8ClampedArray(buffer);
    const imData = new ImageData(array, event.data.width, event.data.height);

    // Make segmentation predictions
    const predictions = await this.segmenter.segmentPeople({
      input: imData,
      returnTensors: false, // Return processed image data
      flipHorizontal: false,
      predictIrises: false,
    });

    return predictions;
  };

  changeModelType = async (newModelType) => {
    if (this.modelType !== newModelType) {
      this.modelType = newModelType;
      await this.loadModel(); // Reload the model with the new type
    }
  };
}

const selfieSegmentationWebWorker = new SelfieSegmentationWebWorker();

onmessage = (event) => {
  switch (event.data.message) {
    case "FRAME":
      selfieSegmentationWebWorker.processFrame(event).then((results) => {
        postMessage({
          message: "PROCESSED_FRAME",
          results,
        });
      });
      break;
    case "CHANGE_MODEL_TYPE":
      selfieSegmentationWebWorker.changeModelType(event.data.newModelType);
      break;
    default:
      break;
  }
};
