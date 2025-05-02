import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { Permissions } from "../../../context/permissionsContext/typeConstant";
import {
  IncomingMediasoupMessages,
  onResponsedCatchUpDataType,
} from "../../../serverControllers/mediasoupServer/lib/typeConstant";
import ReactController from "../../../elements/reactButton/lib/ReactController";
import TableSocketController from "../../../serverControllers/tableServer/TableSocketController";
import {
  IncomingTableMessages,
  onReactionOccurredType,
} from "../../../serverControllers/tableServer/lib/typeConstant";
import MediasoupSocketController from "../../../serverControllers/mediasoupServer/MediasoupSocketController";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";

class FgAudioElementContainerController {
  reactController: ReactController;

  constructor(
    private isUser: boolean,
    private tableId: string,
    private username: string,
    private instance: string,
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
    private permissions: Permissions,
    private remoteDataStreams: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          positionScaleRotation?: DataConsumer | undefined;
        };
      };
    }>,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableSocket: React.MutableRefObject<
      TableSocketController | undefined
    >,
    private behindEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private frontEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private audioContainerRef: React.RefObject<HTMLDivElement>,
    private setAudioEffectsSectionVisible: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private handleDisableEnableBtns: (disabled: boolean) => void,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    private fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>,
    private bundleRef: React.RefObject<HTMLDivElement>,
  ) {
    this.reactController = new ReactController(
      `audio_${this.tableId}_${this.username}_${this.instance}`,
      undefined,
      "audio",
      this.behindEffectsContainerRef,
      this.frontEffectsContainerRef,
      this.tableSocket,
    );
  }

  onResponsedCatchUpData = (event: onResponsedCatchUpDataType) => {
    const { inquiredUsername, inquiredInstance, inquiredType } = event.header;

    if (
      !this.isUser &&
      this.username === inquiredUsername &&
      this.instance === inquiredInstance &&
      inquiredType === "audio" &&
      event.data &&
      Object.keys(event.data.positioning).length !== 0
    ) {
      this.positioning.current = event.data.positioning;
    }
  };

  onNewConsumerWasCreated = () => {
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
              data.tableId === this.tableId &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === "audio"
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

  handleMediasoupMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
        break;
      case "newConsumerWasCreated":
        this.onNewConsumerWasCreated();
        break;
      default:
        break;
    }
  };

  attachListeners = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (stream) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              this.permissions.acceptsAudioEffects &&
              data.tableId === this.tableId &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === "audio"
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

  reactionOccurred = (event: onReactionOccurredType) => {
    const { contentType, contentId } = event.header;
    const { reaction, reactionStyle } = event.data;

    if (
      contentType === "audio" &&
      contentId === `audio_${this.tableId}_${this.username}_${this.instance}`
    ) {
      this.reactController.handleReaction(reaction, false, reactionStyle);
    }
  };

  handleTableMessage = (event: IncomingTableMessages) => {
    switch (event.type) {
      case "reactionOccurred":
        this.reactionOccurred(event);
        break;
      default:
        break;
    }
  };

  handleToggleAudioEffectsSection = () => {
    this.setAudioEffectsSectionVisible((prev) => !prev);
  };

  handleClose = () => {
    if (!this.tableId || !this.username) {
      console.error("Missing tableId or username!");
      return;
    }

    if (this.isUser) {
      this.handleDisableEnableBtns(true);
      this.isAudio.current = false;
      this.setAudioActive(false);

      this.mediasoupSocket.current?.sendMessage({
        type: "removeProducer",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: "audio",
        },
      });
    } else {
      this.mediasoupSocket.current?.sendMessage({
        type: "requestRemoveProducer",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: "audio",
        },
      });
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.audioContainerRef.current?.classList.contains(
        "in-audio-container",
      ) ||
      event.shiftKey ||
      event.ctrlKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    switch (event.key.toLowerCase()) {
      case "e":
        this.handleToggleAudioEffectsSection();
        break;
      case "x":
        this.handleClose();
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

    const pixelScale = {
      x:
        (this.positioning.current.scale.x / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.scale.y / 100) *
        this.bundleRef.current.clientHeight,
    };

    const rect = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.current?.movementDragFunction(
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      {
        x: 0,
        y: -(pixelScale.y / 2),
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
            this.bundleRef.current.clientHeight +
          pixelScale.y / 2,
      },
    );

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "position",
      { rotationPointPlacement: "middleLeft" },
    );
  };

  scaleFuntion = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const rect = this.bundleRef.current.getBoundingClientRect();

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

    this.fgContentAdjustmentController.current?.scaleDragFunction(
      "square",
      {
        x: event.clientX - rect.left + Math.sin(angle) * (pixelScale.x / 2),
        y: event.clientY - rect.top + Math.cos(angle) * (pixelScale.y / 2),
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight,
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
            this.bundleRef.current.clientHeight +
          pixelScale.y / 2,
      },
    );

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "scale",
    );
  };

  rotateFunction = (event: PointerEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const pixelScale = {
      x:
        (this.positioning.current.scale.x / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.scale.y / 100) *
        this.bundleRef.current.clientHeight,
    };

    const box = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.current?.rotateDragFunction(event, {
      x:
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight +
        box.top +
        pixelScale.y / 2,
    });
    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();
  };
}

export default FgAudioElementContainerController;
