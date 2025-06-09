import { Events as HlsEvents } from "hls.js";
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
import LowerVideoController from "./lowerVideoControls/LowerVideoController";
import TableVideoMediaInstance, {
  VideoInstanceListenerTypes,
} from "../TableVideoMediaInstance";
import { VideoListenerTypes } from "../TableVideoMedia";
import {
  IncomingVideoMessages,
  onRespondedCatchUpVideoMetadataType,
  onUpdatedVideoMetadataType,
} from "../../../serverControllers/videoServer/lib/typeConstant";

class VideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: TableVideoMediaInstance,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
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
      !this.videoMediaInstance.settings.synced.value ||
      contentType !== "video" ||
      contentId !== this.videoMediaInstance.videoMedia.videoId ||
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

    this.videoMediaInstance.updateAllEffects(oldEffectStyle);

    this.setRerender((prev) => !prev);
  };

  private onRespondedCatchUpEffects = (
    event: onRespondedCatchUpEffectsType,
  ) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType !== "video" ||
      contentId !== this.videoMediaInstance.videoMedia.videoId ||
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

    this.videoMediaInstance.updateAllEffects();
  };

  private onUpdateVideoPosition = (event: onUpdatedVideoMetadataType) => {
    const { contentId, instanceId } = event.header;

    if (
      !this.videoMediaInstance.settings.synced.value ||
      contentId !== this.videoMediaInstance.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    const { isPlaying, lastKnownPosition, videoPlaybackSpeed, lastUpdatedAt } =
      event.data;

    if (this.videoMediaInstance.instanceVideo) {
      this.videoMediaInstance.instanceVideo.currentTime =
        (isPlaying
          ? ((Date.now() - lastUpdatedAt) / 1000) * videoPlaybackSpeed
          : 0) + lastKnownPosition;

      this.videoMediaInstance.instanceVideo.playbackRate = videoPlaybackSpeed;

      if (isPlaying && this.videoMediaInstance.instanceVideo.paused) {
        this.videoMediaInstance.instanceVideo.play();
      } else if (!isPlaying && !this.videoMediaInstance.instanceVideo.paused) {
        this.videoMediaInstance.instanceVideo.pause();
      }
    }

    this.videoMediaInstance.settings.isPlaying.value = isPlaying;

    this.lowerVideoController.current.timeUpdate();

    this.setRerender((prev) => !prev);
  };

  private onRespondedCatchUpVideoMetadata = (
    event: onRespondedCatchUpVideoMetadataType,
  ) => {
    const { contentId, instanceId } = event.header;

    if (
      !this.videoMediaInstance.settings.synced.value ||
      contentId !== this.videoMediaInstance.videoMedia.videoId ||
      instanceId !== this.videoInstanceId
    )
      return;

    const { isPlaying, lastKnownPosition, videoPlaybackSpeed, lastUpdatedAt } =
      event.data;

    if (this.videoMediaInstance.instanceVideo) {
      this.videoMediaInstance.instanceVideo.currentTime =
        (isPlaying
          ? ((Date.now() - lastUpdatedAt) / 1000) * videoPlaybackSpeed
          : 0) + lastKnownPosition;

      this.videoMediaInstance.instanceVideo.playbackRate = videoPlaybackSpeed;

      if (isPlaying && this.videoMediaInstance.instanceVideo.paused) {
        this.videoMediaInstance.instanceVideo.play();
      } else if (!isPlaying && !this.videoMediaInstance.instanceVideo.paused) {
        this.videoMediaInstance.instanceVideo.pause();
      }
    }

    this.videoMediaInstance.settings.isPlaying.value = isPlaying;

    this.lowerVideoController.current.timeUpdate();

    this.setRerender((prev) => !prev);
  };

  handleVideoSocketMessage = (event: IncomingVideoMessages) => {
    switch (event.type) {
      case "updatedVideoMetadata":
        this.onUpdateVideoPosition(event);
        break;
      case "respondedCatchUpVideoMetadata":
        this.onRespondedCatchUpVideoMetadata(event);
        break;
      default:
        break;
    }
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

  private onDownloadComplete = () => {
    if (
      this.videoMediaInstance.instanceVideo &&
      this.videoMediaInstance.instanceCanvas
    ) {
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

      this.videoMediaInstance.hls.on(
        HlsEvents.BUFFER_APPENDED,
        this.lowerVideoController.current.bufferUpdate,
      );

      // Keep video time
      this.lowerVideoController.current.timeUpdate();
      this.videoMediaInstance.instanceVideo.addEventListener(
        "timeupdate",
        this.lowerVideoController.current.timeUpdate,
      );

      this.videoMediaInstance.instanceVideo.addEventListener(
        "enterpictureinpicture",
        () => this.lowerVideoController.current.handlePictureInPicture("enter"),
      );

      this.videoMediaInstance.instanceVideo.addEventListener(
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
