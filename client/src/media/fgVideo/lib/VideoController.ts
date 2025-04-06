import { VideoOptions } from "./typeConstant";
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
import VideoMediaInstance from "../VideoMediaInstance";

class VideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: VideoMediaInstance,
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

  onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    if (
      contentType === "video" &&
      contentId === this.videoMediaInstance.videoMedia.videoId &&
      instanceId === this.videoInstanceId
    ) {
      this.userEffects.current.video[this.videoInstanceId].video = effects as {
        [effectType in VideoEffectTypes]: boolean;
      };

      const oldEffectStyle = structuredClone(
        this.userEffectsStyles.current.video[this.videoInstanceId].video
      );

      if (effectStyles !== undefined) {
        this.userEffectsStyles.current.video[this.videoInstanceId].video =
          effectStyles as VideoEffectStylesType;

        this.tintColor.current = (
          effectStyles as VideoEffectStylesType
        ).tint.color;
      }

      this.videoMediaInstance.updateAllEffects(oldEffectStyle);

      if (this.userEffects.current.video[this.videoInstanceId].video.pause) {
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
    }
  };

  onUpdateVideoPosition = (event: onUpdatedVideoPositionType) => {
    const { contentType, contentId, instanceId } = event.header;

    if (
      contentType === "video" &&
      contentId === this.videoMediaInstance.videoMedia.videoId &&
      instanceId === this.videoInstanceId
    ) {
      this.videoMediaInstance.updateVideoPosition(event.data.videoPosition);

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
