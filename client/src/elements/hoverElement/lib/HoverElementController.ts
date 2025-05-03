import { HoverElementOptions } from "../HoverElement";

class HoverElementController {
  constructor(
    private hoverElementOptions: HoverElementOptions,
    private hoverContent: React.ReactElement | undefined,
    private hoverTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private setIsHover: React.Dispatch<React.SetStateAction<boolean>>,
    private hoverContainerRef: React.RefObject<HTMLDivElement>,
  ) {}

  handlePointerEnter = () => {
    if (this.hoverContent && !this.hoverTimeout.current) {
      this.hoverTimeout.current = setTimeout(() => {
        this.setIsHover(true);
      }, this.hoverElementOptions.hoverTimeoutDuration);

      document.addEventListener("pointermove", this.handlePointerMove);
    }
  };

  handlePointerMove = (event: PointerEvent) => {
    if (!this.hoverContainerRef.current?.contains(event.target as Node)) {
      this.setIsHover(false);
      if (this.hoverTimeout.current !== undefined) {
        clearTimeout(this.hoverTimeout.current);
        this.hoverTimeout.current = undefined;
      }

      document.removeEventListener("pointermove", this.handlePointerMove);
    }
  };

  handleVisibilityChange = () => {
    if (this.hoverTimeout.current) {
      this.hoverTimeout.current = undefined;
      clearTimeout(this.hoverTimeout.current);
    }
    this.setIsHover(false);
  };
}

export default HoverElementController;
