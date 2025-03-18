import { FgButtonOptions } from "../FgButton";

class FgButtonController {
  constructor(
    private fgButtonOptions: FgButtonOptions,
    private clickFunction: ((event: React.MouseEvent) => void) | undefined,
    private pointerDownFunction:
      | ((event: React.PointerEvent) => void)
      | undefined,
    private pointerUpFunction: ((event: PointerEvent) => void) | undefined,
    private doubleClickFunction:
      | ((event: React.MouseEvent) => void)
      | undefined,
    private holdFunction: ((event: PointerEvent) => void) | undefined,
    private dragFunction:
      | ((
          displacement: {
            x: number;
            y: number;
          },
          event: PointerEvent
        ) => void)
      | undefined,
    private toggleHold: (event: PointerEvent) => void,
    private togglePopup: (event: PointerEvent) => void,
    private hoverContent: React.ReactElement | undefined,
    private toggleClickContent: React.ReactElement | undefined,
    private clickTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private holdTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private hoverTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private isClicked: React.MutableRefObject<boolean>,
    private setIsClickToggle: React.Dispatch<React.SetStateAction<boolean>>,
    private setExternalClickToggleState:
      | React.Dispatch<React.SetStateAction<boolean>>
      | undefined,
    private isClickToggle: boolean,
    private setIsHeld: React.Dispatch<React.SetStateAction<boolean>>,
    private isHeldRef: React.MutableRefObject<boolean>,
    private setIsHeldToggle: React.Dispatch<React.SetStateAction<boolean>>,
    private setIsHover: React.Dispatch<React.SetStateAction<boolean>>,
    private startDragPosition: React.MutableRefObject<
      | {
          x: number;
          y: number;
        }
      | undefined
    >,
    private buttonRef: React.RefObject<HTMLButtonElement>,
    private externalRef: React.RefObject<HTMLButtonElement> | undefined,
    private scrollingContainerRef: React.RefObject<HTMLDivElement> | undefined,
    private referenceDragElement: React.RefObject<HTMLElement> | undefined
  ) {}

  handlePointerDown = (event: React.PointerEvent) => {
    window.addEventListener("pointerup", this.handlePointerUp);

    this.isClicked.current = true;

    if (this.pointerDownFunction) {
      this.pointerDownFunction(event);
    }

    if (this.holdFunction && this.clickTimeout.current === undefined) {
      this.holdTimeout.current = setTimeout(() => {
        this.isHeldRef.current = true;
        this.setIsHeld(true);
        if (this.fgButtonOptions.holdKind === "toggle") {
          this.setIsHeldToggle(true);
          window.addEventListener("pointerdown", this.toggleHold);
        }
      }, this.fgButtonOptions.holdTimeoutDuration);
    }

    if (this.dragFunction) {
      this.startDragPosition.current = { x: event.clientX, y: event.clientY };
      window.addEventListener("pointermove", this.handleDragPointerMove);
    }
  };

  private handlePointerUp = (event: PointerEvent) => {
    window.removeEventListener("pointerup", this.handlePointerUp);

    if (this.toggleClickContent) {
      if (!this.isClickToggle) {
        if (this.fgButtonOptions.toggleClickCloseWhenOutside) {
          window.addEventListener("pointerup", this.togglePopup);
        }
      }
      this.setIsClickToggle((prev) => !prev);
      if (this.setExternalClickToggleState)
        this.setExternalClickToggleState((prev) => !prev);
    }

    if (this.pointerUpFunction) {
      this.pointerUpFunction(event);
    }

    if (this.isClicked.current && this.clickTimeout.current === undefined) {
      if (!this.isHeldRef.current) {
        if (this.doubleClickFunction) {
          this.clickTimeout.current = setTimeout(() => {
            if (this.clickFunction)
              this.clickFunction(event as unknown as React.MouseEvent);
            if (this.clickTimeout.current !== undefined) {
              clearTimeout(this.clickTimeout.current);
              this.clickTimeout.current = undefined;
            }
          }, this.fgButtonOptions.doubleClickTimeoutDuration);
        } else {
          if (this.clickFunction) {
            this.clickFunction(event as unknown as React.MouseEvent);
          }
        }
      } else {
        if (this.holdFunction) {
          this.holdFunction(event);
        }
      }

      if (this.holdTimeout.current !== undefined) {
        clearTimeout(this.holdTimeout.current);
        this.holdTimeout.current = undefined;
      }

      this.isHeldRef.current = false;
      this.setIsHeld(false);
      this.isClicked.current = false;
    }

    if (this.dragFunction) {
      window.removeEventListener("pointermove", this.handleDragPointerMove);
    }
  };

  handleDoubleClick = (event: React.MouseEvent) => {
    if (this.clickTimeout.current) {
      clearTimeout(this.clickTimeout.current);
      this.clickTimeout.current = undefined;
    }
    if (this.doubleClickFunction) {
      this.doubleClickFunction(event);
    }
    this.isClicked.current = false;
  };

  handlePointerEnter = () => {
    if (this.hoverContent && !this.hoverTimeout.current) {
      this.hoverTimeout.current = setTimeout(() => {
        this.setIsHover(true);
      }, this.fgButtonOptions.hoverTimeoutDuration);

      document.addEventListener("pointermove", this.handlePointerMove);
    }
  };

  handlePointerMove = (event: PointerEvent) => {
    const buttonElement = this.externalRef?.current || this.buttonRef.current;

    if (buttonElement && !buttonElement.contains(event.target as Node)) {
      this.setIsHover(false);
      if (this.hoverTimeout.current !== undefined) {
        clearTimeout(this.hoverTimeout.current);
        this.hoverTimeout.current = undefined;
      }

      document.removeEventListener("pointermove", this.handlePointerMove);
    }
  };

  handleDragPointerMove = (event: PointerEvent) => {
    event.stopPropagation();
    if (
      this.dragFunction === undefined ||
      this.startDragPosition.current === undefined
    ) {
      return;
    }

    if (this.referenceDragElement?.current) {
      const rect = this.referenceDragElement.current.getBoundingClientRect();
      this.dragFunction(
        {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
        event
      );
    } else {
      this.dragFunction(
        {
          x: event.clientX - this.startDragPosition.current.x,
          y: event.clientY - this.startDragPosition.current.y,
        },
        event
      );

      this.startDragPosition.current = { x: event.clientX, y: event.clientY };
    }
  };

  handleVisibilityChange = () => {
    clearTimeout(this.hoverTimeout.current);
    this.setIsHover(false);
  };

  handleScrollingContainerScroll = (event: Event) => {
    this.setIsHeld(false);
    this.setIsHeldToggle(false);
    this.handlePointerMove(event as unknown as PointerEvent);
  };
}

export default FgButtonController;
