import TableStaticContentSocketController from "../../../../lib/TableStaticContentSocketController";
import FgContentAdjustmentController from "../../../../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import { MediaKinds } from "../../typeConstant";

class LowerController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private mediaId: string,
    private filename: string,
    private kind: MediaKinds,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private mediaContainerRef: React.RefObject<HTMLDivElement>,
    private panBtnRef: React.RefObject<HTMLButtonElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
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
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.mediaContainerRef.current?.classList.contains("in-media") ||
      this.mediaContainerRef.current?.classList.contains("in-piano") ||
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
      case "x":
        this.handleClose();
        break;
      case "delete":
        this.handleClose();
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
      case "h":
        this.handleDesync();
        break;
      default:
        break;
    }
  };

  handleDesync = () => {};

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
      "aspect",
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

  handleClose = () => {
    if (this.kind === "image" || this.kind === "video") {
      this.tableStaticContentSocket.current?.deleteContent(
        this.kind,
        this.mediaId,
        this.filename
      );
    }
  };
}

export default LowerController;
