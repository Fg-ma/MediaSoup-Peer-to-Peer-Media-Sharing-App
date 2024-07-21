import { releaseAllTexturePositions } from "../effects/EffectsWebGL/lib/handleTexturePosition";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/EffectsWebGL/lib/BaseShader";
import render from "../effects/EffectsWebGL/lib/render";
import FaceLandmarks from "../effects/EffectsWebGL/lib/FaceLandmarks";
import updateDeadbandingMaps from "../effects/EffectsWebGL/lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { EffectTypes } from "../context/StreamsContext";

export type URLsTypes =
  | "leftEar"
  | "rightEar"
  | "glasses"
  | "beards"
  | "mustaches";

class CameraMedia {
  private username: string;
  private table_id: string;
  private cameraId: string;

  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private initCameraStream: MediaStream;

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
  private faceLandmarks: FaceLandmarks;

  private faceMeshResults: Results[];
  private faceMesh: FaceMesh;

  private effects: {
    blur?: boolean | undefined;
    tint?: boolean | undefined;
    ears?: boolean | undefined;
    glasses?: boolean | undefined;
    beards?: boolean | undefined;
    mustaches?: boolean | undefined;
    faceMasks?: boolean | undefined;
  };

  private tintColor = "#F56114";

  constructor(
    username: string,
    table_id: string,
    cameraId: string,
    initCameraStream: MediaStream,
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
    this.cameraId = cameraId;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;

    this.canvas = document.createElement("canvas");
    const gl =
      this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    if (!gl) {
      throw new Error("WebGL is not supported");
    }

    this.gl = gl;

    this.initCameraStream = initCameraStream;

    const meshes = {
      mustache1: { meshURL: "/3DAssets/mustaches/mustache1.json" },
      mustache2: { meshURL: "/3DAssets/mustaches/mustache2.json" },
      mustache3: { meshURL: "/3DAssets/mustaches/mustache3.json" },
      mustache4: { meshURL: "/3DAssets/mustaches/mustache4.json" },
      disguiseMustache: { meshURL: "/3DAssets/mustaches/mustache1.json" },
      faceMask1: { meshURL: "/3DAssets/faceMasks/faceMask1.json" },
    };

    this.effects = {};

    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as keyof typeof this.userStreamEffects.current;
      for (const kind in this.userStreamEffects.current[effectType]) {
        const kindType = kind as "camera" | "screen";
        for (const kindId in this.userStreamEffects.current[effectType][
          kindType
        ]) {
          if (kindId === this.cameraId) {
            if (
              userStreamEffects.current[effectType][kindType]![this.cameraId]
            ) {
              this.effects[effectType] = true;
            }
          }
        }
      }
    }

    this.baseShader = new BaseShader(gl, this.effects, meshes);

    this.baseShader.setTintColor(this.tintColor);

    this.faceLandmarks = new FaceLandmarks(this.cameraId, currentEffectsStyles);

    this.faceMeshResults = [];
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    this.faceMesh.setOptions({
      maxNumFaces: 2,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.faceMesh.onResults((results) => {
      this.faceMeshResults[0] = results;
    });

    // Start video and render loop
    this.animationFrameId = [];
    this.video = document.createElement("video");
    this.video.srcObject = this.initCameraStream;
    this.video.addEventListener("play", () => {
      render(
        this.cameraId,
        this.gl,
        this.baseShader,
        this.faceLandmarks,
        this.video,
        this.canvas,
        this.animationFrameId,
        {},
        this.currentEffectsStyles,
        this.faceMesh,
        this.faceMeshResults
      );
    });
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.video.play();
    };
  }

  private async updateAtlases() {
    const twoDimUrls = {
      [`${this.currentEffectsStyles.current[this.cameraId].ears.style}Left`]:
        this.effects.ears
          ? `/2DAssets/ears/${
              this.currentEffectsStyles.current[this.cameraId].ears.style
            }Left.png`
          : null,
      [`${this.currentEffectsStyles.current[this.cameraId].ears.style}Right`]:
        this.effects.ears
          ? `/2DAssets/ears/${
              this.currentEffectsStyles.current[this.cameraId].ears.style
            }Right.png`
          : null,
      [this.currentEffectsStyles.current[this.cameraId].glasses.style]: this
        .effects.glasses
        ? `/2DAssets/glasses/${
            this.currentEffectsStyles.current[this.cameraId].glasses.style
          }.png`
        : null,
      [this.currentEffectsStyles.current[this.cameraId].beards.style]: this
        .effects.beards
        ? `/2DAssets/beards/${
            this.currentEffectsStyles.current[this.cameraId].beards.style
          }.png`
        : null,
      [this.currentEffectsStyles.current[this.cameraId].mustaches.style]: this
        .effects.mustaches
        ? `/2DAssets/mustaches/${
            this.currentEffectsStyles.current[this.cameraId].mustaches.style
          }.png`
        : null,
    };

    const filteredTwoDimUrls: { [URLType in URLsTypes]?: string } =
      Object.fromEntries(
        Object.entries(twoDimUrls).filter(([key, value]) => value !== null)
      );

    const threeDimUrls = {
      // [`${currentEffectsStyles.current.ears.style}Left`]: effects.ears
      //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
      //   : null,
      // [`${currentEffectsStyles.current.ears.style}Right`]: effects.ears
      //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
      //   : null,
      // [currentEffectsStyles.current.glasses.style]: effects.glasses
      //   ? `/3DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
      //   : null,
      // [currentEffectsStyles.current.beards.style]: effects.beards
      //   ? `/3DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
      //   : null,
      [this.currentEffectsStyles.current[this.cameraId].mustaches.style]:
        this.effects.mustaches &&
        this.currentEffectsStyles.current[this.cameraId].mustaches.threeDim
          ? `/3DAssets/mustaches/${
              this.currentEffectsStyles.current[this.cameraId].mustaches.style
            }.png`
          : null,
      [this.currentEffectsStyles.current[this.cameraId].faceMasks.style]:
        this.effects.faceMasks &&
        this.currentEffectsStyles.current[this.cameraId].faceMasks.threeDim
          ? `/3DAssets/faceMasks/${
              this.currentEffectsStyles.current[this.cameraId].faceMasks.style
            }.png`
          : null,
    };

    const filteredThreeDimUrls: { [URLType in URLsTypes]?: string } =
      Object.fromEntries(
        Object.entries(threeDimUrls).filter(([key, value]) => value !== null)
      );

    await this.baseShader.createAtlasTexture("twoDim", filteredTwoDimUrls);
    await this.baseShader.createAtlasTexture("threeDim", filteredThreeDimUrls);
  }

  async changeEffects(effect: EffectTypes, tintColor?: string) {
    if (this.effects[effect] !== undefined) {
      this.effects[effect] = !this.effects[effect];
    } else {
      this.effects[effect] = true;
    }

    // Remove old animation frame
    if (this.animationFrameId[0]) {
      cancelAnimationFrame(this.animationFrameId[0]);
      delete this.animationFrameId[0];
    }

    releaseAllTexturePositions();

    await this.updateAtlases();

    updateDeadbandingMaps(
      this.cameraId,
      this.effects,
      this.currentEffectsStyles
    );

    if (tintColor) {
      this.setTintColor(tintColor);
    }

    render(
      this.cameraId,
      this.gl,
      this.baseShader,
      this.faceLandmarks,
      this.video,
      this.canvas,
      this.animationFrameId,
      this.effects,
      this.currentEffectsStyles,
      this.faceMesh,
      this.faceMeshResults
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

export default CameraMedia;
