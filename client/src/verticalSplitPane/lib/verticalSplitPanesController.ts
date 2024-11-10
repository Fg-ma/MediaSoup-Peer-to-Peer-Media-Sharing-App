import { VerticalSplitPanesOptions } from "../VerticalSplitPanes";

class VerticalSplitPanesController {
  constructor(
    private verticalSplitPanesOptions: VerticalSplitPanesOptions,
    private paneHeight: string,
    private setPaneHeight: React.Dispatch<React.SetStateAction<string>>,
    private setHeaderLightness: React.Dispatch<React.SetStateAction<number>>,
    private verticalSplitPanesRef: React.RefObject<HTMLDivElement>,
    private isResizing: React.MutableRefObject<boolean>,
    private startMousePosition: React.MutableRefObject<number>,
    private startPaneHeight: React.MutableRefObject<number>,
    private maxPaneHeightCallback?: () => void,
    private minPaneHeightCallback?: () => void,
    private panelSizeChangeCallback?: () => void
  ) {}

  // Handles softly lowering and raising the pane height when togglePaneHeight is called
  animateTogglePaneHeight = (targetHeight: number, duration = 500) => {
    const start = Date.now();
    const initialHeight = parseFloat(this.paneHeight) || 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - start) / duration);

      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

      const newPaneHeight =
        initialHeight + (targetHeight - initialHeight) * easedProgress;

      this.setPaneHeight(`${newPaneHeight}%`);
      this.setHeaderLightness(this.getLightness(newPaneHeight));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  handleMove = (clientY: number) => {
    if (this.isResizing.current) {
      const containerHeight = this.verticalSplitPanesRef.current?.offsetHeight;

      if (!containerHeight) {
        return;
      }

      const mouseYDelta = clientY - this.startMousePosition.current;

      // Adjust the speed by fiddling with the sensitivity factor
      const sensitivityFactor = 1;
      let newPaneHeight =
        this.startPaneHeight.current +
        (mouseYDelta / containerHeight) * 100 * sensitivityFactor;

      // Cap the newPaneHeight to a maximum value
      newPaneHeight = Math.min(
        newPaneHeight,
        this.verticalSplitPanesOptions.maxPaneHeight
      );
      newPaneHeight = Math.max(
        newPaneHeight,
        this.verticalSplitPanesOptions.minPaneHeight
      );

      if (
        this.maxPaneHeightCallback &&
        newPaneHeight === this.verticalSplitPanesOptions.maxPaneHeight
      ) {
        this.maxPaneHeightCallback();
      }

      if (
        this.minPaneHeightCallback &&
        newPaneHeight === this.verticalSplitPanesOptions.minPaneHeight
      ) {
        this.minPaneHeightCallback();
      }

      // Calculate lightness based on the percentage of newPaneHeight
      const lightness = this.getLightness(newPaneHeight);

      this.setPaneHeight(`${newPaneHeight}%`);
      this.setHeaderLightness(lightness);

      if (this.panelSizeChangeCallback) {
        this.panelSizeChangeCallback();
      }
    }
  };

  handleTouchUp = () => {
    this.isResizing.current = false;

    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchUp);
  };

  handleMouseUp = () => {
    this.isResizing.current = false;

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleTouchDown = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing.current = true;
    this.startMousePosition.current = event.touches[0].clientY;
    this.startPaneHeight.current = parseFloat(this.paneHeight) || 0;

    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchUp);
  };

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing.current = true;
    this.startMousePosition.current = event.clientY;
    this.startPaneHeight.current = parseFloat(this.paneHeight) || 0;

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = (event: MouseEvent) => {
    this.handleMove(event.clientY);
  };

  handleTouchMove = (event: TouchEvent) => {
    this.handleMove(event.touches[0].clientY);
  };

  togglePaneHeight = () => {
    const newHeight = parseFloat(this.paneHeight) < 100 ? "100%" : "79%";
    this.animateTogglePaneHeight(parseFloat(newHeight));
  };

  getLightness = (height: number) => {
    let lightness = Math.max(
      52,
      this.verticalSplitPanesOptions.maxPaneHeight - height * 0.75
    );
    lightness = Math.min(60, lightness);
    return lightness;
  };
}

export default VerticalSplitPanesController;
