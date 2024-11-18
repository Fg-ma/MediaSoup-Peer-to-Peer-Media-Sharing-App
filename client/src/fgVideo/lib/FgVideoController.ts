import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import {
  EffectStylesType,
  HideBackgroundEffectTypes,
  PostProcessEffects,
} from "../../context/currentEffectsStylesContext/typeConstant";
import { defaultFgVideoOptions, FgVideoOptions } from "../FgVideo";
import Controls from "../../fgVideoControls/lib/Controls";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";

type FgVideoMessageEvents =
  | {
      type: "effectChangeRequested";
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      blockStateChange: boolean;
      data: { style: string };
    }
  | {
      type: "clientEffectChanged";
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
      producerId: string;
      effect: CameraEffectTypes | ScreenEffectTypes;
      effectStyle: string;
      blockStateChange: boolean;
    }
  | {
      type: "responsedCatchUpData";
      inquiredUsername: string;
      inquiredInstance: string;
      inquiredType: "camera" | "screen";
      inquiredVideoId: string;
      data:
        | {
            cameraPaused: boolean;
            cameraTimeEllapsed: number;
          }
        | {
            screenPaused: boolean;
            screenTimeEllapsed: number;
          }
        | undefined;
    };

class FgVideoController {
  constructor(
    private username: string,
    private instance: string,
    private type: "camera" | "screen",
    private videoId: string,
    private controls: Controls,
    private videoStream: MediaStream | undefined,
    private setPausedState: React.Dispatch<React.SetStateAction<boolean>>,
    private paused: React.MutableRefObject<boolean>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private remoteStreamEffects: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera: {
            [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
          };
          screen: {
            [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
          };
          audio: { [effectType in AudioEffectTypes]: boolean };
        };
      };
    }>,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    private videoRef: React.RefObject<HTMLVideoElement>,
    private videoContainerRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private fgVideoOptions: FgVideoOptions,
    private handleVisualEffectChange: (
      effect: CameraEffectTypes | ScreenEffectTypes,
      blockStateChange?: boolean
    ) => Promise<void>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private position: {
      left: number;
      top: number;
    },
    private setPosition: React.Dispatch<
      React.SetStateAction<{
        left: number;
        top: number;
      }>
    >,
    private scale: {
      x: number;
      y: number;
    },
    private setScale: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
      }>
    >,
    private rotation: number,
    private setRotation: React.Dispatch<React.SetStateAction<number>>
  ) {}

  init = () => {
    // Set videoStream as srcObject
    if (
      this.videoRef.current &&
      (this.fgVideoOptions.isStream ?? defaultFgVideoOptions.isStream) &&
      this.videoStream
    ) {
      this.videoRef.current.srcObject = this.videoStream!;
    }

    // Set initial track statte
    const volumeSliders =
      this.videoContainerRef.current?.querySelectorAll(".volume-slider");

    volumeSliders?.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (this.audioRef.current) {
        sliderElement.value = this.audioRef.current.muted
          ? "0"
          : this.audioRef.current.volume.toString();
      }
    });

    this.videoContainerRef.current?.style.setProperty(
      "--primary-video-color",
      `${
        this.fgVideoOptions.primaryVideoColor ??
        defaultFgVideoOptions.primaryVideoColor
      }`
    );
  };

  onEffectChangeRequested = (event: {
    type: "effectChangeRequested";
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    blockStateChange: boolean;
    data: {
      style: string;
      hideBackgroundStyle?: HideBackgroundEffectTypes;
      hideBackgroundColor?: string;
      postProcessStyle?: PostProcessEffects;
    };
  }) => {
    if (
      this.fgVideoOptions.acceptsVisualEffects &&
      this.type === event.requestedProducerType &&
      this.videoId === event.requestedProducerId
    ) {
      // @ts-expect-error: ts can't verify type, videoId, and effect correlate
      this.currentEffectsStyles.current[this.type][this.videoId][event.effect] =
        event.data.style;

      if (event.effect === "pause") {
        this.setPausedState((prev) => !prev);
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundColor !== undefined
      ) {
        this.userMedia.current.camera[
          this.videoId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
          event.data.hideBackgroundColor
        );
      }

      if (
        event.effect === "hideBackground" &&
        event.data.hideBackgroundStyle !== undefined
      ) {
        this.userMedia.current.camera[
          this.videoId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          event.data.hideBackgroundStyle
        );
      }

      if (
        event.effect === "postProcess" &&
        event.data.postProcessStyle !== undefined
      ) {
        this.userMedia.current[this.type][
          this.videoId
        ].babylonScene.babylonShaderController.swapPostProcessEffects(
          event.data.postProcessStyle
        );
      }

      // @ts-expect-error: ts can't verify type and effect correlate
      this.handleVisualEffectChange(event.effect, event.blockStateChange);
    }
  };

  onClientEffectChanged = (event: {
    type: "clientEffectChanged";
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    effectStyle: string;
    blockStateChange: boolean;
  }) => {
    if (
      !this.fgVideoOptions.isUser &&
      this.username === event.username &&
      this.instance === event.instance &&
      this.type === event.producerType &&
      this.videoId === event.producerId
    ) {
      if (!event.blockStateChange) {
        // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
        this.remoteStreamEffects.current[this.username][this.instance][
          this.type
        ][this.videoId][event.effect] =
          // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
          !this.remoteStreamEffects.current[this.username][this.instance][
            this.type
          ][this.videoId][event.effect];
      }

      // @ts-expect-error: ts can't verify username, instance, videoId, and effect correlate
      this.remoteCurrentEffectsStyles.current[this.username][this.instance][
        this.type
      ][this.videoId][event.effect] = event.effectStyle;

      if (event.effect === "pause") {
        this.setPausedState((prev) => !prev);
      }
    }
  };

  onResponsedCatchUpData = (event: {
    type: "responsedCatchUpData";
    inquiredUsername: string;
    inquiredInstance: string;
    inquiredType: "camera" | "screen";
    inquiredVideoId: string;
    data:
      | {
          cameraPaused: boolean;
          cameraTimeEllapsed: number;
        }
      | {
          screenPaused: boolean;
          screenTimeEllapsed: number;
        }
      | undefined;
  }) => {
    if (
      !this.fgVideoOptions.isUser &&
      this.username === event.inquiredUsername &&
      this.instance === event.inquiredInstance &&
      this.type === event.inquiredType &&
      this.videoId === event.inquiredVideoId &&
      event.data
    ) {
      if (this.type === "camera") {
        if ("cameraPaused" in event.data) {
          if (event.data.cameraPaused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.controls.setInitTimeOffset(event.data.cameraTimeEllapsed);
        }
      } else if (this.type === "screen") {
        if ("screenPaused" in event.data) {
          if (event.data.screenPaused) {
            this.paused.current = !this.paused.current;
            this.setPausedState((prev) => !prev);
          }

          this.controls.setInitTimeOffset(event.data.screenTimeEllapsed);
        }
      }
    }
  };

  handleMessage = (event: FgVideoMessageEvents) => {
    switch (event.type) {
      case "effectChangeRequested":
        this.onEffectChangeRequested(event);
        break;
      case "clientEffectChanged":
        this.onClientEffectChanged(event);
        break;
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
        break;
      default:
        break;
    }
  };

  handleVisibilityChange() {
    if (this.type !== "camera") {
      return;
    }

    if (document.hidden) {
      if (!this.videoContainerRef.current?.classList.contains("paused")) {
        this.controls.handlePausePlay();
      }
    } else {
      if (this.videoContainerRef.current?.classList.contains("paused")) {
        this.controls.handlePausePlay();
      }
    }
  }

  movementDragFunction = (displacement: { x: number; y: number }) => {
    if (!this.bundleRef.current) {
      return;
    }

    const angle = 2 * Math.PI - this.rotation * (Math.PI / 180);

    const pixelScale = {
      x: (this.scale.x / 100) * this.bundleRef.current.clientWidth,
      y: (this.scale.y / 100) * this.bundleRef.current.clientHeight,
    };

    const left =
      displacement.x -
      pixelScale.x * Math.cos(angle) -
      (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle);

    const top =
      displacement.y +
      pixelScale.x * Math.sin(angle) -
      (pixelScale.y / 2) * Math.sin(Math.PI / 2 - angle);

    const isOutside = this.isBoxOutside(
      left,
      top,
      angle,
      pixelScale.x,
      pixelScale.y
    );

    if (!isOutside) {
      this.setPosition({
        left: (left / this.bundleRef.current.clientWidth) * 100,
        top: (top / this.bundleRef.current.clientHeight) * 100,
      });
    } else {
      const isLeftOutside = this.isBoxOutside(
        left,
        (this.position.top / 100) * this.bundleRef.current.clientHeight,
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const { max: leftMax, min: leftMin } = this.getLeftBounds(
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const maxLeft = (leftMax / this.bundleRef.current.clientWidth) * 100;
      const minLeft = (leftMin / this.bundleRef.current.clientWidth) * 100;

      const isTopOutside = this.isBoxOutside(
        (this.position.left / 100) * this.bundleRef.current.clientWidth,
        top,
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const { max: topMax, min: topMin } = this.getTopBounds(
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const maxTop = (topMax / this.bundleRef.current.clientHeight) * 100;
      const minTop = (topMin / this.bundleRef.current.clientHeight) * 100;

      this.setPosition((prev) => {
        if (!this.bundleRef.current) {
          return prev;
        }

        return {
          left:
            (left / this.bundleRef.current.clientWidth) * 100 > maxLeft
              ? maxLeft
              : (left / this.bundleRef.current.clientWidth) * 100 < minLeft
              ? minLeft
              : isLeftOutside
              ? prev.left
              : (left / this.bundleRef.current.clientWidth) * 100,
          top:
            (top / this.bundleRef.current.clientHeight) * 100 > maxTop
              ? maxTop
              : (top / this.bundleRef.current.clientHeight) * 100 < minTop
              ? minTop
              : isTopOutside
              ? prev.top
              : (top / this.bundleRef.current.clientHeight) * 100,
        };
      });
    }
  };

  scaleDragFunction = (displacement: { x: number; y: number }) => {
    if (!this.bundleRef.current) {
      return;
    }

    const referenceX =
      (this.position.left / 100) * this.bundleRef.current.clientWidth;
    const referenceY =
      (this.position.top / 100) * this.bundleRef.current.clientHeight;

    const theta = 2 * Math.PI - this.rotation * (Math.PI / 180);

    const A = { x: Math.cos(theta), y: Math.sin(theta) };
    const B = {
      x: displacement.x - referenceX,
      y: referenceY - displacement.y,
    };

    const ADotB = A.x * B.x + A.y * B.y;

    const AMag = Math.sqrt(A.x * A.x + A.y * A.y);
    const ANorm = { x: A.x / AMag, y: A.y / AMag };
    const BParallel = { x: ANorm.x * ADotB, y: ANorm.y * ADotB };

    const BPerp = {
      x: B.x - BParallel.x,
      y: B.y - BParallel.y,
    };
    const BPerpMag = Math.sqrt(BPerp.x * BPerp.x + BPerp.y * BPerp.y);

    const ACrossB = A.x * B.y - A.y * B.x;

    let height;
    if (ACrossB < 0) {
      height = Math.max(
        2,
        (BPerpMag / this.bundleRef.current.clientHeight) * 100
      );
    } else {
      height = 2;
    }

    const width = Math.max(
      2,
      (ADotB / this.bundleRef.current.clientWidth) * 100
    );

    const isOutside = this.isBoxOutside(
      referenceX,
      referenceY,
      theta,
      ADotB,
      BPerpMag
    );

    if (!isOutside) {
      this.setScale({
        x: width,
        y: height,
      });
    } else {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        ADotB,
        (this.scale.y / 100) * this.bundleRef.current.clientHeight
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxHeight(
            referenceX,
            referenceY,
            theta,
            ADotB,
            (this.scale.y / 100) * this.bundleRef.current.clientHeight
          ) /
            this.bundleRef.current.clientHeight) *
          100;

        this.setScale((prev) => ({
          x: width,
          y: height > maxHeight ? maxHeight : prev.y,
        }));
      } else {
        const isHeightOutside = this.isBoxOutside(
          referenceX,
          referenceY,
          theta,
          (this.scale.x / 100) * this.bundleRef.current.clientWidth,
          BPerpMag
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxWidth(
              referenceX,
              referenceY,
              theta,
              (this.scale.x / 100) * this.bundleRef.current.clientWidth,
              BPerpMag
            ) /
              this.bundleRef.current.clientWidth) *
            100;

          this.setScale((prev) => ({
            x: width > maxWidth ? maxWidth : prev.x,
            y: height,
          }));
        }
      }
    }
  };

  rotateDragFunction = (
    _displacement: { x: number; y: number },
    event: MouseEvent
  ) => {
    if (!this.bundleRef.current) {
      return;
    }

    const bundleRect = this.bundleRef.current.getBoundingClientRect();

    const angle = this.calculateRotationAngle(
      {
        x:
          (this.position.left / 100) * this.bundleRef.current.clientWidth +
          bundleRect.left,
        y:
          (this.position.top / 100) * this.bundleRef.current.clientHeight +
          bundleRect.top,
      },
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    const isOutside = this.isBoxOutside(
      (this.position.left / 100) * this.bundleRef.current.clientWidth,
      (this.position.top / 100) * this.bundleRef.current.clientHeight,
      2 * Math.PI - (angle * Math.PI) / 180,
      (this.scale.x / 100) * this.bundleRef.current.clientWidth,
      (this.scale.y / 100) * this.bundleRef.current.clientHeight
    );

    if (!isOutside) {
      this.setRotation(angle);
    }
  };

  private isBoxOutside = (
    x1: number, // Top-left x-coordinate of Box 2
    y1: number, // Top-left y-coordinate of Box 2
    theta: number, // Rotation in radians
    width: number, // Width of Box 2
    height: number // Height of Box 2
  ) => {
    const corners = [
      [x1, y1], // Top-left
      [x1 + width * Math.cos(theta), y1 - width * Math.sin(theta)], // Top-right
      [
        x1 + width * Math.cos(theta) + height * Math.cos(Math.PI / 2 - theta),
        y1 - width * Math.sin(theta) + height * Math.sin(Math.PI / 2 - theta),
      ], // Bottom-right
      [
        x1 + height * Math.cos(Math.PI / 2 - theta),
        y1 + height * Math.sin(Math.PI / 2 - theta),
      ], // Bottom-left
    ];

    const isOutside = corners.some((corner) => {
      if (!this.bundleRef.current) {
        return true;
      }

      return (
        corner[0] < this.bundleRef.current.clientLeft ||
        corner[0] >
          this.bundleRef.current.clientWidth +
            this.bundleRef.current.clientLeft ||
        corner[1] < this.bundleRef.current.clientTop ||
        corner[1] >
          this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop
      );
    });

    return isOutside;
  };

  private getTopBounds = (
    theta: number,
    width: number,
    height: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryTop = this.bundleRef.current.clientTop;
    const boundaryBottom =
      this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop;

    // Define equations for each corner's y-coordinate
    const topLeftY = (top: number) => top;
    const topRightY = (top: number) => top - width * Math.sin(theta);
    const bottomRightY = (top: number) =>
      top - width * Math.sin(theta) + height * Math.sin(Math.PI / 2 - theta);
    const bottomLeftY = (top: number) =>
      top + height * Math.sin(Math.PI / 2 - theta);

    // Define the constraints for each corner
    const constraints = [
      // Top-left corner
      { min: boundaryTop - topLeftY(0), max: boundaryBottom - topLeftY(0) },

      // Top-right corner
      { min: boundaryTop - topRightY(0), max: boundaryBottom - topRightY(0) },

      // Bottom-right corner
      {
        min: boundaryTop - bottomRightY(0),
        max: boundaryBottom - bottomRightY(0),
      },

      // Bottom-left corner
      {
        min: boundaryTop - bottomLeftY(0),
        max: boundaryBottom - bottomLeftY(0),
      },
    ];

    // Find the intersection of all constraints
    const maxValidTop = Math.min(...constraints.map((c) => c.max));
    const minValidTop = Math.max(...constraints.map((c) => c.min));

    if (maxValidTop < minValidTop) {
      return { max: -1, min: -1 };
    }

    return { max: maxValidTop, min: minValidTop };
  };

  private getLeftBounds = (
    theta: number,
    width: number,
    height: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryLeft = this.bundleRef.current.clientLeft;
    const boundaryRight =
      this.bundleRef.current.clientWidth + this.bundleRef.current.clientLeft;

    // Define equations for each corner's x-coordinate
    const topLeftX = (left: number) => left;
    const topRightX = (left: number) => left + width * Math.cos(theta);
    const bottomRightX = (left: number) =>
      left + width * Math.cos(theta) + height * Math.cos(Math.PI / 2 - theta);
    const bottomLeftX = (left: number) =>
      left + height * Math.cos(Math.PI / 2 - theta);

    // Define the constraints for each corner
    const constraints = [
      // Top-left corner
      { min: boundaryLeft - topLeftX(0), max: boundaryRight - topLeftX(0) },

      // Top-right corner
      { min: boundaryLeft - topRightX(0), max: boundaryRight - topRightX(0) },

      // Bottom-right corner
      {
        min: boundaryLeft - bottomRightX(0),
        max: boundaryRight - bottomRightX(0),
      },

      // Bottom-left corner
      {
        min: boundaryLeft - bottomLeftX(0),
        max: boundaryRight - bottomLeftX(0),
      },
    ];

    // Find the intersection of all constraints
    const maxValidLeft = Math.min(...constraints.map((c) => c.max));
    const minValidLeft = Math.max(...constraints.map((c) => c.min));

    if (maxValidLeft < minValidLeft) {
      return { max: -1, min: -1 };
    }

    return { max: maxValidLeft, min: minValidLeft }; // Return the largest possible left position
  };

  private getMaxWidth = (
    x1: number,
    y1: number,
    theta: number,
    startWidth: number,
    height: number
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(x1, y1, theta, startWidth + i, height);
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(x1, y1, theta, startWidth + i, height);
    }

    return startWidth + i - 1;
  };

  private getMaxHeight = (
    x1: number,
    y1: number,
    theta: number,
    width: number,
    startHeight: number
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(x1, y1, theta, width, startHeight + i);
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(x1, y1, theta, width, startHeight + i);
    }

    return startHeight + i - 1;
  };

  private calculateRotationAngle = (
    topLeft: { x: number; y: number },
    mouse: { x: number; y: number }
  ) => {
    // Calculate the target vector from bottom-left to the mouse
    const targetVectorX = mouse.x - topLeft.x;
    const targetVectorY = mouse.y - topLeft.y;

    // Calculate angles from the x-axis for each vector
    let targetAngle =
      Math.atan2(targetVectorY, targetVectorX) * (180 / Math.PI);

    // Normalize both angles to the range [0, 360)
    if (targetAngle < 0) targetAngle += 360;

    return targetAngle;
  };
}

export default FgVideoController;
