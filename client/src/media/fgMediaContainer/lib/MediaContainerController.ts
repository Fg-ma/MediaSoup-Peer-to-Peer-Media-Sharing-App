import { MediaContainerOptions } from "./typeConstant";
import { IncomingMediasoupMessages } from "../../../serverControllers/mediasoupServer/lib/typeConstant";
import {
  RemoteDataStreamsType,
  UserDataStreamsType,
} from "../../../context/mediaContext/lib/typeConstant";
import TableStaticContentSocketController from "../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import {
  IncomingTableMessages,
  onReactionOccurredType,
} from "../../../serverControllers/tableServer/lib/typeConstant";
import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import LowerController from "./lowerControls/lib/LowerController";
import {
  onGroupDragEndType,
  onGroupDragStartType,
  onGroupDragType,
  GroupSignals,
  onGroupDeleteType,
  MediaPositioningSignals,
  onMoveToType,
  onRotateToType,
  onScaleToType,
} from "../../../context/signalContext/lib/typeConstant";
import FgContentAdjustmentController from "../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";

class MediaContainerController {
  groupStartDragPosition: { x: number; y: number } | undefined;
  savedMediaPosition: { top: number; left: number } | undefined;

  hoveringOver = {
    main: false,
    pan: false,
    scale: false,
    rotate: false,
  };

