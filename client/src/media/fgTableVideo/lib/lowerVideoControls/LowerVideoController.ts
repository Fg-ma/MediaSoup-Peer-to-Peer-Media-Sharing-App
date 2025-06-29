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
} from "../typeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableVideoMediaInstance from "../../TableVideoMediaInstance";
import { GroupSignals } from "../../../../context/signalContext/lib/typeConstant";
import VideoSocketController from "../../../../serverControllers/videoServer/VideoSocketController";

class LowerVideoController {
  constructor(
    private videoInstanceId: string,
    private videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
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
    private videoSocket: React.MutableRefObject<
      VideoSocketController | undefined
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
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
      case "j":
        this.handleDownloadRecording();
        break;
      case "h":
        this.handleSync();
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
      this.videoMediaInstance.current.instanceVideo
        ?.requestPictureInPicture()
        .catch((error) => {
          console.error("Failed to request picture in picture:", error);
        });
    }
  };

  skipInVideo = (amount: number) => {
    if (this.videoMediaInstance.current.instanceVideo) {
      this.videoMediaInstance.current.instanceVideo.currentTime = Math.max(
        0,
        Math.min(
          this.videoMediaInstance.current.instanceVideo.currentTime + amount,
          this.videoMediaInstance.current.instanceVideo.duration,
        ),
      );
    }

    if (this.videoMediaInstance.current.settings.synced.value) {
      this.videoSocket.current?.updateVideoMetadata(
        this.videoMediaInstance.current.videoMedia.videoId,
        this.videoInstanceId,
        this.videoMediaInstance.current.meta.isPlaying,
        this.videoMediaInstance.current.meta.currentTime,
        this.videoMediaInstance.current.meta.videoSpeed,
        false,
      );
    }
  };

  handlePausePlay = () => {
    this.videoMediaInstance.current.meta.isPlaying =
      !this.videoMediaInstance.current.meta.isPlaying;

    if (this.videoMediaInstance.current.instanceVideo) {
      if (!this.videoMediaInstance.current.meta.isPlaying) {
        this.videoMediaInstance.current.instanceVideo.pause();
      } else {
        this.videoMediaInstance.current.instanceVideo.play();
      }
    }

    if (this.videoMediaInstance.current.settings.synced.value) {
      this.videoSocket.current?.updateVideoMetadata(
        this.videoMediaInstance.current.videoMedia.videoId,
        this.videoInstanceId,
        this.videoMediaInstance.current.meta.isPlaying,
        this.videoMediaInstance.current.meta.currentTime,
        this.videoMediaInstance.current.meta.videoSpeed,
        false,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handlePictureInPicture = (action: string) => {
    if (action === "enter") {
      this.videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.videoContainerRef.current?.classList.remove("mini-player");
    }
  };

  timeUpdate = () => {
    if (
      this.currentTimeRef.current &&
      this.videoMediaInstance.current.instanceVideo
    ) {
      this.videoMediaInstance.current.meta.currentTime =
        this.videoMediaInstance.current.instanceVideo.currentTime;

      const currentTime =
        this.videoMediaInstance.current.instanceVideo.currentTime;
      const percent =
        currentTime / this.videoMediaInstance.current.instanceVideo.duration;

      this.currentTimeRef.current.textContent =
        this.formatDuration(currentTime);
      this.timelineContainerRef.current?.style.setProperty(
        "--progress-position",
        `${percent}`,
      );

      if (
        !this.isScrubbing.current &&
        this.videoMediaInstance.current.instanceVideo.currentTime >=
          this.videoMediaInstance.current.instanceVideo.duration - 0.5 &&
        this.videoMediaInstance.current.instanceVideo
      ) {
        this.videoMediaInstance.current.instanceVideo.pause();
        this.videoMediaInstance.current.instanceVideo.currentTime = 0;
        this.videoSocket.current?.updateVideoMetadata(
          this.videoMediaInstance.current.videoMedia.videoId,
          this.videoInstanceId,
          false,
          this.videoMediaInstance.current.instanceVideo.currentTime,
          this.videoMediaInstance.current.meta.videoSpeed,
          true,
        );
      }
    }
  };

  bufferUpdate = () => {
    if (!this.videoMediaInstance.current.instanceVideo) return;

    const buffered = this.videoMediaInstance.current.instanceVideo.buffered;
    const duration = this.videoMediaInstance.current.instanceVideo.duration;

    let maxBuffered = 0;

    for (let i = 0; i < buffered.length; i++) {
      maxBuffered = Math.max(maxBuffered, buffered.end(i));
    }

    const percent = maxBuffered / duration;

    this.timelineContainerRef.current?.style.setProperty(
      "--buffered-position",
      `${percent}`,
    );
  };

  updateCaptionsStyles = () => {
    if (!this.videoContainerRef.current) {
      return;
    }

    const style = this.videoContainerRef.current.style;
    const captionOptions =
      this.videoMediaInstance.current.settings.closedCaption
        .closedCaptionOptions;

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

      this.videoMediaInstance.current.changeEffects(
        effect,
        this.tintColor.current,
        blockStateChange,
      );

      if (this.videoMediaInstance.current.settings.synced.value) {
        this.tableStaticContentSocket.current?.updateContentEffects(
          "video",
          this.videoMediaInstance.current.videoMedia.videoId,
          this.videoInstanceId,
          this.staticContentEffects.current.video[this.videoInstanceId].video,
          this.staticContentEffectsStyles.current.video[this.videoInstanceId]
            .video,
        );
      }
    } else {
      this.videoMediaInstance.current.clearAllEffects();

      if (this.videoMediaInstance.current.settings.synced.value) {
        this.tableStaticContentSocket.current?.updateContentEffects(
          "video",
          this.videoMediaInstance.current.videoMedia.videoId,
          this.videoInstanceId,
          this.staticContentEffects.current.video[this.videoInstanceId].video,
          this.staticContentEffectsStyles.current.video[this.videoInstanceId]
            .video,
        );
      }
    }
  };

  handleDownload = () => {
    if (
      this.videoMediaInstance.current.settings.downloadType.value === "snapShot"
    ) {
      this.videoMediaInstance.current.babylonScene?.downloadSnapShot();
    } else if (
      this.videoMediaInstance.current.settings.downloadType.value === "original"
    ) {
      this.videoMediaInstance.current.videoMedia.downloadVideo();
    } else if (
      this.videoMediaInstance.current.settings.downloadType.value === "record"
    ) {
      if (!this.recording.current) {
        this.videoMediaInstance.current.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.videoMediaInstance.current.settings.downloadType
              .downloadTypeOptions.mimeType.value
          ],
          parseInt(
            this.videoMediaInstance.current.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4,
            ),
          ),
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.videoMediaInstance.current.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.videoMediaInstance.current.babylonScene?.downloadRecording();
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

    event.preventDefault();
    event.stopPropagation();

    document.addEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.addEventListener("pointerup", this.handleStopScrubbing);

    this.isScrubbing.current = true;
    if (this.isScrubbing.current) {
      this.videoContainerRef.current?.classList.add("scrubbing");
      if (this.videoMediaInstance.current.instanceVideo) {
        this.wasPaused.current =
          this.videoMediaInstance.current.instanceVideo.paused;
        this.videoMediaInstance.current.instanceVideo.pause();
      }
    }

    this.handleScrubbingTimelineUpdate(event as unknown as PointerEvent);
  };

  handleStopScrubbing = (event: PointerEvent) => {
    document.removeEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate,
    );
    document.removeEventListener("pointerup", this.handleStopScrubbing);

    if (!this.timelineContainerRef.current || !this.currentTimeRef.current)
      return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;

    this.isScrubbing.current = false;

    this.videoContainerRef.current?.classList.remove("scrubbing");
    if (this.videoMediaInstance.current.instanceVideo) {
      this.videoMediaInstance.current.instanceVideo.currentTime =
        percent * this.videoMediaInstance.current.instanceVideo.duration;

      if (this.videoMediaInstance.current.settings.synced.value) {
        this.videoSocket.current?.updateVideoMetadata(
          this.videoMediaInstance.current.videoMedia.videoId,
          this.videoInstanceId,
          this.videoMediaInstance.current.meta.isPlaying,
          this.videoMediaInstance.current.instanceVideo.currentTime,
          this.videoMediaInstance.current.meta.videoSpeed,
          false,
        );
      }

      if (!this.wasPaused.current) {
        this.videoMediaInstance.current.instanceVideo.play();
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

      if (this.videoMediaInstance.current.instanceVideo) {
        if (this.currentTimeRef.current) {
          this.currentTimeRef.current.textContent = this.formatDuration(
            percent * this.videoMediaInstance.current.instanceVideo.duration,
          );
        }

        this.videoMediaInstance.current.instanceVideo.currentTime =
          percent * this.videoMediaInstance.current.instanceVideo.duration;
      }

      if (!this.videoMediaInstance.current.meta.isPlaying) {
        this.throttledForceRenderLoop(percent);
      }
    }
  };

  throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let lastCall = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  }

  throttledForceRenderLoop = this.throttle((percent: number) => {
    this.videoMediaInstance.current.babylonScene?.forceEngineRenderLoop();
  }, 150);

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
    if (this.videoMediaInstance.current.instanceVideo) {
      this.videoMediaInstance.current.instanceVideo.playbackRate = playbackRate;

      if (this.videoMediaInstance.current.settings.synced.value) {
        this.videoSocket.current?.updateVideoMetadata(
          this.videoMediaInstance.current.videoMedia.videoId,
          this.videoInstanceId,
          this.videoMediaInstance.current.meta.isPlaying,
          this.videoMediaInstance.current.instanceVideo.currentTime,
          this.videoMediaInstance.current.meta.videoSpeed,
          false,
        );
      }
    }
  };

  handleSetAsBackground = () => {
    this.videoMediaInstance.current.settings.background.value =
      !this.videoMediaInstance.current.settings.background.value;

    this.setSettingsActive(false);

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: { removeType: "video", removeId: this.videoInstanceId },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.videoMediaInstance.current.settings.synced.value =
      !this.videoMediaInstance.current.settings.synced.value;

    if (this.videoMediaInstance.current.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "video",
        this.videoMediaInstance.current.videoMedia.videoId,
        this.videoMediaInstance.current.videoInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };
}

export default LowerVideoController;
