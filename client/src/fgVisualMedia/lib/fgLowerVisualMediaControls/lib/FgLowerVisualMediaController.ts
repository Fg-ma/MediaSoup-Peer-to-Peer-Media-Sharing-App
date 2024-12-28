import { Socket } from "socket.io-client";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import CameraMedia from "../../../../lib/CameraMedia";
import ScreenMedia from "../../../../lib/ScreenMedia";
import AudioMedia from "../../../../lib/AudioMedia";
import FgContentAdjustmentController from "../../../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import { FgVisualMediaOptions, Settings } from "../../typeConstant";

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

class FgLowerVisualMediaController {
  private initTime: number;

  constructor(
    private mediasoupSocket: React.MutableRefObject<Socket> | undefined,
    private visualMediaId: string,
    private table_id: string,
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private fgVisualMediaOptions: FgVisualMediaOptions,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private visualMediaContainerRef: React.RefObject<HTMLDivElement>,
    private panBtnRef: React.RefObject<HTMLButtonElement>,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private paused: React.MutableRefObject<boolean>,
    private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private currentTimeRef: React.RefObject<HTMLDivElement>,
    private setVisualEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
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
    private initTimeOffset: React.MutableRefObject<number>,
    private fgContentAdjustmentController: FgContentAdjustmentController,
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
    private screenAudioStream?: MediaStream
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
    if (this.visualMediaContainerRef.current) {
      this.visualMediaContainerRef.current.classList.toggle("captions");
      this.setCaptionsActive((prev) => !prev);
    }
  };

  handleCloseVideo = () => {
    if (!this.mediasoupSocket) {
      return;
    }

    if (this.fgVisualMediaOptions.isUser) {
      const msg = {
        type: "removeProducer",
        header: {
          table_id: this.table_id,
          username: this.username,
          instance: this.instance,
          producerType: this.type,
          producerId: this.visualMediaId,
        },
      };
      this.mediasoupSocket.current.emit("message", msg);

      if (this.type === "screen" && this.screenAudioStream) {
        const message = {
          type: "removeProducer",
          header: {
            table_id: this.table_id,
            username: this.username,
            instance: this.instance,
            producerType: "screenAudio",
            producerId: `${this.visualMediaId}_audio`,
          },
        };
        this.mediasoupSocket.current.emit("message", message);
      }
    } else {
      const msg = {
        type: "requestRemoveProducer",
        header: {
          table_id: this.table_id,
          username: this.username,
          instance: this.instance,
          producerType: this.type,
          producerId: this.visualMediaId,
        },
      };
      this.mediasoupSocket.current.emit("message", msg);

      if (this.type === "screen" && this.screenAudioStream) {
        const message = {
          type: "requestRemoveProducer",
          header: {
            table_id: this.table_id,
            username: this.username,
            instance: this.instance,
            producerType: "screenAudio",
            producerId: `${this.visualMediaId}_audio`,
          },
        };
        this.mediasoupSocket.current.emit("message", message);
      }
    }
  };

  handleVisualEffects = () => {
    this.setVisualEffectsActive((prev) => !prev);
  };

