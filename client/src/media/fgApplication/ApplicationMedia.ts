import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultApplicationsStreamEffects,
  defaultApplicationsEffectsStyles,
  ApplicationsEffectTypes,
} from "../../context/effectsContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../lib/TableStaticContentSocketController";
import BabylonScene from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import { UserMediaType } from "../../context/mediaContext/typeConstant";

class ApplicationMedia {
  canvas: HTMLCanvasElement;
  application: HTMLImageElement;

  filename: string;
  mimeType: TableTopStaticMimeType;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  private blobURL: string | undefined;

  babylonScene: BabylonScene | undefined;

  private effects: {
    [applicationEffect in ApplicationsEffectTypes]?: boolean;
  } = {};

  initPositioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  constructor(
    private applicationId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private getApplication: (key: string) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private userDevice: UserDevice,
    private userMedia: React.MutableRefObject<UserMediaType>,
    initPositioning: {
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
    this.filename = filename;
    this.mimeType = mimeType;
    this.initPositioning = initPositioning;

    this.userStreamEffects.current.applications[this.applicationId] =
      structuredClone(defaultApplicationsStreamEffects);

    if (!this.userEffectsStyles.current.applications[this.applicationId]) {
      this.userEffectsStyles.current.applications[this.applicationId] =
        structuredClone(defaultApplicationsEffectsStyles);
    }

    this.application = document.createElement("img");
    this.application.onloadedmetadata = () => {
      this.canvas.width = this.application.width;
      this.canvas.height = this.application.height;
    };

    this.getApplication(this.filename);
    this.addMessageListener(this.getApplicationListener);

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.objectFit = "contain";
  }

  deconstructor() {
    this.application.src = "";
  }

  private getApplicationListener = (
    message: IncomingTableStaticContentMessages
  ) => {
    if (message.type === "chunk") {
      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);
      this.application.src = this.blobURL;

      this.babylonScene = new BabylonScene(
        this.applicationId,
        "application",
        this.canvas,
        this.application,
        undefined,
        this.effects,
        this.userEffectsStyles,
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

      this.removeMessageListener(this.getApplicationListener);
    }
  };

  downloadApplication = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-application.docx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  changeEffects = (
    effect: ApplicationsEffectTypes,
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

    this.babylonScene.imageAlreadyProcessed = 1;
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

export default ApplicationMedia;
