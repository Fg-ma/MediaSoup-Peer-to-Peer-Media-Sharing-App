import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import shaka from "shaka-player";
import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultVideoStreamEffects,
  defaultAudioStreamEffects,
  defaultVideoEffectsStyles,
  defaultAudioEffectsStyles,
  VideoEffectTypes,
} from "../context/effectsContext/typeConstant";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import UserDevice from "./UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../babylon/BabylonScene";
import assetMeshes from "../babylon/meshes";
import FaceLandmarks from "../babylon/FaceLandmarks";
import Deadbanding from "../babylon/Deadbanding";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "./TableStaticContentSocketController";

class VideoMedia {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  shakaPlayer: shaka.Player;
  hiddenVideo: HTMLVideoElement | undefined;
  hiddenShakaPlayer: shaka.Player | undefined;

  filename: string;
  mimeType: TableTopStaticMimeType;
  originalVideoURL: string;
  dashUrl: string | undefined;

  private fileChunks: Buffer[] = [];

  private creationTime = Date.now();

  private faceLandmarks: FaceLandmarks;

  private faceMeshWorker: Worker;
  private faceMeshResults: NormalizedLandmarkListList[] = [];
  private faceMeshProcessing = [false];
  private faceDetectionWorker: Worker;
  private faceDetectionProcessing = [false];
  private selfieSegmentationWorker: Worker;
  private selfieSegmentationResults: ImageData[] = [];
  private selfieSegmentationProcessing = [false];

  private effects: {
    [videoEffect in VideoEffectTypes]?: boolean;
  } = {};

  private maxFaces: [number] = [1];

  babylonScene: BabylonScene;

