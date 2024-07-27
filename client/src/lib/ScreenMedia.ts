import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/lib/BaseShader";
import render from "../effects/lib/render";
import updateDeadbandingMaps from "../effects/lib/updateDeadbandingMaps";
import { EffectTypes } from "../context/StreamsContext";

type ScreenEffects = "pause" | "blur" | "tint";

class ScreenMedia {
  private username: string;
  private table_id: string;
  private screenId: string;

  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private initScreenStream: MediaStream;

  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      camera?:
        | {
            [cameraId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;

  private animationFrameId: number[];

  private baseShader: BaseShader;

  private effects: {
    [screenEffect in ScreenEffects]?: boolean;
  };

  private tintColor = "#F56114";

  constructor(
    username: string,
    table_id: string,
    screenId: string,
    initScreenStream: MediaStream,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      [effectType in EffectTypes]: {
        camera?:
          | {
              [cameraId: string]: boolean;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: boolean;
            }
          | undefined;
        audio?: boolean;
      };
    }>
  ) {
    this.username = username;
    this.table_id = table_id;
    this.screenId = screenId;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;

    this.canvas = document.createElement("canvas");
    const gl =
      this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    if (!gl) {
      throw new Error("WebGL is not supported");
    }

    this.gl = gl;

    this.initScreenStream = initScreenStream;

    if (!currentEffectsStyles.current[this.screenId]) {
      currentEffectsStyles.current[this.screenId] = {};
    }

    const meshes = {};

    this.effects = {};

    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as EffectTypes;
      if (effectType in this.effects) {
        for (const kindId in this.userStreamEffects.current[effectType]
          .screen) {
          if (
            kindId === this.screenId &&
            userStreamEffects.current[effectType].screen![this.screenId]
          ) {
            this.effects[effectType as ScreenEffects] = true;
          }
        }
      }
    }

    this.baseShader = new BaseShader(gl, this.effects, meshes);

    this.baseShader.setTintColor(this.tintColor);
    this.baseShader.createAtlasTexture("twoDim", {});
    this.baseShader.createAtlasTexture("threeDim", {});

    // Start video and render loop
    this.animationFrameId = [];
    this.video = document.createElement("video");
    this.video.srcObject = this.initScreenStream;
    this.video.addEventListener("play", () => {
      render(
        this.screenId,
        this.gl,
        this.baseShader,
        undefined,
        this.video,
        this.canvas,
        this.animationFrameId,
        {},
        this.currentEffectsStyles,
        undefined,
        undefined,
        this.effects.pause
      );
    });
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.video.play();
    };
  }

  deconstructor() {
    // End render loop
    if (this.animationFrameId[0]) {
      cancelAnimationFrame(this.animationFrameId[0]);
      delete this.animationFrameId[0];
    }

    // End initial stream
    this.initScreenStream.getTracks().forEach((track) => track.stop());

    // End video
    this.video.pause();
    this.video.srcObject = null;

    // Deconstruct base shader
    this.baseShader.deconstructor();

    // Clear gl canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.canvas) {
      const contextAttributes = this.gl.getContextAttributes();
      if (contextAttributes && contextAttributes.preserveDrawingBuffer) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      }
      const ext = this.gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    }
    this.canvas.remove();
  }

  private async updateAtlases() {
    const twoDimUrls = {};

    const threeDimUrls = {};

    await this.baseShader.updateAtlasTexture("twoDim", twoDimUrls);
    await this.baseShader.updateAtlasTexture("threeDim", threeDimUrls);
  }

  async changeEffects(
    effect: ScreenEffects,
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

    await this.updateAtlases();

    updateDeadbandingMaps(
      this.screenId,
      this.effects,
      this.currentEffectsStyles
    );

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && !blockStateChange) {
      this.baseShader.toggleTintEffect();
    }

    if (effect === "blur") {
      this.baseShader.toggleBlurEffect();
    }

    if (effect === "pause") {
      this.baseShader.setPause(this.effects[effect]);
    }

    // Remove old animation frame
    if (this.animationFrameId[0]) {
      cancelAnimationFrame(this.animationFrameId[0]);
      delete this.animationFrameId[0];
    }

    render(
      this.screenId,
      this.gl,
      this.baseShader,
      undefined,
      this.video,
      this.canvas,
      this.animationFrameId,
      this.effects,
      this.currentEffectsStyles,
      undefined,
      undefined,
      this.effects.pause,
      this.effects.pause ? true : false
    );
  }

  getStream() {
    return this.canvas.captureStream();
  }

  getTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  setTintColor(newTintColor: string) {
    this.baseShader.setTintColor(newTintColor);
  }
}

export default ScreenMedia;
