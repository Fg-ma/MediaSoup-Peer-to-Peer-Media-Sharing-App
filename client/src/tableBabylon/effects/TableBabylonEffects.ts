import {
  Vector3,
  Vector2,
  MeshBuilder,
  StandardMaterial,
  VideoTexture,
  Mesh,
  Color3,
  BlurPostProcess,
  Layer,
  Texture,
  Color4,
} from "@babylonjs/core";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonEffects {
  private backgroundMediaLayer: Layer | undefined;
  private backgroundMediaTexture: VideoTexture | Texture | undefined;

  private tintPlane: Mesh | undefined;
  private tintMaterial: StandardMaterial | undefined;

  private blurPostProcessX: BlurPostProcess | undefined;
  private blurPostProcessY: BlurPostProcess | undefined;

  constructor(private tableBabylonScene: TableBabylonScene) {
    this.initBackgroundMediaLayer();
    this.initTintPlane();
  }

  private initBackgroundMediaLayer = () => {
    if (!this.tableBabylonScene.backgroundMedia) return;

    this.backgroundMediaTexture =
      this.tableBabylonScene.backgroundMedia instanceof HTMLVideoElement
        ? new VideoTexture(
            "backgroundMediaTexture",
            this.tableBabylonScene.backgroundMedia,
            this.tableBabylonScene.scene,
          )
        : new Texture(
            this.tableBabylonScene.backgroundMedia.src,
            this.tableBabylonScene.scene,
          );
    this.backgroundMediaTexture.hasAlpha = true;
    this.tableBabylonScene.scene.clearColor = new Color4(0, 0, 0, 0);

    this.backgroundMediaLayer = new Layer(
      "background",
      null,
      this.tableBabylonScene.scene,
      true,
    );

    this.backgroundMediaLayer.texture = this.backgroundMediaTexture;
  };

  private initTintPlane = () => {
    this.tintPlane = MeshBuilder.CreatePlane(
      "tintPlane",
      { width: 1, height: 1 },
      this.tableBabylonScene.scene,
    );
    this.tintPlane.isPickable = false;
    this.tintMaterial = new StandardMaterial(
      "tintMaterial",
      this.tableBabylonScene.scene,
    );
    this.tintMaterial.diffuseColor = new Color3(0, 0, 0);
    this.tintMaterial.alpha = 0.0;

    this.tintPlane.material = this.tintMaterial;

    this.updateTintPlaneSize();

    if (this.tableBabylonScene.backgroundLight) {
      this.tableBabylonScene.backgroundLight.includedOnlyMeshes.push(
        this.tintPlane,
      );
    }
  };

  private updateTintPlaneSize = () => {
    if (!this.tintPlane) return;

    const foregroundDistance = this.tableBabylonScene.camera.minZ;

    this.tintPlane.scaling = new Vector3(-1000, 1000, 1);
    this.tintPlane.position = new Vector3(0, 0, foregroundDistance);
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
          this.tableBabylonScene.camera, // Apply blur to the camera
        );

        this.blurPostProcessY = new BlurPostProcess(
          "blurEffectY", // Name of the effect
          new Vector2(0.0, 1.0), // Direction of the blur
          80.0, // Blur kernel size (affects intensity)
          0.5, // Ratio (resolution scaling factor)
          this.tableBabylonScene.camera, // Apply blur to the camera
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
}

export default TableBabylonEffects;
