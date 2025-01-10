import { UserMediaType } from "../../../../../context/mediaContext/typeConstant";
import TableStaticContentSocketController from "../../../../../lib/TableStaticContentSocketController";
import {
  UserStreamEffectsType,
  VideoEffectTypes,
} from "../../../../../context/effectsContext/typeConstant";
import FgContentAdjustmentController from "../../../../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import { Settings } from "../../typeConstant";
import VideoMedia from "../../../../../lib/VideoMedia";

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

class FgLowerVideoController {
  private initTime: number;

  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private table_id: string,
    private username: string,
    private instance: string,
    private videoId: string,
    private sharedBundleRef: React.RefObject<HTMLDivElement>,
    private videoMedia: VideoMedia,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private panBtnRef: React.RefObject<HTMLButtonElement>,
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
    private userMedia: React.MutableRefObject<UserMediaType>,
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
    }>
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
    this.tableStaticContentSocket.current?.deleteContent("video", this.videoId);
  };

  handleVideoEffects = () => {
    this.setVideoEffectsActive((prev) => !prev);
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
      !this.videoContainerRef.current?.classList.contains("in-video-media") ||
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
      case "f":
        this.handleFullScreen();
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
    if (!this.sharedBundleRef.current) {
      return;
    }

    const angle =
      2 * Math.PI - this.positioning.current.rotation * (Math.PI / 180);

    const pixelScale = {
      x:
        (this.positioning.current.scale.x / 100) *
        this.sharedBundleRef.current.clientWidth,
      y:
        (this.positioning.current.scale.y / 100) *
        this.sharedBundleRef.current.clientHeight,
    };

    const rect = this.sharedBundleRef.current.getBoundingClientRect();

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
          this.sharedBundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
          this.sharedBundleRef.current.clientHeight,
      }
    );
    this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction();
  };

  scaleFuntion = (event: PointerEvent) => {
    if (!this.sharedBundleRef.current) {
      return;
    }

    const rect = this.sharedBundleRef.current.getBoundingClientRect();

    const referencePoint = {
      x:
        (this.positioning.current.position.left / 100) *
        this.sharedBundleRef.current.clientWidth,
      y:
        (this.positioning.current.position.top / 100) *
        this.sharedBundleRef.current.clientHeight,
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
    if (!this.sharedBundleRef.current) {
      return;
    }

    const box = this.sharedBundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.rotateDragFunction(event, {
      x:
        (this.positioning.current.position.left / 100) *
          this.sharedBundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.sharedBundleRef.current.clientHeight +
        box.top,
    });
    this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction();
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
      if (this.videoMedia.video.currentTime !== undefined) {
        this.currentTimeRef.current.textContent = this.formatDuration(
          this.videoMedia.video.currentTime + this.initTimeOffset.current / 1000
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

  handleVideoEffect = async (
    effect: VideoEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.userStreamEffects.current.video[this.videoId].video[effect] =
        !this.userStreamEffects.current.video[this.videoId].video[effect];
    }

    this.userMedia.current.video[this.videoId].changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );
  };

  setInitTimeOffset = (offset: number) => {
    this.initTimeOffset.current = offset;
  };
}

export default FgLowerVideoController;
