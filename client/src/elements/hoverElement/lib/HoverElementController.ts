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
    }
  };

  handlePointerLeave = () => {
    this.setIsHover(false);
    if (this.hoverTimeout.current !== undefined) {
      clearTimeout(this.hoverTimeout.current);
      this.hoverTimeout.current = undefined;
    }
  };

  handleVisibilityChange = () => {
    if (this.hoverTimeout.current) {
      clearTimeout(this.hoverTimeout.current);
      this.hoverTimeout.current = undefined;
    }
    this.setIsHover(false);
  };

  handleScroll = () => {
    if (this.hoverTimeout.current) {
      clearTimeout(this.hoverTimeout.current);
      this.hoverTimeout.current = undefined;
    }
    this.setIsHover(false);
  };
}

export default HoverElementController;
