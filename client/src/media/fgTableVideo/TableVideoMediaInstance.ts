import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import Hls from "hls.js";
import {
  defaultVideoEffects,
  defaultAudioEffects,
  defaultVideoEffectsStyles,
  defaultAudioEffectsStyles,
  VideoEffectTypes,
  VideoEffectStylesType,
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
} from "../../../../universal/effectsTypeConstant";
import UserDevice from "../../tools/userDevice/UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import assetMeshes from "../../babylon/meshes";
import Deadbanding from "../../babylon/Deadbanding";
import TableVideoMedia, { VideoListenerTypes } from "./TableVideoMedia";
import { defaultMeta, defaultSettings } from "./lib/typeConstant";
import VideoSocketController from "../../serverControllers/videoServer/VideoSocketController";
import {
  IncomingVideoMessages,
  onRespondedCatchUpVideoMetadataType,
  onUpdatedVideoMetadataType,
} from "../../serverControllers/videoServer/lib/typeConstant";
import BabylonRenderLoopWorker from "../../babylon/BabylonRenderLoopWorker";
import FaceLandmarks from "../../babylon/FaceLandmarks";

export type VideoInstanceListenerTypes =
  | { type: "settingsChanged" }
  | { type: "effectsChanged" }
  | { type: "metaChanged" }
  | { type: "thumbnailLoaded" };

const videoServerBaseUrl = process.env.VIDEO_SERVER_BASE_URL;

class TableVideoMediaInstance {
  hls = new Hls();
  instanceCanvas: HTMLCanvasElement;
  instanceVideo: HTMLVideoElement | undefined;
  instanceThumbnail: HTMLImageElement | undefined;

  instanceVideoSetUp = false;
  instanceThumbnailSetUp = false;

  private creationTime = Date.now();

  private effects: {
    [videoEffect in VideoEffectTypes]?: boolean;
  } = {};
  private effectsNeedingFaceDetection = [
    "glasses",
    "beards",
    "mustaches",
    "masks",
    "hats",
    "pets",
  ];

  private positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  settings = structuredClone(defaultSettings);
  meta = structuredClone(defaultMeta);

  private videoInstanceListeners: Set<
    (message: VideoInstanceListenerTypes) => void
  > = new Set();

  maxFaces: [number] = [0];
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

  babylonScene: BabylonScene | undefined;

  babylonRenderLoopWorker: BabylonRenderLoopWorker | undefined;

