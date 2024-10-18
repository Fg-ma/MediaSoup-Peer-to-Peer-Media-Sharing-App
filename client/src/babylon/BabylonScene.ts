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
  Texture,
} from "@babylonjs/core";
import BabylonMeshes, { MeshTypes } from "./BabylonMeshes";
import BabylonRenderLoop from "./BabylonRenderLoop";
import FaceLandmarks from "src/effects/visualEffects/lib/FaceLandmarks";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "src/context/StreamsContext";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import UserDevice from "src/UserDevice";

class BabylonScene {
  private engine: Engine;
  private scene: Scene;
  private camera: UniversalCamera;
  private light: HemisphericLight | undefined;

  private videoPlane: Mesh | undefined;
  private videoMaterial: StandardMaterial | undefined;

  private tintPlane: Mesh | undefined;
  private tintMaterial: StandardMaterial | undefined;

  private pausePostProcess: ImageProcessingPostProcess | undefined;
  private pauseLayer: Layer | undefined;

  private blurPostProcessX: BlurPostProcess | undefined;
  private blurPostProcessY: BlurPostProcess | undefined;

  private babylonMeshes: BabylonMeshes;

  private babylonRenderLoop: BabylonRenderLoop;

  twoDimMeshesPlane = 90;
  threeDimMeshesPlane = 100;

  constructor(
    private id: string,
    private canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
    private faceLandmarks: FaceLandmarks | undefined,
    private effects: {
      [effectType in
        | CameraEffectTypes
        | ScreenEffectTypes
        | AudioEffectTypes]?: boolean | undefined;
    },
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private faceMeshWorker: Worker | undefined,
    private faceMeshResults: NormalizedLandmarkListList[] | undefined,
    private faceMeshProcessing: boolean[] | undefined,
    private faceDetectionWorker: Worker | undefined,
    private faceDetectionProcessing: boolean[] | undefined,
    private selfieSegmentationWorker: Worker | undefined,
    private selfieSegmentationResults: ImageData[] | undefined,
    private selfieSegmentationProcessing: boolean[] | undefined,
    private userDevice: UserDevice
  ) {
    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);

    this.initCamera();
    this.initLighting();
    this.initVideoPlane();
    this.initTintPlane();

    this.babylonMeshes = new BabylonMeshes(this.scene);

    this.babylonRenderLoop = new BabylonRenderLoop(
      this.id,
      this.scene,
      this.camera,
      this.faceLandmarks,
      this.canvas,
      this.video,
      this.effects,
      this.currentEffectsStyles,
      this.faceMeshWorker,
      this.faceMeshResults,
      this.faceMeshProcessing,
      this.faceDetectionWorker,
      this.faceDetectionProcessing,
      this.selfieSegmentationWorker,
      this.selfieSegmentationResults,
      this.selfieSegmentationProcessing,
      this.userDevice
    );

    // Render loop
    this.engine.runRenderLoop(() => {
      this.babylonRenderLoop.renderLoop();
      this.scene.render();
    });

    // Resize
    window.addEventListener("resize", () => {
      this.engine.resize();
      this.updateVideoPlaneSize();
    });
  }

  deconstructor = () => {
    this.engine.dispose();
    this.engine.stopRenderLoop();
    window.removeEventListener("resize", () => {
      this.engine.resize();
      this.updateVideoPlaneSize();
    });
  };

  private initCamera = () => {
    this.camera.setTarget(Vector3.Zero());
  };

  private initLighting = () => {
    // Create a light
    this.light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this.scene
    );
  };

  private updateVideoPlaneSize = () => {
    if (!this.videoPlane) {
      return;
    }

    const backgroundDistance = this.camera.maxZ;

    // Calculate the plane's height based on FOV and distance
    const verticalFOV = this.camera.fov;
    const planeHeight = 2 * Math.tan(verticalFOV / 2) * backgroundDistance;

    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;

    const aspectRatio = canvas.width / canvas.height;
    const planeWidth = planeHeight * aspectRatio;

    // Update the plane's scaling and position
    this.videoPlane.scaling = new Vector3(-planeWidth, planeHeight, 1);
    this.videoPlane.position = new Vector3(0, 0, backgroundDistance);
  };

  private initVideoPlane = () => {
    const videoTexture = new VideoTexture(
      "videoTexture",
      this.video,
      this.scene,
      true
    );

    this.videoPlane = MeshBuilder.CreatePlane(
      "videoPlane",
      { width: 1, height: 1 },
      this.scene
    );
    this.videoMaterial = new StandardMaterial("videoMaterial", this.scene);
    this.videoMaterial.diffuseTexture = videoTexture;
    this.videoPlane.material = this.videoMaterial;

    this.updateVideoPlaneSize();
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
  };

  createMesh = (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    deafultMeshPlacement: string,
    meshPath: string,
    meshFile: string,
    position?: [number, number, number],
    scale?: [number, number, number],
    rotation?: [number, number, number]
  ) => {
    this.babylonMeshes.loader(
      type,
      meshLabel,
      meshName,
      deafultMeshPlacement,
      meshPath,
      meshFile,
      undefined,
      position,
      scale,
      rotation
    );
  };

  createEffectMesh = (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    defaultMeshPlacement: string,
    meshPath: string,
    meshFile: string,
    position?: [number, number, number],
    scale?: [number, number, number],
    rotation?: [number, number, number]
  ) => {
    if (!this.faceLandmarks) {
      return;
    }

    for (const {
      faceId,
      landmarks,
    } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
      this.babylonMeshes.loader(
        type,
        meshLabel,
        meshName,
        defaultMeshPlacement,
        meshPath,
        meshFile,
        faceId,
        position,
        scale,
        rotation
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
          "/2DAssets/videoPaused.png",
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
}

export default BabylonScene;
