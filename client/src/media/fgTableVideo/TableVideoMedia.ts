import Hls from "hls.js";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import { StaticContentEffectsType } from "../../../../universal/effectsTypeConstant";
import TableVideoAudioMedia from "./TableVideoAudioMedia";
import {
  TableContentStateTypes,
  LoadingStateTypes,
  StaticMimeTypes,
} from "../../../../universal/contentTypeConstant";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import BabylonRenderLoopWorker from "../../babylon/BabylonRenderLoopWorker";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../tools/userDevice/UserDevice";

const videoServerBaseUrl = process.env.VIDEO_SERVER_BASE_URL;

export type VideoListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" }
  | { type: "rectifyEffectMeshCount" };

class TableVideoMedia {
  hls = new Hls();
  video: HTMLVideoElement;
  thumbnail: HTMLImageElement;

  loadingState: LoadingStateTypes = "downloading";
  aspect: number | undefined;

  private videoListeners: Set<(message: VideoListenerTypes) => void> =
    new Set();

  private audioStream?: MediaStream;
  private videoAudioMedia?: TableVideoAudioMedia;

  maxFaces: [number] = [1];
  detectedFaces: [number] = [0];
  maxFacesDetected = 0;

  faceLandmarks: FaceLandmarks;

  faceMeshWorker: Worker;
  faceMeshResults: NormalizedLandmarkListList[] = [];
  faceMeshProcessing = [false];
  faceDetectionWorker: Worker;
  faceDetectionProcessing = [false];
  selfieSegmentationWorker: Worker;
  selfieSegmentationResults: ImageData[] = [];
  selfieSegmentationProcessing = [false];

  faceCountChangeListeners: Set<(facesDetected: number) => void> = new Set();

  forcingFaces = false;

  babylonRenderLoopWorker: BabylonRenderLoopWorker | undefined;

  constructor(
    public videoId: string,
    public filename: string,
    public mimeType: StaticMimeTypes,
    public state: TableContentStateTypes[],
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
  ) {
    this.faceLandmarks = new FaceLandmarks(
      true,
      "video",
      this.videoId,
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
          this.detectedFaces[0] =
            detectedFaces === undefined ? 0 : detectedFaces;

          if (this.detectedFaces[0] > this.maxFacesDetected) {
            this.maxFacesDetected = this.detectedFaces[0];
          }

          if (this.detectedFaces[0] !== this.maxFaces[0]) {
            this.maxFaces[0] = this.detectedFaces[0];

            this.faceMeshWorker.postMessage({
              message: "CHANGE_MAX_FACES",
              newMaxFace: this.detectedFaces[0],
            });
            this.videoListeners.forEach((listener) => {
              listener({ type: "rectifyEffectMeshCount" });
            });

            this.faceCountChangeListeners.forEach((listener) => {
              listener(this.detectedFaces[0]);
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

    this.video = document.createElement("video");
    const videoSrc = `${videoServerBaseUrl}stream-video/${this.videoId}/index.m3u8`;
    if (Hls.isSupported()) {
      this.hls.loadSource(videoSrc);
      this.hls.attachMedia(this.video);
    } else if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
      this.video.src = `${videoServerBaseUrl}stream-video/${this.videoId}/video.mp4`;
    }
    this.video.onloadedmetadata = () => {
      if (!this.video) return;
      this.aspect = this.video.videoWidth / this.video.videoHeight;

      this.babylonRenderLoopWorker = new BabylonRenderLoopWorker(
        false,
        this.faceLandmarks,
        this.aspect,
        this.video,
        this.faceMeshWorker,
        this.faceMeshProcessing,
        this.faceDetectionWorker,
        this.faceDetectionProcessing,
        this.selfieSegmentationWorker,
        this.selfieSegmentationProcessing,
        this.userDevice,
      );

      this.loadingState = "downloaded";

      this.videoListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });
    };

    this.thumbnail = document.createElement("img");
    this.thumbnail.src = `${videoServerBaseUrl}stream-video-thumbnail/${this.videoId}`;
  }

  deconstructor() {
    this.video.pause();
    this.video.src = "";
    this.video.srcObject = null;

    this.videoListeners.clear();

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

  downloadVideo = () => {
    const link = document.createElement("a");
    link.href = `${videoServerBaseUrl}download-video/${this.videoId}/video.mp4`;
    link.download = "video.mp4";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  addVideoListener = (
    listener: (message: VideoListenerTypes) => void,
  ): void => {
    this.videoListeners.add(listener);
  };

  removeVideoListener = (
    listener: (message: VideoListenerTypes) => void,
  ): void => {
    this.videoListeners.delete(listener);
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.videoListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
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

export default TableVideoMedia;
