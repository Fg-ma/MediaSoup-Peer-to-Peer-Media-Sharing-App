import { EffectTypes } from "../../context/StreamsContext";
import render from "./lib/render";
import createStopFunction from "./lib/createStopFunction";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { releaseAllTexturePositions } from "./lib/handleTexturePosition";
import BaseShader from "./lib/BaseShader";
import TriangleShader from "./lib/TriangleShader";
import FaceLandmarks from "./lib/FaceLandmarks";
import { URLsTypes } from "./handleEffectWebGL";

class EffectsWebGL {
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement | null = null;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null;

  private baseShader: BaseShader | undefined = undefined;
  private triangleShader: TriangleShader | undefined = undefined;
  private faceLandmarks: FaceLandmarks | undefined = undefined;

  private effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  };
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private tintColor: string = "";

  private urls: { [URLType in URLsTypes]: string | null } | undefined =
    undefined;

  private faceMeshResults: Results[] = [];
  private faceMesh: FaceMesh | undefined = undefined;

  private animationFrameId: number[] = [];

  constructor(
    type: "webcam" | "screen" | "audio",
    id: string,
    userUneffectedStreams: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: MediaStream;
      };
      screen: {
        [screenId: string]: MediaStream;
      };
      audio: MediaStream | undefined;
    }>,
    userStopStreamEffects: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: () => void;
      };
      screen: {
        [screenId: string]: () => void;
      };
      audio: (() => void) | undefined;
    }>,
    effects: {
      [effectType in EffectTypes]?: boolean | undefined;
    },
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    tintColor: string
  ) {
    this.effects = effects;
    this.currentEffectsStyles = currentEffectsStyles;
    this.tintColor = tintColor;

    // Setup WebGL context
    this.canvas = document.createElement("canvas");
    this.gl =
      this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    this.initShaders();

    this.faceLandmarks = new FaceLandmarks(this.currentEffectsStyles);

    this.initTwoDimTextures();

    updateDeadbandingMaps(effects, this.currentEffectsStyles);

    this.initFaceMesh();

    this.initRenderLoop(type, id, userUneffectedStreams);

    // Set up stop function
    if (this.video && this.gl && this.baseShader && this.triangleShader) {
      createStopFunction(
        this.animationFrameId,
        this.video,
        this.gl,
        this.baseShader,
        this.triangleShader,
        this.canvas,
        type,
        id,
        userStopStreamEffects
      );
    }
  }

  private initShaders() {
    if (!this.gl) {
      return;
    }

    this.baseShader = new BaseShader(
      this.gl,
      this.effects,
      `/3DAssets/mustaches/miniMustacheTexture.png`
    );
    this.baseShader.setTintColor(this.tintColor);

    this.triangleShader = new TriangleShader(
      this.gl,
      `/3DAssets/mustaches/mustacheTexture.png`
    );
  }

  private async initTwoDimTextures() {
    if (!this.baseShader) {
      return;
    }

    this.urls = {
      leftEar: this.effects.ears
        ? `/2DAssets/ears/${this.currentEffectsStyles.current.ears.style}Left.png`
        : null,
      rightEar: this.effects.ears
        ? `/2DAssets/ears/${this.currentEffectsStyles.current.ears.style}Right.png`
        : null,
      glasses: this.effects.glasses
        ? `/2DAssets/glasses/${this.currentEffectsStyles.current.glasses.style}.png`
        : null,
      beards: this.effects.beards
        ? `/2DAssets/beards/${this.currentEffectsStyles.current.beards.style}.png`
        : null,
      mustaches: this.effects.mustaches
        ? `/2DAssets/mustaches/${this.currentEffectsStyles.current.mustaches.style}.png`
        : null,
    };

    const filteredUrls: { [URLType in URLsTypes]?: string } =
      Object.fromEntries(
        Object.entries(this.urls).filter(([key, value]) => value !== null)
      );

    await this.baseShader.createAtlasTexture(filteredUrls);
  }

  private initFaceMesh() {
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
  }

  private initRenderLoop(
    type: "webcam" | "screen" | "audio",
    id: string,
    userUneffectedStreams: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: MediaStream;
      };
      screen: {
        [screenId: string]: MediaStream;
      };
      audio: MediaStream | undefined;
    }>
  ) {
    this.video = document.createElement("video");
    if (
      ((type === "webcam" || type === "screen") &&
        userUneffectedStreams.current[type][id]) ||
      (type === "audio" && userUneffectedStreams.current[type])
    ) {
      this.video.srcObject = new MediaStream([
        type === "webcam" || type === "screen"
          ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
          : userUneffectedStreams.current[type]!.getVideoTracks()[0],
      ]);
    } else {
      return new Error("Error getting user uneffected streams");
    }
    this.video.addEventListener("play", async () => {
      if (
        !this.gl ||
        !this.baseShader ||
        !this.triangleShader ||
        !this.faceLandmarks ||
        !this.video ||
        !this.faceMesh ||
        !this.urls
      ) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      render(
        this.gl,
        this.baseShader,
        this.triangleShader,
        this.faceLandmarks,
        this.video,
        this.canvas,
        this.animationFrameId,
        this.effects,
        this.currentEffectsStyles,
        this.faceMesh,
        this.faceMeshResults,
        this.urls
      );
    });
    this.video.onloadedmetadata = () => {
      if (!this.gl || !this.video) {
        return;
      }

      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.video.play();
    };
  }

  getStreamTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  // releaseAllTexturePositions();
}

export default EffectsWebGL;
