import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import Deadbanding from "../../babylon/Deadbanding";
import BabylonRenderLoopWorker from "../../babylon/BabylonRenderLoopWorker";
import UserDevice from "../../lib/UserDevice";

export type ImageListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" }
  | { type: "rectifyEffectMeshCount" };

class ImageMedia {
  image: HTMLImageElement | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  blobURL: string | undefined;
  loadingState: "downloading" | "downloaded" = "downloading";
  aspect: number | undefined;

  private imageListeners: Set<(message: ImageListenerTypes) => void> =
    new Set();

  maxFaces: [number] = [1];
  detectedFaces: number = 0;

  faceLandmarks: FaceLandmarks;

  faceMeshWorker: Worker;
  faceMeshResults: NormalizedLandmarkListList[] = [];
  faceMeshProcessing = [false];
  faceDetectionWorker: Worker;
  faceDetectionProcessing = [false];
  selfieSegmentationWorker: Worker;
  selfieSegmentationResults: ImageData[] = [];
  selfieSegmentationProcessing = [false];

  private faceCountChangeListeners: Set<(facesDetected: number) => void> =
    new Set();

  forcingFaces = false;

  babylonRenderLoopWorker: BabylonRenderLoopWorker | undefined;

  constructor(
    public imageId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private deadbanding: Deadbanding,
    private userDevice: UserDevice,
    private getImage: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string,
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void,
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void,
    ) => void,
  ) {
    this.faceLandmarks = new FaceLandmarks(
      true,
      "image",
      this.imageId,
      this.deadbanding,
    );

    this.faceMeshWorker = new Worker(
      new URL("../../webWorkers/faceMeshWebWorker.worker", import.meta.url),
      {
        type: "module",
      },
    );

    this.faceMeshWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "PROCESSED_FRAME":
          this.faceMeshProcessing[0] = false;
          if (event.data.results) {
            if (!this.faceMeshResults) {
              this.faceMeshResults = [];
            }
            this.faceMeshResults[0] = event.data.results;
          }
          break;
        default:
          break;
      }
    };

    this.faceDetectionWorker = new Worker(
      new URL(
        "../../webWorkers/faceDetectionWebWorker.worker",
        import.meta.url,
      ),
      {
        type: "module",
      },
    );

    this.faceDetectionWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "FACES_DETECTED": {
          this.faceDetectionProcessing[0] = false;
          const detectedFaces = event.data.numFacesDetected;
          this.detectedFaces = detectedFaces === undefined ? 0 : detectedFaces;

          if (detectedFaces !== this.maxFaces[0]) {
            this.maxFaces[0] = detectedFaces;

            this.faceMeshWorker.postMessage({
              message: "CHANGE_MAX_FACES",
              newMaxFace: detectedFaces,
            });
            this.imageListeners.forEach((listener) => {
              listener({ type: "rectifyEffectMeshCount" });
            });

            this.faceCountChangeListeners.forEach((listener) => {
              listener(detectedFaces);
            });
          }
          break;
        }
        default:
          break;
      }
    };

    this.selfieSegmentationWorker = new Worker(
      new URL(
        "../../webWorkers/selfieSegmentationWebWorker.worker",
        import.meta.url,
      ),
      {
        type: "module",
      },
    );

    this.selfieSegmentationWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "PROCESSED_FRAME":
          this.selfieSegmentationProcessing[0] = false;
          if (event.data.results) {
            this.selfieSegmentationResults[0] = event.data.results;
          }
          break;
        default:
          break;
      }
    };

    this.getImage("image", this.imageId, this.filename);
    this.addMessageListener(this.getImageListener);
  }

  deconstructor() {
    if (this.image) {
      this.image.src = "";
      this.image = undefined;
    }

    this.aspect = undefined;

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    this.imageListeners.clear();

    // Terminate workers to prevent memory leaks
    if (this.faceMeshWorker) {
      this.faceMeshWorker.terminate();
    }
    if (this.faceDetectionWorker) {
      this.faceDetectionWorker.terminate();
    }
    if (this.selfieSegmentationWorker) {
      this.selfieSegmentationWorker.terminate();
    }

    this.faceCountChangeListeners.clear();
  }

  private getImageListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "image" ||
        contentId !== this.imageId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "image" ||
        contentId !== this.imageId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);
      this.image = document.createElement("img");
      this.image.src = this.blobURL;

      this.image.onload = () => {
        this.aspect = (this.image?.width ?? 1) / (this.image?.height ?? 1);

        if (this.image)
          this.babylonRenderLoopWorker = new BabylonRenderLoopWorker(
            false,
            this.faceLandmarks,
            this.aspect,
            this.image,
            this.faceMeshWorker,
            this.faceMeshProcessing,
            this.faceDetectionWorker,
            this.faceDetectionProcessing,
            this.selfieSegmentationWorker,
            this.selfieSegmentationProcessing,
            this.userDevice,
          );

        this.loadingState = "downloaded";

        this.imageListeners.forEach((listener) => {
          listener({ type: "downloadComplete" });
        });
      };

      this.removeMessageListener(this.getImageListener);
    }
  };

  addImageListener = (
    listener: (message: ImageListenerTypes) => void,
  ): void => {
    this.imageListeners.add(listener);
  };

  removeImageListener = (
    listener: (message: ImageListenerTypes) => void,
  ): void => {
    this.imageListeners.delete(listener);
  };

  setState = (state: ContentStateTypes[]) => {
    this.state = state;

    this.imageListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };

  downloadImage = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-image.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  addFaceCountChangeListener = (
    listener: (facesDetected: number) => void,
  ): void => {
    this.faceCountChangeListeners.add(listener);
  };

  removeFaceCountChangeListener = (
    listener: (facesDetected: number) => void,
  ): void => {
    this.faceCountChangeListeners.delete(listener);
  };
}

export default ImageMedia;
