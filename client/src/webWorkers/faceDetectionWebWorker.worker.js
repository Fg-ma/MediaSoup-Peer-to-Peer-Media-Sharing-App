import "../../public/faceMeshModel/tf-core.js";
import "../../public/faceMeshModel/tf-converter.js";
import "../../public/faceMeshModel/tf-backend-wasm.js";
import "../../public/faceMeshModel/face-landmarks-detection.js";

class FaceDetectionWebWorker {
  faceDetector;
  maxFaces = 10;

  constructor() {
    this.loadModel();
  }

  loadModel = async () => {
    tf.wasm.setWasmPaths("/faceMeshModel/");
    await tf.ready();

    this.faceDetector = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFaceDetector,
      {
        maxFaces: this.maxFaces,
        minDetectionConfidence: 0.9,
      }
    );
  };

  processFrame = async (event) => {
    if (!this.faceDetector) {
      return;
    }

    // Parse passed ArrayBuffer
    const buffer = event.data.data;
    const array = new Uint8ClampedArray(buffer);
    const imData = new ImageData(array, event.data.width, event.data.height);

    const predictions = await this.faceDetector.estimateFaces({
      input: imData,
      returnTensors: false,
      flipHorizontal: false,
    });

    // Return the number of detected faces (bounding boxes)
    return predictions.length;
  };
}

const faceDetectionWebWorker = new FaceDetectionWebWorker();

onmessage = (event) => {
  switch (event.data.message) {
    case "FRAME":
      faceDetectionWebWorker.processFrame(event).then((numFacesDetected) => {
        postMessage({
          message: "FACES_DETECTED",
          numFacesDetected,
        });
      });
      break;
    default:
      break;
  }
};
