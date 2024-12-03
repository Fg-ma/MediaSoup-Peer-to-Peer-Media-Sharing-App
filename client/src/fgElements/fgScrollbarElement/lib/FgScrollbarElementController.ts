class FgScrollbarController {
  private scrollTimeoutTime = 1250;

  constructor(
    private scrollingContentRef: React.RefObject<HTMLDivElement>,
    private scrollbarElementRef: React.RefObject<HTMLDivElement>,
    private scrollbarRef: React.RefObject<HTMLDivElement>,
    private scrollbarTrackRef: React.RefObject<HTMLDivElement>,
    private scrollbarThumbRef: React.RefObject<HTMLDivElement>,
    private scrollTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private direction: "vertical" | "horizontal",
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

  updateVerticalScrollbar = () => {
    if (
      !this.scrollingContentRef.current ||
      !this.scrollbarThumbRef.current ||
      !this.scrollbarTrackRef.current ||
      !this.scrollbarRef.current
    ) {
      return;
    }

    const contentHeight = this.scrollingContentRef.current.scrollHeight;
    const containerHeight = this.scrollingContentRef.current.clientHeight;

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
    const scrollPosition = this.scrollingContentRef.current.scrollTop;

    // Calculate thumb's top position relative to the track
    const thumbPosition =
      (scrollPosition / (contentHeight - containerHeight)) *
      (trackHeight - thumbHeight);

    // Set thumb position within the track
    this.scrollbarThumbRef.current.style.top = `${thumbPosition}px`;
  };

  updateHorizontalScrollbar = () => {
    if (
      !this.scrollingContentRef.current ||
      !this.scrollbarThumbRef.current ||
      !this.scrollbarTrackRef.current ||
      !this.scrollbarRef.current
    ) {
      return;
    }

    const contentWidth = this.scrollingContentRef.current.scrollWidth;
    const containerWidth = this.scrollingContentRef.current.clientWidth;

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
    const scrollPosition = this.scrollingContentRef.current.scrollLeft;

    // Calculate thumb's left position relative to the track
    const thumbPosition =
      (scrollPosition / (contentWidth - containerWidth)) *
      (trackWidth - thumbWidth);

    // Set thumb position within the track
    this.scrollbarThumbRef.current.style.left = `${thumbPosition}px`;
  };

  thumbDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.scrollStart.current = { x: event.clientX, y: event.clientY };
    this.startScrollPosition.current = {
      top: this.scrollingContentRef.current?.scrollTop ?? 0,
      left: this.scrollingContentRef.current?.scrollLeft ?? 0,
    };

    this.dragging.current = true;

    // Add mousemove and mouseup event listeners to track dragging
    document.addEventListener("mousemove", this.thumbDragMove);
    document.addEventListener("mouseup", this.thumbDragEnd);
  };

  thumbDragMove = (event: MouseEvent) => {
    if (!this.scrollingContentRef.current) return;

    if (this.direction === "vertical") {
      const deltaY = event.clientY - this.scrollStart.current.y;
      const contentHeight = this.scrollingContentRef.current.scrollHeight;
      const containerHeight = this.scrollingContentRef.current.clientHeight;

      // Calculate the new scroll position based on mouse movement
      const newScrollTop =
        this.startScrollPosition.current.top +
        (deltaY / containerHeight) * contentHeight;
      // Apply the scroll position to the container
      this.scrollingContentRef.current.scrollTop = newScrollTop;

      // Update the scrollbar thumb position
      this.updateVerticalScrollbar();
    } else {
      const deltaX = event.clientX - this.scrollStart.current.x;
      const contentWidth = this.scrollingContentRef.current.scrollWidth;
      const containerWidth = this.scrollingContentRef.current.clientWidth;

      // Calculate the new scroll position based on mouse movement
      const newScrollLeft =
        this.startScrollPosition.current.left +
        (deltaX / containerWidth) * contentWidth;

      // Apply the scroll position to the container
      this.scrollingContentRef.current.scrollLeft = newScrollLeft;

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

  horizontalScrollWheel = (event: WheelEvent) => {
    if (this.direction === "vertical" || !this.scrollingContentRef.current) {
      return;
    }

    this.scrollingContentRef.current.scrollLeft += event.deltaY;
  };

  trackMouseDown = (event: React.MouseEvent) => {
    if (
      !this.scrollingContentRef.current ||
      !this.scrollbarTrackRef.current ||
      !this.scrollbarThumbRef.current
    ) {
      return;
    }

    const track = this.scrollbarTrackRef.current;
    const container = this.scrollingContentRef.current;
    const thumb = this.scrollbarThumbRef.current;

    if (this.direction === "vertical") {
      // Handle vertical scrolling
      const trackRect = track.getBoundingClientRect();
      const thumbHeight = thumb.offsetHeight;

      // Calculate click position relative to track and adjust for thumb center
      const clickY = event.clientY - trackRect.top;
      const thumbCenter = clickY - thumbHeight / 2;

      const contentHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;
      const maxThumbTop = trackRect.height - thumbHeight;

      // Clamp the thumb position within track bounds
      const clampedThumbTop = Math.max(0, Math.min(thumbCenter, maxThumbTop));

      // Convert thumb position to scroll position
      const scrollRatio = clampedThumbTop / maxThumbTop;
      const newScrollTop = scrollRatio * (contentHeight - containerHeight);

      // Update the scroll position of the container
      container.scrollTop = newScrollTop;

      // Update the scrollbar thumb position
      this.updateVerticalScrollbar();
    } else {
      // Handle horizontal scrolling
      const trackRect = track.getBoundingClientRect();
      const thumbWidth = thumb.offsetWidth;

      // Calculate click position relative to track and adjust for thumb center
      const clickX = event.clientX - trackRect.left;
      const thumbCenter = clickX - thumbWidth / 2;

      const contentWidth = container.scrollWidth;
      const containerWidth = container.clientWidth;
      const maxThumbLeft = trackRect.width - thumbWidth;

      // Clamp the thumb position within track bounds
      const clampedThumbLeft = Math.max(0, Math.min(thumbCenter, maxThumbLeft));

      // Convert thumb position to scroll position
      const scrollRatio = clampedThumbLeft / maxThumbLeft;
      const newScrollLeft = scrollRatio * (contentWidth - containerWidth);

      // Update the scroll position of the container
      container.scrollLeft = newScrollLeft;

      // Update the scrollbar thumb position
      this.updateHorizontalScrollbar();
    }

    // Start thumb draging behavior after click
    this.thumbDragStart(event);
  };

  scrollFunction = () => {
    if (this.direction === "vertical") {
      this.updateVerticalScrollbar();
    } else {
      this.updateHorizontalScrollbar();
    }

    this.scrollbarElementRef.current?.classList.remove("hide-fg-scrollbar");

    if (this.scrollTimeout.current) {
      clearTimeout(this.scrollTimeout.current);
      this.scrollTimeout.current = undefined;
    }

    if (!this.dragging.current) {
      this.scrollTimeout.current = setTimeout(() => {
        this.scrollbarElementRef.current?.classList.add("hide-fg-scrollbar");

        clearTimeout(this.scrollTimeout.current);
        this.scrollTimeout.current = undefined;
      }, this.scrollTimeoutTime);
    }
  };

  hideTableScrollBar = (event: React.MouseEvent) => {
    if (!this.scrollbarElementRef.current || this.dragging.current) return;

    const rect = this.scrollbarElementRef.current.getBoundingClientRect();

    if (this.direction === "vertical") {
      // Check if the mouse is within 40px of the right edge of the container
      if (rect.right - event.clientX <= 40) {
        this.scrollbarElementRef.current.classList.remove("hide-fg-scrollbar");
      } else {
        if (
          !this.scrollbarElementRef.current.classList.contains(
            "hide-fg-scrollbar"
          ) &&
          !this.scrollTimeout.current
        ) {
          this.scrollTimeout.current = setTimeout(() => {
            this.scrollbarElementRef.current?.classList.add(
              "hide-fg-scrollbar"
            );

            clearTimeout(this.scrollTimeout.current);
            this.scrollTimeout.current = undefined;
          }, this.scrollTimeoutTime);
        }
      }
    } else {
      // Check if the mouse is within 40px of the right edge of the container
      if (rect.bottom - event.clientY <= 40) {
        this.scrollbarElementRef.current.classList.remove("hide-fg-scrollbar");
      } else {
        if (
          !this.scrollbarElementRef.current.classList.contains(
            "hide-fg-scrollbar"
          ) &&
          !this.scrollTimeout.current
        ) {
          this.scrollTimeout.current = setTimeout(() => {
            this.scrollbarElementRef.current?.classList.add(
              "hide-fg-scrollbar"
            );

            clearTimeout(this.scrollTimeout.current);
            this.scrollTimeout.current = undefined;
          }, this.scrollTimeoutTime);
        }
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
      this.scrollbarElementRef.current &&
      !this.scrollbarElementRef.current.classList.contains("hide-fg-scrollbar")
    ) {
      this.scrollbarElementRef.current.classList.add("hide-fg-scrollbar");
    }
  };
}

export default FgScrollbarController;
