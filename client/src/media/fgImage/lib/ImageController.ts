import { ImageOptions } from "./typeConstant";

class ImageController {
  constructor(
    private imageContainerRef: React.RefObject<HTMLDivElement>,
    private imageOptions: ImageOptions,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.imageContainerRef.current?.style.setProperty(
      "--primary-image-color",
      `${this.imageOptions.primaryImageColor}`
    );
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default ImageController;
