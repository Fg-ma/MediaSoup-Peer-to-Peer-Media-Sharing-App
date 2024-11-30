export type RotationPoints =
  | "topLeft"
  | "topMiddle"
  | "topRight"
  | "bottomLeft"
  | "bottomMiddle"
  | "bottomRight"
  | "middleLeft"
  | "middleRight";

const boundaryCheckingRotationPointMap: {
  [rotationPoint in RotationPoints]: { x: number; y: number };
} = {
  topLeft: { x: 0, y: 0 },
  topMiddle: { x: 0.5, y: 0 },
  topRight: { x: 1, y: 0 },
  bottomLeft: { x: 0, y: 1 },
  bottomMiddle: { x: 0.5, y: 1 },
  bottomRight: { x: 1, y: 1 },
  middleLeft: { x: 0, y: 0.5 },
  middleRight: { x: 1, y: 0.5 },
};

class FgAdjustmentVideoController {
  constructor(
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
    private setAdjustingDimensions: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private canvasRef?: React.RefObject<HTMLCanvasElement>
  ) {}

  movementDragFunction = (
    rotationPointPlacement: RotationPoints,
    displacement: { x: number; y: number },
    buttonPosition: { x: number; y: number },
    rotationPoint: { x: number; y: number }
  ) => {
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

    const left = displacement.x + buttonPosition.x;

    const top = displacement.y + buttonPosition.y;

    const isOutside = this.isBoxOutside(
      left,
      top,
      angle,
      pixelScale.x,
      pixelScale.y,
      rotationPoint.x,
      rotationPoint.y
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
      const { max: leftMax, min: leftMin } = this.getLeftBounds(
        angle,
        pixelScale.x,
        pixelScale.y,
        boundaryCheckingRotationPointMap[rotationPointPlacement].x *
          pixelScale.x,
        boundaryCheckingRotationPointMap[rotationPointPlacement].y *
          pixelScale.y
      );

      const maxLeft = (leftMax / this.bundleRef.current.clientWidth) * 100;
      const minLeft = (leftMin / this.bundleRef.current.clientWidth) * 100;

      const { max: topMax, min: topMin } = this.getTopBounds(
        angle,
        pixelScale.x,
        pixelScale.y,
        boundaryCheckingRotationPointMap[rotationPointPlacement].x *
          pixelScale.x,
        boundaryCheckingRotationPointMap[rotationPointPlacement].y *
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
              : (left / this.bundleRef.current.clientWidth) * 100,
          top:
            (top / this.bundleRef.current.clientHeight) * 100 > maxTop
              ? maxTop
              : (top / this.bundleRef.current.clientHeight) * 100 < minTop
              ? minTop
              : (top / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    }
  };

  scaleDragFunction = (
    kind: "any" | "square",
    displacement: { x: number; y: number },
    referencePoint: { x: number; y: number }
  ) => {
    if (!this.bundleRef.current) {
      return;
    }

    const { x: referenceX, y: referenceY } = referencePoint;

    let theta =
      2 * Math.PI - this.positioning.current.rotation * (Math.PI / 180);
    if (theta > 2 * Math.PI - 0.0000001) {
      theta = 0;
    }

    const A = { x: Math.cos(theta), y: Math.sin(theta) };
    const B = {
      x: displacement.x - referenceX,
      y: referenceY - displacement.y,
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
      BPerpMag,
      referenceX,
      referenceY
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        scale:
          kind === "square"
            ? { x: Math.max(width, height), y: Math.max(width, height) }
            : {
                x: width,
                y: height,
              },
      };
      this.setRerender((prev) => !prev);
    } else if (isOutside && kind !== "square") {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        ADotB,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight,
        referenceX,
        referenceY
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
          BPerpMag,
          referenceX,
          referenceY
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

  rotateDragFunction = (
    event: MouseEvent,
    referencePoint: { x: number; y: number }
  ) => {
    if (!this.bundleRef.current) {
      return;
    }

    const { x: referenceX, y: referenceY } = referencePoint;

    const angle = this.calculateRotationAngle(
      {
        x: referenceX,
        y: referenceY,
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
        this.bundleRef.current.clientHeight,
      referenceX,
      referenceY
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        rotation: angle,
      };
      this.setRerender((prev) => !prev);
    }
  };

  private rotatePoint = (
    px: number,
    py: number,
    cx: number,
    cy: number,
    angle: number
  ) => {
    const cosTheta = Math.cos(angle);
    const sinTheta = Math.sin(angle);

    // Translate point to origin, rotate, then translate back
    const translatedX = px - cx;
    const translatedY = py - cy;

    const rotatedX = translatedX * cosTheta - translatedY * sinTheta + cx;
    const rotatedY = translatedX * sinTheta + translatedY * cosTheta + cy;

    return [rotatedX, rotatedY];
  };

  private isBoxOutside = (
    x1: number, // Top-left x-coordinate of Box 2
    y1: number, // Top-left y-coordinate of Box 2
    theta: number, // Rotation in radians
    width: number, // Width of Box 2
    height: number, // Height of Box 2
    rotatePointX: number, // X-coordinate of the rotation point
    rotatePointY: number // Y-coordinate of the rotation point
  ) => {
    const corners = [
      [x1, y1], // Top-left
      [x1 + width, y1], // Top-right
      [x1 + width, y1 + height], // Bottom-right
      [x1, y1 + height], // Bottom-left
    ];

    // Rotate each corner around the given rotation point
    const rotatedCorners = corners.map(([px, py]) =>
      this.rotatePoint(px, py, rotatePointX, rotatePointY, -theta)
    );

    if (this.canvasRef && this.canvasRef.current && this.bundleRef.current) {
      this.canvasRef.current.width = this.bundleRef.current.clientWidth;
      this.canvasRef.current.height = this.bundleRef.current.clientHeight;
      const ctx = this.canvasRef.current.getContext("2d");

      if (ctx) {
        ctx.clearRect(
          0,
          0,
          this.canvasRef.current.width,
          this.canvasRef.current.height
        ); // Clear canvas before drawing

        ctx.fillStyle = "red";
        ctx.fillRect(
          0,
          0,
          this.canvasRef.current.width,
          this.canvasRef.current.height
        );

        ctx.fillStyle = "blue"; // Set point color
        rotatedCorners.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI); // Draw a circle for each point
          ctx.fill();
        });

        ctx.fillStyle = "purple"; // Set point color
        corners.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI); // Draw a circle for each point
          ctx.fill();
        });
      }
    }

    // Check if any corner is outside the bounding box
    const isOutside = rotatedCorners.some(([rotatedX, rotatedY]) => {
      if (!this.bundleRef.current) {
        return true;
      }

      return (
        rotatedX < this.bundleRef.current.clientLeft ||
        rotatedX >
          this.bundleRef.current.clientWidth +
            this.bundleRef.current.clientLeft ||
        rotatedY < this.bundleRef.current.clientTop ||
        rotatedY >
          this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop
      );
    });

    return isOutside;
  };

  private getTopBounds = (
    theta: number,
    width: number,
    height: number,
    cx: number,
    cy: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryTop = this.bundleRef.current.clientTop;
    const boundaryBottom =
      this.bundleRef.current.clientHeight + this.bundleRef.current.clientTop;

    // Define the four corners of the rectangle before rotation
    const corners = [
      [0, 0], // Top-left
      [width, 0], // Top-right
      [width, height], // Bottom-right
      [0, height], // Bottom-left
    ];

    // Rotate all corners around the point (cx, cy)
    const rotatedCorners = corners.map(([px, py]) =>
      this.rotatePoint(px, py, cx, cy, -theta)
    );

    // Compute the minimum and maximum y-coordinates of the rotated corners
    const yCoordinates = rotatedCorners.map(([_, y]) => y);
    const minY = Math.min(...yCoordinates);
    const maxY = Math.max(...yCoordinates);

    // Calculate constraints for valid "top" positions
    const constraints = [
      { min: boundaryTop - minY, max: boundaryBottom - minY },
      { min: boundaryTop - maxY, max: boundaryBottom - maxY },
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
    height: number,
    cx: number,
    cy: number
  ): { max: number; min: number } => {
    if (!this.bundleRef.current) {
      return { max: -1, min: -1 };
    }

    // Get boundary dimensions
    const boundaryLeft = this.bundleRef.current.clientLeft;
    const boundaryRight =
      this.bundleRef.current.clientWidth + this.bundleRef.current.clientLeft;

    // Define the four corners of the rectangle before rotation
    const corners = [
      [0, 0], // Top-left
      [width, 0], // Top-right
      [width, height], // Bottom-right
      [0, height], // Bottom-left
    ];

    // Rotate all corners around the point (cx, cy)
    const rotatedCorners = corners.map(([px, py]) =>
      this.rotatePoint(px, py, cx, cy, -theta)
    );

    // Compute the minimum and maximum x-coordinates of the rotated corners
    const xCoordinates = rotatedCorners.map(([x]) => x);
    const minX = Math.min(...xCoordinates);
    const maxX = Math.max(...xCoordinates);

    // Calculate constraints for valid "left" positions
    const constraints = [
      { min: boundaryLeft - minX, max: boundaryRight - minX },
      { min: boundaryLeft - maxX, max: boundaryRight - maxX },
    ];

    // Find the intersection of all constraints
    const maxValidLeft = Math.min(...constraints.map((c) => c.max));
    const minValidLeft = Math.max(...constraints.map((c) => c.min));

    if (maxValidLeft < minValidLeft) {
      return { max: -1, min: -1 };
    }

    return { max: maxValidLeft, min: minValidLeft };
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

      isOutside = this.isBoxOutside(
        x1,
        y1,
        theta,
        startWidth + i,
        height,
        x1,
        y1
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        x1,
        y1,
        theta,
        startWidth + i,
        height,
        x1,
        y1
      );
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

      isOutside = this.isBoxOutside(
        x1,
        y1,
        theta,
        width,
        startHeight + i,
        x1,
        y1
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        x1,
        y1,
        theta,
        width,
        startHeight + i,
        x1,
        y1
      );
    }

    return startHeight + i - 1;
  };

  private calculateRotationAngle = (
    pointOfRotation: { x: number; y: number },
    mouse: { x: number; y: number }
  ) => {
    // Calculate the target vector from point of rotation to the mouse
    const targetVectorX = mouse.x - pointOfRotation.x;
    const targetVectorY = mouse.y - pointOfRotation.y;

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
