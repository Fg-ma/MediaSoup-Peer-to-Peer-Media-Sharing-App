import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultTextStreamEffects,
  defaultTextEffectsStyles,
  TextEffectTypes,
} from "../../context/effectsContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  TableContentTypes,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import BabylonScene from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import { UserMediaType } from "../../context/mediaContext/typeConstant";

class TextMedia {
  canvas: HTMLCanvasElement;
  text: HTMLImageElement;

  filename: string;
  mimeType: TableTopStaticMimeType;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  private blobURL: string | undefined;

  babylonScene: BabylonScene | undefined;

  private effects: {
    [textEffect in TextEffectTypes]?: boolean;
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
    private textId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private getText: (
      contentType: TableContentTypes,
      contentId: string,
      key: string
    ) => void,
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

    if (!this.userStreamEffects.current.text[this.textId]) {
      this.userStreamEffects.current.text[this.textId] = structuredClone(
        defaultTextStreamEffects
      );
    }

    if (!this.userEffectsStyles.current.text[this.textId]) {
      this.userEffectsStyles.current.text[this.textId] = structuredClone(
        defaultTextEffectsStyles
      );
    }

    this.text = document.createElement("img");
    this.text.onloadedmetadata = () => {
      this.canvas.width = this.text.width;
      this.canvas.height = this.text.height;
    };

    this.getText("text", this.textId, this.filename);
    this.addMessageListener(this.getTextListener);

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.objectFit = "contain";
  }

  deconstructor() {
    this.text.src = "";
  }

  private getTextListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "text" ||
        contentId !== this.textId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "text" ||
        contentId !== this.textId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);
      this.text.src = this.blobURL;

      this.babylonScene = new BabylonScene(
        this.textId,
        "text",
        this.canvas,
        this.text,
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

      this.removeMessageListener(this.getTextListener);

      for (const effect in this.userStreamEffects.current.text[this.textId]) {
        if (
          this.userStreamEffects.current.text[this.textId][
            effect as TextEffectTypes
          ]
        ) {
          if (effect === "postProcess") {
            this.babylonScene.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.text[this.textId].postProcess.style
            );

            this.changeEffects(effect as TextEffectTypes);
          } else if (effect === "tint") {
            this.setTintColor(
              this.userEffectsStyles.current.text[this.textId].tint.color
            );

            this.changeEffects(
              effect as TextEffectTypes,
              this.userEffectsStyles.current.text[this.textId].tint.color
            );
          } else {
            this.changeEffects(effect as TextEffectTypes);
          }
        }
      }
    }
  };

  downloadText = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-text.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  changeEffects = (
    effect: TextEffectTypes,
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

export default TextMedia;
