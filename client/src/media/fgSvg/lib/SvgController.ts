import {
  SvgEffectStylesType,
  SvgEffectTypes,
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
    private svgId: string,
    private svgMedia: SvgMedia,
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

    if (contentType === "svg" && contentId === this.svgId) {
      this.userStreamEffects.current.svg[this.svgId] = effects as {
        [effectType in SvgEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.svg[this.svgId]
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.svg[this.svgId] =
          effectStyles as SvgEffectStylesType;
      }

      // this.svgMedia.updateAllEffects(oldEffectStyle);

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

export default SvgController;
