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
import { defaultSettings } from "./lib/typeConstant";
import VideoSocketController from "../../serverControllers/videoServer/VideoSocketController";

export type VideoInstanceListenerTypes =
  | { type: "settingsChanged" }
  | { type: "effectsChanged" };

const videoServerBaseUrl = process.env.VIDEO_SERVER_BASE_URL;

class TableVideoMediaInstance {
  hls = new Hls();
  instanceCanvas: HTMLCanvasElement;
  instanceVideo: HTMLVideoElement | undefined;

  private creationTime = Date.now();

  private effects: {
    [videoEffect in VideoEffectTypes]?: boolean;
  } = {};

  babylonScene: BabylonScene | undefined;

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

  private videoInstanceListeners: Set<
    (message: VideoInstanceListenerTypes) => void
  > = new Set();

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

    this.instanceCanvas = document.createElement("canvas");
    this.instanceCanvas.classList.add("babylonJS-canvas");

    if (this.videoMedia.video) this.setVideo();
    this.videoMedia.addVideoListener(this.handleVideoMessages);
  }

  deconstructor() {
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

    this.videoMedia.removeVideoListener(this.handleVideoMessages);
  }

  private handleVideoMessages = (event: VideoListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.setVideo();
        break;
      case "rectifyEffectMeshCount":
        this.rectifyEffectMeshCount();
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

  private setVideo = () => {
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
    this.instanceVideo.autoplay = true;
    this.instanceVideo.controls = false;
    this.instanceVideo.muted = true;

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

        if (!this.babylonScene)
          this.babylonScene = new BabylonScene(
            this.videoMedia.babylonRenderLoopWorker,
            "video",
            this.videoMedia.aspect ?? 1,
            this.instanceCanvas,
            this.instanceVideo,
            this.videoMedia.faceLandmarks,
            this.effects,
            this.videoMedia.faceMeshResults,
            this.videoMedia.selfieSegmentationResults,
            this.userDevice,
            this.videoMedia.maxFaces,
          );

        this.updateAllEffects();

        this.videoSocket.current?.requestCatchUpVideoPosition(
          this.videoMedia.videoId,
          this.videoInstanceId,
        );
      }
    };
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

      if (count < this.videoMedia.maxFaces[0]) {
        const currentEffectStyle =
          this.staticContentEffectsStyles.current.video[this.videoInstanceId]
            .video[effect as EffectType];

        if (effect === "masks" && currentEffectStyle.style === "baseMask") {
          for (let i = count; i < this.videoMedia.maxFaces[0]; i++) {
            this.babylonScene.babylonMeshes.createFaceMesh(i, []);
          }
        } else {
          for (let i = count; i < this.videoMedia.maxFaces[0]; i++) {
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
      } else if (count > this.videoMedia.maxFaces[0]) {
        for (let i = this.videoMedia.maxFaces[0]; i < count; i++) {
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
    this.videoMedia.babylonRenderLoopWorker?.removeAllNeed(
      this.videoInstanceId,
    );

    if (
      Object.entries(this.effects).some(
        ([key, val]) => val && key !== "hideBackground",
      )
    ) {
      this.videoMedia.babylonRenderLoopWorker?.addNeed(
        "faceDetection",
        this.videoInstanceId,
      );
    }
    if (this.effects.hideBackground) {
      this.videoMedia.babylonRenderLoopWorker?.addNeed(
        "selfieSegmentation",
        this.videoInstanceId,
      );
    }
    if (
      this.effects.masks &&
      this.staticContentEffectsStyles.current.video[this.videoInstanceId].video
        .masks.style !== "baseMask"
    ) {
      this.videoMedia.babylonRenderLoopWorker?.addNeed(
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

    this.videoMedia.babylonRenderLoopWorker?.removeAllNeed(
      this.videoInstanceId,
    );

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
              for (let i = 0; i < this.videoMedia.maxFaces[0]; i++) {
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
              for (let i = 0; i < this.videoMedia.maxFaces[0]; i++) {
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
          for (let i = 0; i < this.videoMedia.maxFaces[0]; i++) {
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
}

export default TableVideoMediaInstance;
