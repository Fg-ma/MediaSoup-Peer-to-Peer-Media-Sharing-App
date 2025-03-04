import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  VideoEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import {
  characterEdgeStyleMap,
  colorMap,
  downloadRecordingMimeMap,
  fontFamilyMap,
  fontSizeMap,
  opacityMap,
  Settings,
} from "../typeConstant";
import VideoMedia from "../../VideoMedia";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";

class LowerVideoController {
  constructor(
    private videoId: string,
    private videoMedia: VideoMedia,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private paused: React.MutableRefObject<boolean>,
    private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private currentTimeRef: React.RefObject<HTMLDivElement>,
    private setVideoEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setAudioEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private initTimeOffset: React.MutableRefObject<number>,
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
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>
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
      this.controlPressed.current ||
      this.shiftPressed.current
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = true;
        break;
      case "control":
        this.controlPressed.current = true;
        break;
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

  handleKeyUp = (event: KeyboardEvent) => {
    if (!event.key) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = false;
        break;
      case "control":
        this.controlPressed.current = false;
        break;
    }
  };

  handleMiniPlayer = () => {
    if (this.videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture().catch((error) => {
        console.error("Failed to exit picture in picture:", error);
      });
    } else {
      this.videoMedia.video.requestPictureInPicture().catch((error) => {
        console.error("Failed to request picture in picture:", error);
      });
    }
  };

  handlePausePlay = () => {
    this.handleVideoEffect("pause", false);

    this.paused.current = !this.paused.current;
    if (this.paused.current) {
      this.videoMedia.video.pause();
    } else {
      this.videoMedia.video.play();
    }

    this.setPausedState((prev) => !prev);
  };

  handlePictureInPicture = (action: string) => {
    if (action === "enter") {
      this.videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.videoContainerRef.current?.classList.remove("mini-player");
    }
  };

  timeUpdate = () => {
    if (this.currentTimeRef.current) {
      const currentTime =
        this.videoMedia.video.currentTime + this.initTimeOffset.current / 1000;
      const percent = currentTime / this.videoMedia.video.duration;

      this.currentTimeRef.current.textContent =
        this.formatDuration(currentTime);
      this.timelineContainerRef.current?.style.setProperty(
        "--progress-position",
        `${percent}`
      );
    }
  };

  updateCaptionsStyles = () => {
    if (!this.videoContainerRef.current) {
      return;
    }

    const style = this.videoContainerRef.current.style;
    const captionOptions =
      this.settings.closedCaption.closedCaptionOptionsActive;

    style.setProperty(
      "--closed-captions-font-family",
      fontFamilyMap[captionOptions.fontFamily.value]
    );
    style.setProperty(
      "--closed-captions-font-color",
      `${colorMap[captionOptions.fontColor.value]} ${
        opacityMap[captionOptions.fontOpacity.value]
      }`
    );
    style.setProperty(
      "--closed-captions-font-size",
      fontSizeMap[captionOptions.fontSize.value]
    );
    style.setProperty(
      "--closed-captions-background-color",
      captionOptions.backgroundColor.value
    );
    style.setProperty(
      "--closed-captions-background-opacity",
      opacityMap[captionOptions.backgroundOpacity.value]
    );
    style.setProperty(
      "--closed-captions-character-edge-style",
      characterEdgeStyleMap[captionOptions.characterEdgeStyle.value]
    );
  };

  handleVideoEffect = async (
    effect: VideoEffectTypes | "clearAll",
    blockStateChange: boolean
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        this.userStreamEffects.current.video[this.videoId].video[effect] =
          !this.userStreamEffects.current.video[this.videoId].video[effect];
      }

      this.tableStaticContentSocket.current?.updateContentEffects(
        "video",
        this.videoId,
        this.userStreamEffects.current.video[this.videoId].video,
        this.userEffectsStyles.current.video[this.videoId].video
      );
    } else {
      this.userMedia.current.video[this.videoId].clearAllEffects();

      this.tableStaticContentSocket.current?.updateContentEffects(
        "video",
        this.videoId,
        this.userStreamEffects.current.video[this.videoId].video,
        this.userEffectsStyles.current.video[this.videoId].video
      );
    }
  };

  setInitTimeOffset = (offset: number) => {
    this.initTimeOffset.current = offset;
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.videoMedia.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.videoMedia.downloadVideo();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.videoMedia.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.settings.downloadType.downloadTypeOptions.mimeType.value
          ],
          parseInt(
            this.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4
            )
          )
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.videoMedia.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.videoMedia.babylonScene?.downloadRecording();
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
      this.handleScrubbingTimelineUpdate
    );
    document.addEventListener("pointerup", this.handleStopScrubbing);

    this.isScrubbing.current = true;
    if (this.isScrubbing.current) {
      this.videoContainerRef.current?.classList.add("scrubbing");
      this.wasPaused.current = this.videoMedia.video.paused;
      this.videoMedia.video.pause();
    }

    this.handleScrubbingTimelineUpdate(event as unknown as PointerEvent);
  };

  handleStopScrubbing = (event: PointerEvent) => {
    if (!this.timelineContainerRef.current || !this.currentTimeRef.current)
      return;

    document.removeEventListener(
      "pointermove",
      this.handleScrubbingTimelineUpdate
    );
    document.removeEventListener("pointerup", this.handleStopScrubbing);

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.clientX - rect.x), rect.width) / rect.width;

    this.isScrubbing.current = false;

    this.videoContainerRef.current?.classList.remove("scrubbing");
    this.videoMedia.video.currentTime =
      percent * this.videoMedia.video.duration;

    if (!this.wasPaused.current) {
      this.videoMedia.video.play();
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
      `${percent}`
    );

    if (this.isScrubbing.current && this.currentTimeRef.current) {
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
      );

      this.currentTimeRef.current.textContent = this.formatDuration(
        percent * this.videoMedia.video.duration
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
      `${percent}`
    );
  };

  handlePlaybackSpeed = (playbackRate: number) => {
    this.videoMedia.video.playbackRate = playbackRate;
  };

  handleSetAsBackground = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      if (newSettings.background.value === "true") {
        newSettings.background.value = "false";
      } else {
        newSettings.background.value = "true";
      }

      return newSettings;
    });
  };
}

export default LowerVideoController;
