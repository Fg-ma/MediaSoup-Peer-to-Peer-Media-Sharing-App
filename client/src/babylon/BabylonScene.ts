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
  Material,
  Texture,
  Color4,
  Tools,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import {
  CameraEffectTypes,
  UserEffectsStylesType,
} from "../context/effectsContext/typeConstant";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import BabylonMeshes from "./BabylonMeshes";
import BabylonRenderLoop from "./BabylonRenderLoop";
import UserDevice from "../lib/UserDevice";
import BabylonShaderController from "./BabylonShaderController";
import { MeshTypes } from "./typeContant";
import FaceLandmarks from "./FaceLandmarks";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

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
  private engine: Engine;
  scene: Scene;
  private camera: UniversalCamera;

  private resizeObserver: ResizeObserver;

  private backgroundLight: HemisphericLight | undefined;
  private ambientLightThreeDimMeshes: HemisphericLight | undefined;
  private ambientLightTwoDimMeshes: HemisphericLight | undefined;

  private backgroundMediaPlane: Mesh | undefined;
  private backgroundMediaTexture: VideoTexture | Texture | undefined;
  private backgroundMediaMaterial: StandardMaterial | undefined;

  private hideBackgroundPlane: Mesh | undefined;
  private hideBackgroundTexture: DynamicTexture | undefined;
  private hideBackgroundMaterial: StandardMaterial | undefined;

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

  imageAlreadyProcessed = 1;

  mediaRecorder: MediaRecorder | undefined = undefined;
  chunks: Blob[] = [];
  recordingURL: string | undefined;
  recordingMimeType: string | undefined;

  constructor(
    private id: string,
    private type: "camera" | "screen" | "image" | "video",
    private canvas: HTMLCanvasElement,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement,
    private faceLandmarks: FaceLandmarks | undefined,
    private effects: {
      [effectType in CameraEffectTypes]?: boolean | undefined;
    },
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private faceMeshWorker: Worker | undefined,
    private faceMeshResults: NormalizedLandmarkListList[] | undefined,
    private faceMeshProcessing: boolean[] | undefined,
    private faceDetectionWorker: Worker | undefined,
    private faceDetectionProcessing: boolean[] | undefined,
    private selfieSegmentationWorker: Worker | undefined,
    private selfieSegmentationResults: ImageData[] | undefined,
    private selfieSegmentationProcessing: boolean[] | undefined,
    private userDevice: UserDevice,
    private maxFaces: [number],
    private userMedia: React.MutableRefObject<UserMediaType>
  ) {
    this.engine = new Engine(this.canvas, true);

    this.scene = new Scene(this.engine);

    this.scene.clearColor = new Color4(0, 0, 0, 1);

    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);

    this.initCamera();
    this.initLighting();
    this.initBackgroundMediaPlane();
    this.initHideBackgroundPlane();
    this.initTintPlane();

    this.babylonMeshes = new BabylonMeshes(
      this.scene,
      this.camera,
      this.canvas,
      this.ambientLightThreeDimMeshes,
      this.ambientLightTwoDimMeshes,
      this.threeDimMeshesZCoord,
      this.userMedia
    );

    this.babylonRenderLoop = new BabylonRenderLoop(
      this.id,
      this.type,
      this.scene,
      this.camera,
      this.faceLandmarks,
      this.canvas,
      this.backgroundMedia,
      this.effects,
      this.userEffectsStyles,
      this.faceMeshWorker,
      this.faceMeshResults,
      this.faceMeshProcessing,
      this.faceDetectionWorker,
      this.faceDetectionProcessing,
      this.selfieSegmentationWorker,
      this.selfieSegmentationResults,
      this.selfieSegmentationProcessing,
      this.userDevice,
      this.hideBackgroundTexture,
      this.hideBackgroundMaterial,
      this.babylonMeshes
    );

    this.babylonShaderController = new BabylonShaderController(
      this.engine,
      this.camera,
      this.scene
    );

    // Render loop
    this.engine.runRenderLoop(this.engineRenderLoop);

    window.addEventListener("resize", this.canvasSizeChange);
    window.addEventListener("fullscreenchange", this.canvasSizeChange);

    this.resizeObserver = new ResizeObserver(this.canvasSizeChange);
    this.resizeObserver.observe(this.canvas);

    setTimeout(() => {
      this.canvasSizeChange();
    }, 1000);
  }

  deconstructor = () => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    this.engine.stopRenderLoop();
    this.engine.dispose();

    window.removeEventListener("resize", this.canvasSizeChange);
    window.removeEventListener("fullscreenchange", this.canvasSizeChange);

    this.resizeObserver.disconnect();
  };

  private engineRenderLoop = () => {
    if (
      !(
        this.backgroundMedia instanceof HTMLImageElement &&
        this.imageAlreadyProcessed > 20
      )
    ) {
      if (this.imageAlreadyProcessed <= 20) {
        this.imageAlreadyProcessed += 1;
      }

      this.babylonRenderLoop.renderLoop();
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
      this.scene
    );
    dummyMesh3D.scaling = new Vector3(0, 0, 0);

    // Create a light
    this.backgroundLight = new HemisphericLight(
      "backgroundLight",
      new Vector3(-1, 1, 0),
      this.scene
    );
    this.backgroundLight.intensity = 2.0;
    this.backgroundLight.diffuse = new Color3(1, 1, 1);
    this.backgroundLight.includedOnlyMeshes.push(dummyMesh3D);

    this.ambientLightThreeDimMeshes = new HemisphericLight(
      "ambientLightThreeDimMeshes",
      new Vector3(-0.4, 0.3, -0.15),
      this.scene
    );
    this.ambientLightThreeDimMeshes.intensity = 0.8;
    this.ambientLightThreeDimMeshes.includedOnlyMeshes.push(dummyMesh3D);

    this.ambientLightTwoDimMeshes = new HemisphericLight(
      "ambientLightTwoDimMeshes",
      new Vector3(1, 1, -1),
      this.scene
    );
    this.ambientLightTwoDimMeshes.intensity = 2;
    this.ambientLightTwoDimMeshes.specular = new Color3(0, 0, 0);
    this.ambientLightTwoDimMeshes.includedOnlyMeshes.push(dummyMesh3D);
  };

  private updateBackgroundPlaneSize = (plane: Mesh, zOffset?: number) => {
    const backgroundDistance = this.camera.maxZ - (zOffset ?? 0);

    const verticalFOV = this.camera.fov;
    const planeHeight = 2 * Math.tan(verticalFOV / 2) * backgroundDistance;

    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;

    const canvasAspect = canvas.width / canvas.height;
    const mediaAspect =
      this.backgroundMedia instanceof HTMLVideoElement
        ? this.backgroundMedia.videoWidth / this.backgroundMedia.videoHeight
        : this.backgroundMedia.width / this.backgroundMedia.height;

    let planeWidth: number;
    let planeScaledHeight: number;

    // Compute dimensions based on `object-fit: contain`
    if (canvasAspect > mediaAspect) {
      // Fit by height
      planeScaledHeight = planeHeight;
      planeWidth = planeHeight * mediaAspect;
    } else {
      // Fit by width
      planeWidth = planeHeight * canvasAspect;
      planeScaledHeight = planeWidth / mediaAspect;
    }

    // Update the plane scaling
    plane.scaling = new Vector3(
      (this.type === "camera" ? -1 : 1) * planeWidth,
      planeScaledHeight,
      1
    );
    plane.position = new Vector3(0, 0, backgroundDistance);
  };

  private initBackgroundMediaPlane = () => {
    this.backgroundMediaTexture =
      this.backgroundMedia instanceof HTMLVideoElement
        ? new VideoTexture(
            "backgroundMediaTexture",
            this.backgroundMedia,
            this.scene
          )
        : new Texture(this.backgroundMedia.src, this.scene);

    this.backgroundMediaPlane = MeshBuilder.CreatePlane(
      "backgroundMediaPlane",
      { width: 1, height: 1 },
      this.scene
    );
    this.backgroundMediaMaterial = new StandardMaterial(
      "backgroundMediaMaterial",
      this.scene
    );
    this.backgroundMediaMaterial.diffuseTexture = this.backgroundMediaTexture;
    this.backgroundMediaPlane.material = this.backgroundMediaMaterial;

    this.updateBackgroundPlaneSize(this.backgroundMediaPlane);

    if (this.backgroundLight) {
      this.backgroundLight.includedOnlyMeshes.push(this.backgroundMediaPlane);
    }
  };

  private initHideBackgroundPlane = () => {
    this.hideBackgroundTexture = new DynamicTexture(
      "hideBackgroundTexture",
      {
        width: this.canvas.width,
        height: this.canvas.height,
      },
      this.scene
    );

    this.hideBackgroundTexture.hasAlpha = true;

    this.hideBackgroundMaterial = new StandardMaterial(
      "hideBackgroundMaterial",
      this.scene
    );

    this.hideBackgroundMaterial.useAlphaFromDiffuseTexture = true; // Use the alpha channel from the diffuse texture
    this.hideBackgroundMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND; // Set transparency mode to alpha test

    this.hideBackgroundMaterial.diffuseTexture = this.hideBackgroundTexture;
  };

  private createHideBackgroundPlane = () => {
    if (!this.hideBackgroundMaterial) {
      return;
    }

    this.hideBackgroundPlane = MeshBuilder.CreatePlane(
      "hideBackgroundPlane",
      { width: 1, height: 1 },
      this.scene
    );
    this.backgroundLight?.includedOnlyMeshes.push(this.hideBackgroundPlane);

    this.hideBackgroundPlane.material = this.hideBackgroundMaterial;

    this.updateBackgroundPlaneSize(this.hideBackgroundPlane, 0.00000001);
  };

  private deleteHideBackgroundPlane = () => {
    if (this.hideBackgroundPlane) {
      this.hideBackgroundPlane.dispose();
      this.hideBackgroundPlane = undefined;
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
      this.scene
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

  private canvasSizeChange = () => {
    this.engine.resize();
    this.scene.render();

    if (this.backgroundMediaPlane) {
      this.updateBackgroundPlaneSize(this.backgroundMediaPlane);
    }
    if (this.hideBackgroundPlane) {
      this.updateBackgroundPlaneSize(this.hideBackgroundPlane, 0.000001);
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
    initRotation?: [number, number, number]
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
      initRotation
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
    initRotation?: [number, number, number]
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
        initRotation
      );
    }
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
      const meshMetaData = mesh.metadata;
      if (meshMetaData && meshMetaData.effectType === effect) {
        meshesToDelete.push(mesh);
      }
    }

    // Now, delete them after iteration
    for (const mesh of meshesToDelete) {
      this.babylonMeshes.deleteMesh(mesh);
    }
  };

  toggleHideBackgroundPlane = (active: boolean) => {
    if (active && !this.hideBackgroundPlane) {
      this.createHideBackgroundPlane();
    } else if (!active && this.hideBackgroundPlane) {
      this.deleteHideBackgroundPlane();
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
          "blurEffect", // Name of the effect
          new Vector2(1.0, 0.0), // Direction of the blur
          80.0, // Blur kernel size (affects intensity)
          1.0, // Ratio (resolution scaling factor)
          this.camera // Apply blur to the camera
        );

        this.blurPostProcessY = new BlurPostProcess(
          "blurEffect", // Name of the effect
          new Vector2(0.0, 1.0), // Direction of the blur
          80.0, // Blur kernel size (affects intensity)
          0.5, // Ratio (resolution scaling factor)
          this.camera // Apply blur to the camera
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
          this.camera
        );
      }

      if (!this.pauseLayer) {
        // Create a full-screen layer for the pause image
        this.pauseLayer = new Layer(
          "pauseLayer",
          nginxAssetSeverBaseUrl + "2DAssets/videoPaused.png",
          this.scene,
          false
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

  downloadSnapShot = () => {
    if (this.engine) {
      Tools.CreateScreenshotUsingRenderTarget(
        this.engine,
        this.camera,
        { width: this.canvas.width, height: this.canvas.height },
        (dataUrl) => {
          // Create a link element for download
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "scene-snapshot.png";

          // Simulate a click to download the image
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      );
    }
  };

  startRecording(mimeType: string, fps: number) {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    const stream = this.canvas.captureStream(fps);
    try {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.recordingMimeType = mimeType;
    } catch {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
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
    };

    // Start recording
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.mediaRecorder?.stop();
  }

  downloadRecording = () => {
    if (!this.recordingURL || !this.recordingMimeType) return;

    const a = document.createElement("a");
    a.href = this.recordingURL;
    a.download = `recording${
      recordingMimeTypeExtensionMap[
        this.recordingMimeType as keyof typeof recordingMimeTypeExtensionMap
      ] ?? ".webp"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}

export default BabylonScene;
