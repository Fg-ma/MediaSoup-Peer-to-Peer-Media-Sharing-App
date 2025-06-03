import { RemoteMediaType } from "../../../../../context/mediaContext/lib/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../../../../universal/effectsTypeConstant";
import FgContentAdjustmentController from "../../../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import { FgVisualMediaOptions } from "../../typeConstant";
import MediasoupSocketController from "../../../../../serverControllers/mediasoupServer/MediasoupSocketController";
import ReactController from "../../../../../elements/reactButton/lib/ReactController";
import TableSocketController from "../../../../../serverControllers/tableServer/TableSocketController";
import CameraMedia from "../../../../../media/fgVisualMedia/CameraMedia";
import ScreenMedia from "../../../../../media/fgVisualMedia/ScreenMedia";
import RemoteVisualMedia from "../../../../../media/fgVisualMedia/RemoteVisualMedia";

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

  reactController: ReactController;

  constructor(
    private visualMedia: CameraMedia | ScreenMedia | RemoteVisualMedia,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private visualMediaId: string,
    private tableId: string,
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
    private paused: React.MutableRefObject<boolean>,
    private setCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private currentTimeRef: React.RefObject<HTMLDivElement>,
    private setVisualEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setAudioEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private handleMute: (
      producerType: "audio" | "screenAudio",
      producerId: string | undefined,
    ) => void,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean,
    ) => Promise<void>,
    private tracksColorSetterCallback: (
      producerType: "audio" | "screenAudio",
      producerId: string | undefined,
    ) => void,
    private tintColor: React.MutableRefObject<string>,
    private userEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private initTimeOffset: React.MutableRefObject<number>,
    private fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>,
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
    private aspectRatio: React.MutableRefObject<number>,
    private screenAudioStream: MediaStream | undefined,
    private behindEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private frontEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private tableSocket: React.MutableRefObject<
      TableSocketController | undefined
    >,
    private setReactionsPanelActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
  ) {
    this.initTime = Date.now();

    this.reactController = new ReactController(
      this.visualMediaId,
      undefined,
      this.type,
      this.behindEffectsContainerRef,
      this.frontEffectsContainerRef,
      this.tableSocket,
    );
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
    if (this.fgVisualMediaOptions.isUser) {
      this.mediasoupSocket.current?.sendMessage({
        type: "removeProducer",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: this.type,
          producerId: this.visualMediaId,
        },
      });

      if (this.type === "screen" && this.screenAudioStream) {
        this.mediasoupSocket.current?.sendMessage({
          type: "removeProducer",
          header: {
            tableId: this.tableId,
            username: this.username,
            instance: this.instance,
            producerType: "screenAudio",
            producerId: `${this.visualMediaId}_audio`,
          },
        });
      }
    } else {
      this.mediasoupSocket.current?.sendMessage({
        type: "requestRemoveProducer",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: this.type,
          producerId: this.visualMediaId,
        },
      });

      if (this.type === "screen" && this.screenAudioStream) {
        this.mediasoupSocket.current?.sendMessage({
          type: "requestRemoveProducer",
          header: {
            tableId: this.tableId,
            username: this.username,
            instance: this.instance,
            producerType: "screenAudio",
            producerId: `${this.visualMediaId}_audio`,
          },
        });
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

          if (
            this.fgVisualMediaOptions.isUser &&
            (this.visualMedia instanceof CameraMedia ||
              this.visualMedia instanceof ScreenMedia)
          ) {
            this.visualMedia.canvas.style.width = "100%";
            this.visualMedia.canvas.style.height = "100%";
          }
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.visualMediaContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.visualMediaContainerRef.current?.classList.add("full-screen");

          if (
            this.fgVisualMediaOptions.isUser &&
            (this.visualMedia instanceof CameraMedia ||
              this.visualMedia instanceof ScreenMedia)
          ) {
            if (
              this.visualMedia.canvas.width / document.body.clientWidth >
              this.visualMedia.canvas.height / document.body.clientHeight
            ) {
              this.visualMedia.canvas.style.width = "100%";
              this.visualMedia.canvas.style.height = "auto";
            } else {
              this.visualMedia.canvas.style.width = "auto";
              this.visualMedia.canvas.style.height = "100%";
            }
          }
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.visualMediaContainerRef.current?.classList.remove("full-screen");

      if (
        this.fgVisualMediaOptions.isUser &&
        (this.visualMedia instanceof CameraMedia ||
          this.visualMedia instanceof ScreenMedia)
      ) {
        this.visualMedia.canvas.style.width = "100%";
        this.visualMedia.canvas.style.height = "100%";
      }
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.visualMediaContainerRef.current?.classList.contains(
        "in-visual-media",
      ) ||
      this.visualMediaContainerRef.current?.classList.contains("in-piano") ||
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
          this.handleMute(
            this.screenAudioStream ? "screenAudio" : "audio",
            this.screenAudioStream ? `${this.visualMediaId}_audio` : undefined,
          );
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
        this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
          "scale",
        );
        document.addEventListener("pointermove", this.scaleFuntion);
        document.addEventListener("pointerdown", this.scaleFunctionEnd);
        break;
      case "g":
        this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
          "position",
          { rotationPointPlacement: "topLeft" },
        );
        document.addEventListener("pointermove", this.moveFunction);
        document.addEventListener("pointerdown", this.moveFunctionEnd);
        break;
      case "r":
        this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
          "rotation",
        );
        document.addEventListener("pointermove", this.rotateFunction);
        document.addEventListener("pointerdown", this.rotateFunctionEnd);
        break;
      default:
        break;
    }
  };

  scaleFunctionEnd = () => {
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.scaleFuntion);
    document.removeEventListener("pointerdown", this.scaleFunctionEnd);
  };

  rotateFunctionEnd = () => {
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.rotateFunction);
    document.removeEventListener("pointerdown", this.rotateFunctionEnd);
  };

  moveFunctionEnd = () => {
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
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

    this.fgContentAdjustmentController.current?.movementDragFunction(
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
      },
    );
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();
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

    this.fgContentAdjustmentController.current?.scaleDragFunction(
      "aspect",
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      referencePoint,
      referencePoint,
      this.aspectRatio.current,
    );
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();
  };

  rotateFunction = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const box = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.current?.rotateDragFunction(event, {
      x:
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight +
        box.top,
    });
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();
  };

  volumeControl = (volumeChangeAmount: number) => {
    const producerType = this.screenAudioStream ? "screenAudio" : "audio";
    const producerId = this.screenAudioStream
      ? `${this.visualMediaId}_audio`
      : undefined;
    this.tracksColorSetterCallback(producerType, producerId);

    if (!this.screenAudioStream) {
      if (!this.audioRef.current) {
        return;
      }

      const newVolume = Math.max(
        0,
        Math.min(1, this.audioRef.current.volume + volumeChangeAmount),
      );

      this.audioRef.current.volume = newVolume;

      if (this.bundleRef.current) {
        const volumeSliders = this.bundleRef.current.querySelectorAll(
          `.volume-slider-${producerType}`,
        );

        volumeSliders.forEach((slider) => {
          const sliderElement = slider as HTMLInputElement;
          sliderElement.value = `${newVolume}`;
        });
      }
    } else {
      if (!producerId) {
        return;
      }

      const audioElement = document.getElementById(
        producerId,
      ) as HTMLAudioElement | null;

      if (!audioElement) {
        return;
      }

      const newVolume = Math.max(
        0,
        Math.min(1, audioElement.volume + volumeChangeAmount),
      );

      audioElement.volume = newVolume;

      if (this.bundleRef.current) {
        const volumeSliders =
          // prettier-ignore
          this.bundleRef.current.querySelectorAll(`.volume-slider-${producerType}${producerId ? producerId : ""}`);

        volumeSliders.forEach((slider) => {
          const sliderElement = slider as HTMLInputElement;
          sliderElement.value = `${newVolume}`;
        });
      }
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
          this.videoRef.current.currentTime +
            this.initTimeOffset.current / 1000,
        );
      } else {
        this.currentTimeRef.current.textContent = this.formatDuration(
          (Date.now() - this.initTime - this.initTimeOffset.current) / 1000,
        );
      }
    }
  };

  updateCaptionsStyles = () => {
    if (!this.visualMediaContainerRef.current) return;

    const style = this.visualMediaContainerRef.current.style;
    const captionOptions =
      this.visualMedia.settings.closedCaption.closedCaptionOptions;

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

  handleVisualEffect = async (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange: boolean,
  ) => {
    // Fill stream effects if state change isn't blocked
    if (!blockStateChange) {
      if (this.type === "camera") {
        this.userEffects.current[this.type][this.visualMediaId][
          effect as CameraEffectTypes
        ] =
          !this.userEffects.current[this.type][this.visualMediaId][
            effect as CameraEffectTypes
          ];
      } else if (this.type === "screen") {
        this.userEffects.current[this.type][this.visualMediaId][
          effect as ScreenEffectTypes
        ] =
          !this.userEffects.current[this.type][this.visualMediaId][
            effect as ScreenEffectTypes
          ];
      }
    }

    if (
      this.visualMedia instanceof CameraMedia ||
      this.visualMedia instanceof ScreenMedia
    ) {
      if (this.type === "camera") {
        this.visualMedia.changeEffects(
          effect as any,
          this.tintColor.current,
          blockStateChange,
        );
      } else if (this.type === "screen") {
        this.visualMedia.changeEffects(
          effect as ScreenEffectTypes,
          this.tintColor.current,
          blockStateChange,
        );
      }
    }
  };

  setInitTimeOffset = (offset: number) => {
    this.initTimeOffset.current = offset;
  };

  handleReact = () => {
    this.setReactionsPanelActive((prev) => !prev);
  };
}

export default FgLowerVisualMediaController;
