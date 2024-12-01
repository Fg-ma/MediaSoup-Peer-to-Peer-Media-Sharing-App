class FgTableController {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private aspectDir: React.MutableRefObject<"width" | "height">,
    private scrollTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
    private dragging: React.MutableRefObject<boolean>
  ) {}

  hideTableScrollBar = (event: MouseEvent) => {
    const container = this.tableRef.current;

    if (!container || this.dragging.current) return;

    const rect = container.getBoundingClientRect();

    if (this.aspectDir.current === "width") {
      // Check if the mouse is within 50px of the right edge of the container
      if (rect.right - event.clientX <= 50) {
        container.classList.remove("hide-fg-scrollbar");
      } else {
        if (
          !container.classList.contains("hide-fg-scrollbar") &&
          !this.scrollTimeout.current
        ) {
          container.classList.add("hide-fg-scrollbar");
        }
      }
    } else {
      // Check if the mouse is within 50px of the right edge of the container
      if (rect.bottom - event.clientY <= 50) {
        container.classList.remove("hide-fg-scrollbar");
      } else {
        if (
          !container.classList.contains("hide-fg-scrollbar") &&
          !this.scrollTimeout.current
        ) {
          container.classList.add("hide-fg-scrollbar");
        }
      }
    }
  };

  getAspectDir = () => {
    if (!this.remoteVideosContainerRef.current) {
      return;
    }

    if (
      this.remoteVideosContainerRef.current.clientWidth >=
      this.remoteVideosContainerRef.current.clientHeight
    ) {
      if (this.aspectDir.current !== "width") {
        this.aspectDir.current = "width";
        this.setRerender((prev) => !prev);
      }
    } else {
      if (this.aspectDir.current !== "height") {
        this.aspectDir.current = "height";
        this.setRerender((prev) => !prev);
      }
    }
  };

  mouseLeaveFunction = () => {
    if (this.dragging.current) {
      return;
    }

    if (this.scrollTimeout.current) {
      clearTimeout(this.scrollTimeout.current);
      this.scrollTimeout.current = undefined;
    }

    if (
      this.tableRef.current &&
      !this.tableRef.current.classList.contains("hide-fg-scrollbar")
    ) {
      this.tableRef.current.classList.add("hide-fg-scrollbar");
    }
  };
}

export default FgTableController;
