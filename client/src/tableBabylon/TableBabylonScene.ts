import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  Color3,
  Color4,
  PointerEventTypes,
  AbstractMesh,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import TableBabylonMeshes from "./meshes/TableBabylonMeshes";
import BabylonShaderController from "./shaders/BabylonShaderController";
import LittleBuddies from "./littleBuddies/LittleBuddies";
import TableBabylonSceneUtils from "./utils/TableBabylonSceneUtils";
import TableBabylonEffects from "./effects/TableBabylonEffects";
import TableBabylonKeyboard from "./keyboard/TableBabylonKeyboard";
import LittleBuddy from "./littleBuddies/lib/LittleBuddy";
import TableBabylonGizmo from "./gizmo/TableBabylonGizmo";
import TableBabylonAudio from "./audio/TableBabylonAudio";
import TableBabylonAnimations from "./animations/TableBabylonAnimations";
import TableBabylonSelect from "./select/TableBabylonSelect";
import TableBabylonMouse from "./mouse/TableBabylonMouse";
import TableBabylonPhysics from "./physics/TableBabylonPhysics";

class TableBabylonScene {
  twoDimMeshesZCoord = 90;
  threeDimMeshesZCoord = 100;

  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;

  backgroundLight: HemisphericLight | undefined;
  ambientLightThreeDimMeshes: HemisphericLight | undefined;
  ambientLightTwoDimMeshes: HemisphericLight | undefined;

  tableBabylonSceneUtils: TableBabylonSceneUtils;
  tableBabylonGizmo: TableBabylonGizmo;
  tableBabylonAudio: TableBabylonAudio;
  tableBabylonAnimations: TableBabylonAnimations;
  tableBabylonSelect: TableBabylonSelect;
  tableBabylonMouse: TableBabylonMouse;
  tableBabylonMeshes: TableBabylonMeshes;
  tableBabylonEffects: TableBabylonEffects;
  babylonShaderController: BabylonShaderController;
  tableBabylonKeyboard: TableBabylonKeyboard;
  tableBabylonPhysics: TableBabylonPhysics;

  littleBuddies: {
    [username: string]: { [littleBuddyId: string]: LittleBuddy };
  } = {};
  tableLittleBuddies: LittleBuddies;

  selectedMesh: AbstractMesh | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    public backgroundMedia: HTMLVideoElement | HTMLImageElement | undefined,
  ) {
    this.engine = new Engine(this.canvas, true);

    this.scene = new Scene(this.engine);

    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, -1),
      this.scene,
    );
    // this.camera.attachControl(this.canvas, true);

    this.initCamera();
    this.initLighting();

    this.tableBabylonSceneUtils = new TableBabylonSceneUtils(
      this.engine,
      this.camera,
      this.canvas,
    );
    this.tableBabylonGizmo = new TableBabylonGizmo(this);
    this.tableBabylonAudio = new TableBabylonAudio();
    this.tableBabylonAnimations = new TableBabylonAnimations(this);
    this.tableBabylonSelect = new TableBabylonSelect(this);
    this.tableBabylonMouse = new TableBabylonMouse(this);
    this.tableBabylonMeshes = new TableBabylonMeshes(this);
    this.tableBabylonEffects = new TableBabylonEffects(this);
    this.babylonShaderController = new BabylonShaderController(this);
    this.tableLittleBuddies = new LittleBuddies(this);
    this.tableBabylonKeyboard = new TableBabylonKeyboard(this);
    this.tableBabylonPhysics = new TableBabylonPhysics(this);

    this.engine.resize();

    // Render loop
    this.engine.runRenderLoop(this.engineRenderLoop);
  }

  deconstructor = () => {
    this.engine.stopRenderLoop();
    this.engine.dispose();

    this.tableBabylonSceneUtils.deconstructor();
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
}

export default TableBabylonScene;
