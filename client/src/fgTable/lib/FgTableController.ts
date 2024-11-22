class FgTableController {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private aspectDir: React.MutableRefObject<"width" | "height">,
    private scrollTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
    private scrollbarTrackRef: React.RefObject<HTMLDivElement>,
    private scrollbarThumbRef: React.RefObject<HTMLDivElement>,
    private dragging: React.MutableRefObject<boolean>,
    private scrollStart: React.MutableRefObject<{
      x: number;
      y: number;
    }>,
    private startScrollPosition: React.MutableRefObject<{
      top: number;
      left: number;
    }>
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

    if (this.aspectDir.current === "width") {
      if (this.scrollbarThumbRef.current) {
        this.scrollbarThumbRef.current.style.width = "100%";
        this.scrollbarThumbRef.current.style.left = "0%";
      }
      this.updateVerticalScrollbar();
    } else {
      if (this.scrollbarThumbRef.current) {
        this.scrollbarThumbRef.current.style.height = "100%";
        this.scrollbarThumbRef.current.style.top = "0%";
      }
      this.updateHorizontalScrollbar();
    }
  };

  updateVerticalScrollbar = () => {
    if (
      !this.remoteVideosContainerRef.current ||
      !this.scrollbarThumbRef.current ||
      !this.scrollbarTrackRef.current
    ) {
      return;
    }

    const contentHeight = this.remoteVideosContainerRef.current.scrollHeight;
    const containerHeight = this.remoteVideosContainerRef.current.clientHeight;

    // Get the track height from the ref (the custom track height set by CSS)
    const trackHeight = this.scrollbarTrackRef.current.clientHeight;

    // Calculate thumb height based on the proportion of content height and track height
    const thumbHeight = Math.max(
      50,
      contentHeight > containerHeight
        ? (trackHeight / contentHeight) * trackHeight // Proportional thumb height
        : trackHeight
    ); // If content is smaller, thumb fills the track height
    this.scrollbarThumbRef.current.style.height = `${thumbHeight}px`;

    // Calculate the thumb position as a ratio of the scroll position to the content height
    const scrollPosition = this.remoteVideosContainerRef.current.scrollTop;

    // Calculate thumb's top position relative to the track
    const thumbPosition =
      (scrollPosition / (contentHeight - containerHeight)) *
      (trackHeight - thumbHeight);

    // Set thumb position within the track
    this.scrollbarThumbRef.current.style.top = `${thumbPosition}px`;
  };

  updateHorizontalScrollbar = () => {
    if (
      !this.remoteVideosContainerRef.current ||
      !this.scrollbarThumbRef.current ||
      !this.scrollbarTrackRef.current
    ) {
      return;
    }

    const contentWidth = this.remoteVideosContainerRef.current.scrollWidth;
    const containerWidth = this.remoteVideosContainerRef.current.clientWidth;

    // Get the track width from the ref (the custom track width set by CSS)
    const trackWidth = this.scrollbarTrackRef.current.clientWidth;

    // Calculate thumb width based on the proportion of content width and track width
    const thumbWidth = Math.max(
      50,
      contentWidth > containerWidth
        ? (trackWidth / contentWidth) * trackWidth // Proportional thumb width
        : trackWidth
    ); // If content is smaller, thumb fills the track width
    this.scrollbarThumbRef.current.style.width = `${thumbWidth}px`;

    // Calculate the thumb position as a ratio of the scroll position to the content width
    const scrollPosition = this.remoteVideosContainerRef.current.scrollLeft;

    // Calculate thumb's left position relative to the track
    const thumbPosition =
      (scrollPosition / (contentWidth - containerWidth)) *
      (trackWidth - thumbWidth);

    // Set thumb position within the track
    this.scrollbarThumbRef.current.style.left = `${thumbPosition}px`;
  };

  thumbDragStart = (event: React.MouseEvent) => {
    this.scrollStart.current = { x: event.clientX, y: event.clientY };
    this.startScrollPosition.current = {
      top: this.remoteVideosContainerRef.current?.scrollTop ?? 0,
      left: this.remoteVideosContainerRef.current?.scrollLeft ?? 0,
    };

    this.dragging.current = true;

    event.preventDefault();

    // Add mousemove and mouseup event listeners to track dragging
    document.addEventListener("mousemove", this.thumbDragMove);
    document.addEventListener("mouseup", this.thumbDragEnd);
  };

  thumbDragMove = (event: MouseEvent) => {
    if (!this.remoteVideosContainerRef.current) return;

    if (this.aspectDir.current === "width") {
      const deltaY = event.clientY - this.scrollStart.current.y;
      const contentHeight = this.remoteVideosContainerRef.current.scrollHeight;
      const containerHeight =
        this.remoteVideosContainerRef.current.clientHeight;

      // Calculate the new scroll position based on mouse movement
      const newScrollTop =
        this.startScrollPosition.current.top +
        (deltaY / containerHeight) * contentHeight;
      // Apply the scroll position to the container
      this.remoteVideosContainerRef.current.scrollTop = newScrollTop;

      // Update the scrollbar thumb position
      this.updateVerticalScrollbar();
    } else {
      const deltaX = event.clientX - this.scrollStart.current.x;
      const contentWidth = this.remoteVideosContainerRef.current.scrollWidth;
      const containerWidth = this.remoteVideosContainerRef.current.clientWidth;

      // Calculate the new scroll position based on mouse movement
      const newScrollLeft =
        this.startScrollPosition.current.left +
        (deltaX / containerWidth) * contentWidth;
      // Apply the scroll position to the container
      this.remoteVideosContainerRef.current.scrollLeft = newScrollLeft;

      // Update the scrollbar thumb position
      this.updateHorizontalScrollbar();
    }
  };

  thumbDragEnd = () => {
    this.dragging.current = false;

    // Remove mousemove and mouseup listeners
    document.removeEventListener("mousemove", this.thumbDragMove);
    document.removeEventListener("mouseup", this.thumbDragEnd);
  };

  horizontalScrollWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (
      this.aspectDir.current === "width" ||
      !this.remoteVideosContainerRef.current
    ) {
      return;
    }

    this.remoteVideosContainerRef.current.scrollLeft += event.deltaY;
  };

  scrollFunction = () => {
    if (this.aspectDir.current === "width") {
      this.updateVerticalScrollbar();
    } else {
      this.updateHorizontalScrollbar();
    }

    this.tableRef.current?.classList.remove("hide-fg-scrollbar");

    if (this.scrollTimeout.current) {
      clearTimeout(this.scrollTimeout.current);
      this.scrollTimeout.current = undefined;
    }

    if (!this.dragging.current) {
      this.scrollTimeout.current = setTimeout(() => {
        this.tableRef.current?.classList.add("hide-fg-scrollbar");
      }, 750);
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
