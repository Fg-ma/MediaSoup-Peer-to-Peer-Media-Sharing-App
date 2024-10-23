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
  MotionBlurPostProcess,
  BlackAndWhitePostProcess,
  ChromaticAberrationPostProcess,
  SharpenPostProcess,
  TonemapPostProcess,
  TonemappingOperator,
  Effect,
  PostProcess,
} from "@babylonjs/core";
import BabylonMeshes, { MeshTypes } from "./BabylonMeshes";
import BabylonRenderLoop from "./BabylonRenderLoop";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { CameraEffectTypes } from "../context/StreamsContext";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import UserDevice from "../UserDevice";
import "@babylonjs/inspector";

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
export type PositionStyle = "faceTrack" | "free";

export const validEffectTypes: EffectType[] = [
  "glasses",
  "beards",
  "mustaches",
  "masks",
  "pets",
  "hats",
];

// Shader Code
Effect.ShadersStore["vintageTVFragmentShader"] = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform float time;
  uniform float aspectRatio;

  // Random noise function for static effect
  float random(vec2 coords) {
      return fract(sin(dot(coords.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main(void) {
      // 1. Apply scanlines
      float scanline = sin(vUV.y * 800.0) * 0.05; // Adjust the frequency and strength of the scanlines
      vec2 uv = vUV;
      
      // 2. Simulate chromatic aberration by slightly offsetting the RGB channels
      float r = texture2D(textureSampler, uv + vec2(0.001, 0.0)).r;  // Red channel
      float g = texture2D(textureSampler, uv).g;                      // Green channel
      float b = texture2D(textureSampler, uv - vec2(0.001, 0.0)).b;   // Blue channel

      // 3. Combine the channels with scanline effect
      vec3 color = vec3(r, g, b) - vec3(scanline);

      // 4. Add vignette effect (darken the edges)
      float vignette = smoothstep(0.7, 1.0, length(vUV - 0.5) * 1.5);
      color *= 1.0 - vignette;

      // 5. Add random noise for static
      float noise = random(vUV * time) * 0.05;
      color += vec3(noise);

      // Output the final color
      gl_FragColor = vec4(color, 1.0);
  }
`;

class BabylonScene {
  private engine: Engine;
  scene: Scene;
  private camera: UniversalCamera;

  private backgroundLight: HemisphericLight | undefined;
  private ambientLightThreeDimMeshes: HemisphericLight | undefined;
  private ambientLightTwoDimMeshes: HemisphericLight | undefined;

  private videoPlane: Mesh | undefined;
  private videoTexture: VideoTexture | undefined;
  private videoMaterial: StandardMaterial | undefined;

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

  twoDimMeshesZCoord = 90;
  threeDimMeshesZCoord = 100;

  constructor(
    private id: string,
    private canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
    private faceLandmarks: FaceLandmarks | undefined,
    private effects: {
      [effectType in CameraEffectTypes]?: boolean | undefined;
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
    private userDevice: UserDevice,
    private maxFaces: [number]
  ) {
    this.engine = new Engine(this.canvas, true);

    this.scene = new Scene(this.engine);

    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    // const motionblur = new MotionBlurPostProcess(
    //   "mb", // The name of the effect.
    //   this.scene, // The scene containing the objects to blur according to their velocity.
    //   1.0, // The required width/height ratio to downsize to before computing the render pass.
    //   this.camera // The camera to apply the render pass to.
    // );
    // const blackAndWhite = new BlackAndWhitePostProcess(
    //   "bw",
    //   1.0,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const chromaticAberrationPostProcess = new ChromaticAberrationPostProcess(
    //   "ca",
    //   this.canvas.width,
    //   this.canvas.height,
    //   1,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const sharpenPostProcess = new SharpenPostProcess(
    //   "s",
    //   1,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const tonemapPostProcess = new TonemapPostProcess(
    //   "tonemap",
    //   TonemappingOperator.HejiDawson, // You can switch between Hable, Reinhard, or HejiDawson
    //   1.0, // Exposure adjustment
    //   this.camera // Attach it to your camera
    // );
    // Fisheye PostProcess
    // const vintageTVPostProcess = new PostProcess(
    //   "vintageTVEffect", // Name of the effect
    //   "vintageTV", // Shader name
    //   ["time", "aspectRatio"], // Uniforms passed to the shader
    //   null, // No samplers
    //   1.0, // Scale ratio
    //   this.camera // Apply the effect to the camera
    // );

    // // Pass the current time to the shader (for noise animation)
    // vintageTVPostProcess.onApply = (effect) => {
    //   effect.setFloat("time", performance.now() * 0.001); // time in seconds
    //   effect.setFloat("aspectRatio", this.engine.getAspectRatio(this.camera)); // Screen aspect ratio
    // };

    this.initCamera();
    this.initVideoPlane();
    this.initHideBackgroundPlane();
    this.initTintPlane();
    this.initLighting();

    this.babylonMeshes = new BabylonMeshes(
      this.scene,
      this.ambientLightThreeDimMeshes,
      this.ambientLightTwoDimMeshes
    );

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
      this.userDevice,
      this.hideBackgroundTexture,
      this.hideBackgroundMaterial
    );

    // Render loop
    this.engine.runRenderLoop(() => {
      this.babylonRenderLoop.renderLoop();
      this.scene.render();
    });

    // Resize
    window.addEventListener("resize", () => {
      this.engine.resize();
      if (this.videoPlane) this.updateBackgroundPlaneSize(this.videoPlane);
      if (this.hideBackgroundPlane)
        this.updateBackgroundPlaneSize(this.hideBackgroundPlane, 0.01);
    });
  }

  deconstructor = () => {
    this.engine.dispose();
    this.engine.stopRenderLoop();

    window.removeEventListener("resize", () => {
      this.engine.resize();
      if (this.videoPlane) this.updateBackgroundPlaneSize(this.videoPlane);
      if (this.hideBackgroundPlane)
        this.updateBackgroundPlaneSize(this.hideBackgroundPlane, 0.01);
    });
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
    this.backgroundLight.intensity = 1.0;
    this.backgroundLight.diffuse = new Color3(1, 1, 1);
    this.backgroundLight.includedOnlyMeshes.push(dummyMesh3D);
    if (this.videoPlane) {
      this.backgroundLight.includedOnlyMeshes.push(this.videoPlane);
    }
    if (this.tintPlane) {
      this.backgroundLight.includedOnlyMeshes.push(this.tintPlane);
    }

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

    // Calculate the plane's height based on FOV and distance
    const verticalFOV = this.camera.fov;
    const planeHeight = 2 * Math.tan(verticalFOV / 2) * backgroundDistance;

    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;

    const aspectRatio = canvas.width / canvas.height;
    const planeWidth = planeHeight * aspectRatio;

    // Update the plane's scaling and position
    plane.scaling = new Vector3(-planeWidth, planeHeight, 1);
    plane.position = new Vector3(0, 0, backgroundDistance);
  };

  private initVideoPlane = () => {
    this.videoTexture = new VideoTexture(
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
    this.videoMaterial.diffuseTexture = this.videoTexture;
    this.videoPlane.material = this.videoMaterial;

    this.updateBackgroundPlaneSize(this.videoPlane);
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

    this.updateBackgroundPlaneSize(this.hideBackgroundPlane, 0.01);
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