  constructor(
    public videoMedia: TableVideoMedia,
    public videoInstanceId: string,
    private userDevice: React.MutableRefObject<UserDevice>,
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
    private videoSocket: React.MutableRefObject<
      VideoSocketController | undefined
    >,
  ) {
    this.positioning = this.initPositioning;

    if (!this.staticContentEffects.current.video[this.videoInstanceId]) {
      this.staticContentEffects.current.video[this.videoInstanceId] = {
        video: structuredClone(defaultVideoEffects),
        audio: structuredClone(defaultAudioEffects),
      };
    }
    if (!this.staticContentEffects.current.video[this.videoInstanceId].audio) {
      this.staticContentEffects.current.video[this.videoInstanceId].audio =
        structuredClone(defaultAudioEffects);
    }

    if (!this.staticContentEffectsStyles.current.video[this.videoInstanceId]) {
      this.staticContentEffectsStyles.current.video[this.videoInstanceId] = {
        video: structuredClone(defaultVideoEffectsStyles),
        audio: structuredClone(defaultAudioEffectsStyles),
      };
    }

    this.faceLandmarks = new FaceLandmarks(
      true,
      "video",
      this.videoInstanceId,
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
            this.rectifyEffectMeshCount();

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

    this.instanceCanvas = document.createElement("canvas");
    this.instanceCanvas.classList.add("babylonJS-canvas");

    this.videoSocket.current?.requestCatchUpVideoMetadata(
      this.videoMedia.videoId,
      this.videoInstanceId,
    );

    this.videoSocket.current?.addMessageListener(this.handleVideoSocketMessage);

    this.videoMedia.addVideoListener(this.handleVideoMessages);

    if (this.videoMedia.loadingState === "downloaded") {
      this.createInstanceThumbnail();
    }
  }

  deconstructor() {
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

    // Pause and cleanup video elements
    if (this.instanceVideo) {
      this.instanceVideo.pause();
      this.instanceVideo.srcObject = null;
      this.instanceVideo = undefined;
    }

    // Remove canvas element
    if (this.instanceCanvas) {
      this.instanceCanvas.remove();
    }

    this.babylonScene?.deconstructor();

    this.videoSocket.current?.removeMessageListener(
      this.handleVideoSocketMessage,
    );

    this.videoMedia.removeVideoListener(this.handleVideoMessages);
  }

  private createInstanceThumbnail = () => {
    this.instanceThumbnail = this.videoMedia.thumbnail.cloneNode(
      true,
    ) as HTMLImageElement;
    if (
      this.videoMedia.thumbnail.naturalWidth >
      this.videoMedia.thumbnail.naturalHeight
    ) {
      this.instanceThumbnail.style.height = "auto";
      this.instanceThumbnail.style.width = "100%";
    } else {
      this.instanceThumbnail.style.height = "100%";
      this.instanceThumbnail.style.width = "auto";
    }

    this.instanceThumbnailSetUp = true;
    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "thumbnailLoaded" });
    });
  };

  private handleVideoMessages = (event: VideoListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.createInstanceThumbnail();
        break;
      default:
        break;
    }
  };

  private onUpdateVideoMetadata = async (event: onUpdatedVideoMetadataType) => {
    const { contentId, instanceId } = event.header;

    if (
      !this.settings.synced.value ||
      contentId !== this.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    const {
      isPlaying,
      lastKnownPosition,
      videoPlaybackSpeed,
      ended,
      lastUpdatedAt,
    } = event.data;

    const calculatedCurrentTime =
      (isPlaying
        ? ((Date.now() - lastUpdatedAt) / 1000) * videoPlaybackSpeed
        : 0) + lastKnownPosition;

    this.meta.videoSpeed = videoPlaybackSpeed;
    this.meta.currentTime = calculatedCurrentTime;
    this.meta.isPlaying = isPlaying;
    this.meta.ended = ended;

    if (!ended && !this.instanceVideo) {
      await this.setVideo();
    }

    if (this.babylonScene) {
      this.babylonScene.setRunning(!ended && isPlaying);
    }

    if (this.instanceVideo) {
      this.instanceVideo.currentTime = calculatedCurrentTime;

      this.instanceVideo.playbackRate = videoPlaybackSpeed;

      if (isPlaying && this.instanceVideo.paused) {
        this.instanceVideo.play();
      } else if (!isPlaying && !this.instanceVideo.paused) {
        this.instanceVideo.pause();
      }
    }

    if (!isPlaying) {
      setTimeout(() => {
        this.babylonScene?.forceEngineRenderLoop();
      }, 100);
    }

    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "metaChanged" });
    });
  };

  private onRespondedCatchUpVideoMetadata = async (
    event: onRespondedCatchUpVideoMetadataType,
  ) => {
    const { contentId, instanceId } = event.header;

    if (
      !this.settings.synced.value ||
      contentId !== this.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    const {
      isPlaying,
      lastKnownPosition,
      videoPlaybackSpeed,
      ended,
      lastUpdatedAt,
    } = event.data;

    const calculatedCurrentTime =
      (isPlaying
        ? ((Date.now() - lastUpdatedAt) / 1000) * videoPlaybackSpeed
        : 0) + lastKnownPosition;

    this.meta.videoSpeed = videoPlaybackSpeed;
    this.meta.currentTime = calculatedCurrentTime;
    this.meta.isPlaying = isPlaying;
    this.meta.ended = ended;

    if (!ended && !this.instanceVideo) {
      await this.setVideo();
    }

    if (this.babylonScene) {
      this.babylonScene.setRunning(!ended && isPlaying);
    }

    if (this.instanceVideo) {
      this.instanceVideo.currentTime = calculatedCurrentTime;

      this.instanceVideo.playbackRate = videoPlaybackSpeed;

      if (isPlaying && this.instanceVideo.paused) {
        this.instanceVideo.play();
      } else if (!isPlaying && !this.instanceVideo.paused) {
        this.instanceVideo.pause();
      }
    }

    if (!isPlaying) {
      setTimeout(() => {
        this.babylonScene?.forceEngineRenderLoop();
      }, 100);
    }

    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "metaChanged" });
    });
  };

  private handleVideoSocketMessage = (event: IncomingVideoMessages) => {
    switch (event.type) {
      case "updatedVideoMetadata":
        this.onUpdateVideoMetadata(event);
        break;
      case "respondedCatchUpVideoMetadata":
        this.onRespondedCatchUpVideoMetadata(event);
        break;
      default:
        break;
    }
  };

  settingsChanged = () => {
    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "settingsChanged" });
    });
  };

  private setVideo = (): Promise<void> => {
    return new Promise((resolve) => {
      this.instanceVideo = document.createElement("video");
      const videoSrc = `${videoServerBaseUrl}stream-video/${this.videoMedia.videoId}/index.m3u8`;

      if (Hls.isSupported()) {
        this.hls.loadSource(videoSrc);
        this.hls.attachMedia(this.instanceVideo);
      } else if (
        this.instanceVideo.canPlayType("application/vnd.apple.mpegurl")
      ) {
        this.instanceVideo.src = `${videoServerBaseUrl}stream-video/${this.videoMedia.videoId}/video.mp4`;
      }

      this.instanceVideo.autoplay = this.meta.isPlaying;
      this.instanceVideo.controls = false;
      this.instanceVideo.muted = this.meta.isPlaying;
      this.instanceVideo.loop = false;

      this.instanceVideo.onloadedmetadata = () => {
        if (this.instanceVideo) {
          this.instanceCanvas.width = this.instanceVideo.videoWidth;
          this.instanceCanvas.height = this.instanceVideo.videoHeight;

          if (this.instanceVideo.videoWidth > this.instanceVideo.videoHeight) {
            this.instanceCanvas.style.height = "auto";
            this.instanceCanvas.style.width = "100%";
          } else {
            this.instanceCanvas.style.height = "100%";
            this.instanceCanvas.style.width = "auto";
          }

          if (!this.babylonRenderLoopWorker) {
            this.babylonRenderLoopWorker = new BabylonRenderLoopWorker(
              false,
              this.instanceVideo.videoWidth / this.instanceVideo.videoHeight,
              this.instanceVideo,
              this.faceMeshWorker,
              this.faceMeshProcessing,
              this.faceDetectionWorker,
              this.faceDetectionProcessing,
              this.selfieSegmentationWorker,
              this.selfieSegmentationProcessing,
              this.userDevice,
            );
          }

          if (!this.babylonScene) {
            this.babylonScene = new BabylonScene(
              this.babylonRenderLoopWorker,
              "video",
              this.videoMedia.aspect ?? 1,
              this.instanceCanvas,
              this.instanceVideo,
              this.faceLandmarks,
              this.effects,
              this.faceMeshResults,
              this.selfieSegmentationResults,
              this.userDevice,
              this.maxFaces,
              this.meta.ended,
            );
          }

          this.updateAllEffects();
        }

        this.instanceVideoSetUp = true;

        resolve();
      };
    });
  };

  private rectifyEffectMeshCount = () => {
    if (!this.babylonScene) return;

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
          this.staticContentEffectsStyles.current.video[this.videoInstanceId]
            .video[effect as EffectType];

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
              meshData.initRotation,
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

  private updateNeed = () => {
    this.babylonRenderLoopWorker?.removeAllNeed(this.videoInstanceId);

    if (
      this.maxFaces[0] === 0 ||
      Object.entries(this.effects).some(
        ([key, val]) => val && this.effectsNeedingFaceDetection.includes(key),
      )
    ) {
      this.babylonRenderLoopWorker?.addNeed(
        "faceDetection",
        this.videoInstanceId,
      );
    }
    if (
      Object.entries(this.effects).some(
        ([key, val]) => val && this.effectsNeedingFaceDetection.includes(key),
      )
    ) {
      this.babylonRenderLoopWorker?.addNeed("faceMesh", this.videoInstanceId);
    }
    if (this.effects.hideBackground) {
      this.babylonRenderLoopWorker?.addNeed(
        "selfieSegmentation",
        this.videoInstanceId,
      );
    }
    if (
      this.effects.masks &&
      this.staticContentEffectsStyles.current.video[this.videoInstanceId].video
        .masks.style !== "baseMask"
    ) {
      this.babylonRenderLoopWorker?.addNeed(
        "smoothFaceLandmarks",
        this.videoInstanceId,
      );
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

  clearAllEffects = () => {
    if (!this.babylonScene) return;

    this.babylonRenderLoopWorker?.removeAllNeed(this.videoInstanceId);

    Object.entries(this.effects).map(([effect, value]) => {
      if (value) {
        this.staticContentEffects.current.video[this.videoInstanceId].video[
          effect as EffectType
        ] = false;

        if (effect === "tint") {
          this.babylonScene?.toggleTintPlane(false);
        } else if (effect === "blur") {
          this.babylonScene?.toggleBlurEffect(false);
        } else if (effect === "hideBackground") {
          this.babylonScene?.toggleHideBackgroundPlane(false);
        } else if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            false,
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      }
    });

    this.effects = structuredClone(defaultVideoEffects);

    this.deadbanding.current.update(
      "capture",
      this.videoInstanceId,
      this.effects,
    );

    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  updateAllEffects = (oldEffectStyles?: VideoEffectStylesType) => {
    if (!this.babylonScene) return;

    Object.entries(
      this.staticContentEffects.current.video[this.videoInstanceId].video,
    ).map(([effect, value]) => {
      if (this.effects[effect as EffectType] && !value) {
        this.effects[effect as EffectType] = false;

        if (effect === "tint") {
          this.babylonScene?.toggleTintPlane(false);
        } else if (effect === "blur") {
          this.babylonScene?.toggleBlurEffect(false);
        } else if (effect === "hideBackground") {
          this.babylonScene?.toggleHideBackgroundPlane(false);
        } else if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            false,
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      } else if (!this.effects[effect as EffectType] && value) {
        this.effects[effect as EffectType] = true;

        if (validEffectTypes.includes(effect as EffectType)) {
          if (
            effect !== "masks" ||
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video.masks.style !== "baseMask"
          ) {
            this.drawNewEffect(effect as EffectType);
          } else {
            this.babylonScene?.deleteEffectMeshes(effect);

            if (this.effects[effect]) {
              for (let i = 0; i < this.maxFaces[0]; i++) {
                this.babylonScene?.babylonMeshes.createFaceMesh(i, []);
              }
            }
          }
        }

        if (effect === "tint") {
          this.setTintColor(
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].color,
          );
          this.babylonScene?.toggleTintPlane(
            this.effects[effect] ?? false,
            this.hexToNormalizedRgb(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color,
            ),
          );
        }

        if (effect === "blur") {
          this.babylonScene?.toggleBlurEffect(this.effects[effect] ?? false);
        }

        if (effect === "hideBackground") {
          if (
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].style === "color"
          ) {
            this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color,
            );
          } else {
            this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].style,
            );
          }

          this.babylonScene?.toggleHideBackgroundPlane(
            this.effects[effect] ?? false,
          );
        }

        if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.swapPostProcessEffects(
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].style,
          );

          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            this.effects[effect] ?? false,
          );
        }
      } else if (this.effects[effect as EffectType] && value) {
        if (
          validEffectTypes.includes(effect as EffectType) &&
          (!oldEffectStyles ||
            oldEffectStyles[effect as EffectType].style !==
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect as EffectType].style)
        ) {
          if (
            effect !== "masks" ||
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video.masks.style !== "baseMask"
          ) {
            this.babylonScene?.deleteEffectMeshes(effect);

            this.drawNewEffect(effect as EffectType);
          } else {
            this.babylonScene?.deleteEffectMeshes(effect);

            if (this.effects[effect]) {
              for (let i = 0; i < this.maxFaces[0]; i++) {
                this.babylonScene?.babylonMeshes.createFaceMesh(i, []);
              }
            }
          }
        }

        if (
          effect === "tint" &&
          (!oldEffectStyles ||
            oldEffectStyles[effect].color !==
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color)
        ) {
          this.babylonScene?.toggleTintPlane(false);

          this.setTintColor(
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].color,
          );
          this.babylonScene?.toggleTintPlane(
            this.effects[effect] ?? false,
            this.hexToNormalizedRgb(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color,
            ),
          );
        }

        if (
          effect === "hideBackground" &&
          (!oldEffectStyles ||
            oldEffectStyles[effect].color !==
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color ||
            oldEffectStyles[effect].style !==
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].style)
        ) {
          this.babylonScene?.toggleHideBackgroundPlane(false);

          if (
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].style === "color"
          ) {
            this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].color,
            );
          } else {
            this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].style,
            );
          }
          this.babylonScene?.toggleHideBackgroundPlane(
            this.effects[effect] ?? false,
          );
        }

        if (
          effect === "postProcess" &&
          (!oldEffectStyles ||
            oldEffectStyles[effect].style !==
              this.staticContentEffectsStyles.current.video[
                this.videoInstanceId
              ].video[effect].style)
        ) {
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            false,
          );

          this.babylonScene?.babylonShaderController.swapPostProcessEffects(
            this.staticContentEffectsStyles.current.video[this.videoInstanceId]
              .video[effect].style,
          );
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            this.effects[effect] ?? false,
          );
        }
      }
    });

    this.updateNeed();

    this.deadbanding.current.update(
      "video",
      this.videoInstanceId,
      this.effects,
    );

    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  changeEffects = (
    effect: VideoEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false,
  ) => {
    if (!this.babylonScene) return;

    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    this.updateNeed();

    if (validEffectTypes.includes(effect as EffectType)) {
      if (
        effect !== "masks" ||
        this.staticContentEffectsStyles.current.video[this.videoInstanceId]
          .video.masks.style !== "baseMask"
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
    this.deadbanding.current.update(
      "video",
      this.videoInstanceId,
      this.effects,
    );

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor),
      );
    }

    if (effect === "blur") {
      this.babylonScene.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "hideBackground") {
      this.babylonScene.toggleHideBackgroundPlane(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect],
      );
    }

    this.videoInstanceListeners.forEach((listener) => {
      listener({ type: "effectsChanged" });
    });
  };

  private drawNewEffect = (effect: EffectType) => {
    if (!this.babylonScene) return;

    const currentStyle =
      this.staticContentEffectsStyles.current.video?.[this.videoInstanceId]
        ?.video[effect];

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
        meshData.initRotation,
      );
    }
  };

  getStream = () => {
    return this.instanceCanvas.captureStream();
  };

  getAudioTrack = () => {
    return this.instanceVideo
      ? ((this.instanceVideo as any).captureStream() as MediaStream)
      : undefined;
  };

  getTrack = () => {
    return this.instanceCanvas.captureStream().getVideoTracks()[0];
  };

  setTintColor = (newTintColor: string) => {
    this.babylonScene?.setTintColor(this.hexToNormalizedRgb(newTintColor));
  };

  getTimeEllapsed = () => {
    return Date.now() - this.creationTime;
  };

  getVideoTime = () => {
    return this.instanceVideo?.currentTime;
  };

  getAspect = () => {
    return this.videoMedia.aspect;
  };

  setPositioning = (positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }) => {
    this.positioning = positioning;
  };

  getPositioning = () => {
    return this.positioning;
  };

  addVideoInstanceListener = (
    listener: (message: VideoInstanceListenerTypes) => void,
  ): void => {
    this.videoInstanceListeners.add(listener);
  };

  removeVideoInstanceListener = (
    listener: (message: VideoInstanceListenerTypes) => void,
  ): void => {
    this.videoInstanceListeners.delete(listener);
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

export default TableVideoMediaInstance;
