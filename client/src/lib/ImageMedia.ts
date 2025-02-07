import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultImageStreamEffects,
  defaultImageEffectsStyles,
  ImageEffectTypes,
} from "../context/effectsContext/typeConstant";
import { IncomingTableStaticContentMessages } from "./TableStaticContentSocketController";

class ImageMedia {
  image: HTMLImageElement;

  imageURL: string;

  filename: string;

  private fileChunks: Buffer[] = [];

  private effects: {
    [imageEffect in ImageEffectTypes]?: boolean;
  } = {};
  babylonScene: any;

  constructor(
    private imageId: string,
    filename: string,
    imageURL: string,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private getImage: (key: string) => void,
    private addMessageListener: (
      listener: (
        message: IncomingTableStaticContentMessages,
        event: MessageEvent
      ) => void
    ) => void,
    private removeMessageListener: (
      listener: (
        message: IncomingTableStaticContentMessages,
        event: MessageEvent
      ) => void
    ) => void
  ) {
    this.filename = filename;
    this.imageURL = imageURL;

    this.userStreamEffects.current.image[this.imageId] = structuredClone(
      defaultImageStreamEffects
    );

    if (!this.userEffectsStyles.current.image[this.imageId]) {
      this.userEffectsStyles.current.image[this.imageId] = structuredClone(
        defaultImageEffectsStyles
      );
    }

    this.image = document.createElement("img") as HTMLImageElement;
    this.image.style.width = "100%";
    this.image.style.height = "auto";
    this.image.style.objectFit = "cover";
    this.image.style.backgroundColor = "#000";

    this.getImage(this.filename);
    this.addMessageListener(this.getImageListener);
  }

  deconstructor() {
    this.image.src = "";
  }

  getImageListener = (
    message: IncomingTableStaticContentMessages,
    event: MessageEvent
  ) => {
    if (message.type === "imageDownloadComplete") {
      if (message.type === "imageDownloadComplete") {
        const mergedBuffer = Buffer.concat(this.fileChunks);
        const blob = new Blob([new Uint8Array(mergedBuffer)], {
          type: "image/png",
        });

        const url = URL.createObjectURL(blob);
        this.image.src = url;

        this.removeMessageListener(this.getImageListener);
      }
    } else if (message.type === "chunk") {
      const chunkData = Buffer.from(message.data.chunk.data);
      this.fileChunks.push(chunkData);
    }
  };
}

export default ImageMedia;
