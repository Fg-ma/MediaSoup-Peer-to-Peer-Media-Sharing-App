class FgScrollbarController {
  constructor(
    private containerRef: React.RefObject<HTMLDivElement>,
    private direction: "vertical" | "horizontal",
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
    event.preventDefault();
    event.stopPropagation();

    this.scrollStart.current = { x: event.clientX, y: event.clientY };
    this.startScrollPosition.current = {
      top: this.remoteVideosContainerRef.current?.scrollTop ?? 0,
      left: this.remoteVideosContainerRef.current?.scrollLeft ?? 0,
    };

    this.dragging.current = true;

    // Add mousemove and mouseup event listeners to track dragging
    document.addEventListener("mousemove", this.thumbDragMove);
    document.addEventListener("mouseup", this.thumbDragEnd);
  };

  thumbDragMove = (event: MouseEvent) => {
    if (!this.remoteVideosContainerRef.current) return;

    if (this.direction === "vertical") {
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

  horizontalScrollWheel = (event: WheelEvent) => {
    if (
      this.direction === "vertical" ||
      !this.remoteVideosContainerRef.current
    ) {
      return;
    }

    this.remoteVideosContainerRef.current.scrollLeft += event.deltaY;
  };

  trackMouseDown = (event: React.MouseEvent) => {
    if (
      !this.remoteVideosContainerRef.current ||
      !this.scrollbarTrackRef.current ||
      !this.scrollbarThumbRef.current
    ) {
      return;
    }

    const track = this.scrollbarTrackRef.current;
    const container = this.remoteVideosContainerRef.current;
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

    this.containerRef.current?.classList.remove("hide-fg-scrollbar");

    if (this.scrollTimeout.current) {
      clearTimeout(this.scrollTimeout.current);
      this.scrollTimeout.current = undefined;
    }

    if (!this.dragging.current) {
      this.scrollTimeout.current = setTimeout(() => {
        this.containerRef.current?.classList.add("hide-fg-scrollbar");
      }, 750);
    }
  };
}

export default FgScrollbarController;
