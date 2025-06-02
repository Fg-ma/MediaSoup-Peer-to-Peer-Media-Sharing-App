import {
  StaticContentEffectsStylesType,
  StaticContentEffectsType,
  VideoEffectTypes,
} from "../../../../../../universal/effectsTypeConstant";
import {
  characterEdgeStyleMap,
  colorMap,
  downloadRecordingMimeMap,
  fontFamilyMap,
  fontSizeMap,
  opacityMap,
  Settings,
} from "../typeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableVideoMediaInstance from "../../TableVideoMediaInstance";

class LowerVideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: TableVideoMediaInstance,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private paused: React.MutableRefObject<boolean>,
    private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private currentTimeRef: React.RefObject<HTMLDivElement>,
    private setVideoEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setAudioEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private timelineContainerRef: React.RefObject<HTMLDivElement>,
    private isScrubbing: React.MutableRefObject<boolean>,
    private wasPaused: React.MutableRefObject<boolean>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
  ) {}

  formatDuration = (time: number) => {
    // No need to divide by 1000; assume `time` is already in seconds
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((time / 60) % 60)
      .toString()
      .padStart(2, "0");
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${seconds}`;
    } else {
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  handleClosedCaptions = () => {
    if (this.videoContainerRef.current) {
      this.videoContainerRef.current.classList.toggle("captions");
      this.setCaptionsActive((prev) => !prev);
    }
  };

  handleVideoEffects = () => {
    this.setVideoEffectsActive((prev) => !prev);
  };

  handleAudioEffects = () => {
    this.setAudioEffectsActive((prev) => !prev);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.videoContainerRef.current?.classList.contains("in-media") ||
      this.videoContainerRef.current?.classList.contains("in-piano") ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
        this.handlePausePlay();
        break;
      case "mediaplaypause":
        this.handlePausePlay();
        break;
      case "k":
        this.handlePausePlay();
        break;
      case "i":
        this.handleMiniPlayer();
        break;
      case "m":
        break;
      case "c":
        this.handleClosedCaptions();
        break;
      case "e":
        this.handleVideoEffects();
        break;
      case "a":
        this.handleAudioEffects();
        break;
      case "arrowup":
        this.volumeControl(0.05);
        break;
      case "arrowdown":
        this.volumeControl(-0.05);
        break;
      case "arrowleft":
        this.skipInVideo(-5);
        break;
      case "arrowright":
        this.skipInVideo(5);
        break;
      case "d":
        this.handleDownload();
        break;
      case "u":
        this.handleSettings();
        break;
      case "h":
        this.handleDownloadRecording();
        break;
      case "b":
        this.handleSetAsBackground();
        break;
      default:
        break;
    }
  };

  volumeControl = (volumeChangeAmount: number) => {};

  handleMiniPlayer = () => {
    if (this.videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture().catch((error) => {
        console.error("Failed to exit picture in picture:", error);
      });
    } else {
      this.videoMediaInstance.instanceVideo
        ?.requestPictureInPicture()
        .catch((error) => {
          console.error("Failed to request picture in picture:", error);
        });
    }
  };

  skipInVideo = (amount: number) => {
    if (!this.videoMediaInstance.instanceVideo) return;

    this.videoMediaInstance.instanceVideo.currentTime = Math.max(
      0,
      Math.min(
        this.videoMediaInstance.instanceVideo.currentTime + amount,
        this.videoMediaInstance.instanceVideo.duration,
      ),
    );

    this.tableStaticContentSocket.current?.updateVideoPosition(
      "video",
      this.videoMediaInstance.videoMedia.videoId,
      this.videoInstanceId,
      this.videoMediaInstance.instanceVideo.currentTime,
    );
  };

  handlePausePlay = () => {
    this.handleVideoEffect("pause", false);

    this.paused.current = !this.paused.current;

    if (!this.videoMediaInstance.instanceVideo) return;

    if (this.paused.current) {
      this.videoMediaInstance.instanceVideo.pause();
    } else {
      this.videoMediaInstance.instanceVideo.play();
    }

    this.setPausedState((prev) => !prev);

    this.tableStaticContentSocket.current?.updateVideoPosition(
      "video",
      this.videoMediaInstance.videoMedia.videoId,
      this.videoInstanceId,
      this.videoMediaInstance.instanceVideo.currentTime,
    );
  };

  handlePictureInPicture = (action: string) => {
    if (action === "enter") {
      this.videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.videoContainerRef.current?.classList.remove("mini-player");
    }
  };

  timeUpdate = () => {
    if (this.currentTimeRef.current && this.videoMediaInstance.instanceVideo) {
      const currentTime = this.videoMediaInstance.instanceVideo.currentTime;
      const percent =
        currentTime / this.videoMediaInstance.instanceVideo.duration;

      this.currentTimeRef.current.textContent =
        this.formatDuration(currentTime);
      this.timelineContainerRef.current?.style.setProperty(
        "--progress-position",
        `${percent}`,
      );
    }
  };

  updateCaptionsStyles = () => {
    if (!this.videoContainerRef.current) {
      return;
    }

    const style = this.videoContainerRef.current.style;
    const captionOptions =
      this.videoMediaInstance.settings.closedCaption.closedCaptionOptionsActive;

    style.setProperty(
      "--closed-captions-font-family",
      fontFamilyMap[captionOptions.fontFamily.value],
    );
    style.setProperty(
      "--closed-captions-font-color",
      `${colorMap[captionOptions.fontColor.value]} ${
        opacityMap[captionOptions.fontOpacity.value]
      }`,
    );
    style.setProperty(
      "--closed-captions-font-size",
      fontSizeMap[captionOptions.fontSize.value],
    );
    style.setProperty(
      "--closed-captions-background-color",
      captionOptions.backgroundColor.value,
    );
    style.setProperty(
      "--closed-captions-background-opacity",
      opacityMap[captionOptions.backgroundOpacity.value],
    );
    style.setProperty(
      "--closed-captions-character-edge-style",
      characterEdgeStyleMap[captionOptions.characterEdgeStyle.value],
    );
  };

  handleVideoEffect = async (
    effect: VideoEffectTypes | "clearAll",
    blockStateChange: boolean,
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        this.staticContentEffects.current.video[this.videoInstanceId].video[
          effect
        ] =
          !this.staticContentEffects.current.video[this.videoInstanceId].video[
            effect
          ];
      }

      this.videoMediaInstance.changeEffects(
        effect,
        this.tintColor.current,
        blockStateChange,
      );

      this.tableStaticContentSocket.current?.updateContentEffects(
        "video",
        this.videoMediaInstance.videoMedia.videoId,
        this.videoInstanceId,
        this.staticContentEffects.current.video[this.videoInstanceId].video,
        this.staticContentEffectsStyles.current.video[this.videoInstanceId]
          .video,
      );
    } else {
      this.videoMediaInstance.clearAllEffects();

      this.tableStaticContentSocket.current?.updateContentEffects(
        "video",
        this.videoMediaInstance.videoMedia.videoId,
        this.videoInstanceId,
        this.staticContentEffects.current.video[this.videoInstanceId].video,
        this.staticContentEffectsStyles.current.video[this.videoInstanceId]
          .video,
      );
    }
  };

  handleDownload = () => {
    if (this.videoMediaInstance.settings.downloadType.value === "snapShot") {
      this.videoMediaInstance.babylonScene?.downloadSnapShot();
    } else if (
      this.videoMediaInstance.settings.downloadType.value === "original"
    ) {
      this.videoMediaInstance.videoMedia.downloadVideo();
    } else if (
      this.videoMediaInstance.settings.downloadType.value === "record"
    ) {
      if (!this.recording.current) {
        this.videoMediaInstance.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.videoMediaInstance.settings.downloadType.downloadTypeOptions
              .mimeType.value
          ],
          parseInt(
            this.videoMediaInstance.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4,
            ),
          ),
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.videoMediaInstance.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.videoMediaInstance.babylonScene?.downloadRecording();
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };

  handleStartScrubbing = (event: React.PointerEvent) => {
    if (
      !this.timelineContainerRef.current ||
      !this.currentTimeRef.current ||
      this.isScrubbing.current
    )
      return;

    document.addEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.addEventListener("pointerup", this.handleStopScrubbing);

    this.isScrubbing.current = true;
    if (this.isScrubbing.current) {
      this.videoContainerRef.current?.classList.add("scrubbing");
      if (this.videoMediaInstance.instanceVideo) {
        this.wasPaused.current = this.videoMediaInstance.instanceVideo.paused;
        this.videoMediaInstance.instanceVideo.pause();
      }
    }

    this.handleScrubbingTimelineUpdate(event as unknown as PointerEvent);
  };

  handleStopScrubbing = (event: PointerEvent) => {
    if (!this.timelineContainerRef.current || !this.currentTimeRef.current)
      return;

    document.removeEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.removeEventListener("pointerup", this.handleStopScrubbing);

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;

    this.isScrubbing.current = false;

    this.videoContainerRef.current?.classList.remove("scrubbing");
    if (this.videoMediaInstance.instanceVideo) {
      this.videoMediaInstance.instanceVideo.currentTime =
        percent * this.videoMediaInstance.instanceVideo.duration;
    }

    if (this.videoMediaInstance.instanceVideo) {
      this.tableStaticContentSocket.current?.updateVideoPosition(
        "video",
        this.videoMediaInstance.videoMedia.videoId,
        this.videoInstanceId,
        this.videoMediaInstance.instanceVideo.currentTime,
      );

      if (!this.wasPaused.current) {
        this.videoMediaInstance.instanceVideo.play();
      }
    }

    this.handleScrubbingTimelineUpdate(event);
  };

  handleScrubbingTimelineUpdate = (event: PointerEvent) => {
    if (!this.timelineContainerRef.current) return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;
    this.timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`,
    );

    if (this.isScrubbing.current) {
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`,
      );

      if (this.videoMediaInstance.instanceVideo && this.currentTimeRef.current)
        this.currentTimeRef.current.textContent = this.formatDuration(
          percent * this.videoMediaInstance.instanceVideo.duration,
        );
    }
  };

  handleHoverTimelineUpdate = (event: React.PointerEvent) => {
    if (!this.timelineContainerRef.current) return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;
    this.timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`,
    );
  };

  handlePlaybackSpeed = (playbackRate: number) => {
    if (this.videoMediaInstance.instanceVideo)
      this.videoMediaInstance.instanceVideo.playbackRate = playbackRate;
  };

  handleSetAsBackground = () => {
    this.videoMediaInstance.settings.background.value =
      !this.videoMediaInstance.settings.background.value;

    this.setRerender((prev) => !prev);
  };
}

export default LowerVideoController;
