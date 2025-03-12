const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

class FaceDetectionWebWorker {
  faceDetector;
  maxFaces = 10;

  constructor() {
    this.loadDependencies()
      .then(this.loadModel)
      .catch((error) =>
        console.error("Error loading dependencies or model:", error)
      );
  }

  loadDependencies = async () => {
    const baseUrl = nginxAssetServerBaseUrl + "faceMeshModel/";

    const scripts = [
      "tf-core.js",
      "tf-converter.js",
      "tf-backend-wasm.js",
      "face-landmarks-detection.js",
    ];

    try {
      importScripts(...scripts.map((script) => `${baseUrl}${script}`));
    } catch (error) {
      throw new Error(`Failed to load scripts: ${error}`);
    }
  };

  loadModel = async () => {
    // eslint-disable-next-line no-undef
    tf.wasm.setWasmPaths(nginxAssetServerBaseUrl + "faceMeshModel/");
    // eslint-disable-next-line no-undef
    await tf.ready();

    // eslint-disable-next-line no-undef
    this.faceDetector = await faceLandmarksDetection.load(
      // eslint-disable-next-line no-undef
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
