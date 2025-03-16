import {
  ImageEffectStylesType,
  ImageEffectTypes,
  UserEffectsStylesType,
  UserStreamEffectsType,
} from "../../../context/effectsContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SvgMedia from "../SvgMedia";

class SvgController {
  constructor(
    private imageId: string,
    private imageMedia: ImageMedia,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId } = event.header;
    const { effects, effectStyles } = event.data;

    if (contentType === "image" && contentId === this.imageId) {
      this.userStreamEffects.current.image[this.imageId] = effects as {
        [effectType in ImageEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.image[this.imageId]
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.image[this.imageId] =
          effectStyles as ImageEffectStylesType;

        this.tintColor.current = effectStyles.tint.color;
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
