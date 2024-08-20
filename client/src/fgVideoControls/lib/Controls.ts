import { Socket } from "socket.io-client";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/StreamsContext";
import { defaultFgVideoOptions, FgVideoOptions } from "../../fgVideo/FgVideo";

class Controls {
  private socket: React.MutableRefObject<Socket> | undefined;
  private videoId: string;
  private table_id: string;
  private username: string;
  private instance: string;
  private type: string;

  private fgVideoOptions: FgVideoOptions;

  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoContainerRef: React.RefObject<HTMLDivElement>;

  private shiftPressed: React.MutableRefObject<boolean>;
  private controlPressed: React.MutableRefObject<boolean>;

  private paused: React.MutableRefObject<boolean>;
  private wasPaused: React.MutableRefObject<boolean>;

  private timelineContainerRef: React.RefObject<HTMLDivElement>;
  private isScrubbing: React.MutableRefObject<boolean>;

  private totalTimeRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLDivElement>;

  private previewImgRef: React.RefObject<HTMLImageElement>;
  private thumbnails: React.MutableRefObject<string[]>;
  private thumbnailImgRef: React.RefObject<HTMLImageElement>;
  private thumbnailInterval: number;
  private thumbnailClarity: number;

  private captions: React.MutableRefObject<TextTrack | undefined>;

  private theater: React.MutableRefObject<boolean>;

  private playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;

  private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>;

  private setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;

  private handleMute: () => void;
  private handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;

  private leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  constructor(
    socket: React.MutableRefObject<Socket> | undefined,
    videoId: string,
    table_id: string,
    username: string,
    instance: string,
    type: string,

    fgVideoOptions: FgVideoOptions,

    videoRef: React.RefObject<HTMLVideoElement>,
    videoContainerRef: React.RefObject<HTMLDivElement>,

    shiftPressed: React.MutableRefObject<boolean>,
    controlPressed: React.MutableRefObject<boolean>,

    paused: React.MutableRefObject<boolean>,
    wasPaused: React.MutableRefObject<boolean>,

    timelineContainerRef: React.RefObject<HTMLDivElement>,
    isScrubbing: React.MutableRefObject<boolean>,

    totalTimeRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLDivElement>,

    previewImgRef: React.RefObject<HTMLImageElement>,
    thumbnails: React.MutableRefObject<string[]>,
    thumbnailImgRef: React.RefObject<HTMLImageElement>,
    thumbnailInterval = 10,
    thumbnailClarity = 5,

    captions: React.MutableRefObject<TextTrack | undefined>,

    theater: React.MutableRefObject<boolean>,

    playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>,

    leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>,

    setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,

    handleMute: () => void,
    handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>
  ) {
    this.socket = socket;
    this.videoId = videoId;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.type = type;

    this.fgVideoOptions = fgVideoOptions;

    this.videoRef = videoRef;
    this.videoContainerRef = videoContainerRef;

    this.shiftPressed = shiftPressed;
    this.controlPressed = controlPressed;

    this.paused = paused;
    this.wasPaused = wasPaused;

    this.timelineContainerRef = timelineContainerRef;
    this.isScrubbing = isScrubbing;

    this.totalTimeRef = totalTimeRef;
    this.currentTimeRef = currentTimeRef;

    this.previewImgRef = previewImgRef;
    this.thumbnails = thumbnails;
    this.thumbnailImgRef = thumbnailImgRef;
    this.thumbnailInterval = thumbnailInterval;
    this.thumbnailClarity = thumbnailClarity;

    this.captions = captions;

    this.theater = theater;

    this.playbackSpeedButtonRef = playbackSpeedButtonRef;

    this.leaveVideoTimer = leaveVideoTimer;

    this.setEffectsActive = setEffectsActive;
    this.handleMute = handleMute;
    this.handleVisualEffectChange = handleVisualEffectChange;
  }

