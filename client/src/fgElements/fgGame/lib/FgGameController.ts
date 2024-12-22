import { Socket } from "socket.io-client";
import { RemoteDataStreamsType } from "../../../context/mediaContext/typeConstant";
import FgContentAdjustmentController from "../../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";

type Messages =
  | onNewConsumerWasCreatedType
  | onRequestedGameCatchUpDataType
  | onResponsedGameCatchUpDataType;

type onNewConsumerWasCreatedType = { type: "newConsumerWasCreated" };

type onRequestedGameCatchUpDataType = {
  type: "requestedGameCatchUpData";
  inquiringUsername: string;
  inquiringInstance: string;
  gameId: string;
};

type onResponsedGameCatchUpDataType = {
  type: "responsedGameCatchUpData";
  gameId: string;
  positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };
};

class FgGameController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: string,
    private gameId: string,
    private gameStarted: boolean,
    private setFocus: React.Dispatch<React.SetStateAction<boolean>>,
    private setFocusClicked: React.Dispatch<React.SetStateAction<boolean>>,
    private focusClicked: boolean,
    private setHideControls: React.Dispatch<React.SetStateAction<boolean>>,
    private mouseLeaveHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private mouseStillHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private gameRef: React.RefObject<HTMLDivElement>,
    private closeGameFunction: (() => void) | undefined,
    private startGameFunction: (() => void) | undefined,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
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
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private panBtnRef: React.RefObject<HTMLButtonElement>,
    private fgContentAdjustmentController: FgContentAdjustmentController,
    private popupRefs: React.RefObject<HTMLElement>[] | undefined
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (!focus || event.target instanceof HTMLInputElement) return;

    switch (event.key.toLowerCase()) {
      case "p":
        if (this.startGameFunction) {
          this.startGameFunction();
        }
        break;
      case "x":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "delete":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "escape":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "s":
        this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
          "scale"
        );
        document.addEventListener("mousemove", this.scaleFuntion);
        document.addEventListener("mousedown", this.scaleFunctionEnd);
        break;
      case "g":
        this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
          "position",
          { rotationPointPlacement: "topLeft" }
        );
        document.addEventListener("mousemove", this.moveFunction);
        document.addEventListener("mousedown", this.moveFunctionEnd);
        break;
      case "r":
        this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
          "rotation"
        );
        document.addEventListener("mousemove", this.rotateFunction);
        document.addEventListener("mousedown", this.rotateFunctionEnd);
        break;
      default:
        break;
    }
  };

  scaleFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnMouseUpFunction();
    document.removeEventListener("mousemove", this.scaleFuntion);
    document.removeEventListener("mousedown", this.scaleFunctionEnd);
  };

  rotateFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnMouseUpFunction();
    document.removeEventListener("mousemove", this.rotateFunction);
    document.removeEventListener("mousedown", this.rotateFunctionEnd);
  };

  moveFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnMouseUpFunction();
    document.removeEventListener("mousemove", this.moveFunction);
    document.removeEventListener("mousedown", this.moveFunctionEnd);
  };

  moveFunction = (event: MouseEvent) => {
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
    this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction();
  };

  scaleFuntion = (event: MouseEvent) => {
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
    this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction();
  };

  rotateFunction = (event: MouseEvent) => {
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
    this.fgContentAdjustmentController.adjustmentBtnMouseDownFunction();
  };

  handleGameClick = (event: React.MouseEvent) => {
    if (this.gameRef.current) {
      const value = this.gameRef.current.contains(event.target as Node);
      this.setFocus(value);
      this.setFocusClicked(value);
    }
  };

  attachPositioningListeners = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (
          stream &&
          (!this.positioningListeners.current[remoteUsername] ||
            !this.positioningListeners.current[remoteUsername][remoteInstance])
        ) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              data.table_id === this.table_id &&
              data.gameId === this.gameId &&
              data.type === "games"
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
            }
          };

          stream.on("message", handleMessage);

          // Store cleanup function
          if (!this.positioningListeners.current[remoteUsername]) {
            this.positioningListeners.current[remoteUsername] = {};
          }
          this.positioningListeners.current[remoteUsername][remoteInstance] =
            () => stream.off("message", handleMessage);
        }
      }
    }
  };

  onRequestedGameCatchUpData = (event: onRequestedGameCatchUpDataType) => {
    const { inquiringUsername, inquiringInstance, gameId } = event;

    if (gameId === this.gameId) {
      const msg = {
        type: "responseGameCatchUpData",
        table_id: this.table_id,
        inquiringUsername,
        inquiringInstance,
        gameId,
        positioning: this.positioning.current,
      };
      this.socket.current.send(msg);
    }
  };

  onResponsedGameCatchUpData = (event: onResponsedGameCatchUpDataType) => {
    const { gameId, positioning } = event;

    if (gameId === this.gameId) {
      this.positioning.current = positioning;
      this.setRerender((prev) => !prev);
    }
  };

  handleMessage = (event: Messages) => {
    switch (event.type) {
      case "newConsumerWasCreated":
        this.attachPositioningListeners();
        break;
      case "requestedGameCatchUpData":
        this.onRequestedGameCatchUpData(event);
        break;
      case "responsedGameCatchUpData":
        this.onResponsedGameCatchUpData(event);
        break;
      default:
        break;
    }
  };

  handleMouseLeave = () => {
    if (!this.focusClicked) {
      this.setFocus(false);
    }

    if (!this.mouseLeaveHideControlsTimeout.current) {
      this.mouseLeaveHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseLeaveHideControlsTimeout.current);
        this.mouseLeaveHideControlsTimeout.current = undefined;

        this.setHideControls(true);

        if (this.popupRefs) {
          this.popupRefs.map((ref) => {
            if (!ref.current?.classList.contains("hide-controls"))
              ref.current?.classList.add("hide-controls");
          });
        }
      }, 1250);
    }

    if (this.mouseStillHideControlsTimeout.current) {
      clearTimeout(this.mouseStillHideControlsTimeout.current);
      this.mouseStillHideControlsTimeout.current = undefined;
    }
  };

  handleMouseEnter = () => {
    this.setFocus(true);
    this.setHideControls(false);

    if (this.popupRefs) {
      this.popupRefs.map((ref) =>
        ref.current?.classList.remove("hide-controls")
      );
    }

    if (this.mouseLeaveHideControlsTimeout.current) {
      clearTimeout(this.mouseLeaveHideControlsTimeout.current);
      this.mouseLeaveHideControlsTimeout.current = undefined;
    }

    if (this.gameStarted) {
      this.mouseStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseStillHideControlsTimeout.current);
        this.mouseStillHideControlsTimeout.current = undefined;

        this.setHideControls(true);

        if (this.popupRefs) {
          this.popupRefs.map((ref) => {
            if (!ref.current?.classList.contains("hide-controls"))
              ref.current?.classList.add("hide-controls");
          });
        }
      }, 1250);
    }
  };

  handleMouseMove = (event: React.MouseEvent) => {
    this.setHideControls(false);
    if (this.popupRefs) {
      this.popupRefs.map((ref) =>
        ref.current?.classList.remove("hide-controls")
      );
    }

    if (this.mouseStillHideControlsTimeout.current) {
      clearTimeout(this.mouseStillHideControlsTimeout.current);
      this.mouseStillHideControlsTimeout.current = undefined;
    }

    const target = event.target;

    if (
      (this.gameStarted &&
        target &&
        this.gameRef.current?.contains(target as Node)) ||
      (this.popupRefs &&
        this.popupRefs.some((ref) => ref.current?.contains(target as Node)))
    ) {
      this.mouseStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.mouseStillHideControlsTimeout.current);
        this.mouseStillHideControlsTimeout.current = undefined;

        this.setHideControls(true);

        if (this.popupRefs) {
          this.popupRefs.map((ref) => {
            if (!ref.current?.classList.contains("hide-controls"))
              ref.current?.classList.add("hide-controls");
          });
        }
      }, 1250);
    }
  };
}

export default FgGameController;
