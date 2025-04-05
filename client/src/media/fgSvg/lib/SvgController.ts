import {
  SvgEffectStylesType,
  SvgEffectTypes,
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SvgMediaInstance from "../SvgMediaInstance";

class SvgController {
  constructor(
    private svgInstanceId: string,
    private svgMediaInstance: SvgMediaInstance,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType === "svg" &&
      contentId === this.svgMediaInstance.svgMedia.svgId &&
      instanceId === this.svgInstanceId
    ) {
      this.svgMediaInstance.clearAllEffects();

      this.userEffects.current.svg[this.svgInstanceId] = effects as {
        [effectType in SvgEffectTypes]: boolean;
      };

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.svg[this.svgInstanceId] =
          effectStyles as SvgEffectStylesType;
      }

      this.svgMediaInstance.updateAllEffects();

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