  formatDuration(time: number) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${this.leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${this.leadingZeroFormatter.format(
        minutes
      )}:${this.leadingZeroFormatter.format(seconds)}`;
    }
  }

  handleClosedCaptions() {
    if (this.captions.current && this.videoContainerRef.current) {
      const isHidden = this.captions.current.mode === "hidden";
      this.captions.current.mode = isHidden ? "showing" : "hidden";
      this.videoContainerRef.current.classList.toggle("captions", isHidden);
    }
  }

  handleCloseVideo() {
    if (this.socket) {
      const msg = {
        type: "removeProducer",
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        producerType: this.type,
        producerId: this.videoId,
      };

      this.socket.current.emit("message", msg);
    }
  }

  handleEffects() {
    this.setEffectsActive((prev) => !prev);
    if (!this.videoContainerRef.current?.classList.contains("in-effects")) {
      this.videoContainerRef.current?.classList.add("in-effects");
    } else {
      this.videoContainerRef.current?.classList.remove("in-effects");
    }
  }

  handleFullScreen() {
    if (this.videoContainerRef.current?.classList.contains("full-screen")) {
      document
        .exitFullscreen()
        .then(() => {
          this.videoContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.videoContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.videoContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  }

  handleFullScreenChange() {
    if (!document.fullscreenElement) {
      this.videoContainerRef.current?.classList.remove("full-screen");
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (
      !event.key ||
      !this.videoContainerRef.current?.classList.contains("in-video") ||
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
        if (this.fgVideoOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "mediaplaypause":
        if (this.fgVideoOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "k":
        if (this.fgVideoOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "f":
        if (this.fgVideoOptions.isFullScreen) {
          this.handleFullScreen();
        }
        break;
      case "t":
        if (this.fgVideoOptions.isTheater) {
          this.handleTheater();
        }
        break;
      case "i":
        if (this.fgVideoOptions.isPictureInPicture) {
          this.handleMiniPlayer();
        }
        break;
      case "m":
        if (this.fgVideoOptions.isVolume) {
          this.handleMute();
        }
        break;
      case "arrowleft":
        if (this.fgVideoOptions.isSkip) {
          this.skip(
            -(
              this.fgVideoOptions.skipIncrement ??
              defaultFgVideoOptions.skipIncrement
            )
          );
        }
        break;
      case "j":
        if (this.fgVideoOptions.isSkip) {
          this.skip(
            -(
              this.fgVideoOptions.skipIncrement ??
              defaultFgVideoOptions.skipIncrement
            )
          );
        }
        break;
      case "arrowright":
        if (this.fgVideoOptions.isSkip) {
          this.skip(
            this.fgVideoOptions.skipIncrement ??
              defaultFgVideoOptions.skipIncrement
          );
        }
        break;
      case "l":
        if (this.fgVideoOptions.isSkip) {
          this.skip(
            this.fgVideoOptions.skipIncrement ??
              defaultFgVideoOptions.skipIncrement
          );
        }
        break;
      case "c":
        if (this.fgVideoOptions.isClosedCaptions) {
          this.handleClosedCaptions();
        }
        break;
      case "e":
        this.handleEffects();
        break;
      case "x":
        this.handleCloseVideo();
        break;
      case "delete":
        this.handleCloseVideo();
        break;
      default:
        break;
    }
  }

  handleKeyUp(event: KeyboardEvent) {
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
  }

  handleMiniPlayer() {
    if (this.videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture().catch((error) => {
        console.error("Failed to exit picture in picture:", error);
      });
    } else {
      this.videoRef.current?.requestPictureInPicture().catch((error) => {
        console.error("Failed to request picture in picture:", error);
      });
    }
  }

  handleMouseEnter() {
    this.videoContainerRef.current?.classList.add("in-video");
    if (this.leaveVideoTimer.current) {
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = null;
    }
  }

  handleMouseLeave() {
    this.leaveVideoTimer.current = setTimeout(() => {
      this.videoContainerRef.current?.classList.remove("in-video");
    }, this.fgVideoOptions.controlsVanishTime);
  }

  handlePausePlay() {
    this.handleVisualEffectChange("pause");
    this.paused.current = !this.paused.current;
    if (this.paused.current) {
      this.videoContainerRef.current?.classList.add("paused");
    } else {
      this.videoContainerRef.current?.classList.remove("paused");
    }
  }

  handlePictureInPicture(action: string) {
    if (action === "enter") {
      this.videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.videoContainerRef.current?.classList.remove("mini-player");
    }
  }

  handlePlaybackSpeed() {
    if (!this.videoRef.current || !this.playbackSpeedButtonRef.current) return;

    const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const currentPlaybackRateIndex = playbackRates.findIndex(
      (rate) => rate === this.videoRef.current?.playbackRate
    );

    const nextPlaybackRateIndex =
      (currentPlaybackRateIndex + 1) % playbackRates.length;

    this.videoRef.current.playbackRate = playbackRates[nextPlaybackRateIndex];
    this.playbackSpeedButtonRef.current.textContent = `${playbackRates[nextPlaybackRateIndex]}x`;
  }

  handleScrubbing(event: MouseEvent) {
    if (
      !this.timelineContainerRef.current ||
      !this.videoRef.current ||
      !this.currentTimeRef.current
    )
      return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;

    this.isScrubbing.current = (event.buttons & 1) === 1;
    this.videoContainerRef.current?.classList.toggle(
      "scrubbing",
      this.isScrubbing.current
    );
    if (this.isScrubbing.current) {
      this.videoContainerRef.current?.classList.add("scrubbing");
      this.wasPaused.current = this.videoRef.current.paused;
      this.videoRef.current.pause();
    } else {
      this.videoContainerRef.current?.classList.remove("scrubbing");
      this.videoRef.current.currentTime =
        percent * this.videoRef.current.duration;
      if (!this.wasPaused) this.videoRef.current.play();
    }

    this.handleTimelineUpdate(event);
  }

  handleTheater() {
    this.theater.current = !this.theater.current;
    if (this.theater.current) {
      this.videoContainerRef.current?.classList.add("theater");
    } else {
      this.videoContainerRef.current?.classList.remove("theater");
    }
  }

  handleTimelineUpdate(event: MouseEvent) {
    if (
      !this.timelineContainerRef.current ||
      !this.videoRef.current ||
      !this.previewImgRef.current
    )
      return;

    const rect = this.timelineContainerRef.current.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;
    const previewImgIndex = Math.max(
      1,
      Math.floor((percent * this.videoRef.current.duration) / 10)
    );
    const previewImgSrc = this.thumbnails.current[previewImgIndex];
    this.previewImgRef.current.src = previewImgSrc;
    this.timelineContainerRef.current.style.setProperty(
      "--preview-position",
      `${percent}`
    );

    if (
      this.isScrubbing.current &&
      this.thumbnailImgRef.current &&
      this.currentTimeRef.current
    ) {
      event.preventDefault();
      this.thumbnailImgRef.current.src = previewImgSrc;
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
      );

      this.currentTimeRef.current.textContent = this.formatDuration(
        percent * this.videoRef.current.duration
      );
    }
  }

  async extractThumbnails(): Promise<string[]> {
    if (!this.videoRef.current) {
      return [];
    }

    const thumbnails: string[] = [];
    const offscreenVideo = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const videoWidth = this.videoRef.current.videoWidth;
    const videoHeight = this.videoRef.current.videoHeight;
    const videoAspectRatio = videoWidth / videoHeight;

    if (!ctx) throw new Error("Failed to get 2D context");

    offscreenVideo.src = this.videoRef.current.src;
    offscreenVideo.crossOrigin = "anonymous";

    await new Promise<void>((resolve) => {
      offscreenVideo.onloadedmetadata = () => {
        resolve();
      };
    });

    const duration = offscreenVideo.duration;
    const thumbnailHeight = Math.max(videoHeight / this.thumbnailClarity, 90);
    const thumbnailWidth = Math.max(
      videoWidth / this.thumbnailClarity,
      90 * videoAspectRatio
    );

    for (let time = 0; time < duration; time += this.thumbnailInterval) {
      offscreenVideo.currentTime = time;

      await new Promise<void>((resolve) => {
        offscreenVideo.onseeked = () => {
          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;
          ctx.drawImage(offscreenVideo, 0, 0, thumbnailWidth, thumbnailHeight);
          const thumbnail = canvas.toDataURL("image/png");
          thumbnails.push(thumbnail);
          resolve();
        };
      });
    }

    return thumbnails;
  }

  loadedData() {
    if (!this.videoRef.current) return;

    if (this.fgVideoOptions.isTotalTime && this.totalTimeRef.current) {
      this.totalTimeRef.current.textContent = this.formatDuration(
        this.videoRef.current.duration
      );
    }

    const loadThumbnails = async () => {
      if (this.videoRef.current) {
        const generatedThumbnails = await this.extractThumbnails();
        this.thumbnails.current = generatedThumbnails;
      }
    };

    if (
      this.fgVideoOptions.isTimeLine &&
      (this.fgVideoOptions.isPreview || this.fgVideoOptions.isThumbnail)
    ) {
      loadThumbnails();
    }
  }

  skip(duration: number) {
    if (this.videoRef.current) {
      this.videoRef.current.currentTime += duration;
    }
  }

  timeUpdate() {
    if (!this.videoRef.current) return;

    if (this.currentTimeRef.current) {
      this.currentTimeRef.current.textContent = this.formatDuration(
        this.videoRef.current.currentTime
      );
    }
    const percent =
      this.videoRef.current.currentTime / this.videoRef.current.duration;
    if (this.timelineContainerRef.current) {
      this.timelineContainerRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
      );
    }
  }
}

export default Controls;
