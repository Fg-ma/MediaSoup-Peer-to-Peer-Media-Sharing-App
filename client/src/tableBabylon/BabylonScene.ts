import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  VideoTexture,
  UniversalCamera,
  Color3,
  Layer,
  Texture,
  Color4,
  Tools,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import BabylonMeshes from "./BabylonMeshes";
import BabylonShaderController from "./BabylonShaderController";
import { MeshTypes } from "./typeContant";

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

  babylonMeshes: BabylonMeshes;

  babylonShaderController: BabylonShaderController;

  twoDimMeshesZCoord = 90;
  threeDimMeshesZCoord = 100;

  mediaRecorder: MediaRecorder | undefined = undefined;
  chunks: Blob[] = [];
  recordingURL: string | undefined;
  recordingMimeType: string | undefined;

  snapShotURL: string | undefined;
  snapShotExtension: string | undefined;

  private screenShotSuccessCallbacks: (() => void)[] = [];
  private videoSuccessCallbacks: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement | undefined,
  ) {
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
    this.initBackgroundMediaPlane();

    this.babylonMeshes = new BabylonMeshes(
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

    this.setBackgroundLayer("backgroundMedia");
  };

  private setBackgroundLayer = (type: "backgroundMedia") => {
    if (type === "backgroundMedia") {
      if (this.backgroundMediaLayer && this.backgroundMediaTexture)
        this.backgroundMediaLayer.texture = this.backgroundMediaTexture;
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
    this.babylonMeshes.loader(
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

export default TableBabylonScene;
