import { Socket } from "socket.io-client";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/StreamsContext";
import {
  defaultFgVideoOptions,
  FgVideoOptions,
  Settings,
} from "../../fgVideo/FgVideo";

const fontSizeMap = {
  xsmall: "0.75rem",
  small: "1.25rem",
  base: "1.5rem",
  medium: "2rem",
  large: "2.5rem",
  xlarge: "3rem",
};

const opacityMap = {
  "25%": "0.25",
  "50%": "0.5",
  "75%": "0.75",
  "100%": "1",
};

const colorMap = {
  white: "rgba(255, 255, 255,",
  black: "rgba(0, 0, 0,",
  red: "rgba(255, 0, 0,",
  green: "rgba(0, 255, 0,",
  blue: "rgba(0, 0, 255,",
  magenta: "rgba(255, 0, 255,",
  orange: "rgba(255, 165, 0,",
  cyan: "rgba(0, 255, 255,",
};

const fontFamilyMap = {
  K2D: "'K2D', sans-serif",
  Josephin: "'Josefin Sans', sans-serif",
  mono: "'Courier New', monospace",
  sans: "'Arial', sans-serif",
  serif: "'Times New Roman', serif",
  thin: "'Montserrat Thin', sans-serif",
  bold: "'Noto Sans', sans-serif",
};

const characterEdgeStyleMap = {
  None: "none",
  Shadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  Raised: "1px 1px 2px rgba(0, 0, 0, 0.4)",
  Inset:
    "1px 1px 2px rgba(255, 255, 255, 0.5), -1px -1px 2px rgba(0, 0, 0, 0.4)",
  Outline:
    "-1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black, 1px 1px 0px black",
};

class Controls {
  private socket: React.MutableRefObject<Socket> | undefined;
  private videoId: string;
  private table_id: string;
  private username: string;
  private instance: string;
  private type: string;

  private fgVideoOptions: FgVideoOptions;

  private bundleRef: React.RefObject<HTMLDivElement>;
  private videoRef: React.RefObject<HTMLVideoElement>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private videoContainerRef: React.RefObject<HTMLDivElement>;

  private shiftPressed: React.MutableRefObject<boolean>;
  private controlPressed: React.MutableRefObject<boolean>;

  private paused: React.MutableRefObject<boolean>;
  private wasPaused: React.MutableRefObject<boolean>;

  private captionsActive: boolean;
  private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>;

  private settings: Settings;
  private setSettings: React.Dispatch<React.SetStateAction<Settings>>;

  private timelineContainerRef: React.RefObject<HTMLDivElement>;
  private isScrubbing: React.MutableRefObject<boolean>;

  private totalTimeRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLDivElement>;

  private previewImgRef: React.RefObject<HTMLImageElement>;
  private thumbnails: React.MutableRefObject<string[]>;
  private thumbnailImgRef: React.RefObject<HTMLImageElement>;
  private thumbnailInterval: number;
  private thumbnailClarity: number;

  private theater: React.MutableRefObject<boolean>;

  private playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;

  private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>;

  private setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;

  private handleMute: () => void;
  private handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  private tracksColorSetterCallback: () => void;

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

    bundleRef: React.RefObject<HTMLDivElement>,
    videoRef: React.RefObject<HTMLVideoElement>,
    audioRef: React.RefObject<HTMLAudioElement>,
    videoContainerRef: React.RefObject<HTMLDivElement>,

    shiftPressed: React.MutableRefObject<boolean>,
    controlPressed: React.MutableRefObject<boolean>,

    paused: React.MutableRefObject<boolean>,
    wasPaused: React.MutableRefObject<boolean>,

    captionsActive: boolean,
    setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,

    settings: Settings,
    setSettings: React.Dispatch<React.SetStateAction<Settings>>,

    timelineContainerRef: React.RefObject<HTMLDivElement>,
    isScrubbing: React.MutableRefObject<boolean>,

    totalTimeRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLDivElement>,

    previewImgRef: React.RefObject<HTMLImageElement>,
    thumbnails: React.MutableRefObject<string[]>,
    thumbnailImgRef: React.RefObject<HTMLImageElement>,
    thumbnailInterval = 10,
    thumbnailClarity = 5,

    theater: React.MutableRefObject<boolean>,

    playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>,

    leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | null>,

    setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,