  handleAudioEffects = () => {
    this.setAudioEffectsActive((prev) => !prev);
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.visualMediaContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.visualMediaContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.visualMediaContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.visualMediaContainerRef.current?.classList.remove("full-screen");
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.visualMediaContainerRef.current?.classList.contains(
        "in-visual-media"
      ) ||
      this.visualMediaContainerRef.current?.classList.contains("in-piano") ||
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
        if (this.fgVisualMediaOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "mediaplaypause":
        if (this.fgVisualMediaOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "k":
        if (this.fgVisualMediaOptions.isPlayPause) {
          this.handlePausePlay();
        }
        break;
      case "f":
        if (this.fgVisualMediaOptions.isFullScreen) {
          this.handleFullScreen();
        }
        break;
      case "i":
        if (this.fgVisualMediaOptions.isPictureInPicture) {
          this.handleMiniPlayer();
        }
        break;
      case "m":
        if (this.fgVisualMediaOptions.isVolume) {
          this.handleMute();
        }
        break;
      case "c":
        if (this.fgVisualMediaOptions.isClosedCaptions) {
          this.handleClosedCaptions();
        }
        break;
      case "e":
        this.handleVisualEffects();
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
      case "s":
        this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
          "scale"
        );
        document.addEventListener("pointermove", this.scaleFuntion);
        document.addEventListener("pointerdown", this.scaleFunctionEnd);
        break;
      case "g":
        this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
          "position",
          { rotationPointPlacement: "topLeft" }
        );
        document.addEventListener("pointermove", this.moveFunction);
        document.addEventListener("pointerdown", this.moveFunctionEnd);
        break;
      case "r":
        this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
          "rotation"
        );
        document.addEventListener("pointermove", this.rotateFunction);
        document.addEventListener("pointerdown", this.rotateFunctionEnd);
        break;
      default:
        break;
    }
  };

  scaleFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.scaleFuntion);
    document.removeEventListener("pointerdown", this.scaleFunctionEnd);
  };

  rotateFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.rotateFunction);
    document.removeEventListener("pointerdown", this.rotateFunctionEnd);
  };

  moveFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.moveFunction);
    document.removeEventListener("pointerdown", this.moveFunctionEnd);
  };

  moveFunction = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const angle =
      2 * Math.PI - this.positioning.current.rotation * (Math.PI / 180);

    const pixelScale = {
      x:
        (this.positioning.current.scale.x / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.scale.y / 100) *
        this.bundleRef.current.clientHeight,
    };

    const rect = this.bundleRef.current.getBoundingClientRect();

    const buttonWidth = (this.panBtnRef.current?.clientWidth ?? 0) / 2;

    this.fgContentAdjustmentController.movementDragFunction(
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      {
        x:
          -buttonWidth * Math.cos(angle) -
          pixelScale.x * Math.cos(angle) -
          (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle),
        y:
          buttonWidth * Math.sin(angle) +
          pixelScale.x * Math.sin(angle) -
          (pixelScale.y / 2) * Math.sin(Math.PI / 2 - angle),
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight,
      }
    );
    this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction();
  };

  scaleFuntion = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const rect = this.bundleRef.current.getBoundingClientRect();

    const referencePoint = {
      x:
        (this.positioning.current.position.left / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.position.top / 100) *
        this.bundleRef.current.clientHeight,
    };

    this.fgContentAdjustmentController.scaleDragFunction(
      "any",
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      referencePoint,
      referencePoint
    );
    this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction();
  };

  rotateFunction = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const box = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.rotateDragFunction(event, {
      x:
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight +
        box.top,
    });
    this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction();
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
    if (
      this.visualMediaContainerRef.current?.classList.contains("mini-player")
    ) {
      document.exitPictureInPicture().catch((error) => {
        console.error("Failed to exit picture in picture:", error);
      });
    } else {
      this.videoRef.current?.requestPictureInPicture().catch((error) => {
        console.error("Failed to request picture in picture:", error);
      });
    }
  };

  handlePausePlay = () => {
    this.handleVisualEffectChange("pause");
    this.paused.current = !this.paused.current;

    if (this.fgVisualMediaOptions.isUser) {
      this.setPausedState((prev) => !prev);
    }
  };

  handlePictureInPicture = (action: string) => {
    if (action === "enter") {
      this.visualMediaContainerRef.current?.classList.add("mini-player");
    } else if (action === "leave") {
      this.visualMediaContainerRef.current?.classList.remove("mini-player");
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
    if (!this.visualMediaContainerRef.current) {
      return;
    }

    const style = this.visualMediaContainerRef.current.style;
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
        this.userStreamEffects.current[this.type][this.visualMediaId][
          effect as CameraEffectTypes
        ] =
          !this.userStreamEffects.current[this.type][this.visualMediaId][
            effect as CameraEffectTypes
          ];
      } else if (this.type === "screen") {
        this.userStreamEffects.current[this.type][this.visualMediaId][
          effect as ScreenEffectTypes
        ] =
          !this.userStreamEffects.current[this.type][this.visualMediaId][
            effect as ScreenEffectTypes
          ];
      }
    }

    if (this.type === "camera") {
      this.userMedia.current[this.type][this.visualMediaId].changeEffects(
        effect as CameraEffectTypes,
        this.tintColor.current,
        blockStateChange
      );
    } else if (this.type === "screen") {
      this.userMedia.current[this.type][this.visualMediaId].changeEffects(
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

export default FgLowerVisualMediaController;
