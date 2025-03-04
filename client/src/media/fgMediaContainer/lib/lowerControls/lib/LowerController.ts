import TableStaticContentSocketController from "../../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { TableContentTypes } from "../../../../../serverControllers/tableStaticContentServer/lib/typeConstant";
import FgContentAdjustmentController from "../../../../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import { MediaContainerOptions } from "../../typeConstant";
import {
  reactionsMeta,
  TableReactions,
} from "../../upperControls/lib/reactButton/lib/typeConstant";

class LowerController {
  private moving: boolean = false;
  private scaling: boolean = false;
  private rotating: boolean = false;

  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private mediaId: string,
    private filename: string,
    private kind: TableContentTypes,
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
    }>,
    private aspectRatio: React.MutableRefObject<number | undefined>,
    private setFullScreen: React.Dispatch<React.SetStateAction<boolean>>,
    private mediaContainerOptions: MediaContainerOptions,
    private setDesync: React.Dispatch<React.SetStateAction<boolean>>,
    private setReactionsPanelActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private behindEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private frontEffectsContainerRef: React.RefObject<HTMLDivElement>
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      (!this.mediaContainerRef.current?.classList.contains("in-media") &&
        !this.mediaContainerRef.current?.classList.contains("full-screen")) ||
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
        this.scaling = !this.scaling;
        if (this.scaling) {
          this.scaleFunctionEnd();
        } else {
          this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
            "scale"
          );
          document.addEventListener("pointermove", this.scaleFuntion);
          document.addEventListener("pointerdown", this.scaleFunctionEnd);
        }
        break;
      case "g":
        this.moving = !this.moving;
        if (this.moving) {
          this.moveFunctionEnd();
        } else {
          this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
            "position",
            { rotationPointPlacement: "topLeft" }
          );
          document.addEventListener("pointermove", this.moveFunction);
          document.addEventListener("pointerdown", this.moveFunctionEnd);
        }
        break;
      case "r":
        this.rotating = !this.rotating;
        if (this.rotating) {
          this.rotateFunctionEnd();
        } else {
          this.fgContentAdjustmentController.adjustmentBtnPointerDownFunction(
            "rotation"
          );
          document.addEventListener("pointermove", this.rotateFunction);
          document.addEventListener("pointerdown", this.rotateFunctionEnd);
        }
        break;
      case "h":
        this.handleDesync();
        break;
      case "f":
        this.handleFullScreen();
        break;
      case "q":
        this.handleReact();
        break;
      default:
        break;
    }
  };

  handleDesync = () => {
    this.setDesync((prev) => !prev);
  };

  scaleFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.scaleFuntion);
    document.removeEventListener("pointerdown", this.scaleFunctionEnd);

    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaId,
      { scale: this.positioning.current.scale }
    );
  };

  rotateFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.rotateFunction);
    document.removeEventListener("pointerdown", this.rotateFunctionEnd);

    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaId,
      { rotation: this.positioning.current.rotation }
    );
  };

  moveFunctionEnd = () => {
    this.fgContentAdjustmentController.adjustmentBtnPointerUpFunction();
    document.removeEventListener("pointermove", this.moveFunction);
    document.removeEventListener("pointerdown", this.moveFunctionEnd);

    this.tableStaticContentSocket.current?.updateContentPositioning(
      this.kind,
      this.mediaId,
      { position: this.positioning.current.position }
    );
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
      this.mediaContainerOptions.resizeType ?? "aspect",
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      referencePoint,
      referencePoint,
      this.aspectRatio.current
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
    this.tableStaticContentSocket.current?.deleteContent(
      this.kind,
      this.mediaId,
      this.filename
    );
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.mediaContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
      this.setFullScreen(false);
    } else {
      this.mediaContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.mediaContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
      this.setFullScreen(true);
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.mediaContainerRef.current?.classList.remove("full-screen");
      this.setFullScreen(false);
    }
  };

  handleReact = () => {
    this.setReactionsPanelActive((prev) => !prev);
  };

  handleReaction = (reaction: TableReactions) => {
    const reactionSrc = reactionsMeta[reaction].src;

    const actions = [
      this.explodeReaction,
      this.expandReaction,
      this.hidingReaction,
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    randomAction.call(this, reactionSrc);
  };

  private expandReaction = (reaction: string) => {
    if (!this.frontEffectsContainerRef.current) return;

    this.frontEffectsContainerRef.current.style.zIndex = "100";

    // Number of particles
    const particle = document.createElement("div");
    particle.classList.add(
      Math.random() < 0.5
        ? "expanding-reaction-particle"
        : "expanding-rotating-reaction-particle"
    );
    particle.style.backgroundImage = `url(${reaction})`;

    particle.style.width = `${
      Math.min(
        this.frontEffectsContainerRef.current.clientWidth,
        this.frontEffectsContainerRef.current.clientHeight
      ) / 12
    }px`;
    this.frontEffectsContainerRef.current.appendChild(particle);

    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, 1250);
  };

  private explodeReaction = (reaction: string) => {
    if (!this.frontEffectsContainerRef.current) return;
    if (!this.behindEffectsContainerRef.current) return;

    let behind = false;
    if (Math.random() < 0.5) {
      behind = true;
    }

    for (let i = 0; i < 40; i++) {
      // Number of particles
      const particle = document.createElement("div");
      particle.classList.add("exploding-reaction-particle");
      particle.style.backgroundImage = `url(${reaction})`;

      // Random position and movement
      const angle = Math.random() * Math.PI * 2;
      const distance = behind
        ? Math.random() *
          Math.min(
            this.frontEffectsContainerRef.current.clientWidth,
            this.frontEffectsContainerRef.current.clientHeight
          )
        : (Math.random() *
            Math.min(
              this.frontEffectsContainerRef.current.clientWidth,
              this.frontEffectsContainerRef.current.clientHeight
            )) /
          1.5;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = Math.max(15, Math.random() * 50);
      const rotation = Math.random() * 360;

      particle.style.setProperty("--x", `calc(${x}px - 50%)`);
      particle.style.setProperty("--y", `calc(${y}px - 50%)`);

      particle.style.width = `${size}px`;
      particle.style.rotate = `${rotation}deg`;
      (behind
        ? this.behindEffectsContainerRef.current
        : this.frontEffectsContainerRef.current
      ).appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1250);
    }
  };

  private hidingReaction = (reaction: string) => {
    if (!this.behindEffectsContainerRef.current) return;

    const particle = document.createElement("div");
    particle.classList.add("hiding-reaction-particle");
    particle.style.backgroundImage = `url(${reaction})`;

    particle.style.width = `${
      Math.min(
        this.behindEffectsContainerRef.current.clientWidth,
        this.behindEffectsContainerRef.current.clientHeight
      ) / 1.5
    }px`;
    this.behindEffectsContainerRef.current.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1250);
  };
}

export default LowerController;
