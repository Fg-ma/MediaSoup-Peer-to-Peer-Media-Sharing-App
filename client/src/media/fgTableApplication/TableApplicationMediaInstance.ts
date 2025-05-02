import {
  UserEffectsStylesType,
  UserEffectsType,
  defaultApplicationEffects,
  defaultApplicationEffectsStyles,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import BabylonScene from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import TableApplicationMedia, {
  ApplicationListenerTypes,
} from "./TableApplicationMedia";

class TableApplicationMediaInstance {
  instanceCanvas: HTMLCanvasElement;
  instanceApplication: HTMLImageElement | undefined;

  babylonScene: BabylonScene | undefined;

  private effects: {
    [applicationEffect in ApplicationEffectTypes]?: boolean;
  } = {};

  constructor(
    public applicationMedia: TableApplicationMedia,
    public applicationInstanceId: string,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userDevice: React.MutableRefObject<UserDevice>,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
  ) {
    if (!this.userEffects.current.application[this.applicationInstanceId]) {
      this.userEffects.current.application[this.applicationInstanceId] =
        structuredClone(defaultApplicationEffects);
    }

    if (
      !this.userEffectsStyles.current.application[this.applicationInstanceId]
    ) {
      this.userEffectsStyles.current.application[this.applicationInstanceId] =
        structuredClone(defaultApplicationEffectsStyles);
    }

    this.instanceCanvas = document.createElement("canvas");
    this.instanceCanvas.classList.add("babylonJS-canvas");
    this.instanceCanvas.style.width = "100%";
    this.instanceCanvas.style.height = "100%";
    this.instanceCanvas.style.objectFit = "contain";

    if (applicationMedia.application) {
      this.instanceApplication = applicationMedia.application?.cloneNode(
        true,
      ) as HTMLImageElement;

      this.instanceApplication.onload = () => {
        if (this.instanceApplication) {
          this.instanceCanvas.width = this.instanceApplication.width;
          this.instanceCanvas.height = this.instanceApplication.height;
        }
      };

      if (!this.babylonScene && this.instanceApplication)
        this.babylonScene = new BabylonScene(
          undefined,
          "application",
          this.applicationMedia.aspect ?? 1,
          this.instanceCanvas,
          this.instanceApplication,
          undefined,
          this.effects,
          undefined,
          undefined,
          this.userDevice,
          [0],
        );
    }

    this.applicationMedia.addApplicationListener(
      this.handleApplicationMessages,
    );
  }

  deconstructor() {
    if (this.instanceApplication) {
      this.instanceApplication.src = "";
      this.instanceApplication = undefined;
    }

    // Remove canvas element
    this.instanceCanvas.remove();

    // Call the BabylonScene deconstructor
    this.babylonScene?.deconstructor();

    this.applicationMedia.removeApplicationListener(
      this.handleApplicationMessages,
    );
  }

  private handleApplicationMessages = (event: ApplicationListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    this.instanceApplication = this.applicationMedia.application?.cloneNode(
      true,
    ) as HTMLImageElement;

    this.instanceApplication.onload = () => {
      if (this.instanceApplication) {
        this.instanceCanvas.width = this.instanceApplication.width;
        this.instanceCanvas.height = this.instanceApplication.height;
      }
    };

    if (!this.babylonScene && this.instanceApplication) {
      this.babylonScene = new BabylonScene(
        undefined,
        "application",
        this.applicationMedia.aspect ?? 1,
        this.instanceCanvas,
        this.instanceApplication,
        undefined,
        this.effects,
        undefined,
        undefined,
        this.userDevice,
        [0],
      );
    }

    for (const effect in this.userEffects.current.application[
      this.applicationInstanceId
    ]) {
      if (
        this.userEffects.current.application[this.applicationInstanceId][
          effect as ApplicationEffectTypes
        ]
      ) {
        if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.swapPostProcessEffects(
            this.userEffectsStyles.current.application[
              this.applicationInstanceId
            ].postProcess.style,
          );

          this.changeEffects(effect as ApplicationEffectTypes);
        } else if (effect === "tint") {
          this.setTintColor(
            this.userEffectsStyles.current.application[
              this.applicationInstanceId
            ].tint.color,
          );

          this.changeEffects(
            effect as ApplicationEffectTypes,
            this.userEffectsStyles.current.application[
              this.applicationInstanceId
            ].tint.color,
          );
        } else {
          this.changeEffects(effect as ApplicationEffectTypes);
        }
      }
    }
  };

  changeEffects = (
    effect: ApplicationEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false,
  ) => {
    if (!this.babylonScene) return;

    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene?.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor),
      );
    }

    if (effect === "blur") {
      this.babylonScene?.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect],
      );
    }

    this.babylonScene.imageAlreadyProcessed = [1];
  };

  setTintColor = (newTintColor: string) => {
    this.babylonScene?.setTintColor(this.hexToNormalizedRgb(newTintColor));
  };

  private hexToNormalizedRgb = (hex: string): [number, number, number] => {
    // Remove the leading '#' if present
    hex = hex.replace(/^#/, "");

    // Parse the r, g, b values from the hex string
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
  };

  getAspect = () => {
    return this.applicationMedia.aspect;
  };
}

export default TableApplicationMediaInstance;
