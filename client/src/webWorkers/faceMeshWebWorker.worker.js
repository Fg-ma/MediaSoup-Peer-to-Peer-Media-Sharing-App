import "../../public/faceMeshModel/tf-core.js";
import "../../public/faceMeshModel/tf-converter.js";
import "../../public/faceMeshModel/tf-backend-wasm.js";
import "../../public/faceMeshModel/face-landmarks-detection.js";

class FaceMeshWebWorker {
  faceMesh;
  maxFaces = 1;

  constructor() {
    this.loadModel();
  }

  loadModel = async () => {
    tf.wasm.setWasmPaths("/faceMeshModel/");
    await tf.ready();

    this.faceMesh = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {
        maxFaces: this.maxFaces,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }
    );
  };

  processFrame = async (event) => {
    if (!this.faceMesh) {
      return;
    }

    // Parse passed ArrayBuffer
    const buffer = event.data.data;
    const array = new Uint8ClampedArray(buffer);
    const imData = new ImageData(array, event.data.width, event.data.height);

    const predictions = await this.faceMesh.estimateFaces({
      input: imData,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: true,
    });

    // Normalize predictions between -1 and 1
    const normalizedPredictions = predictions.map((face) => {
      const zValues = face.scaledMesh.map(([, , z]) => z);
      const zMin = Math.min(...zValues) * 3;
      const zMax = Math.max(...zValues) * 3;

      return {
        ...face,
        scaledMesh: face.scaledMesh.map(([x, y, z]) => {
          const normX = (x / event.data.width) * 2 - 1; // Normalize X
          const normY = ((y / event.data.height) * 2 - 1) * -1; // Normalize Y
          const normZ = ((z - zMin) / (zMax - zMin)) * 2 - 1; // Normalize Z
          return { x: normX, y: normY, z: normZ };
        }),
      };
    });

    return normalizedPredictions;
  };

  changeMaxFaces = async (newMaxFaces) => {
    if (this.maxFaces !== newMaxFaces) {
      this.maxFaces = newMaxFaces;
      await this.loadModel();
    }
  };
}

const faceMeshWebWorker = new FaceMeshWebWorker();

onmessage = (event) => {
  switch (event.data.message) {
    case "FRAME":
      faceMeshWebWorker.processFrame(event).then((results) => {
        postMessage({
          message: "PROCESSED_FRAME",
          results,
        });
      });
      break;
    case "CHANGE_MAX_FACES":
      faceMeshWebWorker.changeMaxFaces(event.data.newMaxFace);
      break;
    default:
      break;
  }
};
