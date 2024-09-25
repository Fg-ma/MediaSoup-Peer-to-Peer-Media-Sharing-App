import {
  beardChinOffsetsMap,
  defaultBeard,
  defaultFaceMask,
  defaultGlasses,
  defaultMustache,
  EffectStylesType,
  mustacheNoseOffsetsMap,
} from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/visualEffects/lib/BaseShader";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultCameraStreamEffects,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import UserDevice from "../UserDevice";
import Deadbanding from "src/effects/visualEffects/lib/Deadbanding";
import Render from "../effects/visualEffects/lib/render";

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

  private render: Render;

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

    this.userStreamEffects.current.camera[this.cameraId] =
      defaultCameraStreamEffects;

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
      mustache1: { meshURL: "/3DAssets/mustaches/mustache1/mustache1.json" },
      mustache2: { meshURL: "/3DAssets/mustaches/mustache2/mustache2.json" },
      mustache3: { meshURL: "/3DAssets/mustaches/mustache3/mustache3.json" },
      mustache4: { meshURL: "/3DAssets/mustaches/mustache4/mustache4.json" },
      disguiseMustache: {
        meshURL: "/3DAssets/mustaches/mustache1/mustache1.json",
      },
      classicalCurlyBeard: {
        meshURL:
          "/3DAssets/beards/classicalCurlyBeard/classicalCurlyBeard.json",
      },
      chinBeard: { meshURL: "/3DAssets/beards/chinBeard/chinBeard.json" },
      baseFaceMask: {
        meshURL: "/3DAssets/faceMasks/baseFaceMask/baseFaceMask.json",
      },
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

    this.render = new Render(
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
      this.userDevice,
      false
    );

    this.video.srcObject = this.initCameraStream;
    this.video.addEventListener("play", () => {
      this.render.loop();
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
    const glassesStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].glasses;
    const beardStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].beards;
    const mustacheStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].mustaches;
    const faceMaskStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].faceMasks;
    const hatStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].hats;
    const petStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].pets;

    if (glassesStyles && this.effects.glasses) {
      twoDimUrls[
        glassesStyles.style
      ] = `/2DAssets/glasses/${glassesStyles.style}/${glassesStyles.style}.png`;
    }
    if (beardStyles && this.effects.beards) {
      twoDimUrls[
        beardStyles.style
      ] = `/2DAssets/beards/${beardStyles.style}/${beardStyles.style}.png`;
    }
    if (mustacheStyles && this.effects.mustaches) {
      twoDimUrls[
        mustacheStyles.style
      ] = `/2DAssets/mustaches/${mustacheStyles.style}/${mustacheStyles.style}.png`;
    }
    if (faceMaskStyles && this.effects.faceMasks) {
      twoDimUrls[
        faceMaskStyles.style
      ] = `/2DAssets/faceMasks/${faceMaskStyles.style}/${faceMaskStyles.style}.png`;
    }
    if (hatStyles && this.effects.hats) {
      twoDimUrls[
        hatStyles.style
      ] = `/2DAssets/hats/${hatStyles.style}/${hatStyles.style}.png`;
    }
    if (petStyles && this.effects.pets) {
      twoDimUrls[
        petStyles.style
      ] = `/2DAssets/pets/${petStyles.style}/${petStyles.style}.png`;
    }

    const threeDimUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      threeDimUrls[
        glassesStyles.style
      ] = `/3DAssets/glasses/${glassesStyles.style}/texs/${glassesStyles.style}_diff.png`;
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      threeDimUrls[
        beardStyles.style
      ] = `/3DAssets/beards/${beardStyles.style}/texs/${beardStyles.style}_diff.png`;
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      threeDimUrls[
        mustacheStyles.style
      ] = `/3DAssets/mustaches/${mustacheStyles.style}/texs/${mustacheStyles.style}_diff.png`;
    }
    if (faceMaskStyles && this.effects.faceMasks) {
      threeDimUrls[
        faceMaskStyles.style
      ] = `/3DAssets/faceMasks/${faceMaskStyles.style}/texs/${faceMaskStyles.style}_diff.png`;
    }
    if (hatStyles && this.effects.hats) {
      threeDimUrls[
        hatStyles.style
      ] = `/3DAssets/hats/${hatStyles.style}/texs/${hatStyles.style}_diff.png`;
    }
    if (petStyles && this.effects.pets) {
      threeDimUrls[
        petStyles.style
      ] = `/3DAssets/pets/${petStyles.style}/texs/${petStyles.style}_diff.png`;
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

    this.render.loop();
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
