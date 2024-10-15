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
import BabylonMeshes from "./BabylonMeshes";

class BabylonScene {
  private video: HTMLVideoElement;

  private engine: Engine;
  private scene: Scene;
  private camera: UniversalCamera;
  private light: HemisphericLight | undefined;

  private videoPlane: Mesh | undefined;
  private videoMaterial: StandardMaterial | undefined;

  private babylonMeshes: BabylonMeshes;

  constructor(private canvas: HTMLCanvasElement | null) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.video = document.createElement("video");

    this.initVideoStream();
    this.initCamera();
    this.initLighting();
    this.initVideoPlane();

    this.babylonMeshes = new BabylonMeshes(this.scene);
    this.babylonMeshes.loader(
      "gltf",
      "babyDragon_gltf",
      "",
      "/3DAssets/pets/babyDragon/babyDragon/",
      "scene.gltf",
      [0, 0, 90],
      [10, 10, 10],
      [-Math.PI / 2, 0, Math.PI]
    );
    this.babylonMeshes.loader(
      "2D",
      "babyDragon_2D",
      "",
      "/2DAssets/pets/babyDragon/",
      "babyDragon_512x512.png",
      [0, 0, 100],
      [10, 10, 10],
      [0, 0, 0]
    );
    this.babylonMeshes.loader(
      "gltf",
      "trex_gltf",
      "",
      "/3DAssets/pets/TRex/TRex/",
      "scene.gltf",
      [0, 0, 90],
      [0.1, 0.1, 0.1],
      [Math.PI, 0, Math.PI]
    );

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

  deconstructor() {
    this.engine.dispose();
    window.removeEventListener("resize", () => {
      this.engine.resize();
      this.updateVideoPlaneSize();
    });
  }

  private initVideoStream() {
    // Create a video background
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.loop = true;
    this.video.width = 640;
    this.video.height = 480;
    this.video.style.objectFit = "cover";

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (this.video) {
          this.video.srcObject = stream;
          this.video.play();
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
  }

  private initCamera() {
    this.camera.setTarget(Vector3.Zero());
  }

  private initLighting() {
    // Create a light
    this.light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this.scene
    );
  }

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

  private initVideoPlane() {
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
  }
}

export default BabylonScene;