  constructor(
    private tableId: React.MutableRefObject<string>,
    private mediaIdRef: React.MutableRefObject<string>,
    private mediaInstanceId: string,
    private kind: StaticContentTypes,
    private getAspect: (() => number | undefined) | undefined,
    private setPositioning:
      | ((positioning: {
          position: {
            left: number;
            top: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }) => void)
      | undefined,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private aspectRatio: React.MutableRefObject<number | undefined>,
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
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,
    private mediaContainerRef: React.RefObject<HTMLDivElement>,
    private mediaContainerOptions: MediaContainerOptions,
    private setInMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private lowerController: React.MutableRefObject<LowerController>,
    private fgContentAdjustmentController: React.MutableRefObject<FgContentAdjustmentController | null>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private sendGroupSignal: (signal: GroupSignals) => void,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private adjustmentButtonsActive: React.MutableRefObject<boolean>,
    private setReactionsPanelActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
  ) {}

  handlePointerMove = (e: Event, type: "main" | "scale" | "pan" | "rotate") => {
    const event = e as PointerEvent;

    this.setInMedia(true);

    const container = this.mediaContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX;
      const rightEdge = rect.left + rect.width;
      const right10Threshold = rightEdge - rect.width * 0.1;

      const isInRight10Percent = mouseX >= right10Threshold;

      if (isInRight10Percent && !this.adjustmentButtonsActive.current) {
        this.adjustmentButtonsActive.current = true;
        this.setRerender((prev) => !prev);
      } else if (!isInRight10Percent && this.adjustmentButtonsActive.current) {
        this.adjustmentButtonsActive.current = false;
        this.setRerender((prev) => !prev);
      }
    }

    if (this.movementTimeout.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    if (
      type === "main" &&
      Object.values(this.hoveringOver).filter((val) => val).length === 1 &&
      !this.movementTimeout.current
    ) {
      this.movementTimeout.current = setTimeout(() => {
        this.setInMedia(false);

        if (this.movementTimeout.current) {
          clearTimeout(this.movementTimeout.current);
          this.movementTimeout.current = undefined;
        }
      }, 3500);
    }
  };

  handlePointerEnter = (
    type: "main" | "scale" | "pan" | "rotate",
    ref: React.RefObject<HTMLDivElement> | React.RefObject<HTMLButtonElement>,
  ) => {
    this.hoveringOver[type] = true;

    this.setInMedia(true);

    ref.current?.addEventListener("pointermove", (e) =>
      this.handlePointerMove(e, type),
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeave = (
    type: "main" | "scale" | "pan" | "rotate",
    ref: React.RefObject<HTMLDivElement> | React.RefObject<HTMLButtonElement>,
  ) => {
    this.hoveringOver[type] = false;

    ref.current?.removeEventListener("pointermove", (e) =>
      this.handlePointerMove(e, type),
    );

    if (this.movementTimeout.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    if (
      !Object.values(this.hoveringOver).some((val) => val) &&
      !this.leaveTimer.current
    ) {
      this.leaveTimer.current = setTimeout(() => {
        this.setInMedia(false);

        if (this.leaveTimer.current) {
          clearTimeout(this.leaveTimer.current);
          this.leaveTimer.current = undefined;
        }
      }, this.mediaContainerOptions.controlsVanishTime);
    }
  };

  handleTableScroll = () => {
    this.setReactionsPanelActive(false);
  };

  downloadListener = (
    message: { type: "downloadComplete" } | { type: string },
  ) => {
    switch (message.type) {
      case "downloadComplete":
        if (this.getAspect) {
          this.aspectRatio.current = this.getAspect();

          if (this.aspectRatio.current) {
            this.positioning.current.scale.y =
              this.positioning.current.scale.x / this.aspectRatio.current;

            this.setRerender((prev) => !prev);

            this.tableStaticContentSocket.current?.updateContentPositioning(
              this.kind,
              this.mediaIdRef.current,
              this.mediaInstanceId,
              { position: this.positioning.current.position },
            );
          }

          setTimeout(() => {
            this.sendGroupSignal({ type: "groupUpdate" });
          }, 0);
        }
        break;
      case "contentReloaded":
        if (this.getAspect) {
          this.aspectRatio.current = this.getAspect();

          if (this.aspectRatio.current) {
            this.positioning.current.scale.y =
              this.positioning.current.scale.x / this.aspectRatio.current;

            this.setRerender((prev) => !prev);

            this.tableStaticContentSocket.current?.updateContentPositioning(
              this.kind,
              this.mediaIdRef.current,
              this.mediaInstanceId,
              { position: this.positioning.current.position },
            );
          }

          setTimeout(() => {
            this.sendGroupSignal({ type: "groupUpdate" });
          }, 0);
        }
        break;
      default:
        break;
    }
  };

  handleMediasoupMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "newConsumerWasCreated":
        if (event.header.producerType == "json")
          this.attachPositioningListeners();
        break;
      default:
        break;
    }
  };

  attachPositioningListeners = () => {
    Object.values(this.positioningListeners.current).forEach((userListners) =>
      Object.values(userListners).forEach((removeListener) => removeListener()),
    );
    this.positioningListeners.current = {};

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
              data.tableId === this.tableId.current &&
              data.kind === this.kind &&
              data.mediaId === this.mediaIdRef.current &&
              data.mediaInstanceId === this.mediaInstanceId
            ) {
              this.positioning.current = data.positioning;
              if (this.setPositioning) this.setPositioning(data.positioning);
              this.setRerender((prev) => !prev);
              this.sendGroupSignal({
                type: "groupElementMove",
                data: {
                  contentType: this.kind,
                  instanceId: this.mediaInstanceId,
                },
              });
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
    const { contentType, contentId, instanceId } = event.header;
    const { reaction, reactionStyle } = event.data;

    if (
      contentType === this.kind &&
      contentId === this.mediaIdRef.current &&
      instanceId === this.mediaInstanceId
    ) {
      this.lowerController.current.reactController.handleReaction(
        reaction,
        false,
        reactionStyle,
      );
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

  onGroupDragStart = (signal: onGroupDragStartType) => {
    const { affected, startDragPosition } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.mediaInstanceId && item.type === this.kind,
      )
    )
      return;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "position",
      { rotationPointPlacement: "topLeft" },
    );

    this.groupStartDragPosition = startDragPosition;
    this.savedMediaPosition = this.positioning.current.position;
  };

  onGroupDrag = (signal: onGroupDragType) => {
    const { affected, dragPosition } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.mediaInstanceId && item.type === this.kind,
      ) ||
      !this.groupStartDragPosition ||
      !this.savedMediaPosition ||
      !this.bundleRef.current
    )
      return;