    handleMute: () => void,
    handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    tracksColorSetterCallback: () => void
  ) {
    this.socket = socket;
    this.videoId = videoId;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.type = type;

    this.fgVideoOptions = fgVideoOptions;

    this.bundleRef = bundleRef;
    this.videoRef = videoRef;
    this.audioRef = audioRef;
    this.videoContainerRef = videoContainerRef;

    this.shiftPressed = shiftPressed;
    this.controlPressed = controlPressed;

    this.paused = paused;
    this.wasPaused = wasPaused;

    this.captionsActive = captionsActive;
    this.setCaptionsActive = setCaptionsActive;

    this.settings = settings;
    this.setSettings = setSettings;

    this.timelineContainerRef = timelineContainerRef;
    this.isScrubbing = isScrubbing;

    this.totalTimeRef = totalTimeRef;
    this.currentTimeRef = currentTimeRef;

    this.previewImgRef = previewImgRef;
    this.thumbnails = thumbnails;
    this.thumbnailImgRef = thumbnailImgRef;
    this.thumbnailInterval = thumbnailInterval;
    this.thumbnailClarity = thumbnailClarity;

    this.theater = theater;

    this.playbackSpeedButtonRef = playbackSpeedButtonRef;

    this.leaveVideoTimer = leaveVideoTimer;

    this.setEffectsActive = setEffectsActive;

    this.handleMute = handleMute;
    this.handleVisualEffectChange = handleVisualEffectChange;
    this.tracksColorSetterCallback = tracksColorSetterCallback;
  }

  formatDuration = (time: number) => {
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
  };

  handleClosedCaptions = () => {
    if (this.videoContainerRef.current) {
      this.videoContainerRef.current.classList.toggle("captions");
      this.setCaptionsActive((prev) => !prev);
    }
  };

  handleCloseVideo = () => {
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
  };

  handleEffects = () => {
    this.setEffectsActive((prev) => !prev);
    if (!this.videoContainerRef.current?.classList.contains("in-effects")) {
      this.videoContainerRef.current?.classList.add("in-effects");
    } else {
      this.videoContainerRef.current?.classList.remove("in-effects");
    }
  };

  handleFullScreen = () => {
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
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.videoContainerRef.current?.classList.remove("full-screen");
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.videoContainerRef.current?.classList.contains("in-video") ||
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
      case "arrowup":
        if (!this.audioRef.current) {
          return;
        }

        const upVolume = Math.min(1, this.audioRef.current.volume + 0.05);

        this.audioRef.current.volume = upVolume;

        if (this.bundleRef.current) {
          const volumeSliders =
            this.bundleRef.current.querySelectorAll(".volume-slider");

          volumeSliders.forEach((slider) => {
            const sliderElement = slider as HTMLInputElement;
            sliderElement.value = `${upVolume}`;
          });
        }

        this.tracksColorSetterCallback();
        break;
      case "arrowdown":
        if (!this.audioRef.current) {
          return;
        }

        const downVolume = Math.max(0, this.audioRef.current.volume - 0.05);

        this.audioRef.current.volume = downVolume;

        if (this.bundleRef.current) {
          const volumeSliders =
            this.bundleRef.current.querySelectorAll(".volume-slider");

          volumeSliders.forEach((slider) => {
            const sliderElement = slider as HTMLInputElement;
            sliderElement.value = `${downVolume}`;
          });
        }

        this.tracksColorSetterCallback();
        break;
      default:
        break;
    }
  };

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
      this.videoRef.current?.requestPictureInPicture().catch((error) => {
        console.error("Failed to request picture in picture:", error);
      });
    }
  };

  handleMouseEnter = () => {
    this.videoContainerRef.current?.classList.add("in-video");
    if (this.leaveVideoTimer.current) {
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = null;
    }
  };

  handleMouseLeave = () => {
    this.leaveVideoTimer.current = setTimeout(() => {
      this.videoContainerRef.current?.classList.remove("in-video");
    }, this.fgVideoOptions.controlsVanishTime);
  };

  handlePausePlay = () => {
    this.handleVisualEffectChange("pause");
    this.paused.current = !this.paused.current;
    if (this.paused.current) {
      this.videoContainerRef.current?.classList.add("paused");
    } else {
      this.videoContainerRef.current?.classList.remove("paused");
    }
  };

  handlePictureInPicture = (action: string) => {
    if (action === "enter") {
      this.videoContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.videoContainerRef.current?.classList.remove("mini-player");
    }
  };

  handlePlaybackSpeed = () => {
    if (!this.videoRef.current || !this.playbackSpeedButtonRef.current) return;

    const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const currentPlaybackRateIndex = playbackRates.findIndex(
      (rate) => rate === this.videoRef.current?.playbackRate
    );

    const nextPlaybackRateIndex =
      (currentPlaybackRateIndex + 1) % playbackRates.length;

    this.videoRef.current.playbackRate = playbackRates[nextPlaybackRateIndex];
    this.playbackSpeedButtonRef.current.textContent = `${playbackRates[nextPlaybackRateIndex]}x`;
  };

  handleScrubbing = (event: MouseEvent) => {
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
  };

  handleTheater = () => {
    this.theater.current = !this.theater.current;
    if (this.theater.current) {
      this.videoContainerRef.current?.classList.add("theater");
    } else {
      this.videoContainerRef.current?.classList.remove("theater");
    }
  };

  handleTimelineUpdate = (event: MouseEvent) => {
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
  };

  extractThumbnails = async (): Promise<string[]> => {
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
  };

  loadedData = () => {
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
  };

  skip(duration: number) {
    if (this.videoRef.current) {
      this.videoRef.current.currentTime += duration;
    }
  }

  timeUpdate = () => {
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
}

export default Controls;
