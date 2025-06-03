import { VideoOptions } from "./typeConstant";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
  onUpdatedVideoPositionType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../../universal/effectsTypeConstant";
import LowerVideoController from "./lowerVideoControls/LowerVideoController";
import TableVideoMediaInstance, {
  VideoInstanceListenerTypes,
} from "../TableVideoMediaInstance";
import { VideoListenerTypes } from "../TableVideoMedia";

class VideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: TableVideoMediaInstance,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
    private paused: React.MutableRefObject<boolean>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private lowerVideoController: React.MutableRefObject<LowerVideoController>,
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
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  init = () => {
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.videoOptions.primaryVideoColor}`,
    );
  };

  private onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType === "video" &&
      contentId === this.videoMediaInstance.videoMedia.videoId &&
      instanceId === this.videoInstanceId
    ) {
      this.staticContentEffects.current.video[this.videoInstanceId].video =
        effects as {
          [effectType in VideoEffectTypes]: boolean;
        };

      const oldEffectStyle = structuredClone(
        this.staticContentEffectsStyles.current.video[this.videoInstanceId]
          .video,
      );

      if (effectStyles !== undefined) {
        this.staticContentEffectsStyles.current.video[
          this.videoInstanceId
        ].video = effectStyles as VideoEffectStylesType;

        this.tintColor.current = (
          effectStyles as VideoEffectStylesType
        ).tint.color;
      }

      this.videoMediaInstance.updateAllEffects(oldEffectStyle);

      if (
        this.staticContentEffects.current.video[this.videoInstanceId].video
          .pause
      ) {
        this.paused.current = true;
        if (
          this.videoMediaInstance.instanceVideo &&
          !this.videoMediaInstance.instanceVideo.paused
        ) {
          this.videoMediaInstance.instanceVideo.pause();
        }

        this.setPausedState(true);
      } else {
        this.paused.current = false;
        if (
          this.videoMediaInstance.instanceVideo &&
          this.videoMediaInstance.instanceVideo.paused
        ) {
          this.videoMediaInstance.instanceVideo.play();
        }

        this.setPausedState(false);
      }

      this.setRerender((prev) => !prev);
    }
  };

  private onUpdateVideoPosition = (event: onUpdatedVideoPositionType) => {
    const { contentType, contentId, instanceId } = event.header;

    if (
      contentType === "video" &&
      contentId === this.videoMediaInstance.videoMedia.videoId &&
      instanceId === this.videoInstanceId
    ) {
      this.videoMediaInstance.updateVideoPosition(event.data.videoPosition);

      this.lowerVideoController.current.timeUpdate();
    }
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages,
  ) => {
    switch (event.type) {
      case "updatedContentEffects":
        this.onUpdatedContentEffects(event);
        break;
      case "updatedVideoPosition":
        this.onUpdateVideoPosition(event);
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    if (this.videoMediaInstance.instanceCanvas) {
      const allCanvas =
        this.subContainerRef.current?.querySelectorAll("canvas");

      if (allCanvas) {
        allCanvas.forEach((canvasElement) => {
          canvasElement.remove();
        });
      }

      this.subContainerRef.current?.appendChild(
        this.videoMediaInstance.instanceCanvas,
      );

      this.positioning.current.scale = {
        x: this.videoMediaInstance.videoMedia.aspect
          ? this.positioning.current.scale.y *
            this.videoMediaInstance.videoMedia.aspect
          : this.positioning.current.scale.x,
        y: this.positioning.current.scale.y,
      };

      // Keep video time
      this.lowerVideoController.current.timeUpdate();
      this.videoMediaInstance.instanceVideo?.addEventListener(
        "timeupdate",
        this.lowerVideoController.current.timeUpdate,
      );

      this.videoMediaInstance.instanceVideo?.addEventListener(
        "enterpictureinpicture",
        () => this.lowerVideoController.current.handlePictureInPicture("enter"),
      );

      this.videoMediaInstance.instanceVideo?.addEventListener(
        "leavepictureinpicture",
        () => this.lowerVideoController.current.handlePictureInPicture("leave"),
      );

      this.setRerender((prev) => !prev);
    }
  };

  handleVideoMessages = (event: VideoListenerTypes) => {
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

  handleVideoInstanceMessages = (event: VideoInstanceListenerTypes) => {
    switch (event.type) {
      case "settingsChanged":
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
