class FgAdjustmentVideoController {
  constructor(
    private setAdjustingDimensions: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  movementDragFunction = (displacement: { x: number; y: number }) => {
    if (!this.bundleRef.current) {
      return;
    }

    const angle =
      2 * Math.PI - this.positioning.current.rotation * (Math.PI / 180);

    const pixelScale = {
      x:
        (this.positioning.current.scale.x / 100) *
        this.bundleRef.current.clientWidth,
      y:
        (this.positioning.current.scale.y / 100) *
        this.bundleRef.current.clientHeight,
    };

    const left =
      displacement.x -
      15 -
      pixelScale.x * Math.cos(angle) -
      (pixelScale.y / 2) * Math.cos(Math.PI / 2 - angle);

    const top =
      displacement.y +
      pixelScale.x * Math.sin(angle) -
      (pixelScale.y / 2) * Math.sin(Math.PI / 2 - angle);

    const isOutside = this.isBoxOutside(
      left,
      top,
      angle,
      pixelScale.x,
      pixelScale.y
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        position: {
          left: (left / this.bundleRef.current.clientWidth) * 100,
          top: (top / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    } else {
      const isLeftOutside = this.isBoxOutside(
        left,
        (this.positioning.current.position.top / 100) *
          this.bundleRef.current.clientHeight,
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const { max: leftMax, min: leftMin } = this.getLeftBounds(
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const maxLeft = (leftMax / this.bundleRef.current.clientWidth) * 100;
      const minLeft = (leftMin / this.bundleRef.current.clientWidth) * 100;

      const isTopOutside = this.isBoxOutside(
        (this.positioning.current.position.left / 100) *
          this.bundleRef.current.clientWidth,
        top,
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const { max: topMax, min: topMin } = this.getTopBounds(
        angle,
        pixelScale.x,
        pixelScale.y
      );

      const maxTop = (topMax / this.bundleRef.current.clientHeight) * 100;
      const minTop = (topMin / this.bundleRef.current.clientHeight) * 100;

      this.positioning.current = {
        ...this.positioning.current,
        position: {
          left:
            (left / this.bundleRef.current.clientWidth) * 100 > maxLeft
              ? maxLeft
              : (left / this.bundleRef.current.clientWidth) * 100 < minLeft
              ? minLeft
              : isLeftOutside
              ? this.positioning.current.position.left
              : (left / this.bundleRef.current.clientWidth) * 100,
          top:
            (top / this.bundleRef.current.clientHeight) * 100 > maxTop
              ? maxTop
              : (top / this.bundleRef.current.clientHeight) * 100 < minTop
              ? minTop
              : isTopOutside
              ? this.positioning.current.position.top
              : (top / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    }
  };

  scaleDragFunction = (displacement: { x: number; y: number }) => {
    if (!this.bundleRef.current) {
      return;
    }

    const referenceX =
      (this.positioning.current.position.left / 100) *
      this.bundleRef.current.clientWidth;
    const referenceY =
      (this.positioning.current.position.top / 100) *
      this.bundleRef.current.clientHeight;

    let theta =
      2 * Math.PI - this.positioning.current.rotation * (Math.PI / 180);
    if (theta > 2 * Math.PI - 0.0000001) {
      theta = 0;
    }

    const A = { x: Math.cos(theta), y: Math.sin(theta) };
    const B = {
      x: displacement.x - 15 - referenceX,
      y: referenceY - displacement.y + 15,
    };

    const ADotB = A.x * B.x + A.y * B.y;

    const AMag = Math.sqrt(A.x * A.x + A.y * A.y);
    const ANorm = { x: A.x / AMag, y: A.y / AMag };
    const BParallel = { x: ANorm.x * ADotB, y: ANorm.y * ADotB };

    const BPerp = {
      x: B.x - BParallel.x,
      y: B.y - BParallel.y,
    };
    const BPerpMag = Math.sqrt(BPerp.x * BPerp.x + BPerp.y * BPerp.y);

    const ACrossB = A.x * B.y - A.y * B.x;

    let height;
    if (ACrossB < 0) {
      height = Math.max(
        2,
        (BPerpMag / this.bundleRef.current.clientHeight) * 100
      );
    } else {
      height = 2;
    }

    const width = Math.max(
      2,
      (ADotB / this.bundleRef.current.clientWidth) * 100
    );

    const isOutside = this.isBoxOutside(
      referenceX,
      referenceY,
      theta,
      ADotB,
      BPerpMag
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        scale: {
          x: width,
          y: height,
        },
      };
      this.setRerender((prev) => !prev);
    } else {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        ADotB,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxHeight(
            referenceX,
            referenceY,
            theta,
            ADotB,
            (this.positioning.current.scale.y / 100) *
              this.bundleRef.current.clientHeight
          ) /
            this.bundleRef.current.clientHeight) *
          100;

        this.positioning.current = {
          ...this.positioning.current,
          scale: {
            x: width,
            y:
              height > maxHeight ? maxHeight : this.positioning.current.scale.y,
          },
        };
        this.setRerender((prev) => !prev);
      } else {
        const isHeightOutside = this.isBoxOutside(
          referenceX,
          referenceY,
          theta,
          (this.positioning.current.scale.x / 100) *
            this.bundleRef.current.clientWidth,
          BPerpMag
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxWidth(
              referenceX,
              referenceY,
              theta,
              (this.positioning.current.scale.x / 100) *
                this.bundleRef.current.clientWidth,
              BPerpMag
            ) /
              this.bundleRef.current.clientWidth) *
            100;

          this.positioning.current = {
            ...this.positioning.current,
            scale: {
              x: width > maxWidth ? maxWidth : this.positioning.current.scale.x,
              y: height,
            },
          };
          this.setRerender((prev) => !prev);
        }
      }
    }
  };

  rotateDragFunction = (event: MouseEvent) => {
    if (!this.bundleRef.current) {
      return;
    }

    const bundleRect = this.bundleRef.current.getBoundingClientRect();

    const angle = this.calculateRotationAngle(
      {
        x:
          (this.positioning.current.position.left / 100) *
            this.bundleRef.current.clientWidth +
          bundleRect.left,
        y:
          (this.positioning.current.position.top / 100) *
            this.bundleRef.current.clientHeight +
          bundleRect.top,
      },
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    const isOutside = this.isBoxOutside(
      (this.positioning.current.position.left / 100) *
        this.bundleRef.current.clientWidth,
      (this.positioning.current.position.top / 100) *
        this.bundleRef.current.clientHeight,
      2 * Math.PI - (angle * Math.PI) / 180,
      (this.positioning.current.scale.x / 100) *
        this.bundleRef.current.clientWidth,
      (this.positioning.current.scale.y / 100) *
        this.bundleRef.current.clientHeight
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        rotation: angle,
      };
      this.setRerender((prev) => !prev);
    }
  };

  private isBoxOutside = (
    x1: number, // Top-left x-coordinate of Box 2
    y1: number, // Top-left y-coordinate of Box 2
    theta: number, // Rotation in radians
    width: number, // Width of Box 2
    height: number // Height of Box 2
  ) => {
    const corners = [
      [x1, y1], // Top-left
      [x1 + width * Math.cos(theta), y1 - width * Math.sin(theta)], // Top-right
      [
        x1 + width * Math.cos(theta) + height * Math.cos(Math.PI / 2 - theta),
        y1 - width * Math.sin(theta) + height * Math.sin(Math.PI / 2 - theta),
      ], // Bottom-right
      [
        x1 + height * Math.cos(Math.PI / 2 - theta),
        y1 + height * Math.sin(Math.PI / 2 - theta),
      ], // Bottom-left
    ];

    const isOutside = corners.some((corner) => {
      if (!this.bundleRef.current) {
        return true;
      }

      return (
        corner[0] < this.bundleRef.current.clientLeft ||
        corner[0] >
          this.bundleRef.current.clientWidth +
            this.bundleRef.current.clientLeft ||
        corner[1] < this.bundleRef.current.clientTop ||
        corner[1] >
          this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop
      );
    });

    return isOutside;
  };

  private getTopBounds = (
    theta: number,
    width: number,
    height: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryTop = this.bundleRef.current.clientTop;
    const boundaryBottom =
      this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop;

    // Define equations for each corner's y-coordinate
    const topLeftY = (top: number) => top;
    const topRightY = (top: number) => top - width * Math.sin(theta);
    const bottomRightY = (top: number) =>
      top - width * Math.sin(theta) + height * Math.sin(Math.PI / 2 - theta);
    const bottomLeftY = (top: number) =>
      top + height * Math.sin(Math.PI / 2 - theta);

    // Define the constraints for each corner
    const constraints = [
      // Top-left corner
      { min: boundaryTop - topLeftY(0), max: boundaryBottom - topLeftY(0) },

      // Top-right corner
      { min: boundaryTop - topRightY(0), max: boundaryBottom - topRightY(0) },

      // Bottom-right corner
      {
        min: boundaryTop - bottomRightY(0),
        max: boundaryBottom - bottomRightY(0),
      },

      // Bottom-left corner
      {
        min: boundaryTop - bottomLeftY(0),
        max: boundaryBottom - bottomLeftY(0),
      },
    ];

    // Find the intersection of all constraints
    const maxValidTop = Math.min(...constraints.map((c) => c.max));
    const minValidTop = Math.max(...constraints.map((c) => c.min));

    if (maxValidTop < minValidTop) {
      return { max: -1, min: -1 };
    }

    return { max: maxValidTop, min: minValidTop };
  };

  private getLeftBounds = (
    theta: number,
    width: number,
    height: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryLeft = this.bundleRef.current.clientLeft;
    const boundaryRight =
      this.bundleRef.current.clientWidth + this.bundleRef.current.clientLeft;

    // Define equations for each corner's x-coordinate
    const topLeftX = (left: number) => left;
    const topRightX = (left: number) => left + width * Math.cos(theta);
    const bottomRightX = (left: number) =>
      left + width * Math.cos(theta) + height * Math.cos(Math.PI / 2 - theta);
    const bottomLeftX = (left: number) =>
      left + height * Math.cos(Math.PI / 2 - theta);

    // Define the constraints for each corner
    const constraints = [
      // Top-left corner
      { min: boundaryLeft - topLeftX(0), max: boundaryRight - topLeftX(0) },

      // Top-right corner
      { min: boundaryLeft - topRightX(0), max: boundaryRight - topRightX(0) },

      // Bottom-right corner
      {
        min: boundaryLeft - bottomRightX(0),
        max: boundaryRight - bottomRightX(0),
      },

      // Bottom-left corner
      {
        min: boundaryLeft - bottomLeftX(0),
        max: boundaryRight - bottomLeftX(0),
      },
    ];

    // Find the intersection of all constraints
    const maxValidLeft = Math.min(...constraints.map((c) => c.max));
    const minValidLeft = Math.max(...constraints.map((c) => c.min));

    if (maxValidLeft < minValidLeft) {
      return { max: -1, min: -1 };
    }

    return { max: maxValidLeft, min: minValidLeft }; // Return the largest possible left position
  };

  private getMaxWidth = (
    x1: number,
    y1: number,
    theta: number,
    startWidth: number,
    height: number
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(x1, y1, theta, startWidth + i, height);
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(x1, y1, theta, startWidth + i, height);
    }

    return startWidth + i - 1;
  };

  private getMaxHeight = (
    x1: number,
    y1: number,
    theta: number,
    width: number,
    startHeight: number
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(x1, y1, theta, width, startHeight + i);
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(x1, y1, theta, width, startHeight + i);
    }

    return startHeight + i - 1;
  };

  private calculateRotationAngle = (
    topLeft: { x: number; y: number },
    mouse: { x: number; y: number }
  ) => {
    // Calculate the target vector from bottom-left to the mouse
    const targetVectorX = mouse.x - topLeft.x;
    const targetVectorY = mouse.y - topLeft.y;

    // Calculate angles from the x-axis for each vector
    let targetAngle =
      Math.atan2(targetVectorY, targetVectorX) * (180 / Math.PI);

    // Normalize both angles to the range [0, 360)
    if (targetAngle < 0) targetAngle += 360;

    return targetAngle;
  };

  adjustmentBtnMouseDownFunction = () => {
    this.setAdjustingDimensions(true);
  };

  adjustmentBtnMouseUpFunction = () => {
    this.setAdjustingDimensions(false);
  };
}

export default FgAdjustmentVideoController;
