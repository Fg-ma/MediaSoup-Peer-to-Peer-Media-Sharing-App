import {
  ImageEffectStylesType,
  ImageEffectTypes,
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
} from "../../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { ImageListenerTypes } from "../TableImageMedia";
import TableImageMediaInstance from "../TableImageMediaInstance";

class ImageController {
  constructor(
    private imageInstanceId: string,
    private imageMediaInstance: TableImageMediaInstance,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  private onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType === "image" &&
      contentId === this.imageMediaInstance.imageMedia.imageId &&
      instanceId === this.imageInstanceId
    ) {
      this.staticContentEffects.current.image[this.imageInstanceId] =
        effects as {
          [effectType in ImageEffectTypes]: boolean;
        };

      const oldEffectStyle = structuredClone(
        this.staticContentEffectsStyles.current.image[this.imageInstanceId],
      );

      if (effectStyles !== undefined) {
        this.staticContentEffectsStyles.current.image[this.imageInstanceId] =
          effectStyles as ImageEffectStylesType;

        this.tintColor.current = (
          effectStyles as ImageEffectStylesType
        ).tint.color;
      }

      this.imageMediaInstance.updateAllEffects(oldEffectStyle);

      this.setRerender((prev) => !prev);
    }
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages,
  ) => {
    switch (event.type) {
      case "updatedContentEffects":
        this.onUpdatedContentEffects(event);
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    if (!this.imageMediaInstance.instanceCanvas) {
      return;
    }

    const allCanvas = this.subContainerRef.current?.querySelectorAll("canvas");

    if (allCanvas) {
      allCanvas.forEach((canvasElement) => {
        canvasElement.remove();
      });
    }

    this.subContainerRef.current?.appendChild(
      this.imageMediaInstance.instanceCanvas,
    );

    this.positioning.current.scale = {
      x: this.imageMediaInstance.imageMedia.aspect
        ? this.positioning.current.scale.y *
          this.imageMediaInstance.imageMedia.aspect
        : this.positioning.current.scale.x,
      y: this.positioning.current.scale.y,
    };

    this.setRerender((prev) => !prev);
  };

  handleImageMessages = (event: ImageListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      case "downloadFailed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadPaused":
        this.setRerender((prev) => !prev);
        break;
      case "downloadResumed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadRetry":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default ImageController;
