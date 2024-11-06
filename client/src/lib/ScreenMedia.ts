import {
  defaultScreenCurrentEffectsStyles,
  EffectStylesType,
} from "../context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultScreenStreamEffects,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import UserDevice from "../UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../babylon/BabylonScene";
import CameraMedia from "./CameraMedia";
import AudioMedia from "./AudioMedia";

class ScreenMedia {
  canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;

  private effects: {
    [screenEffect in ScreenEffectTypes]?: boolean;
  };

  private maxFaces: [number] = [1];

  babylonScene: BabylonScene;

  constructor(
    private username: string,
    private table_id: string,
    private screenId: string,
    private initScreenStream: MediaStream,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private userDevice: UserDevice,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>
  ) {
    this.effects = {};

    this.userStreamEffects.current.screen[this.screenId] = structuredClone(
      defaultScreenStreamEffects
    );

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");

    if (!currentEffectsStyles.current.screen[this.screenId]) {
      currentEffectsStyles.current.screen[this.screenId] = structuredClone(
        defaultScreenCurrentEffectsStyles
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
      this.currentEffectsStyles,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.userDevice,
      this.maxFaces,
      this.userMedia
    );

    this.video.srcObject = this.initScreenStream;
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.video.play();
    };
  }

  deconstructor() {
    // End initial stream
    this.initScreenStream.getTracks().forEach((track) => track.stop());

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

  async changeEffects(
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
      this.currentEffectsStyles.current.camera?.[this.screenId]?.[effect];

    if (!currentStyle) {
      return;
    }

    // @ts-ignore
    const meshData2D = assetMeshes[effect][currentStyle.style].planeMesh;
    // @ts-ignore
    const meshData3D = assetMeshes[effect][currentStyle.style].mesh;

    // Delete old meshes
    this.babylonScene.deleteEffectMeshes(effect);

    if (this.effects[effect as ScreenEffectTypes]) {
      this.babylonScene.createEffectMeshes(
        meshData3D.meshType,
        meshData3D.meshLabel,
        "",
        // @ts-ignore
        assetMeshes[effect][currentStyle.style].defaultMeshPlacement,
        meshData3D.meshPath,
        meshData3D.meshFile,
        effect,
        "faceTrack",
        meshData3D.soundEffectPath,
        [0, 0, this.babylonScene.threeDimMeshesZCoord],
        meshData3D.initScale,
        meshData3D.initRotation
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
}

export default ScreenMedia;
