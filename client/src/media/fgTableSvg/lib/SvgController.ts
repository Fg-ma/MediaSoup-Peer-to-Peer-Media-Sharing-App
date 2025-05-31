import {
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import { SvgListenerTypes } from "../TableSvgMedia";
import TableSvgMediaInstance from "../TableSvgMediaInstance";

class SvgController {
  constructor(
    private svgInstanceId: string,
    private svgMediaInstance: TableSvgMediaInstance,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
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
      contentType === "svg" &&
      contentId === this.svgMediaInstance.svgMedia.svgId &&
      instanceId === this.svgInstanceId
    ) {
      this.svgMediaInstance.clearAllEffects();

      this.staticContentEffects.current.svg[this.svgInstanceId] = effects as {
        [effectType in SvgEffectTypes]: boolean;
      };

      if (effectStyles !== undefined) {
        this.staticContentEffectsStyles.current.svg[this.svgInstanceId] =
          effectStyles as SvgEffectStylesType;
      }

      this.svgMediaInstance.updateAllEffects();

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
    if (this.svgMediaInstance.instanceSvg) {
      const allSvgs = this.subContainerRef.current?.querySelectorAll("svg");

      if (allSvgs) {
        allSvgs.forEach((svgElement) => {
          svgElement.remove();
        });
      }

      this.subContainerRef.current?.appendChild(
        this.svgMediaInstance.instanceSvg,
      );

      this.positioning.current.scale = {
        x: this.svgMediaInstance.svgMedia.aspect
          ? this.positioning.current.scale.y *
            this.svgMediaInstance.svgMedia.aspect
          : this.positioning.current.scale.x,
        y: this.positioning.current.scale.y,
      };

      this.setRerender((prev) => !prev);
    }
  };

  handleSvgMessages = (event: SvgListenerTypes) => {
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

export default SvgController;