  constructor(
    private videoId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    originalVideoURL: string,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private getVideo: (key: string) => void,
    private addMessageListener: (
      listener: (
        message: IncomingTableStaticContentMessages,
        event: MessageEvent
      ) => void
    ) => void,
    private removeMessageListener: (
      listener: (
        message: IncomingTableStaticContentMessages,
        event: MessageEvent
      ) => void
    ) => void,
    dashUrl?: string | undefined
  ) {
    this.filename = filename;
    this.mimeType = mimeType;
    this.originalVideoURL = originalVideoURL;
    this.dashUrl = dashUrl;

    this.userStreamEffects.current.video[this.videoId] = {
      video: structuredClone(defaultVideoStreamEffects),
      audio: structuredClone(defaultAudioStreamEffects),
    };

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");

    if (!this.userEffectsStyles.current.video[this.videoId]) {
      this.userEffectsStyles.current.video[this.videoId] = {
        video: structuredClone(defaultVideoEffectsStyles),
        audio: structuredClone(defaultAudioEffectsStyles),
      };
    }

    this.faceLandmarks = new FaceLandmarks(
      "video",
      this.videoId,
      this.deadbanding
    );

    this.faceMeshWorker = new Worker(
      new URL("./../webWorkers/faceMeshWebWorker.worker", import.meta.url),
      {
        type: "module",
      }
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
      new URL("./../webWorkers/faceDetectionWebWorker.worker", import.meta.url),
      {
        type: "module",
      }
    );

    this.faceDetectionWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "FACES_DETECTED": {
          this.faceDetectionProcessing[0] = false;
          const detectedFaces = event.data.numFacesDetected;
          if (detectedFaces !== this.maxFaces[0]) {
            this.maxFaces[0] = detectedFaces;

            this.faceMeshWorker.postMessage({
              message: "CHANGE_MAX_FACES",
              newMaxFace: detectedFaces,
            });
            this.rectifyEffectMeshCount();
          }
          break;
        }
        default:
          break;
      }
    };

    this.selfieSegmentationWorker = new Worker(
      new URL(
        "./../webWorkers/selfieSegmentationWebWorker.worker",
        import.meta.url
      ),
      {
        type: "module",
      }
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
    this.video.autoplay = true;
    this.video.style.width = "100%";
    this.video.style.height = "100%";
    this.video.style.objectFit = "contain";
    this.video.style.backgroundColor = "#000";
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
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
    };

    this.babylonScene = new BabylonScene(
      this.videoId,
      "camera",
      this.canvas,
      this.video,
      this.faceLandmarks,
      this.effects,
      this.userEffectsStyles,
      this.faceMeshWorker,
      this.faceMeshResults,
      this.faceMeshProcessing,
      this.faceDetectionWorker,
      this.faceDetectionProcessing,
      this.selfieSegmentationWorker,
      this.selfieSegmentationResults,
      this.selfieSegmentationProcessing,
      this.userDevice,
      this.maxFaces,
      this.userMedia
    );

    this.getVideo(this.filename);
    this.addMessageListener(this.getVideoListener);
  }

  deconstructor() {
    // Pause and cleanup video elements
    this.video.pause();
    this.video.srcObject = null;

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

    // Remove canvas element
    this.canvas.remove();

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

    // Call the BabylonScene deconstructor
    this.babylonScene.deconstructor();
  }

  private getVideoListener = (
    message: IncomingTableStaticContentMessages,
    event: MessageEvent
  ) => {
    if (message.type === "downloadComplete") {
      const mergedBuffer = Buffer.concat(this.fileChunks);
      const blob = new Blob([new Uint8Array(mergedBuffer)], {
        type: this.mimeType,
      });

      const url = URL.createObjectURL(blob);
      console.log(url);
      this.video.src = url;

      this.removeMessageListener(this.getVideoListener);
    } else if (message.type === "chunk") {
      const chunkData = Buffer.from(message.data.chunk.data);
      console.log(chunkData);
      this.fileChunks.push(chunkData);
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

    if (!this.hiddenVideo) return;

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
        if (!this.dashUrl || !this.hiddenVideo) return;

        await this.shakaPlayer?.load(
          this.dashUrl,
          this.hiddenVideo.currentTime
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

  private rectifyEffectMeshCount = () => {
    for (const effect in this.effects) {
      if (
        !this.effects[effect as VideoEffectTypes] ||
        !validEffectTypes.includes(effect as EffectType)
      ) {
        continue;
      }

      let count = 0;

      for (const mesh of this.babylonScene.scene.meshes) {
        if (mesh.metadata && mesh.metadata.effectType === effect) {
          count++;
        }
      }

      if (count < this.maxFaces[0]) {
        const currentEffectStyle =
          this.userEffectsStyles.current.video[this.videoId].video[
            effect as EffectType
          ];

        if (effect === "masks" && currentEffectStyle.style === "baseMask") {
          for (let i = count; i < this.maxFaces[0]; i++) {
            this.babylonScene.babylonMeshes.createFaceMesh(i, []);
          }
        } else {
          for (let i = count; i < this.maxFaces[0]; i++) {
            const meshData =
              // @ts-expect-error: ts can't verify effect and style correlation
              assetMeshes[effect as EffectType][currentEffectStyle.style];

            this.babylonScene.createMesh(
              meshData.meshType,
              meshData.meshLabel + "." + i,
              "",
              meshData.defaultMeshPlacement,
              meshData.meshPath,
              meshData.meshFile,
              i,
              effect as EffectType,
              "faceTrack",
              meshData.transforms.offsetX,
              meshData.transforms.offsetY,
              meshData.soundEffectPath,
              [0, 0, this.babylonScene.threeDimMeshesZCoord],
              meshData.initScale,
              meshData.initRotation
            );
          }
        }
      } else if (count > this.maxFaces[0]) {
        for (let i = this.maxFaces[0]; i < count; i++) {
          for (const mesh of this.babylonScene.scene.meshes) {
            if (
              mesh.metadata &&
              mesh.metadata.effectType === effect &&
              mesh.metadata.faceId === i
            ) {
              this.babylonScene.babylonMeshes.deleteMesh(mesh);
            }
          }
        }
      }
    }
  };

  private hexToNormalizedRgb = (hex: string): [number, number, number] => {
    // Remove the leading '#' if present
    hex = hex.replace(/^#/, "");

    // Parse the r, g, b values from the hex string
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
  };

  changeEffects = (
    effect: VideoEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false
  ) => {
    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    if (validEffectTypes.includes(effect as EffectType)) {
      if (
        effect !== "masks" ||
        this.userEffectsStyles.current.video[this.videoId].video.masks.style !==
          "baseMask"
      ) {
        this.drawNewEffect(effect as EffectType);
      } else {
        this.babylonScene.deleteEffectMeshes(effect);

        if (this.effects[effect]) {
          for (let i = 0; i < this.maxFaces[0]; i++) {
            this.babylonScene.babylonMeshes.createFaceMesh(i, []);
          }
        }
      }
    }
    this.deadbanding.update("video", this.videoId, this.effects);

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor)
      );
    }

    if (effect === "blur") {
      this.babylonScene.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "pause") {
      this.babylonScene.togglePauseEffect(this.effects[effect]);
    }

    if (effect === "hideBackground") {
      this.babylonScene.toggleHideBackgroundPlane(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect]
      );
    }
  };

  drawNewEffect = (effect: EffectType) => {
    const currentStyle =
      this.userEffectsStyles.current.video?.[this.videoId]?.video[effect];

    if (!currentStyle) {
      return;
    }

    // @ts-expect-error: ts can't verify effect and style correlation
    const meshData = assetMeshes[effect][currentStyle.style];

    // Delete old meshes
    this.babylonScene.deleteEffectMeshes(effect);

    if (this.effects[effect]) {
      this.babylonScene.createEffectMeshes(
        meshData.meshType,
        meshData.meshLabel,
        "",
        meshData.defaultMeshPlacement,
        meshData.meshPath,
        meshData.meshFile,
        effect,
        "faceTrack",
        meshData.transforms.offsetX,
        meshData.transforms.offsetY,
        meshData.soundEffectPath,
        [0, 0, this.babylonScene.threeDimMeshesZCoord],
        meshData.initScale,
        meshData.initRotation
      );
    }
  };

  getStream = () => {
    return this.canvas.captureStream();
  };

  getAudioTrack = () => {
    return (this.video as any).captureStream() as MediaStream;
  };

  getTrack = () => {
    return this.canvas.captureStream().getVideoTracks()[0];
  };

  setTintColor = (newTintColor: string) => {
    this.babylonScene.setTintColor(this.hexToNormalizedRgb(newTintColor));
  };

  getPaused = () => {
    return this.effects.pause ?? false;
  };

  getTimeEllapsed = () => {
    return Date.now() - this.creationTime;
  };

  getVideoTime = () => {
    return this.video.currentTime;
  };
}

export default VideoMedia;
