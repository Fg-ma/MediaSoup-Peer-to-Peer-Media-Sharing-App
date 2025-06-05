import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import shaka from "shaka-player";
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
import Downloader from "../../tools/downloader/Downloader";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import {
  DownloadListenerTypes,
  onDownloadFinishType,
} from "../../tools/downloader/lib/typeConstant";

export type VideoListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: "downloadRetry" }
  | { type: "stateChanged" }
  | { type: "rectifyEffectMeshCount" };

class TableVideoMedia {
  video: HTMLVideoElement | undefined;
  shakaPlayer: shaka.Player;
  hiddenVideo: HTMLVideoElement | undefined;
  hiddenShakaPlayer: shaka.Player | undefined;

  dashUrl: string | undefined;

  fileSize = 0;
  blobURL: string | undefined;
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

  downloader: undefined | Downloader;

  constructor(
    public videoId: string,
    public filename: string,
    public mimeType: StaticMimeTypes,
    public state: TableContentStateTypes[],
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    // this.shakaPlayer = new shaka.Player(this.video);

    // if (this.dashUrl) {
    //   this.shakaPlayer.load(this.dashUrl).then(() => {
    //     console.log("Dash video loaded successfully");
    //   });
    // } else {
    //   this.shakaPlayer.load(this.originalVideoURL).then(() => {
    //     console.log("Original video loaded successfully");
    //   });

    //   this.hiddenVideo = document.createElement("video");
    //   this.hiddenVideo.style.position = "absolute";
    //   this.hiddenVideo.style.top = "0";
    //   this.hiddenVideo.style.left = "0";
    //   this.hiddenVideo.style.objectFit = "cover";
    //   this.hiddenVideo.style.backgroundColor = "#000";
    //   this.hiddenVideo.style.zIndex = "10";
    //   this.hiddenVideo.style.display = "none";
    //   this.hiddenVideo.style.opacity = "0%";
    //   this.hiddenVideo.muted = true;
    //   this.hiddenShakaPlayer = new shaka.Player(this.hiddenVideo);
    // }

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

    this.downloader = new Downloader(
      "video",
      this.videoId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.videoId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();
  }

  deconstructor() {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = undefined;
    }

    if (this.hiddenVideo) {
      this.hiddenVideo.pause();
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo = undefined;
    }

    // Destroy Shaka players to release resources
    if (this.shakaPlayer) {
      this.shakaPlayer.destroy().catch((error) => {
        console.error("Error destroying Shaka player:", error);
      });
    }
    if (this.hiddenShakaPlayer) {
      this.hiddenShakaPlayer.destroy().catch((error) => {
        console.error("Error destroying hidden Shaka player:", error);
      });
    }

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

    if (this.downloader) {
      this.removeCurrentDownload(this.videoId);
      this.downloader = undefined;
    }
  }

  private onDownloadFinish = async (message: onDownloadFinishType) => {
    const { blob, fileSize } = message.data;

    this.fileSize = fileSize;

    this.blobURL = URL.createObjectURL(blob);
    this.video = document.createElement("video");
    this.video.src = this.blobURL;

    this.video.addEventListener("loadeddata", () => {
      this.aspect =
        (this.video?.videoWidth ?? 1) / (this.video?.videoHeight ?? 1);

      if (this.video)
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

      // this.audioStream = (this.video as any)?.captureStream();

      // if (this.audioStream && this.audioStream.getAudioTracks().length > 0) {
      //   this.videoAudioMedia = new TableVideoAudioMedia(
      //     this.videoId,
      //     this.audioStream,
      //     this.staticContentEffects,
      //   );
      // }

      this.videoListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });
    });

    this.downloader = undefined;
  };

  private handleDownloadMessage = (message: DownloadListenerTypes) => {
    switch (message.type) {
      case "downloadFinish":
        this.onDownloadFinish(message);
        break;
      case "downloadFailed":
        this.loadingState = "failed";
        this.downloader = undefined;

        this.videoListeners.forEach((listener) => {
          listener({ type: "downloadFailed" });
        });
        break;
      case "downloadPaused":
        this.loadingState = "paused";
        this.videoListeners.forEach((listener) => {
          listener({ type: "downloadPaused" });
        });
        break;
      case "downloadResumed":
        this.loadingState = "downloading";
        this.videoListeners.forEach((listener) => {
          listener({ type: "downloadResumed" });
        });
        break;
      default:
        break;
    }
  };

  preloadDashStream = (url: string) => {
    this.dashUrl = url;

    if (!this.hiddenShakaPlayer) return;

    if (this.dashUrl) {
      this.hiddenShakaPlayer.load(this.dashUrl).then(() => {
        this.switchToDashStream();
      });
    }
  };

  switchToDashStream = async () => {
    console.log("DASH stream swap");

    if (!this.hiddenVideo || !this.video) return;

    try {
      const currentTime = this.video.currentTime;
      const isPaused = this.video.paused;

      // Sync hidden video with the main video
      this.hiddenVideo.currentTime = currentTime;
      if (!isPaused) {
        this.hiddenVideo.play();
      }
      this.hiddenVideo.muted = false;

      const videoBox = this.video.getBoundingClientRect();

      this.hiddenVideo.width = videoBox.width;
      this.hiddenVideo.height = videoBox.height;

      this.hiddenVideo.style.display = "";
      this.hiddenVideo.style.opacity = "100%";

      // After a short delay, switch the main video to DASH and hide the hidden video
      setTimeout(async () => {
        if (!this.dashUrl || !this.hiddenVideo || !this.video) return;

        await this.shakaPlayer?.load(
          this.dashUrl,
          this.hiddenVideo.currentTime,
        );

        this.video.width = videoBox.width;
        this.video.height = videoBox.height;

        this.video.currentTime = this.hiddenVideo.currentTime;
        if (!this.hiddenVideo.paused) {
          this.video.play();
        }

        this.hiddenVideo.muted = true;

        // Hide the hidden video and clean up
        setTimeout(() => {
          if (this.hiddenVideo) {
            this.hiddenVideo.pause();
            this.hiddenVideo.remove();
            this.hiddenVideo.srcObject = null;
            this.hiddenVideo = undefined;
          }
        }, 250);
      }, 500); // Adjust the delay if needed
    } catch (error) {
      console.error("Error during DASH switch:", error);
    }
  };

  downloadVideo = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-video.mp4";

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

  getFileSize = () => {
    return this.formatBytes(this.fileSize);
  };

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  retryDownload = () => {
    if (this.downloader || this.loadingState === "downloaded") return;

    this.loadingState = "downloading";

    this.downloader = new Downloader(
      "video",
      this.videoId,
      this.filename,
      this.mimeType,
      this.tableStaticContentSocket,
      this.sendDownloadSignal,
      this.removeCurrentDownload,
    );
    this.addCurrentDownload(this.videoId, this.downloader);
    this.downloader.addDownloadListener(this.handleDownloadMessage);
    this.downloader.start();

    this.videoListeners.forEach((listener) => {
      listener({ type: "downloadRetry" });
    });
  };
}

export default TableVideoMedia;
