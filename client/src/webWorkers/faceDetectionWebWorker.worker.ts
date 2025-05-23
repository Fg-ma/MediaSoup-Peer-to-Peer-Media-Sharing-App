interface FaceDetectionInitEventData {
  message: "INIT";
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  nginxAssetServerBaseUrl: string;
}

interface FaceDetectionFrameEventData {
  message: "FRAME";
  bitmap: ImageBitmap;
}

type FaceDetectionWorkerEventData =
  | FaceDetectionInitEventData
  | FaceDetectionFrameEventData;

class FaceDetectionWebWorker {
  nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

  canvas: OffscreenCanvas | undefined;
  context: OffscreenCanvasRenderingContext2D | undefined | null;
  canvasHeight: number | undefined;
  canvasWidth: number | undefined;
  faceDetector: any;
  maxFaces = 10;

  constructor() {
    this.loadDependencies()
      .then(this.loadModel)
      .catch((error) =>
        console.error("Error loading dependencies or model:", error),
      );
  }

  loadDependencies = async () => {
    const baseUrl = this.nginxAssetServerBaseUrl + "faceMeshModel/";

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
    tf.wasm.setWasmPaths(this.nginxAssetServerBaseUrl + "faceMeshModel/");
    // eslint-disable-next-line no-undef
    await tf.ready();

    // eslint-disable-next-line no-undef
    this.faceDetector = await faceLandmarksDetection.load(
      // eslint-disable-next-line no-undef
      faceLandmarksDetection.SupportedPackages.mediapipeFaceDetector,
      {
        maxFaces: this.maxFaces,
        minDetectionConfidence: 0.9,
      },
    );
  };

  processFrame = async (event: MessageEvent<FaceDetectionFrameEventData>) => {
    if (
      !this.faceDetector ||
      !this.context ||
      !this.canvasHeight ||
      !this.canvasWidth
    ) {
      return;
    }

    const bitmap = event.data.bitmap;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const predictions = await this.faceDetector.estimateFaces({
      input: this.canvas,
      returnTensors: false,
      flipHorizontal: false,
    });

    // Return the number of detected faces (bounding boxes)
    return predictions.length;
  };

  setCanvas = async (event: MessageEvent<FaceDetectionInitEventData>) => {
    this.canvas = event.data.canvas;
    this.canvasHeight = event.data.height;
    this.canvasWidth = event.data.width;
    this.context = this.canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
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
    case "INIT":
      faceDetectionWebWorker.setCanvas(event);
      break;
    default:
      break;
  }
};
