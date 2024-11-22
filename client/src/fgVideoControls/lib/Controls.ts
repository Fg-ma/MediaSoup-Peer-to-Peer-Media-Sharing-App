import { Socket } from "socket.io-client";
import { FgVideoOptions, Settings } from "../../fgVideo/FgVideo";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import CameraMedia from "src/lib/CameraMedia";
import ScreenMedia from "src/lib/ScreenMedia";
import AudioMedia from "src/lib/AudioMedia";

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
  private initTime: number;

  constructor(
    private socket: React.MutableRefObject<Socket> | undefined,
    private videoId: string,
    private table_id: string,
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private fgVideoOptions: FgVideoOptions,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private inVideo: boolean,
    private setInVideo: React.Dispatch<React.SetStateAction<boolean>>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private paused: React.MutableRefObject<boolean>,
    private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private currentTimeRef: React.RefObject<HTMLDivElement>,
    private leaveVideoTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private setEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setAudioEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private handleMute: () => void,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    private tracksColorSetterCallback: () => void,
    private tintColor: React.MutableRefObject<string>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private initTimeOffset: React.MutableRefObject<number>
  ) {
    this.initTime = Date.now();
  }

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
  };

  handleAudioEffects = () => {
    this.setAudioEffectsActive((prev) => !prev);
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
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
      !this.inVideo ||
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
      case "c":
        if (this.fgVideoOptions.isClosedCaptions) {
          this.handleClosedCaptions();
        }
        break;
      case "e":
        this.handleEffects();
        break;
      case "a":
        this.handleAudioEffects();
        break;
      case "x":
        this.handleCloseVideo();
        break;
      case "delete":
        this.handleCloseVideo();
        break;
      case "arrowup":
        this.volumeControl(0.05);
        break;
      case "arrowdown":
        this.volumeControl(-0.05);
        break;
      default:
        break;
    }
  };

  volumeControl = (volumeChangeAmount: number) => {
    if (!this.audioRef.current) {
      return;
    }

    const newVolume = Math.max(
      0,
      Math.min(1, this.audioRef.current.volume + volumeChangeAmount)
    );

    this.audioRef.current.volume = newVolume;

    if (this.bundleRef.current) {
      const volumeSliders =
        this.bundleRef.current.querySelectorAll(".volume-slider");

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${newVolume}`;
      });
    }

    this.tracksColorSetterCallback();
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
    this.setInVideo(true);
    if (this.leaveVideoTimer.current) {
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }
  };

  handleMouseLeave = () => {
    this.leaveVideoTimer.current = setTimeout(() => {
      this.setInVideo(false);
      clearTimeout(this.leaveVideoTimer.current);
      this.leaveVideoTimer.current = undefined;
    }, this.fgVideoOptions.controlsVanishTime);
  };

  handlePausePlay = () => {
    this.handleVisualEffectChange("pause");
    this.paused.current = !this.paused.current;

    if (this.fgVideoOptions.isUser) {
      this.setPausedState((prev) => !prev);
    }
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
      if (this.videoRef.current?.currentTime !== undefined) {
        this.currentTimeRef.current.textContent = this.formatDuration(
          this.videoRef.current.currentTime + this.initTimeOffset.current / 1000
        );
      } else {
        this.currentTimeRef.current.textContent = this.formatDuration(
          (Date.now() - this.initTime - this.initTimeOffset.current) / 1000
        );
      }
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

  handleVisualEffect = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean
  ) => {
    // Fill stream effects if state change isn't blocked
    if (!blockStateChange) {
      if (this.type === "camera") {
        this.userStreamEffects.current[this.type][this.videoId][
          effect as CameraEffectTypes
        ] =
          !this.userStreamEffects.current[this.type][this.videoId][
            effect as CameraEffectTypes
          ];
      } else if (this.type === "screen") {
        this.userStreamEffects.current[this.type][this.videoId][
          effect as ScreenEffectTypes
        ] =
          !this.userStreamEffects.current[this.type][this.videoId][
            effect as ScreenEffectTypes
          ];
      }
    }

    if (this.type === "camera") {
      this.userMedia.current[this.type][this.videoId].changeEffects(
        effect as CameraEffectTypes,
        this.tintColor.current,
        blockStateChange
      );
    } else if (this.type === "screen") {
      this.userMedia.current[this.type][this.videoId].changeEffects(
        effect as ScreenEffectTypes,
        this.tintColor.current,
        blockStateChange
      );
    }
  };

  setInitTimeOffset = (offset: number) => {
    this.initTimeOffset.current = offset;
  };
}

export default Controls;
