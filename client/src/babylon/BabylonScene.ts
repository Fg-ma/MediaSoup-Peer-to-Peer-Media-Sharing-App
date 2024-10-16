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
} from "@babylonjs/core";
import BabylonMeshes, { MeshTypes } from "./BabylonMeshes";

class BabylonScene {
  private engine: Engine;
  private scene: Scene;
  private camera: UniversalCamera;
  private light: HemisphericLight | undefined;

  private videoPlane: Mesh | undefined;
  private videoMaterial: StandardMaterial | undefined;

  private babylonMeshes: BabylonMeshes;

  constructor(
    private canvas: HTMLCanvasElement | null,
    private video: HTMLVideoElement
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

    this.babylonMeshes = new BabylonMeshes(this.scene);

    // Render loop
    this.engine.runRenderLoop(() => {
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

  createMesh = (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
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
      meshPath,
      meshFile,
      position,
      scale,
      rotation
    );
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
}

export default BabylonScene;
