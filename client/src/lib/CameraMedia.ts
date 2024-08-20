import {
  beardChinOffsetsMap,
  defaultBeard,
  defaultEars,
  defaultFaceMask,
  defaultGlasses,
  defaultMustache,
  earsWidthFactorMap,
  EffectStylesType,
  mustacheNoseOffsetsMap,
} from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/visualEffects/lib/BaseShader";
import render from "../effects/visualEffects/lib/render";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import UserDevice from "../UserDevice";
import Deadbanding from "src/effects/visualEffects/lib/Deadbanding";

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
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]?: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]?: boolean };
    };
    audio: { [effectType in AudioEffectTypes]?: boolean };
  }>;

  private animationFrameId: number[] = [];

  private baseShader: BaseShader;
  private faceLandmarks: FaceLandmarks;

  private faceMeshResults: Results[];
  private faceMesh: FaceMesh;

  private effects: {
    [cameraEffect in CameraEffectTypes]?: boolean;
  };

  private tintColor = "#F56114";

  private userDevice: UserDevice;

  private deadbanding: Deadbanding;

  constructor(
    username: string,
    table_id: string,
    cameraId: string,
    initCameraStream: MediaStream,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    userDevice: UserDevice,
    deadbanding: Deadbanding
  ) {
    this.username = username;
    this.table_id = table_id;
    this.cameraId = cameraId;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.userDevice = userDevice;
    this.deadbanding = deadbanding;

    this.effects = {};

    this.userStreamEffects.current.camera[this.cameraId] = {
      pause: false,
      blur: false,
      tint: false,
      ears: false,
      glasses: false,
      beards: false,
      mustaches: false,
      faceMasks: false,
    };

    this.canvas = document.createElement("canvas");
    const gl =
      this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    if (!gl) {
      throw new Error("WebGL is not supported");
    }

    this.gl = gl;

    this.initCameraStream = initCameraStream;

    if (!currentEffectsStyles.current.camera[this.cameraId]) {
      currentEffectsStyles.current.camera[this.cameraId] = {
        glasses: { style: defaultGlasses, threeDim: false },
        ears: {
          style: defaultEars,
          threeDim: false,
          leftEarWidthFactor:
            earsWidthFactorMap[defaultEars].leftEarWidthFactor,
          rightEarWidthFactor:
            earsWidthFactorMap[defaultEars].rightEarWidthFactor,
        },
        beards: {
          style: defaultBeard,
          threeDim: false,
          chinOffset: beardChinOffsetsMap[defaultBeard],
        },
        mustaches: {
          style: defaultMustache,
          threeDim: false,
          noseOffset: mustacheNoseOffsetsMap[defaultMustache],
        },
        faceMasks: {
          style: defaultFaceMask,
          threeDim: true,
        },
      };
    }

    const meshes = {
      mustache1: { meshURL: "/3DAssets/mustaches/mustache1.json" },
      mustache2: { meshURL: "/3DAssets/mustaches/mustache2.json" },
      mustache3: { meshURL: "/3DAssets/mustaches/mustache3.json" },
      mustache4: { meshURL: "/3DAssets/mustaches/mustache4.json" },
      disguiseMustache: { meshURL: "/3DAssets/mustaches/mustache1.json" },
      faceMask1: { meshURL: "/3DAssets/faceMasks/faceMask1.json" },
    };

    this.baseShader = new BaseShader(gl, this.effects, meshes);

    this.baseShader.setTintColor(this.tintColor);
    this.baseShader.createAtlasTexture("twoDim", {});
    this.baseShader.createAtlasTexture("threeDim", {});

    this.faceLandmarks = new FaceLandmarks(
      this.cameraId,
      this.currentEffectsStyles,
      this.deadbanding
    );

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
        this.faceMeshResults,
        this.effects.pause,
        false,
        this.userDevice.getMaxFrameProcessingTime(),
        this.userDevice.getMinFrameInterval(),
        this.userDevice.getFaceMeshDetectionInterval()
      );
    });
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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
    this.initCameraStream.getTracks().forEach((track) => track.stop());

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
    const twoDimUrls: { [key: string]: string } = {};

    if (
      this.currentEffectsStyles.current.camera[this.cameraId].ears &&
      this.effects.ears
    ) {
      twoDimUrls[
        `${
          this.currentEffectsStyles.current.camera[this.cameraId].ears!.style
        }Left`
      ] = `/2DAssets/ears/${
        this.currentEffectsStyles.current.camera[this.cameraId].ears!.style
      }Left.png`;
    }
    if (
      this.currentEffectsStyles.current.camera[this.cameraId].ears &&
      this.effects.ears
    ) {
      twoDimUrls[
        `${
          this.currentEffectsStyles.current.camera[this.cameraId].ears!.style
        }Right`
      ] = `/2DAssets/ears/${
        this.currentEffectsStyles.current.camera[this.cameraId].ears!.style
      }Right.png`;
    }
    if (
      this.currentEffectsStyles.current.camera[this.cameraId].glasses &&
      this.effects.glasses
    ) {
      twoDimUrls[
        this.currentEffectsStyles.current.camera[this.cameraId].glasses!.style
      ] = `/2DAssets/glasses/${
        this.currentEffectsStyles.current.camera[this.cameraId].glasses!.style
      }.png`;
    }
    if (
      this.currentEffectsStyles.current.camera[this.cameraId].beards &&
      this.effects.beards
    ) {
      twoDimUrls[
        this.currentEffectsStyles.current.camera[this.cameraId].beards!.style
      ] = `/2DAssets/beards/${
        this.currentEffectsStyles.current.camera[this.cameraId].beards!.style
      }.png`;
    }
    if (
      this.currentEffectsStyles.current.camera[this.cameraId].mustaches &&
      this.effects.mustaches
    ) {
      twoDimUrls[
        this.currentEffectsStyles.current.camera[this.cameraId].mustaches!.style
      ] = `/2DAssets/mustaches/${
        this.currentEffectsStyles.current.camera[this.cameraId].mustaches!.style
      }.png`;
    }

    const threeDimUrls: { [key: string]: string } = {};

    if (
      this.currentEffectsStyles.current.camera[this.cameraId].mustaches &&
      this.currentEffectsStyles.current.camera[this.cameraId].mustaches!
        .threeDim &&
      this.effects.mustaches
    ) {
      threeDimUrls[
        this.currentEffectsStyles.current.camera[this.cameraId].mustaches!.style
      ] = `/3DAssets/mustaches/${
        this.currentEffectsStyles.current.camera[this.cameraId].mustaches!.style
      }.png`;
    }
    if (
      this.currentEffectsStyles.current.camera[this.cameraId].faceMasks &&
      this.effects.faceMasks
    ) {
      threeDimUrls[
        this.currentEffectsStyles.current.camera[this.cameraId].faceMasks!.style
      ] = `/3DAssets/faceMasks/${
        this.currentEffectsStyles.current.camera[this.cameraId].faceMasks!.style
      }.png`;
    }

    await this.baseShader.updateAtlasTexture("twoDim", twoDimUrls);
    await this.baseShader.updateAtlasTexture("threeDim", threeDimUrls);
  }

  async changeEffects(
    effect: CameraEffectTypes,
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

    this.deadbanding.update(this.cameraId, this.effects);

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
      this.faceMeshResults,
      this.effects.pause,
      false,
      this.userDevice.getMaxFrameProcessingTime(),
      this.userDevice.getMinFrameInterval(),
      this.userDevice.getFaceMeshDetectionInterval()
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
