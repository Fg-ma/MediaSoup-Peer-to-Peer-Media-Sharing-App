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

export type AdjustmentTypes = "position" | "scale" | "rotation";

export type AdjustmentBtnPointerDownDetails = {
  aspect?: "square";
  referencePoint?: { x: number; y: number };
  rotationPoint?: { x: number; y: number };
  rotationPointPlacement?: RotationPoints;
};

class FgContentAdjustmentController {
  private maxTop = 0;
  private minTop = 0;
  private maxLeft = 0;
  private minLeft = 0;

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
  ) {}

  movementDragFunction = (
    displacement: { x: number; y: number },
    referencePoint: { x: number; y: number },
    rotationPoint: { x: number; y: number },
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

    const left = displacement.x + referencePoint.x;

    const top = displacement.y + referencePoint.y;

    const isOutside = this.isBoxOutside(
      left,
      top,
      angle,
      pixelScale.x,
      pixelScale.y,
      rotationPoint.x,
      rotationPoint.y,
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
      this.positioning.current = {
        ...this.positioning.current,
        position: {
          left:
            (left / this.bundleRef.current.clientWidth) * 100 > this.maxLeft
              ? this.maxLeft
              : (left / this.bundleRef.current.clientWidth) * 100 < this.minLeft
                ? this.minLeft
                : (left / this.bundleRef.current.clientWidth) * 100,
          top:
            (top / this.bundleRef.current.clientHeight) * 100 > this.maxTop
              ? this.maxTop
              : (top / this.bundleRef.current.clientHeight) * 100 < this.minTop
                ? this.minTop
                : (top / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    }
  };

  scaleDragFunction = (
    kind: "any" | "square" | "aspect",
    displacement: { x: number; y: number },
    referencePoint: { x: number; y: number },
    rotationPoint: { x: number; y: number },
    aspectRatio?: number,
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
        (BPerpMag / this.bundleRef.current.clientHeight) * 100,
      );
    } else {
      height = 2;
    }

    let width = Math.max(2, (ADotB / this.bundleRef.current.clientWidth) * 100);

    // Apply aspect-ratio constraint when `kind === "aspect"`
    if (kind === "aspect") {
      const targetAspect =
        aspectRatio ??
        this.positioning.current.scale.x / this.positioning.current.scale.y;

      // Ensure width and height respect the aspect ratio
      if (width / height > targetAspect) {
        // Constrain by width
        height = width / targetAspect;
      } else {
        // Constrain by height
        width = height * targetAspect;
      }
    }

    const isOutside = this.isBoxOutside(
      referenceX,
      referenceY,
      theta,
      kind === "square"
        ? Math.max(ADotB, BPerpMag)
        : (width * this.bundleRef.current.clientWidth) / 100,
      kind === "square"
        ? Math.max(ADotB, BPerpMag)
        : (height * this.bundleRef.current.clientHeight) / 100,
      rotationPoint.x,
      rotationPoint.y,
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
    } else if (kind === "square") {
      const maxDims =
        (this.getMaxSquareAspectDim(
          referenceX,
          referenceY,
          theta,
          rotationPoint.x,
          rotationPoint.y,
          0,
          0,
        ) /
          Math.max(
            this.bundleRef.current.clientHeight,
            this.bundleRef.current.clientWidth,
          )) *
        100;

      this.positioning.current = {
        ...this.positioning.current,
        scale: {
          x: maxDims,
          y: maxDims,
        },
      };
      this.setRerender((prev) => !prev);
    } else if (kind === "aspect") {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        ADotB,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight,
        referenceX,
        referenceY,
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxAspectHeight(
            referenceX,
            referenceY,
            theta,
            rotationPoint.x,
            rotationPoint.y,
            (this.positioning.current.scale.y / 100) *
              this.bundleRef.current.clientHeight,
            aspectRatio ?? 1,
          ) /
            this.bundleRef.current.clientHeight) *
          100;

        this.positioning.current = {
          ...this.positioning.current,
          scale: {
            x:
              height > maxHeight
                ? maxHeight * (aspectRatio ?? 1)
                : height * (aspectRatio ?? 1),
            y: height > maxHeight ? maxHeight : height,
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
          referenceY,
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxAspectWidth(
              referenceX,
              referenceY,
              theta,
              rotationPoint.x,
              rotationPoint.y,
              (this.positioning.current.scale.x / 100) *
                this.bundleRef.current.clientWidth,
              aspectRatio ?? 1,
            ) /
              this.bundleRef.current.clientWidth) *
            100;

          this.positioning.current = {
            ...this.positioning.current,
            scale: {
              x: width > maxWidth ? maxWidth : width,
              y:
                width > maxWidth
                  ? maxWidth / (aspectRatio ?? 1)
                  : width / (aspectRatio ?? 1),
            },
          };
          this.setRerender((prev) => !prev);
        }
      }
    } else {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        ADotB,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight,
        referenceX,
        referenceY,
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxHeight(
            referenceX,
            referenceY,
            theta,
            rotationPoint.x,
            rotationPoint.y,
            ADotB,
            (this.positioning.current.scale.y / 100) *
              this.bundleRef.current.clientHeight,
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
          referenceY,
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxWidth(
              referenceX,
              referenceY,
              theta,
              rotationPoint.x,
              rotationPoint.y,
              (this.positioning.current.scale.x / 100) *
                this.bundleRef.current.clientWidth,
              BPerpMag,
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
    event: PointerEvent,
    referencePoint: { x: number; y: number },
  ) => {
    if (!this.bundleRef.current) {
      return;
    }

    const { x: referenceX, y: referenceY } = referencePoint;

    const angle = this.calculateRotationAngle(referencePoint, {
      x: event.clientX,
      y: event.clientY,
    });

    const box = this.bundleRef.current.getBoundingClientRect();

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
      referenceX - box.left,
      referenceY - box.top,
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        rotation: angle,
      };
      this.setRerender((prev) => !prev);
    }
  };

  movementTo = (
    displacement: { x: number; y: number },
    rotationPoint: { x: number; y: number },
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

    const isOutside = this.isBoxOutside(
      displacement.x,
      displacement.y,
      angle,
      pixelScale.x,
      pixelScale.y,
      rotationPoint.x,
      rotationPoint.y,
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        position: {
          left: (displacement.x / this.bundleRef.current.clientWidth) * 100,
          top: (displacement.y / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    } else {
      this.positioning.current = {
        ...this.positioning.current,
        position: {
          left:
            (displacement.x / this.bundleRef.current.clientWidth) * 100 >
            this.maxLeft
              ? this.maxLeft
              : (displacement.x / this.bundleRef.current.clientWidth) * 100 <
                  this.minLeft
                ? this.minLeft
                : (displacement.x / this.bundleRef.current.clientWidth) * 100,
          top:
            (displacement.y / this.bundleRef.current.clientHeight) * 100 >
            this.maxTop
              ? this.maxTop
              : (displacement.y / this.bundleRef.current.clientHeight) * 100 <
                  this.minTop
                ? this.minTop
                : (displacement.y / this.bundleRef.current.clientHeight) * 100,
        },
      };
      this.setRerender((prev) => !prev);
    }
  };

  rotateTo = (angle: number, referencePoint: { x: number; y: number }) => {
    if (!this.bundleRef.current) {
      return;
    }

    const box = this.bundleRef.current.getBoundingClientRect();

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
      referencePoint.x - box.left,
      referencePoint.y - box.top,
    );

    if (!isOutside) {
      this.positioning.current = {
        ...this.positioning.current,
        rotation: angle,
      };
      this.setRerender((prev) => !prev);
    }
  };

  scaleTo = (
    kind: "any" | "square" | "aspect",
    scale: { x: number; y: number },
    referencePoint: { x: number; y: number },
    rotationPoint: { x: number; y: number },
    aspectRatio?: number,
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

    let height = Math.max(2, scale.y);

    let width = Math.max(2, scale.x);

    // Apply aspect-ratio constraint when `kind === "aspect"`
    if (kind === "aspect") {
      const targetAspect =
        aspectRatio ??
        this.positioning.current.scale.x / this.positioning.current.scale.y;

      // Ensure width and height respect the aspect ratio
      if (width / height > targetAspect) {
        // Constrain by width
        height = width / targetAspect;
      } else {
        // Constrain by height
        width = height * targetAspect;
      }
    }

    const isOutside = this.isBoxOutside(
      referenceX,
      referenceY,
      theta,
      kind === "square"
        ? Math.max(
            (height * this.bundleRef.current.clientHeight) / 100,
            (width * this.bundleRef.current.clientWidth) / 100,
          )
        : (width * this.bundleRef.current.clientWidth) / 100,
      kind === "square"
        ? Math.max(
            (height * this.bundleRef.current.clientHeight) / 100,
            (width * this.bundleRef.current.clientWidth) / 100,
          )
        : (height * this.bundleRef.current.clientHeight) / 100,
      rotationPoint.x,
      rotationPoint.y,
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
    } else if (kind === "square") {
      const maxDims =
        (this.getMaxSquareAspectDim(
          referenceX,
          referenceY,
          theta,
          rotationPoint.x,
          rotationPoint.y,
          0,
          0,
        ) /
          Math.max(
            this.bundleRef.current.clientHeight,
            this.bundleRef.current.clientWidth,
          )) *
        100;

      this.positioning.current = {
        ...this.positioning.current,
        scale: {
          x: maxDims,
          y: maxDims,
        },
      };
      this.setRerender((prev) => !prev);
    } else if (kind === "aspect") {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        (width * this.bundleRef.current.clientWidth) / 100,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight,
        referenceX,
        referenceY,
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxAspectHeight(
            referenceX,
            referenceY,
            theta,
            rotationPoint.x,
            rotationPoint.y,
            (this.positioning.current.scale.y / 100) *
              this.bundleRef.current.clientHeight,
            aspectRatio ?? 1,
          ) /
            this.bundleRef.current.clientHeight) *
          100;

        this.positioning.current = {
          ...this.positioning.current,
          scale: {
            x:
              height > maxHeight
                ? maxHeight * (aspectRatio ?? 1)
                : height * (aspectRatio ?? 1),
            y: height > maxHeight ? maxHeight : height,
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
          (height * this.bundleRef.current.clientHeight) / 100,
          referenceX,
          referenceY,
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxAspectWidth(
              referenceX,
              referenceY,
              theta,
              rotationPoint.x,
              rotationPoint.y,
              (this.positioning.current.scale.x / 100) *
                this.bundleRef.current.clientWidth,
              aspectRatio ?? 1,
            ) /
              this.bundleRef.current.clientWidth) *
            100;

          this.positioning.current = {
            ...this.positioning.current,
            scale: {
              x: width > maxWidth ? maxWidth : width,
              y:
                width > maxWidth
                  ? maxWidth / (aspectRatio ?? 1)
                  : width / (aspectRatio ?? 1),
            },
          };
          this.setRerender((prev) => !prev);
        }
      }
    } else {
      const isWidthOutside = this.isBoxOutside(
        referenceX,
        referenceY,
        theta,
        (width * this.bundleRef.current.clientWidth) / 100,
        (this.positioning.current.scale.y / 100) *
          this.bundleRef.current.clientHeight,
        referenceX,
        referenceY,
      );

      if (!isWidthOutside) {
        const maxHeight =
          (this.getMaxHeight(
            referenceX,
            referenceY,
            theta,
            rotationPoint.x,
            rotationPoint.y,
            (width * this.bundleRef.current.clientWidth) / 100,
            (this.positioning.current.scale.y / 100) *
              this.bundleRef.current.clientHeight,
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
          (height * this.bundleRef.current.clientHeight) / 100,
          referenceX,
          referenceY,
        );

        if (!isHeightOutside) {
          const maxWidth =
            (this.getMaxWidth(
              referenceX,
              referenceY,
              theta,
              rotationPoint.x,
              rotationPoint.y,
              (this.positioning.current.scale.x / 100) *
                this.bundleRef.current.clientWidth,
              (height * this.bundleRef.current.clientHeight) / 100,
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

  getRotatedRectanglePoints = (
    topLeft: { x: number; y: number },
    width: number,
    height: number,
    angleDeg: number,
  ): { x: number; y: number }[] => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Define the original rectangle corners (relative to top-left)
    const points: { x: number; y: number }[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];

    // Rotate each point around (0,0) and then translate to topLeft
    const rotatedPoints = points.map((p) => ({
      x: topLeft.x + (p.x * cos - p.y * sin),
      y: topLeft.y + (p.x * sin + p.y * cos),
    }));

    return rotatedPoints;
  };

  private rotatePoint = (
    px: number,
    py: number,
    cx: number,
    cy: number,
    angle: number,
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
    rotatePointY: number, // Y-coordinate of the rotation point
  ) => {
    const corners = [
      [x1, y1], // Top-left
      [x1 + width, y1], // Top-right
      [x1 + width, y1 + height], // Bottom-right
      [x1, y1 + height], // Bottom-left
    ];

    // Rotate each corner around the given rotation point
    const rotatedCorners = corners.map(([px, py]) =>
      this.rotatePoint(px, py, rotatePointX, rotatePointY, -theta),
    );

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
    cy: number,
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
      this.rotatePoint(px, py, cx, cy, -theta),
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
    cy: number,
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
      this.rotatePoint(px, py, cx, cy, -theta),
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

  private getMaxSquareAspectDim = (
    left: number,
    top: number,
    theta: number,
    rotationPointX: number,
    rotationPointY: number,
    width: number,
    height: number,
  ) => {
    let isOutside = false;
    let i = -8;

    const startDim = Math.min(width, height);

    while (!isOutside) {
      i += 8;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startDim + i,
        startDim + i,
        rotationPointX,
        rotationPointY,
      );
    }

    isOutside = false;

    i -= 9;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startDim + i,
        startDim + i,
        rotationPointX,
        rotationPointY,
      );
    }

    return startDim + i - 1;
  };

  private getMaxWidth = (
    left: number,
    top: number,
    theta: number,
    rotationPointX: number,
    rotationPointY: number,
    startWidth: number,
    height: number,
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startWidth + i,
        height,
        rotationPointX,
        rotationPointY,
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startWidth + i,
        height,
        rotationPointX,
        rotationPointY,
      );
    }

    return startWidth + i - 1;
  };

  private getMaxHeight = (
    left: number,
    top: number,
    theta: number,
    rotationPointX: number,
    rotationPointY: number,
    width: number,
    startHeight: number,
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        width,
        startHeight + i,
        rotationPointX,
        rotationPointY,
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        width,
        startHeight + i,
        rotationPointX,
        rotationPointY,
      );
    }

    return startHeight + i - 1;
  };

  private getMaxAspectWidth = (
    left: number,
    top: number,
    theta: number,
    rotationPointX: number,
    rotationPointY: number,
    startWidth: number,
    aspectRatio: number,
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startWidth + i,
        (startWidth + i) / aspectRatio,
        rotationPointX,
        rotationPointY,
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        startWidth + i,
        (startWidth + i) / aspectRatio,
        rotationPointX,
        rotationPointY,
      );
    }

    return startWidth + i - 1;
  };

  private getMaxAspectHeight = (
    left: number,
    top: number,
    theta: number,
    rotationPointX: number,
    rotationPointY: number,
    startHeight: number,
    aspectRatio: number,
  ) => {
    let isOutside = false;
    let i = -4;

    while (!isOutside) {
      i += 4;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        (startHeight + i) * aspectRatio,
        startHeight + i,
        rotationPointX,
        rotationPointY,
      );
    }

    isOutside = false;

    i -= 5;

    while (!isOutside) {
      i += 1;

      isOutside = this.isBoxOutside(
        left,
        top,
        theta,
        (startHeight + i) * aspectRatio,
        startHeight + i,
        rotationPointX,
        rotationPointY,
      );
    }

    return startHeight + i - 1;
  };

  private calculateRotationAngle = (
    pointOfRotation: { x: number; y: number },
    pointer: { x: number; y: number },
  ) => {
    // Calculate the target vector from point of rotation to the pointer
    const targetVectorX = pointer.x - pointOfRotation.x;
    const targetVectorY = pointer.y - pointOfRotation.y;

    // Calculate angles from the x-axis for each vector
    let targetAngle =
      Math.atan2(targetVectorY, targetVectorX) * (180 / Math.PI);

    // Normalize both angles to the range [0, 360)
    if (targetAngle < 0) targetAngle += 360;

    return targetAngle;
  };

  adjustmentBtnPointerDownFunction = (
    kind?: AdjustmentTypes,
    details?: AdjustmentBtnPointerDownDetails,
  ) => {
    if (kind === "position") {
      if (details && details.rotationPointPlacement) {
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

        const { max: leftMax, min: leftMin } = this.getLeftBounds(
          angle,
          pixelScale.x,
          pixelScale.y,
          boundaryCheckingRotationPointMap[details.rotationPointPlacement].x *
            pixelScale.x,
          boundaryCheckingRotationPointMap[details.rotationPointPlacement].y *
            pixelScale.y,
        );

        this.maxLeft = (leftMax / this.bundleRef.current.clientWidth) * 100;
        this.minLeft = (leftMin / this.bundleRef.current.clientWidth) * 100;

        const { max: topMax, min: topMin } = this.getTopBounds(
          angle,
          pixelScale.x,
          pixelScale.y,
          boundaryCheckingRotationPointMap[details.rotationPointPlacement].x *
            pixelScale.x,
          boundaryCheckingRotationPointMap[details.rotationPointPlacement].y *
            pixelScale.y,
        );

        this.maxTop = (topMax / this.bundleRef.current.clientHeight) * 100;
        this.minTop = (topMin / this.bundleRef.current.clientHeight) * 100;
      }
    }
    this.setAdjustingDimensions(true);
  };

  adjustmentBtnPointerUpFunction = () => {
    this.setAdjustingDimensions(false);
  };
}

export default FgContentAdjustmentController;
