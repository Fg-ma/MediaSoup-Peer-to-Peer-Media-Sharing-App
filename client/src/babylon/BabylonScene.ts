import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  VideoTexture,
  UniversalCamera,
  Mesh,
  Color3,
  BlurPostProcess,
  Vector2,
  ImageProcessingPostProcess,
  Layer,
  DynamicTexture,
  Texture,
  Color4,
  Tools,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { CameraEffectTypes } from "../../../universal/effectsTypeConstant";
import BabylonMeshes from "./BabylonMeshes";
import BabylonRenderLoop from "./BabylonRenderLoop";
import UserDevice from "../tools/userDevice/UserDevice";
import BabylonShaderController from "./BabylonShaderController";
import FaceLandmarks from "./FaceLandmarks";
import BabylonRenderLoopWorker from "./BabylonRenderLoopWorker";
import { MeshTypes } from "../../../universal/babylonTypeContant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

export type DefaultMeshPlacementType =
  | "forehead"
  | "chin"
  | "eyesCenter"
  | "nose";
export type EffectType =
  | "glasses"
  | "beards"
  | "mustaches"
  | "masks"
  | "pets"
  | "hats";
export type PositionStyle = "faceTrack" | "free" | "landmarks";

export const validEffectTypes: EffectType[] = [
  "glasses",
  "beards",
  "mustaches",
  "masks",
  "pets",
  "hats",
];

const recordingMimeTypeExtensionMap = {
  "video/webm; codecs=vp9": ".webm",
  "video/webm; codecs=vp8": ".webm",
  "video/webm; codecs=av1": ".webm",
  "video/ogg": ".ogg",
};

