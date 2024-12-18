class FgPortalController {
  private mouseOffsets = {
    topLeft: { left: -8, top: -40 },
    topRight: { left: 12, top: -40 },
    bottomLeft: { left: -8, top: 0 },
    bottomRight: { left: 16, top: 0 },
  };

  constructor(
    private externalRef: React.RefObject<HTMLElement> | undefined,
    private portalRef: React.RefObject<HTMLDivElement>,
    private spacing: number | undefined,
    private type: "above" | "below" | "left" | "right" | "mouse",
    private mouseType: "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
    private setPortalPosition: React.Dispatch<
      React.SetStateAction<{
        left: number;
        top: number;
      } | null>
    >
  ) {}

  getStaticPortalPosition = () => {
    const externalRect = this.externalRef?.current?.getBoundingClientRect();

    if (!externalRect || !this.portalRef.current) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const portalWidth = this.portalRef.current.clientWidth;
    const portalHeight = this.portalRef.current.clientHeight;

    const space = this.spacing ?? 0;

    let top = 0;
    let left = 0;

    if (this.type === "above") {
      top = externalRect.top - portalHeight - space;

      // Check if it goes off the screen above, then switch to below
      if (top < 0) {
        top = externalRect.top + externalRect.height + space;

        // Check if it goes off screen and set to bottom of screen if so
        if (top + this.portalRef.current.clientHeight > viewportHeight) {
          top = viewportHeight - portalHeight;
        }
      }
    } else if (this.type === "below") {
      top = externalRect.top + externalRect.height + space;

      // Check if it goes off the screen below, then switch to above
      if (top + this.portalRef.current.clientHeight > viewportHeight) {
        top = externalRect.top - portalHeight - space;

        // Check if it goes off screen and set to zero if so
        if (top < 0) {
          top = 0;
        }
      }
    } else {
      // Default vertical positioning
      top = externalRect.top + externalRect.height / 2 - portalHeight / 2;

      // Constrain vertically
      if (top < 0) top = 0;
      if (top + portalHeight > viewportHeight)
        top = viewportHeight - portalHeight;
    }

    if (this.type === "left") {
      left = externalRect.left - portalWidth - space;

      // Check if it goes off the screen left, switch to right
      if (left < 0) {
        left = externalRect.left + externalRect.width + space;

        if (left + portalWidth > viewportWidth) {
          left = viewportWidth - portalWidth; // Stick to right edge
        }
      }
    } else if (this.type === "right") {
      left = externalRect.left + externalRect.width + space;

      // Check if it goes off the screen right, switch to left
      if (left + portalWidth > viewportWidth) {
        left = externalRect.left - portalWidth - space;

        if (left < 0) {
          left = 0; // Stick to left edge
        }
      }
    } else {
      // Default horizontal positioning
      left = externalRect.left + externalRect.width / 2 - portalWidth / 2;

      // Constrain horizontally
      if (left < 0) left = 0;
      if (left + portalWidth > viewportWidth)
        left = viewportWidth - portalWidth;
    }

    this.setPortalPosition({
      top: top,
      left: left,
    });
  };

  getDynamicPortalPosition = (event: MouseEvent) => {
    this.setPortalPosition({
      left:
        event.clientX +
        this.mouseOffsets[this.mouseType].left -
        (this.mouseType === "bottomLeft" || this.mouseType === "topLeft"
          ? this.portalRef.current?.clientWidth ?? 0
          : 0),
      top: event.clientY + this.mouseOffsets[this.mouseType].top,
    });
  };
}

export default FgPortalController;
