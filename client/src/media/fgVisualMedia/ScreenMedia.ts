import {
  defaultScreenEffectsStyles,
  UserEffectsStylesType,
  defaultScreenEffects,
  ScreenEffectTypes,
  UserEffectsType,
} from "../../../../universal/effectsTypeConstant";
import { UserMediaType } from "../../context/mediaContext/lib/typeConstant";
import UserDevice from "../../tools/userDevice/UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import { defaultSettings } from "./lib/typeConstant";

export type ScreenMediaListenerTypes =
  | { type: "settingsChanged" }
  | { type: "toggleMiniPlayer" }
  | { type: "toggleClosedCaptions" };
class ScreenMedia {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;

  aspectRatio: number | undefined;

  private creationTime = Date.now();

  private effects: {
    [screenEffect in ScreenEffectTypes]?: boolean;
  };

  babylonScene: BabylonScene | undefined;

  settings = structuredClone(defaultSettings);

  private screenListeners: Set<(message: ScreenMediaListenerTypes) => void> =
    new Set();

  constructor(
    private tableId: string,
    private username: string,
    private instance: string,
    private screenId: string,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private originalScreenStream: MediaStream,
    private screenStream: MediaStream,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private userMedia: React.MutableRefObject<UserMediaType>,
  ) {
    this.effects = {};

    this.userEffects.current.screen[this.screenId] =
      structuredClone(defaultScreenEffects);

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");

    if (!userEffectsStyles.current.screen[this.screenId]) {
      userEffectsStyles.current.screen[this.screenId] = structuredClone(
        defaultScreenEffectsStyles,
      );
    }

    // Start video and render loop
    this.video = document.createElement("video");

    this.video.srcObject = this.screenStream;
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      this.aspectRatio = this.video.videoWidth / this.video.videoHeight;

      this.video.play();

      this.babylonScene = new BabylonScene(
        undefined,
        "screen",
        this.aspectRatio,
        this.canvas,
        this.video,
        undefined,
        this.effects,
        undefined,
        undefined,
        this.userDevice,
        [0],
      );
    };

    this.originalScreenStream
      .getVideoTracks()[0]
      .addEventListener("ended", this.originalScreenStreamEnded);
  }

  originalScreenStreamEnded = () => {
    this.originalScreenStream
      .getVideoTracks()[0]
      .removeEventListener("ended", this.originalScreenStreamEnded);

    this.mediasoupSocket.current?.sendMessage({
      type: "removeProducer",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        producerType: "screen",
        producerId: this.screenId,
      },
    });

    if (this.userMedia.current.screenAudio[`${this.screenId}_audio`]) {
      this.mediasoupSocket.current?.sendMessage({
        type: "removeProducer",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: "screenAudio",
          producerId: `${this.screenId}_audio`,
        },
      });
    }
  };

  deconstructor() {
    // End initial stream
    this.screenStream.getTracks().forEach((track) => track.stop());
    this.originalScreenStream.getTracks().forEach((track) => track.stop());

    // End video
    this.video.pause();
    this.video.srcObject = null;

    this.canvas.remove();

    // Deconstruct base shader
    this.babylonScene?.deconstructor();
  }

  settingsChanged = () => {
    this.screenListeners.forEach((listener) => {
      listener({ type: "settingsChanged" });
    });
  };

  handleMiniPlayer = () => {
    this.screenListeners.forEach((listener) => {
      listener({ type: "toggleMiniPlayer" });
    });
  };

  handleClosedCaptions = () => {
    this.screenListeners.forEach((listener) => {
      listener({ type: "toggleClosedCaptions" });
    });
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

    Object.entries(this.effects).map(([effect, value]) => {
      if (value) {
        this.userEffects.current.camera[this.screenId][effect as EffectType] =
          false;

        if (effect === "tint") {
          this.babylonScene?.toggleTintPlane(false);
        } else if (effect === "blur") {
          this.babylonScene?.toggleBlurEffect(false);
        } else if (effect === "pause") {
          this.babylonScene?.togglePauseEffect(false);
        } else if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            false,
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      }
    });

    this.effects = structuredClone(defaultScreenEffects);
  };

  changeEffects(
    effect: ScreenEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false,
  ) {
    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    if (validEffectTypes.includes(effect as EffectType)) {
      this.drawNewEffect(effect as EffectType);
    }

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene?.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor),
      );
    }

    if (effect === "blur") {
      this.babylonScene?.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "pause") {
      this.babylonScene?.togglePauseEffect(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect],
      );
    }
  }

  drawNewEffect = (effect: EffectType) => {
    const currentStyle =
      this.userEffectsStyles.current.camera?.[this.screenId]?.[effect];

    if (!currentStyle) {
      return;
    }

    // @ts-expect-error: ts can't verify effect and style correlate
    const meshData = assetMeshes[effect][currentStyle.style];

    // Delete old meshes
    this.babylonScene?.deleteEffectMeshes(effect);

    if (this.effects[effect as ScreenEffectTypes]) {
      this.babylonScene?.createEffectMeshes(
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

  getStream() {
    return this.canvas.captureStream();
  }

  getTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  setTintColor(newTintColor: string) {
    this.babylonScene?.setTintColor(this.hexToNormalizedRgb(newTintColor));
  }

  getPaused = () => {
    return this.effects.pause ?? false;
  };

  getTimeEllapsed = () => {
    return Date.now() - this.creationTime;
  };

  addVisualMediaListener = (
    listener: (message: ScreenMediaListenerTypes) => void,
  ): void => {
    this.screenListeners.add(listener);
  };

  removeVisualMediaListener = (
    listener: (message: ScreenMediaListenerTypes) => void,
  ): void => {
    this.screenListeners.delete(listener);
  };
}

export default ScreenMedia;
