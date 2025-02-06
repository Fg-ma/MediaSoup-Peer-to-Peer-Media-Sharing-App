import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultImageStreamEffects,
  defaultImageEffectsStyles,
  ImageEffectTypes,
} from "../context/effectsContext/typeConstant";

class ImageMedia {
  image: HTMLImageElement;

  imageURL: string;

  filename: string;

  private effects: {
    [imageEffect in ImageEffectTypes]?: boolean;
  } = {};

  constructor(
    private imageId: string,
    filename: string,
    imageURL: string,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>
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

    this.image = document.createElement("image") as HTMLImageElement;
    this.image.style.width = "100%";
    this.image.style.objectFit = "cover";
    this.image.style.backgroundColor = "#000";
    this.image.src = this.imageURL;
  }

  deconstructor() {
    this.image.src = "";
  }
}

export default ImageMedia;
