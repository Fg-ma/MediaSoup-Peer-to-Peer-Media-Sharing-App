import { VideoOptions } from "./typeConstant";
import VideoMedia from "../VideoMedia";
import {
  IncomingTableStaticContentMessages,
  onUpdatedContentEffectsType,
  onUpdatedVideoPositionType,
} from "../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import {
  UserEffectsStylesType,
  UserEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../../universal/effectsTypeConstant";
import LowerVideoController from "./lowerVideoControls/LowerVideoController";

class VideoController {
  constructor(
    private videoId: string,
    private videoMedia: VideoMedia,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private videoOptions: VideoOptions,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private tintColor: React.MutableRefObject<string>,
    private paused: React.MutableRefObject<boolean>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private lowerVideoController: LowerVideoController
  ) {}

  init = () => {
    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${this.videoOptions.primaryVideoColor}`
    );
  };

  scaleCallback = () => {
    if (!this.subContainerRef.current) return;

    // Calculate the aspect ratio of the video
    const videoAspectRatio =
      this.videoMedia.video.videoWidth / this.videoMedia.video.videoHeight;

    // Get the size of the container
    const containerBox = this.subContainerRef.current.getBoundingClientRect();
    const containerWidth = containerBox.width;
    const containerHeight = containerBox.height;

    // Calculate the container's aspect ratio
    const containerAspectRatio = containerWidth / containerHeight;

    // Apply scaling based on the smaller dimension to prevent overflow
    if (containerAspectRatio > videoAspectRatio) {
      // Container is wider than the video aspect ratio
      this.videoMedia.video.style.width = "auto";
      this.videoMedia.video.style.height = "100%";
      if (this.videoMedia.hiddenVideo) {
        this.videoMedia.hiddenVideo.style.width = "auto";
        this.videoMedia.hiddenVideo.style.height = "100%";
      }
    } else {
      // Container is taller than the video aspect ratio
      this.videoMedia.video.style.width = "100%";
      this.videoMedia.video.style.height = "auto";
      if (this.videoMedia.hiddenVideo) {
        this.videoMedia.hiddenVideo.style.width = "100%";
        this.videoMedia.hiddenVideo.style.height = "auto";
      }
    }
  };

  onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId } = event.header;
    const { effects, effectStyles } = event.data;

    if (contentType === "video" && contentId === this.videoId) {
      this.userEffects.current.video[this.videoId].video = effects as {
        [effectType in VideoEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.video[this.videoId].video
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.video[this.videoId].video =
          effectStyles as VideoEffectStylesType;

        this.tintColor.current = (
          effectStyles as VideoEffectStylesType
        ).tint.color;
      }

      this.videoMedia.updateAllEffects(oldEffectStyle);

      if (this.userEffects.current.video[this.videoId].video.pause) {
        this.paused.current = true;
        if (!this.videoMedia.video.paused) {
          this.videoMedia.video.pause();
        }

        this.setPausedState(true);
      } else {
        this.paused.current = false;
        if (this.videoMedia.video.paused) {
          this.videoMedia.video.play();
        }

        this.setPausedState(false);
      }
    }
  };

  onUpdateVideoPosition = (event: onUpdatedVideoPositionType) => {
    const { contentType, contentId } = event.header;

    if (contentType === "video" && contentId === this.videoId) {
      this.videoMedia.updateVideoPosition(event.data.videoPosition);

      this.lowerVideoController.timeUpdate();
    }
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages
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
}

export default VideoController;
