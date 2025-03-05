const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

class FaceMeshWebWorker {
  faceMesh;
  maxFaces = 1;
  smoothingData = []; // Store previous landmarks for smoothing
  smoothingFactor = 0.9; // Smoothing factor for EMA
  deadbandThreshold = 0.001; // Minimum change threshold to register movement

  constructor() {
    this.loadDependencies()
      .then(this.loadModel)
      .catch((error) =>
        console.error("Error loading dependencies or model:", error)
      );
  }

  loadDependencies = async () => {
    const baseUrl = nginxAssetSeverBaseUrl + "faceMeshModel/";

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
    tf.wasm.setWasmPaths(nginxAssetSeverBaseUrl + "faceMeshModel/");
    // eslint-disable-next-line no-undef
    await tf.ready();

    // eslint-disable-next-line no-undef
    this.faceMesh = await faceLandmarksDetection.load(
      // eslint-disable-next-line no-undef
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

    // Parse ArrayBuffer
    const buffer = event.data.data;
    const array = new Uint8ClampedArray(buffer);
    const imData = new ImageData(array, event.data.width, event.data.height);

    const predictions = await this.faceMesh.estimateFaces({
      input: imData,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: true,
    });

    const multiFaceLandmarks = [];

    predictions.map((face, faceIndex) => {
      const zValues = face.scaledMesh.map(([, , z]) => z);
      const zRange = Math.max(...zValues) - Math.min(...zValues);

      // Initialize smoothing data if empty
      if (!this.smoothingData[faceIndex]) {
        this.smoothingData[faceIndex] = face.scaledMesh.map(([x, y, z]) => ({
          x,
          y,
          z,
        }));
      }

      multiFaceLandmarks.push(
        face.scaledMesh.map(([x, y, z], landmarkIndex) => {
          // Normalize coordinates
          const normX =
            ((x / event.data.width) * 2 - 1) * (event.data.flipped ? 1 : -1);
          const normY = ((y / event.data.height) * 2 - 1) * -1;
          const adjustedZ = (z - Math.min(...zValues)) / (zRange || 1);

          if (!event.data.smooth) {
            // If smoothing is not enabled, return raw normalized values
            return { x: normX, y: normY, z: adjustedZ };
          }

          // Retrieve previous values for smoothing
          const prevLandmark = this.smoothingData[faceIndex][landmarkIndex];

          // Apply exponential smoothing
          const smoothedX =
            this.smoothingFactor * normX +
            (1 - this.smoothingFactor) * prevLandmark.x;
          const smoothedY =
            this.smoothingFactor * normY +
            (1 - this.smoothingFactor) * prevLandmark.y;
          const smoothedZ =
            this.smoothingFactor * adjustedZ +
            (1 - this.smoothingFactor) * prevLandmark.z;

          // Deadbanding: Only update if change exceeds the threshold
          const deltaX = Math.abs(smoothedX - prevLandmark.x);
          const deltaY = Math.abs(smoothedY - prevLandmark.y);
          const deltaZ = Math.abs(smoothedZ - prevLandmark.z);

          if (
            deltaX > this.deadbandThreshold ||
            deltaY > this.deadbandThreshold ||
            deltaZ > this.deadbandThreshold
          ) {
            // Update the stored smoothing data
            this.smoothingData[faceIndex][landmarkIndex] = {
              x: smoothedX,
              y: smoothedY,
              z: smoothedZ,
            };
            return { x: smoothedX, y: smoothedY, z: smoothedZ };
          } else {
            // Return the previous position if within deadband threshold
            return prevLandmark;
          }
        })
      );
    });

    return multiFaceLandmarks;
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
