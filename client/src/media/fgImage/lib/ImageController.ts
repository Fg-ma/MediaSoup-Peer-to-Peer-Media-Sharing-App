import {
  ImageEffectStylesType,
  ImageEffectTypes,
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import ImageMediaInstance from "../ImageMediaInstance";

class ImageController {
  constructor(
    private imageInstanceId: string,
    private imageMediaInstance: ImageMediaInstance,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType === "image" &&
      contentId === this.imageMediaInstance.imageMedia.imageId &&
      instanceId === this.imageInstanceId
    ) {
      this.userEffects.current.image[this.imageInstanceId] = effects as {
        [effectType in ImageEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.image[this.imageInstanceId]
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.image[this.imageInstanceId] =
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
    event: IncomingTableStaticContentMessages
  ) => {
    switch (event.type) {
      case "updatedContentEffects":
        this.onUpdatedContentEffects(event);
        break;
      default:
        break;
    }
  };
}

export default ImageController;
