import {
  UserEffectsStylesType,
  UserEffectsType,
  defaultApplicationEffects,
  defaultApplicationEffectsStyles,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import BabylonScene from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";
import ApplicationMedia from "./ApplicationMedia";

class ApplicationMediaInstance {
  instanceCanvas: HTMLCanvasElement;
  instanceApplication: HTMLImageElement;

  babylonScene: BabylonScene | undefined;

  private effects: {
    [applicationEffect in ApplicationEffectTypes]?: boolean;
  } = {};

  constructor(
    public applicationMedia: ApplicationMedia,
    public applicationInstanceId: string,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userDevice: UserDevice,
    private userMedia: React.MutableRefObject<UserMediaType>,
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
    }
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

    this.instanceApplication = document.createElement("img");
    this.instanceApplication.onloadedmetadata = () => {
      this.instanceCanvas.width = this.instanceApplication.width;
      this.instanceCanvas.height = this.instanceApplication.height;
    };

    this.instanceCanvas = document.createElement("canvas");
    this.instanceCanvas.classList.add("babylonJS-canvas");
    this.instanceCanvas.style.width = "100%";
    this.instanceCanvas.style.height = "100%";
    this.instanceCanvas.style.objectFit = "contain";

    if (applicationMedia.application) {
      this.instanceApplication = applicationMedia.application?.cloneNode(
        true
      ) as HTMLImageElement;

      this.babylonScene = new BabylonScene(
        this.applicationInstanceId,
        "application",
        this.instanceCanvas,
        this.instanceApplication,
        undefined,
        this.effects,
        this.userEffectsStyles.current.application[this.applicationInstanceId],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.userDevice,
        [0],
        this.userMedia
      );
    }
    this.applicationMedia.addDownloadCompleteListener(() => {
      this.instanceApplication = applicationMedia.application?.cloneNode(
        true
      ) as HTMLImageElement;

      if (!this.babylonScene)
        this.babylonScene = new BabylonScene(
          this.applicationInstanceId,
          "application",
          this.instanceCanvas,
          this.instanceApplication,
          undefined,
          this.effects,
          this.userEffectsStyles.current.application[
            this.applicationInstanceId
          ],
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          this.userDevice,
          [0],
          this.userMedia
        );

      for (const effect in this.userEffects.current.application[
        this.applicationInstanceId
      ]) {
        if (
          this.userEffects.current.application[this.applicationInstanceId][
            effect as ApplicationEffectTypes
          ]
        ) {
          if (effect === "postProcess") {
            this.babylonScene.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.application[
                this.applicationInstanceId
              ].postProcess.style
            );

            this.changeEffects(effect as ApplicationEffectTypes);
          } else if (effect === "tint") {
            this.setTintColor(
              this.userEffectsStyles.current.application[
                this.applicationInstanceId
              ].tint.color
            );

            this.changeEffects(
              effect as ApplicationEffectTypes,
              this.userEffectsStyles.current.application[
                this.applicationInstanceId
              ].tint.color
            );
          } else {
            this.changeEffects(effect as ApplicationEffectTypes);
          }
        }
      }
    });
  }

  deconstructor() {
    this.instanceApplication.src = "";
  }

  changeEffects = (
    effect: ApplicationEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false
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
        this.hexToNormalizedRgb(tintColor)
      );
    }

    if (effect === "blur") {
      this.babylonScene?.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect]
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
}

export default ApplicationMediaInstance;
