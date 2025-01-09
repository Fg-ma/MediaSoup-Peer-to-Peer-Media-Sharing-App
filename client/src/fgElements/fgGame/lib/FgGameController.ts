import { RemoteDataStreamsType } from "../../../context/mediaContext/typeConstant";
import FgContentAdjustmentController from "../../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import MediasoupSocketController, {
  IncomingMediasoupMessages,
  onRequestedGameCatchUpDataType,
  onResponsedGameCatchUpDataType,
} from "../../../lib/MediasoupSocketController";

class FgGameController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private table_id: string,
    private gameId: string,
    private hideControls: boolean,
    private gameStarted: boolean,
    private setHideControls: React.Dispatch<React.SetStateAction<boolean>>,
    private pointerLeaveHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private pointerStillHideControlsTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private gameRef: React.RefObject<HTMLDivElement>,
    private closeGameFunction: (() => void) | undefined,
    private startGameFunction: (() => void) | undefined,
    private joinGameFunction: (() => void) | undefined,
    private leaveGameFunction: (() => void) | undefined,
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
    private sharedBundleRef: React.RefObject<HTMLDivElement>,
    private panBtnRef: React.RefObject<HTMLButtonElement>,
    private fgContentAdjustmentController: FgContentAdjustmentController,
    private popupRefs: React.RefObject<HTMLElement>[] | undefined
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (this.hideControls || event.target instanceof HTMLInputElement) return;

    switch (event.key.toLowerCase()) {
      case "p":
        if (this.startGameFunction) {
          this.startGameFunction();
        }
        break;
      case "l":
        if (this.leaveGameFunction) {
          this.leaveGameFunction();
        }
        break;
      case "j":
        if (this.joinGameFunction) {
          this.joinGameFunction();
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
      case "y":
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
      "square",
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
    const { inquiringUsername, inquiringInstance, gameId } = event.header;

    if (gameId === this.gameId) {
      this.mediasoupSocket.current?.sendMessage({
        type: "responseGameCatchUpData",
        header: {
          table_id: this.table_id,
          inquiringUsername,
          inquiringInstance,
          gameId,
        },
        data: {
          positioning: this.positioning.current,
        },
      });
    }
  };

  onResponsedGameCatchUpData = (event: onResponsedGameCatchUpDataType) => {
    const { gameId } = event.header;
    const { positioning } = event.data;

    if (gameId === this.gameId) {
      this.positioning.current = positioning;
      this.setRerender((prev) => !prev);
    }
  };

  handleMessage = (event: IncomingMediasoupMessages) => {
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

  handlePointerLeave = () => {
    if (!this.pointerLeaveHideControlsTimeout.current) {
      this.pointerLeaveHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.pointerLeaveHideControlsTimeout.current);
        this.pointerLeaveHideControlsTimeout.current = undefined;

        this.setHideControls(true);

        if (this.popupRefs) {
          this.popupRefs.map((ref) => {
            if (!ref.current?.classList.contains("hide-controls"))
              ref.current?.classList.add("hide-controls");
          });
        }
      }, 1250);
    }

    if (this.pointerStillHideControlsTimeout.current) {
      clearTimeout(this.pointerStillHideControlsTimeout.current);
      this.pointerStillHideControlsTimeout.current = undefined;
    }
  };

  handlePointerEnter = () => {
    this.setHideControls(false);

    if (this.popupRefs) {
      this.popupRefs.map((ref) =>
        ref.current?.classList.remove("hide-controls")
      );
    }

    if (this.pointerLeaveHideControlsTimeout.current) {
      clearTimeout(this.pointerLeaveHideControlsTimeout.current);
      this.pointerLeaveHideControlsTimeout.current = undefined;
    }

    if (this.gameStarted) {
      this.pointerStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.pointerStillHideControlsTimeout.current);
        this.pointerStillHideControlsTimeout.current = undefined;

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

  handlePointerMove = (event: React.PointerEvent) => {
    this.setHideControls(false);
    if (this.popupRefs) {
      this.popupRefs.map((ref) =>
        ref.current?.classList.remove("hide-controls")
      );
    }

    if (this.pointerStillHideControlsTimeout.current) {
      clearTimeout(this.pointerStillHideControlsTimeout.current);
      this.pointerStillHideControlsTimeout.current = undefined;
    }

    const target = event.target;

    if (
      (this.gameStarted &&
        target &&
        this.gameRef.current?.contains(target as Node)) ||
      (this.popupRefs &&
        this.popupRefs.some((ref) => ref.current?.contains(target as Node)))
    ) {
      this.pointerStillHideControlsTimeout.current = setTimeout(() => {
        clearTimeout(this.pointerStillHideControlsTimeout.current);
        this.pointerStillHideControlsTimeout.current = undefined;

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
