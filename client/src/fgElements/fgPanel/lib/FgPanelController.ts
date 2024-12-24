class FgPanelController {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setPosition: React.Dispatch<
      React.SetStateAction<{
        x?: number;
        y?: number;
      }>
    >,
    private size: {
      width: string;
      height: string;
    },
    private setSize: React.Dispatch<
      React.SetStateAction<{
        width: string;
        height: string;
      }>
    >,
    private setFocus: React.Dispatch<React.SetStateAction<boolean>>,
    private setFocusClicked: React.Dispatch<React.SetStateAction<boolean>>,
    private panelRef: React.RefObject<HTMLDivElement>,
    private containerRef: React.RefObject<HTMLDivElement>,
    private closeButtonRef: React.RefObject<HTMLButtonElement>,
    private isDragging: React.MutableRefObject<boolean>,
    private startPosition: React.MutableRefObject<{
      x: number;
      y: number;
    }>,
    private isResizing: React.MutableRefObject<boolean>,
    private resizingDirection: React.MutableRefObject<
      "se" | "sw" | "ne" | "nw" | undefined
    >,
    private minWidth: number,
    private minHeight: number,
    private closeCallback: (() => void) | undefined,
    private panelBoundariesRef?: React.RefObject<HTMLDivElement>,
    private panelBoundariesScrollingContainerRef?: React.RefObject<HTMLDivElement>,
    private panelInsertionPointRef?: React.RefObject<HTMLDivElement>
  ) {}

  handlePointerMove = (event: React.PointerEvent | PointerEvent) => {
    if (this.isDragging.current && !this.isResizing.current) {
      if (!this.panelRef.current) {
        return;
      }

      const rect = this.panelRef.current.getBoundingClientRect();

      // Calculate the new position
      let newX =
        event.clientX -
        this.startPosition.current.x +
        (this.panelBoundariesScrollingContainerRef &&
        this.panelBoundariesScrollingContainerRef.current
          ? this.panelBoundariesScrollingContainerRef.current.scrollLeft
          : 0);
      let newY =
        event.clientY -
        this.startPosition.current.y +
        (this.panelBoundariesScrollingContainerRef &&
        this.panelBoundariesScrollingContainerRef.current
          ? this.panelBoundariesScrollingContainerRef.current.scrollTop
          : 0);
      const panelBoundaries =
        this.panelBoundariesRef?.current?.getBoundingClientRect();

      // Constrain the new position to the screen boundaries
      const maxX =
        (panelBoundaries ? panelBoundaries.width : window.innerWidth) -
        rect.width; // Maximum X position
      const maxY =
        (panelBoundaries ? panelBoundaries.height : window.innerHeight) -
        rect.height; // Maximum Y position

      newX = Math.max(0, Math.min(newX, maxX)); // Keep X within 0 and maxX
      newY = Math.max(0, Math.min(newY, maxY)); // Keep Y within 0 and maxY

      this.setPosition({
        x: newX,
        y: newY,
      });
    } else if (this.isResizing.current && !this.isDragging.current) {
      if (!this.panelRef.current) {
        return;
      }

      const rect = this.panelRef.current.getBoundingClientRect();
      const panelBoundaries =
        this.panelBoundariesRef?.current?.getBoundingClientRect();

      const maxWidth =
        (panelBoundaries
          ? panelBoundaries.width + panelBoundaries.left
          : window.innerWidth) - rect.left;
      const maxHeight =
        (panelBoundaries
          ? panelBoundaries.height + panelBoundaries.top
          : window.innerHeight) - rect.top;

      const minX = panelBoundaries?.left ?? 0;
      const minY = panelBoundaries?.top ?? 0;

      const newSize = { ...this.size };

      switch (this.resizingDirection.current) {
        case "se":
          newSize.width = `${Math.min(
            Math.max(this.minWidth, event.clientX - rect.left),
            maxWidth
          )}px`;
          newSize.height = `${Math.min(
            Math.max(this.minHeight, event.clientY - rect.top),
            maxHeight
          )}px`;
          break;
        case "sw":
          newSize.width = `${Math.min(
            Math.max(this.minWidth, rect.right - event.clientX),
            rect.right - minX
          )}px`;
          newSize.height = `${Math.min(
            Math.max(this.minHeight, event.clientY - rect.top),
            maxHeight
          )}px`;
          if (rect.right - event.clientX > this.minWidth) {
            this.setPosition((prev) => ({
              ...prev,
              x: Math.max(0, event.clientX - minX),
            }));
          }
          break;
        case "nw":
          newSize.width = `${Math.min(
            Math.max(this.minWidth, rect.right - event.clientX),
            rect.right - minX
          )}px`;
          newSize.height = `${Math.min(
            Math.max(this.minHeight, rect.bottom - event.clientY),
            rect.bottom - minY
          )}px`;
          this.setPosition((prev) => {
            const newPosition = { ...prev };

            if (rect.right - event.clientX > this.minWidth) {
              newPosition.x = Math.max(0, event.clientX - minX);
            }
            if (rect.bottom - event.clientY > this.minHeight) {
              newPosition.y = Math.max(0, event.clientY - minY);
            }

            return newPosition;
          });
          break;
        case "ne":
          newSize.width = `${Math.min(
            Math.max(this.minWidth, event.clientX - rect.left),
            maxWidth
          )}px`;
          newSize.height = `${Math.min(
            Math.max(this.minHeight, rect.bottom - event.clientY),
            rect.bottom - minY
          )}px`;
          if (rect.bottom - event.clientY > this.minHeight) {
            this.setPosition((prev) => ({
              ...prev,
              y: Math.max(0, event.clientY - minY),
            }));
          }
          break;
      }

      this.setSize(newSize);
    }
  };

  handlePointerUp = () => {
    document.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerup", this.handlePointerUp);

    this.isDragging.current = false;
    this.isResizing.current = false;

    this.setRerender((prev) => !prev);
  };

  handleResizePointerDown = (
    event: React.PointerEvent,
    direction: "se" | "sw" | "ne" | "nw"
  ) => {
    event.preventDefault();

    document.addEventListener("pointermove", this.handlePointerMove);
    document.addEventListener("pointerup", this.handlePointerUp);

    this.isResizing.current = true;
    this.resizingDirection.current = direction;
  };

  handleDragPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();

    if (
      event.target === this.containerRef.current ||
      this.containerRef.current?.contains(event.target as Node) ||
      this.closeButtonRef.current?.contains(event.target as Node)
    ) {
      return;
    }

    document.addEventListener("pointermove", this.handlePointerMove);
    document.addEventListener("pointerup", this.handlePointerUp);

    this.isDragging.current = true;

    if (this.panelRef.current) {
      const rect = this.panelRef.current.getBoundingClientRect();
      const insertionPointRect =
        this.panelInsertionPointRef?.current?.getBoundingClientRect();
      this.startPosition.current = {
        x:
          event.clientX -
          rect.left +
          (insertionPointRect ? insertionPointRect.left : 0),
        y:
          event.clientY -
          rect.top +
          (insertionPointRect ? insertionPointRect.top : 0),
      };
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.closeCallback || event.target instanceof HTMLInputElement) return;

    const key = event.key.toLowerCase();
    if (["x", "delete", "escape"].includes(key)) {
      this.closeCallback();
    }
  };

  handlePanelClick = (event: PointerEvent) => {
    if (this.panelRef.current) {
      const value = this.panelRef.current.contains(event.target as Node);
      this.setFocus(value);
      this.setFocusClicked(value);
    }
  };
}

export default FgPanelController;