class BabylonScene {
  readonly mimeTypeExtensionMap: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/heic": ".heic",
  };

  private engine: Engine;
  scene: Scene;
  private camera: UniversalCamera;

  private backgroundLight: HemisphericLight | undefined;
  private ambientLightThreeDimMeshes: HemisphericLight | undefined;
  private ambientLightTwoDimMeshes: HemisphericLight | undefined;

  private backgroundMediaLayer: Layer | undefined;
  private backgroundMediaTexture: VideoTexture | Texture | undefined;

  private hideBackgroundTexture: DynamicTexture | undefined;

  private tintPlane: Mesh | undefined;
  private tintMaterial: StandardMaterial | undefined;

  private pausePostProcess: ImageProcessingPostProcess | undefined;
  private pauseLayer: Layer | undefined;

  private blurPostProcessX: BlurPostProcess | undefined;
  private blurPostProcessY: BlurPostProcess | undefined;

  babylonMeshes: BabylonMeshes;

  babylonRenderLoop: BabylonRenderLoop;

  babylonShaderController: BabylonShaderController;

  twoDimMeshesZCoord = 90;
  threeDimMeshesZCoord = 100;

  imageAlreadyProcessed = [1];

  mediaRecorder: MediaRecorder | undefined = undefined;
  chunks: Blob[] = [];
  recordingURL: string | undefined;
  recordingMimeType: string | undefined;

  snapShotURL: string | undefined;
  snapShotExtension: string | undefined;

  private screenShotSuccessCallbacks: (() => void)[] = [];
  private videoSuccessCallbacks: (() => void)[] = [];

  private flip: boolean;

  private forceFaceDetectEndListeners: Set<() => void> = new Set();

  private running = true;

  constructor(
    private babylonRenderLoopWorker: BabylonRenderLoopWorker | undefined,
    private type:
      | "camera"
      | "screen"
      | "image"
      | "video"
      | "application"
      | "capture",
    private aspect: number,
    private canvas: HTMLCanvasElement,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement,
    private faceLandmarks: FaceLandmarks | undefined,
    private effects: {
      [effectType in CameraEffectTypes]?: boolean | undefined;
    },
    private faceMeshResults: NormalizedLandmarkListList[] | undefined,
    private selfieSegmentationResults: ImageData[] | undefined,
    private userDevice: React.MutableRefObject<UserDevice>,
    private maxFaces: [number],
    initRunning?: boolean,
  ) {
    if (initRunning !== undefined) this.running = initRunning;

    this.flip = this.type === "camera" || this.type === "capture";

    this.engine = new Engine(this.canvas, true);

    this.scene = new Scene(this.engine);

    this.scene.clearColor = new Color4(0, 0, 0, 1);

    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene,
    );
    this.camera.attachControl(this.canvas, true);

    this.initCamera();
    this.initLighting();
    this.initBackgroundMediaLayer();
    this.initHideBackgroundPlane();
    this.initTintPlane();

    this.babylonMeshes = new BabylonMeshes(
      this.scene,
      this.camera,
      this.canvas,
      this.ambientLightThreeDimMeshes,
      this.ambientLightTwoDimMeshes,
      this.threeDimMeshesZCoord,
    );

    this.engine.resize();
    this.babylonRenderLoop = new BabylonRenderLoop(
      this.flip,
      this.scene,
      this.camera,
      this.faceLandmarks,
      this.aspect,
      this.canvas,
      this.effects,
      this.faceMeshResults,
      this.selfieSegmentationResults,
      this.userDevice,
      this.hideBackgroundTexture,
      this.backgroundMedia,
      this.babylonMeshes,
    );

    this.babylonShaderController = new BabylonShaderController(
      this.engine,
      this.camera,
      this.scene,
    );

    // Render loop
    if (this.running) {
      this.engine.runRenderLoop(this.engineRenderLoop);
    }
  }

  deconstructor = () => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    this.engine.stopRenderLoop();
    this.engine.dispose();

    this.forceFaceDetectEndListeners.clear();
  };

  private engineRenderLoop = () => {
    if (
      !(this.backgroundMedia instanceof HTMLImageElement) ||
      this.imageAlreadyProcessed[0] < 100
    ) {
      this.imageAlreadyProcessed[0] += 1;

      this.babylonRenderLoopWorker?.renderLoop();
      this.babylonRenderLoop.renderLoop();
    } else if (this.imageAlreadyProcessed[0] === 100) {
      this.imageAlreadyProcessed[0] += 1;

      this.forceFaceDetectEndListeners.forEach((listener) => {
        listener();
      });

      this.babylonRenderLoopWorker?.removeNeed("faceDetection", "force");
    }

    this.babylonShaderController.renderLoop();

    this.scene.render();
  };

  private initCamera = () => {
    this.camera.setTarget(Vector3.Zero());
  };

  private initLighting = () => {
    const dummyMesh3D = MeshBuilder.CreateBox(
      "dummyMesh3D",
      { size: 1 },
      this.scene,
    );
    dummyMesh3D.scaling = new Vector3(0, 0, 0);

    // Create a light
    this.backgroundLight = new HemisphericLight(
      "backgroundLight",
      new Vector3(-1, 1, 0),
      this.scene,
    );
    this.backgroundLight.intensity = 2.0;
    this.backgroundLight.diffuse = new Color3(1, 1, 1);
    this.backgroundLight.includedOnlyMeshes.push(dummyMesh3D);

    this.ambientLightThreeDimMeshes = new HemisphericLight(
      "ambientLightThreeDimMeshes",
      new Vector3(-0.4, 0.3, -0.15),
      this.scene,
    );
    this.ambientLightThreeDimMeshes.intensity = 0.8;
    this.ambientLightThreeDimMeshes.includedOnlyMeshes.push(dummyMesh3D);

    this.ambientLightTwoDimMeshes = new HemisphericLight(
      "ambientLightTwoDimMeshes",
      new Vector3(1, 1, -1),
      this.scene,
    );
    this.ambientLightTwoDimMeshes.intensity = 2;
    this.ambientLightTwoDimMeshes.specular = new Color3(0, 0, 0);
    this.ambientLightTwoDimMeshes.includedOnlyMeshes.push(dummyMesh3D);
  };

  private initBackgroundMediaLayer = () => {
    this.backgroundMediaTexture =
      this.backgroundMedia instanceof HTMLVideoElement
        ? new VideoTexture(
            "backgroundMediaTexture",
            this.backgroundMedia,
            this.scene,
          )
        : new Texture(this.backgroundMedia.src, this.scene);
    this.backgroundMediaTexture.hasAlpha = true;
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    if (this.flip) this.backgroundMediaTexture.uScale = -1;

    this.backgroundMediaLayer = new Layer("background", null, this.scene, true);

    this.backgroundMediaLayer.texture = this.backgroundMediaTexture;
  };

  private initHideBackgroundPlane = () => {
    this.hideBackgroundTexture = new DynamicTexture(
      "hideBackgroundTexture",
      {
        width:
          this.backgroundMedia instanceof HTMLVideoElement
            ? this.backgroundMedia.videoWidth
            : this.backgroundMedia.naturalWidth,
        height:
          this.backgroundMedia instanceof HTMLVideoElement
            ? this.backgroundMedia.videoHeight
            : this.backgroundMedia.naturalHeight,
      },
      this.scene,
    );

    this.hideBackgroundTexture.hasAlpha = true;
  };

  private setBackgroundLayer = (type: "backgroundMedia" | "hideBackground") => {
    if (type === "backgroundMedia") {
      if (this.backgroundMediaLayer && this.backgroundMediaTexture)
        this.backgroundMediaLayer.texture = this.backgroundMediaTexture;
    } else {
      if (this.backgroundMediaLayer && this.hideBackgroundTexture)
        this.backgroundMediaLayer.texture = this.hideBackgroundTexture;
    }
  };

  private updateTintPlaneSize = () => {
    if (!this.tintPlane) return;

    const foregroundDistance = this.camera.minZ;

    this.tintPlane.scaling = new Vector3(-1000, 1000, 1);
    this.tintPlane.position = new Vector3(0, 0, foregroundDistance);
  };

  private initTintPlane = () => {
    this.tintPlane = MeshBuilder.CreatePlane(
      "tintPlane",
      { width: 1, height: 1 },
      this.scene,
    );
    this.tintPlane.isPickable = false;
    this.tintMaterial = new StandardMaterial("tintMaterial", this.scene);
    this.tintMaterial.diffuseColor = new Color3(0, 0, 0);
    this.tintMaterial.alpha = 0.0;

    this.tintPlane.material = this.tintMaterial;

    this.updateTintPlaneSize();

    if (this.backgroundLight) {
      this.backgroundLight.includedOnlyMeshes.push(this.tintPlane);
    }
  };

  createMesh = (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    defaultMeshPlacement: DefaultMeshPlacementType,
    meshPath: string,
    meshFile: string,
    faceId?: number,
    effectType?: EffectType,
    positionStyle?: PositionStyle,
    shiftX?: number,
    shiftY?: number,
    audioURL?: string,
    initPosition?: [number, number, number],
    initScale?: [number, number, number],
    initRotation?: [number, number, number],
  ) => {
    this.babylonMeshes.loader(
      type,
      meshLabel,
      meshName,
      defaultMeshPlacement,
      meshPath,
      meshFile,
      faceId,
      effectType,
      positionStyle,
      shiftX,
      shiftY,
      audioURL,
      initPosition,
      initScale,
      initRotation,
    );
  };

  createEffectMeshes = (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    defaultMeshPlacement: DefaultMeshPlacementType,
    meshPath: string,
    meshFile: string,
    effectType?: EffectType,
    positionStyle?: PositionStyle,
    shiftX?: number,
    shiftY?: number,
    audioURL?: string,
    initPosition?: [number, number, number],
    initScale?: [number, number, number],
    initRotation?: [number, number, number],
  ) => {
    for (let i = 0; i < this.maxFaces[0]; i++) {
      this.babylonMeshes.loader(
        type,
        meshLabel + "." + i,
        meshName,
        defaultMeshPlacement,
        meshPath,
        meshFile,
        i,
        effectType,
        positionStyle,
        shiftX,
        shiftY,
        audioURL,
        initPosition,
        initScale,
        initRotation,
      );
    }
  };

  setRunning = (run: boolean) => {
    if (this.running !== run) {
      if (run) {
        this.engine.runRenderLoop(this.engineRenderLoop);
      } else {
        this.engine.stopRenderLoop();
      }
      this.running = run;
    }
  };

  forceEngineRenderLoop = () => {
    this.engineRenderLoop();
  };

  deleteMesh = (type: MeshTypes, meshLabel: string) => {
    const meshes =
      this.babylonMeshes.meshes[type === "2D" ? "2D" : "3D"][meshLabel];

    if (!meshes) {
      return;
    }

    if (meshes instanceof Array) {
      for (const mesh of meshes) {
        this.babylonMeshes.deleteMesh(mesh);
      }
    } else {
      this.babylonMeshes.deleteMesh(meshes);
    }
  };

  deleteEffectMeshes = (effect: string) => {
    const meshesToDelete = [];

    // First, collect meshes to be deleted
    for (const mesh of this.scene.meshes) {
      const meshMetadata = mesh.metadata;
      if (meshMetadata && meshMetadata.effectType === effect) {
        meshesToDelete.push(mesh);
      }
    }

    // Now, delete them after iteration
    for (const mesh of meshesToDelete) {
      this.babylonMeshes.deleteMesh(mesh);
    }
  };

  toggleHideBackgroundPlane = (active: boolean) => {
    this.setBackgroundLayer(active ? "hideBackground" : "backgroundMedia");
  };

  toggleTintPlane = (active: boolean, tintColor?: [number, number, number]) => {
    if (!this.tintMaterial) {
      return;
    }

    if (active) {
      if (tintColor) {
        this.tintMaterial.diffuseColor = new Color3(...tintColor);
        this.tintMaterial.alpha = 0.35;
      }
    } else {
      this.tintMaterial.alpha = 0.0;
    }
  };

  setTintColor = (tintColor: [number, number, number]) => {
    if (!this.tintMaterial) {
      return;
    }

    this.tintMaterial.diffuseColor = new Color3(...tintColor);
  };

  toggleBlurEffect = (active: boolean) => {
    if (active) {
      if (!this.blurPostProcessX && !this.blurPostProcessX) {
        this.blurPostProcessX = new BlurPostProcess(
          "blurEffectX", // Name of the effect
          new Vector2(1.0, 0.0), // Direction of the blur
          80.0, // Blur kernel size (affects intensity)
          0.5, // Ratio (resolution scaling factor)
          this.camera, // Apply blur to the camera
        );

        this.blurPostProcessY = new BlurPostProcess(
          "blurEffectY", // Name of the effect
          new Vector2(0.0, 1.0), // Direction of the blur
          80.0, // Blur kernel size (affects intensity)
          0.5, // Ratio (resolution scaling factor)
          this.camera, // Apply blur to the camera
        );
      }
    } else {
      // Dispose the blur post-process if the effect is disabled
      if (this.blurPostProcessX) {
        this.blurPostProcessX.dispose();
        this.blurPostProcessX = undefined;
      }
      if (this.blurPostProcessY) {
        this.blurPostProcessY.dispose();
        this.blurPostProcessY = undefined;
      }
    }
  };

  togglePauseEffect = (active: boolean) => {
    if (active) {
      if (!this.pausePostProcess) {
        // Create the ImageProcessingPostProcess for darkened overlay
        this.pausePostProcess = new ImageProcessingPostProcess(
          "pauseEffect",
          1.0,
          this.camera,
        );
      }

      if (!this.pauseLayer) {
        // Create a full-screen layer for the pause image
        this.pauseLayer = new Layer(
          "pauseLayer",
          nginxAssetServerBaseUrl + "2DAssets/videoPaused.png",
          this.scene,
          false,
        );
      }
    } else {
      // Remove the post-process effect and image overlay
      if (this.pausePostProcess) {
        this.pausePostProcess.dispose();
        this.pausePostProcess = undefined;
      }

      if (this.pauseLayer) {
        this.pauseLayer.dispose();
        this.pauseLayer = undefined;
      }
    }
  };

  downloadSnapShot = (mimeType?: string, quality?: number) => {
    if (this.engine) {
      Tools.CreateScreenshot(
        this.engine,
        this.camera,
        {
          width:
            this.backgroundMedia instanceof HTMLVideoElement
              ? this.backgroundMedia.videoWidth
              : this.backgroundMedia.naturalWidth,
          height:
            this.backgroundMedia instanceof HTMLVideoElement
              ? this.backgroundMedia.videoHeight
              : this.backgroundMedia.naturalHeight,
        },
        (dataUrl) => {
          // Create a link element for download
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `scene-snapshot${this.mimeTypeExtensionMap[mimeType ?? "image/png"] ?? ".png"}`;

          // Simulate a click to download the image
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        mimeType ?? "image/png",
        undefined,
        quality,
      );
    }
  };

  getSnapShotURL = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (this.engine && this.camera) {
        Tools.CreateScreenshot(
          this.engine,
          this.camera,
          {
            width:
              this.backgroundMedia instanceof HTMLVideoElement
                ? this.backgroundMedia.videoWidth
                : this.backgroundMedia.naturalWidth,
            height:
              this.backgroundMedia instanceof HTMLVideoElement
                ? this.backgroundMedia.videoHeight
                : this.backgroundMedia.naturalHeight,
            precision: 1,
          },
          (dataUrl) => {
            resolve(dataUrl);
          },
        );
      } else {
        resolve(undefined);
      }
    });
  };

  takeSnapShot = (mimeType?: string, quality?: number) => {
    if (this.engine) {
      Tools.CreateScreenshot(
        this.engine,
        this.camera,
        {
          width:
            this.backgroundMedia instanceof HTMLVideoElement
              ? this.backgroundMedia.videoWidth
              : this.backgroundMedia.naturalWidth,
          height:
            this.backgroundMedia instanceof HTMLVideoElement
              ? this.backgroundMedia.videoHeight
              : this.backgroundMedia.naturalHeight,
        },
        (dataUrl) => {
          this.snapShotURL = dataUrl;
          this.snapShotExtension =
            this.mimeTypeExtensionMap[mimeType ?? "image/png"] ?? ".png";
        },
        mimeType ?? "image/png",
        undefined,
        quality,
      );
    }
  };

  downloadSnapShotLink = () => {
    return this.snapShotURL;
  };

  startRecording = (
    mimeType: string,
    fps: number,
    bitRate?: number | "default",
  ) => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    const stream = this.canvas.captureStream(fps);
    try {
      const options: MediaRecorderOptions = {
        mimeType,
      };
      if (bitRate && bitRate !== "default") {
        options["videoBitsPerSecond"] = bitRate;
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.recordingMimeType = mimeType;
    } catch {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
        ...(bitRate && bitRate !== "default"
          ? { videoBitsPerSecond: bitRate }
          : {}),
      });
      this.recordingMimeType = mimeType;
    }

    // Store recorded data chunks
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: this.recordingMimeType });
      this.chunks = [];

      // Create a download link
      this.recordingURL = URL.createObjectURL(blob);

      this.videoSuccessCallbacks.map((videoSuccessCallback) =>
        videoSuccessCallback(),
      );
    };

    // Start recording
    this.mediaRecorder.start();
  };

  stopRecording = () => {
    this.mediaRecorder?.stop();
  };

  downloadRecording = () => {
    if (!this.recordingURL || !this.recordingMimeType) return;

    const a = document.createElement("a");
    a.href = this.recordingURL;
    a.download = `recording${
      recordingMimeTypeExtensionMap[
        this.recordingMimeType as keyof typeof recordingMimeTypeExtensionMap
      ] ?? ".webm"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  downloadRecordingLink = () => {
    return this.recordingURL;
  };

  addScreenShotSuccessCallback = (screenShotSuccessCallback: () => void) => {
    this.screenShotSuccessCallbacks.push(screenShotSuccessCallback);
  };

  removeScreenShotSuccessCallback = (screenShotSuccessCallback: () => void) => {
    this.screenShotSuccessCallbacks = this.screenShotSuccessCallbacks.filter(
      (callback) => callback !== screenShotSuccessCallback,
    );
  };

  addVideoSuccessCallback = (videoSuccessCallback: () => void) => {
    this.videoSuccessCallbacks.push(videoSuccessCallback);
  };

  removeVideoSuccessCallback = (VideoSuccessCallback: () => void) => {
    this.videoSuccessCallbacks = this.videoSuccessCallbacks.filter(
      (callback) => callback !== VideoSuccessCallback,
    );
  };

  addForceFaceDetectEndListener = (listener: () => void): void => {
    this.forceFaceDetectEndListeners.add(listener);
  };

  removeForceFaceDetectEndListener = (listener: () => void): void => {
    this.forceFaceDetectEndListeners.delete(listener);
  };

  getReadPixels = () => {
    return this.engine.readPixels(
      0,
      0,
      this.backgroundMedia instanceof HTMLVideoElement
        ? this.backgroundMedia.videoWidth
        : this.backgroundMedia.naturalWidth,
      this.backgroundMedia instanceof HTMLVideoElement
        ? this.backgroundMedia.videoHeight
        : this.backgroundMedia.naturalHeight,
    );
  };
}

export default BabylonScene;
