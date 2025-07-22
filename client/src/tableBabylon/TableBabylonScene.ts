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
  Layer,
  Texture,
  Color4,
  Tools,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import TableBabylonMeshes from "./TableBabylonMeshes";
import BabylonShaderController from "./BabylonShaderController";
import { MeshTypes } from "./typeContant";
import LittleBuddies from "./littleBuddies/LittleBuddies";

const recordingMimeTypeExtensionMap = {
  "video/webm; codecs=vp9": ".webm",
  "video/webm; codecs=vp8": ".webm",
  "video/webm; codecs=av1": ".webm",
  "video/ogg": ".ogg",
};

class TableBabylonScene {
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

  private tintPlane: Mesh | undefined;
  private tintMaterial: StandardMaterial | undefined;

  private blurPostProcessX: BlurPostProcess | undefined;
  private blurPostProcessY: BlurPostProcess | undefined;

  tableBabylonMeshes: TableBabylonMeshes;

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

  littleBuddies: LittleBuddies;

  constructor(
    private canvas: HTMLCanvasElement,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement | undefined,
  ) {
    this.engine = new Engine(this.canvas, true);

    this.scene = new Scene(this.engine);

    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.littleBuddies = new LittleBuddies(this.scene);

    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene,
    );
    this.camera.attachControl(this.canvas, true);

    this.initCamera();
    this.initLighting();
    this.initBackgroundMediaPlane();
    this.initTintPlane();

    this.tableBabylonMeshes = new TableBabylonMeshes(
      this.scene,
      this.ambientLightThreeDimMeshes,
      this.ambientLightTwoDimMeshes,
    );

    this.engine.resize();

    this.babylonShaderController = new BabylonShaderController(
      this.engine,
      this.camera,
      this.scene,
    );

    // Render loop
    this.engine.runRenderLoop(this.engineRenderLoop);
  }

  deconstructor = () => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    this.engine.stopRenderLoop();
    this.engine.dispose();
  };

  private engineRenderLoop = () => {
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

  private initBackgroundMediaPlane = () => {
    if (!this.backgroundMedia) return;

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

    this.backgroundMediaLayer = new Layer("background", null, this.scene, true);

    this.backgroundMediaLayer.texture = this.backgroundMediaTexture;
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
    meshPath: string,
    meshFile: string,
    audioURL?: string,
    initPosition?: [number, number, number],
    initScale?: [number, number, number],
    initRotation?: [number, number, number],
  ) => {
    this.tableBabylonMeshes.loader(
      type,
      meshLabel,
      meshName,
      meshPath,
      meshFile,
      audioURL,
      initPosition,
      initScale,
      initRotation,
    );
  };

  deleteMesh = (type: MeshTypes, meshLabel: string) => {
    const meshes =
      this.tableBabylonMeshes.meshes[type === "2D" ? "2D" : "3D"][meshLabel];

    if (!meshes) {
      return;
    }

    if (meshes instanceof Array) {
      for (const mesh of meshes) {
        this.tableBabylonMeshes.deleteMesh(mesh);
      }
    } else {
      this.tableBabylonMeshes.deleteMesh(meshes);
    }
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

  downloadSnapShot = (mimeType?: string, quality?: number) => {
    if (this.engine) {
      Tools.CreateScreenshot(
        this.engine,
        this.camera,
        {
          width: this.engine.getRenderWidth(),
          height: this.engine.getRenderHeight(),
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
            width: this.engine.getRenderWidth(),
            height: this.engine.getRenderHeight(),
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
          width: this.engine.getRenderWidth(),
          height: this.engine.getRenderHeight(),
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

  getReadPixels = () => {
    return this.engine.readPixels(
      0,
      0,
      this.engine.getRenderWidth(),
      this.engine.getRenderHeight(),
    );
  };
}

export default TableBabylonScene;