    this.fgContentAdjustmentController.current?.movementDragFunction(
      {
        x:
          ((this.savedMediaPosition.left +
            dragPosition.x -
            this.groupStartDragPosition.x) /
            100) *
          this.bundleRef.current.clientWidth,
        y:
          ((this.savedMediaPosition.top +
            dragPosition.y -
            this.groupStartDragPosition.y) /
            100) *
          this.bundleRef.current.clientHeight,
      },
      { x: 0, y: 0 },
      {
        x:
          (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        y:
          (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight,
      },
    );
  };

  onGroupDragEnd = (signal: onGroupDragEndType) => {
    const { affected } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.mediaInstanceId && item.type === this.kind,
      )
    )
      return;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();

    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaIdRef.current,
      this.mediaInstanceId,
      { position: this.positioning.current.position },
    );

    this.groupStartDragPosition = undefined;
    this.savedMediaPosition = undefined;
  };

  onGroupDelete = (signal: onGroupDeleteType) => {
    const { affected } = signal.data;

    if (
      !affected.some(
        (item) => item.id === this.mediaInstanceId && item.type === this.kind,
      )
    )
      return;

    this.lowerController.current.handleClose();
  };

  handleGroupSignal = (signal: GroupSignals) => {
    switch (signal.type) {
      case "groupDelete":
        this.onGroupDelete(signal);
        break;
      case "groupDragStart":
        this.onGroupDragStart(signal);
        break;
      case "groupDrag":
        this.onGroupDrag(signal);
        break;
      case "groupDragEnd":
        this.onGroupDragEnd(signal);
        break;
      default:
        break;
    }
  };

  private sendUpdatePosition = () => {
    if (
      this.userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      this.userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          tableId: this.tableId.current,
          kind: this.kind,
          mediaId: this.mediaIdRef.current,
          mediaInstanceId: this.mediaInstanceId,
          positioning: this.positioning.current,
        }),
      );
      if (this.setPositioning) this.setPositioning(this.positioning.current);
    }
  };

  handleMoveTo = (signal: onMoveToType) => {
    const { instanceId, contentType } = signal.header;

    if (instanceId !== this.mediaInstanceId || contentType !== this.kind)
      return;

    const { position } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
      "position",
      { rotationPointPlacement: "topLeft" },
    );

    this.fgContentAdjustmentController.current?.movementTo(
      {
        x: (position.x / 100) * (this.bundleRef.current?.clientWidth ?? 1),
        y: (position.y / 100) * (this.bundleRef.current?.clientHeight ?? 1),
      },
      {
        x:
          (this.positioning.current.position.left / 100) *
          (this.bundleRef.current?.clientWidth ?? 1),
        y:
          (this.positioning.current.position.top / 100) *
          (this.bundleRef.current?.clientHeight ?? 1),
      },
    );

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaIdRef.current,
      this.mediaInstanceId,
      { position: this.positioning.current.position },
    );

    this.sendUpdatePosition();
  };

  handleRotateTo = (signal: onRotateToType) => {
    const { instanceId, contentType } = signal.header;

    if (
      !this.bundleRef.current ||
      instanceId !== this.mediaInstanceId ||
      contentType !== this.kind
    )
      return;

    const { rotation } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();

    const box = this.bundleRef.current.getBoundingClientRect();

    this.fgContentAdjustmentController.current?.rotateTo(rotation, {
      x:
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth +
        box.left,
      y:
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight +
        box.top,
    });

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaIdRef.current,
      this.mediaInstanceId,
      { rotation: this.positioning.current.rotation },
    );

    this.sendUpdatePosition();
  };

  handleScaleTo = (signal: onScaleToType) => {
    const { instanceId, contentType } = signal.header;

    if (
      !this.bundleRef.current ||
      instanceId !== this.mediaInstanceId ||
      contentType !== this.kind
    )
      return;

    const { scale } = signal.data;

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction();

    const referencePoint = {
      x:
        (this.positioning.current.position.left / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.position.top / 100) *
        this.bundleRef.current.clientHeight,
    };

    this.fgContentAdjustmentController.current?.scaleTo(
      this.mediaContainerOptions.resizeType ?? "aspect",
      scale,
      referencePoint,
      referencePoint,
      this.aspectRatio.current,
    );

    this.fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction();
    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaIdRef.current,
      this.mediaInstanceId,
      { scale: this.positioning.current.scale },
    );

    this.sendUpdatePosition();
  };

  handleMediaPositioningSignal = (signal: MediaPositioningSignals) => {
    switch (signal.type) {
      case "moveTo":
        this.handleMoveTo(signal);
        break;
      case "rotateTo":
        this.handleRotateTo(signal);
        break;
      case "scaleTo":
        this.handleScaleTo(signal);
        break;
      default:
        break;
    }
  };
}

export default MediaContainerController;
