import {
  defaultScreenEffectsStyles,
  UserEffectsStylesType,
  defaultScreenStreamEffects,
  ScreenEffectTypes,
  UserStreamEffectsType,
} from "../context/effectsContext/typeConstant";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import UserDevice from "./UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../babylon/BabylonScene";
import MediasoupSocketController from "./MediasoupSocketController";

class ScreenMedia {
  canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;

  private creationTime = Date.now();

  private effects: {
    [screenEffect in ScreenEffectTypes]?: boolean;
  };

  babylonScene: BabylonScene;

  constructor(
    private table_id: string,
    private username: string,
    private instance: string,
    private screenId: string,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private originalScreenStream: MediaStream,
    private screenStream: MediaStream,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userDevice: UserDevice,
    private userMedia: React.MutableRefObject<UserMediaType>
  ) {
    this.effects = {};

    this.userStreamEffects.current.screen[this.screenId] = structuredClone(
      defaultScreenStreamEffects
    );

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");

    if (!userEffectsStyles.current.screen[this.screenId]) {
      userEffectsStyles.current.screen[this.screenId] = structuredClone(
        defaultScreenEffectsStyles
      );
    }

    // Start video and render loop
    this.video = document.createElement("video");

    this.babylonScene = new BabylonScene(
      this.screenId,
      "screen",
      this.canvas,
      this.video,
      undefined,
      this.effects,
      this.userEffectsStyles,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.userDevice,
      [0],
      this.userMedia
    );

    this.video.srcObject = this.screenStream;
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.video.play();
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
        table_id: this.table_id,
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
          table_id: this.table_id,
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
    this.babylonScene.deconstructor();
  }

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

  changeEffects(
    effect: ScreenEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false
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

    if (effect === "postProcess") {
      this.babylonScene.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect]
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
    this.babylonScene.deleteEffectMeshes(effect);

    if (this.effects[effect as ScreenEffectTypes]) {
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

  getStream() {
    return this.canvas.captureStream();
  }

  getTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  setTintColor(newTintColor: string) {
    this.babylonScene.setTintColor(this.hexToNormalizedRgb(newTintColor));
  }

  getPaused = () => {
    return this.effects.pause ?? false;
  };

  getTimeEllapsed = () => {
    return Date.now() - this.creationTime;
  };
}

export default ScreenMedia;
