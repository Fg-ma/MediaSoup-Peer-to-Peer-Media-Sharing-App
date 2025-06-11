import { VideoOptions } from "./typeConstant";
import {
  IncomingTableStaticContentMessages,
  onRespondedCatchUpEffectsType,
  onUpdatedContentEffectsType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../../universal/effectsTypeConstant";
import TableVideoMediaInstance, {
  VideoInstanceListenerTypes,
} from "../TableVideoMediaInstance";
import { VideoListenerTypes } from "../TableVideoMedia";

class VideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
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
    private subContainerRef: React.RefObject<HTMLDivElement>,
  ) {}

  init = () => {
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.videoOptions.primaryVideoColor}`,
    );

    if (
      this.videoMediaInstance.current.videoMedia.loadingState === "downloaded"
    ) {
      this.positioning.current.scale = {
        x: this.videoMediaInstance.current.videoMedia.aspect
          ? this.positioning.current.scale.y *
            this.videoMediaInstance.current.videoMedia.aspect
          : this.positioning.current.scale.x,
        y: this.positioning.current.scale.y,
      };
      this.setRerender((prev) => !prev);
    }
  };

  private onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      !this.videoMediaInstance.current.settings.synced.value ||
      contentType !== "video" ||
      contentId !== this.videoMediaInstance.current.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    this.staticContentEffects.current.video[this.videoInstanceId].video =
      effects as {
        [effectType in VideoEffectTypes]: boolean;
      };

    const oldEffectStyle = structuredClone(
      this.staticContentEffectsStyles.current.video[this.videoInstanceId].video,
    );

    if (effectStyles !== undefined) {
      this.staticContentEffectsStyles.current.video[
        this.videoInstanceId
      ].video = effectStyles as VideoEffectStylesType;

      this.tintColor.current = (
        effectStyles as VideoEffectStylesType
      ).tint.color;
    }

    this.videoMediaInstance.current.updateAllEffects(oldEffectStyle);

    this.setRerender((prev) => !prev);
  };

  private onRespondedCatchUpEffects = (
    event: onRespondedCatchUpEffectsType,
  ) => {
    const { contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentId !== this.videoMediaInstance.current.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    if (effects)
      this.staticContentEffects.current.video[this.videoInstanceId].video =
        effects as {
          [effectType in VideoEffectTypes]: boolean;
        };
    if (effectStyles)
      this.staticContentEffectsStyles.current.video[
        this.videoInstanceId
      ].video = effectStyles as VideoEffectStylesType;

    this.videoMediaInstance.current.updateAllEffects();
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages,
  ) => {
    switch (event.type) {
      case "updatedContentEffects":
        this.onUpdatedContentEffects(event);
        break;
      case "respondedCatchUpEffects":
        this.onRespondedCatchUpEffects(event);
        break;
      default:
        break;
    }
  };

  handleVideoMessages = (event: VideoListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        setTimeout(() => {
          if (
            this.videoMediaInstance.current.meta.ended &&
            this.videoMediaInstance.current.instanceThumbnail
          ) {
            this.videoMediaInstance.current.instanceThumbnail?.remove();
            this.videoMediaInstance.current.instanceCanvas.remove();

            this.subContainerRef.current?.appendChild(
              this.videoMediaInstance.current.instanceThumbnail,
            );
          }
          this.positioning.current.scale = {
            x: this.videoMediaInstance.current.videoMedia.aspect
              ? this.positioning.current.scale.y *
                this.videoMediaInstance.current.videoMedia.aspect
              : this.positioning.current.scale.x,
            y: this.positioning.current.scale.y,
          };
          this.setRerender((prev) => !prev);
        }, 0);
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  handleVideoInstanceMessages = (event: VideoInstanceListenerTypes) => {
    switch (event.type) {
      case "settingsChanged":
        this.setRerender((prev) => !prev);
        break;
      case "metaChanged":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default VideoController;
