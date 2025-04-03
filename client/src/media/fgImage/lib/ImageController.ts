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
import ImageMedia from "../ImageMedia";

class ImageController {
  constructor(
    private imageId: string,
    private imageMedia: ImageMedia,
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
    const { contentType, contentId } = event.header;
    const { effects, effectStyles } = event.data;

    if (contentType === "image" && contentId === this.imageId) {
      this.userEffects.current.image[this.imageId] = effects as {
        [effectType in ImageEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.image[this.imageId]
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.image[this.imageId] =
          effectStyles as ImageEffectStylesType;

        this.tintColor.current = (
          effectStyles as ImageEffectStylesType
        ).tint.color;
      }

      this.imageMedia.updateAllEffects(oldEffectStyle);

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
