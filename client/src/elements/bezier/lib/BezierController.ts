import JSZip from "jszip";
import {
  BezierPoint,
  ControlTypes,
  cycleControlTypeMap,
  defaultPoints,
  defaultSettings,
  Settings,
} from "./typeConstant";

class BezierController {
  constructor(
    private points: BezierPoint[],
    private setPoints: React.Dispatch<React.SetStateAction<BezierPoint[]>>,
    private bezierContainerRef: React.RefObject<HTMLDivElement>,
    private bezierBackgroundContainerRef: React.RefObject<HTMLDivElement>,
    private svgRef: React.RefObject<SVGSVGElement>,
    private setInBezier: React.Dispatch<React.SetStateAction<boolean>>,
    private setLargestDim: React.Dispatch<
      React.SetStateAction<"height" | "width">
    >,
    private setAspectSquarish: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private leavePathTimeout: React.MutableRefObject<
      NodeJS.Timeout | undefined
    >,
    private settings: Settings,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private copiedTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private setCopied: React.Dispatch<React.SetStateAction<boolean>>,
    private confirmBezierCurveFunction:
      | ((
          url: string,
          svg: string,
          d: string,
          blob: Blob,
          name?: string,
          filters?: string,
        ) => void)
      | undefined,
    private selectionBox: {
      x: number;
      y: number;
      width: number;
      height: number;
      active: boolean;
    },
    private setSelectionBox: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
        width: number;
        height: number;
        active: boolean;
      }>
    >,
    private name: React.MutableRefObject<string | undefined>,
    private handles: boolean,
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).tagName.toLowerCase() === "input") return;

    event.stopPropagation();
    event.preventDefault();
    event.cancelBubble = true;

    if (event.shiftKey || event.ctrlKey) return;

    switch (event.key.toLowerCase()) {
      case "1":
        this.swapControlType("free");
        break;
      case "2":
        this.swapControlType("inlineSymmetric");
        break;
      case "3":
        this.swapControlType("inline");
        break;
      case "4":
        this.cycleControlType();
        break;
      case "l":
        this.simulateHandlePointer("controlOne");
        break;
      case "r":
        this.simulateHandlePointer("controlTwo");
        break;
      case "u":
        this.cycleControlType();
        break;
      case "x":
        this.deleteSelectedAndHovering();
        break;
      case "delete":
        this.deleteSelectedAndHovering();
        break;
      case "d":
        this.downloadBezierCurve();
        break;
      case "c":
        this.copyToClipBoardBezierCurve();
        break;
      case "s":
        this.setSettingsActive((prev) => !prev);
        break;
      default:
        break;
    }
  };

  handlePointerEnter = (index: number) => {
    this.setPoints((prev) => {
      let newPoints = [...prev];

      newPoints = this.handleUnhoverAllPoints(newPoints);

      newPoints[index].hovering = true;

      return newPoints;
    });
  };

  handlePointerLeave = () => {
    this.setPoints((prev) => {
      let newPoints = [...prev];

      newPoints = this.handleUnhoverAllPoints(newPoints);

      return newPoints;
    });
  };

  handlePointerMove = () => {
    this.setInBezier(true);

    if (this.bezierContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.movementTimeout.current = setTimeout(() => {
      this.setInBezier(false);
    }, 3500);
  };

  handlePointerEnterBezier = () => {
    this.setInBezier(true);

    this.bezierContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove,
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeaveBezier = () => {
    this.bezierContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove,
    );

    if (this.bezierContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.leaveTimer.current = setTimeout(() => {
      this.setInBezier(false);
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }, 2500);
  };

  handleSVGPointerDown = (event: React.PointerEvent) => {
    if (this.leavePathTimeout.current) {
      clearTimeout(this.leavePathTimeout.current);
      this.leavePathTimeout.current = undefined;
    }

    if (!this.svgRef.current) return;

    const rect = this.svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.setSelectionBox({
      x,
      y,
      width: 0,
      height: 0,
      active: true,
    });
  };

  handleSVGPointerMove = (event: React.PointerEvent) => {
    if (!this.selectionBox.active || !this.svgRef.current) return;

    if (this.leavePathTimeout.current) {
      clearTimeout(this.leavePathTimeout.current);
      this.leavePathTimeout.current = undefined;
    }

    const rect = this.svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.setSelectionBox((prev) => {
      const width = x - prev.x;
      const height = y - prev.y;

      this.setPoints((prevPoints) => {
        return prevPoints.map((point) => {
          const insideX =
            Math.min(this.selectionBox.x, this.selectionBox.x + width) <=
              point.x &&
            Math.max(this.selectionBox.x, this.selectionBox.x + width) >=
              point.x;
          const insideY =
            Math.min(this.selectionBox.y, this.selectionBox.y + height) <=
              point.y &&
            Math.max(this.selectionBox.y, this.selectionBox.y + height) >=
              point.y;

          return { ...point, inSelectionBox: insideX && insideY };
        });
      });

      return {
        ...prev,
        width: x - prev.x,
        height: y - prev.y,
      };
    });
  };

  handleSVGPointerUp = () => {
    if (!this.selectionBox.active) return;

    if (this.leavePathTimeout.current) {
      clearTimeout(this.leavePathTimeout.current);
      this.leavePathTimeout.current = undefined;
    }

    this.setPoints((prev) => {
      return prev.map((point) => {
        const insideX =
          Math.min(
            this.selectionBox.x,
            this.selectionBox.x + this.selectionBox.width,
          ) <= point.x &&
          Math.max(
            this.selectionBox.x,
            this.selectionBox.x + this.selectionBox.width,
          ) >= point.x;
        const insideY =
          Math.min(
            this.selectionBox.y,
            this.selectionBox.y + this.selectionBox.height,
          ) <= point.y &&
          Math.max(
            this.selectionBox.y,
            this.selectionBox.y + this.selectionBox.height,
          ) >= point.y;

        return {
          ...point,
          inSelectionBox: false,
          selected: insideX && insideY,
        };
      });
    });

    this.setSelectionBox({ x: 0, y: 0, width: 0, height: 0, active: false });
  };

  handlePointerUp = (
    index: number,
    controlType?: "controlOne" | "controlTwo",
  ) => {
    document.removeEventListener("pointermove", (e) =>
      this.handleDrag(index, e, controlType),
    );
    document.removeEventListener("pointerup", () =>
      this.handlePointerUp(index, controlType),
    );

    this.setPoints((prev) => {
      const newPoints = [...prev];

      if (controlType !== undefined) {
        if (newPoints[index].controls[controlType])
          newPoints[index].controls[controlType].dragging = false;
      } else {
        newPoints[index].dragging = false;
      }

      return newPoints;
    });
  };

  handlePointerDown = (
    event: React.PointerEvent,
    index: number,
    controlType?: "controlOne" | "controlTwo",
  ) => {
    event.preventDefault();
    event.stopPropagation();

    this.setPoints((prev) => {
      let newPoints = [...prev];

      if (controlType !== undefined) {
        if (newPoints[index].controls[controlType])
          newPoints[index].controls[controlType].dragging = true;
      } else {
        newPoints = this.handleDeselectAllPoints(newPoints);

        newPoints[index].selected = true;
        newPoints[index].dragging = true;
      }

      return newPoints;
    });

    const moveListener = (e: PointerEvent) =>
      this.handleDrag(index, e, controlType);
    const upListener = () => {
      window.removeEventListener("pointermove", moveListener);
      window.removeEventListener("pointerup", upListener);

      this.setPoints((prev) => {
        const newPoints = [...prev];

        if (controlType !== undefined) {
          if (newPoints[index].controls[controlType])
            newPoints[index].controls[controlType].dragging = false;
        } else {
          newPoints[index].dragging = false;
        }

        return newPoints;
      });
    };

    window.addEventListener("pointermove", moveListener);
    window.addEventListener("pointerup", upListener);
  };

  handleDrag = (
    index: number,
    event: PointerEvent,
    controlType?: "controlOne" | "controlTwo",
  ) => {
    if (
      !this.svgRef.current ||
      ((index === 0 || index === this.points.length - 1) &&
        controlType === undefined)
    )
      return;
    const { clientX, clientY } = event;
    const rect = this.svgRef.current.getBoundingClientRect();
    let x = this.applyBoardLimits(((clientX - rect.left) / rect.width) * 100);
    let y = this.applyBoardLimits(((clientY - rect.top) / rect.height) * 100);

    this.setPoints((prev) => {
      const newPoints = [...prev];

      if (controlType !== undefined) {
        let point = newPoints[index];
        let dx = x - point.x;
        let dy = y - point.y;
        let angle = Math.atan2(dy, dx);
        let distance = Math.hypot(dx, dy);

        if (event.ctrlKey) {
          const snapAngle = Math.round(angle / (Math.PI / 12)) * (Math.PI / 12);
          x = this.applyBoardLimits(point.x + Math.cos(snapAngle) * distance);
          y = this.applyBoardLimits(point.y + Math.sin(snapAngle) * distance);
        } else if (event.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) {
            y = point.y;
          } else {
            x = point.x;
          }
        }

        if (newPoints[index].controlType === "free") {
          newPoints[index].controls[controlType] = {
            x,
            y,
            dragging: true,
          };
        } else if (newPoints[index].controlType === "inlineSymmetric") {
          newPoints[index].controls[controlType] = {
            x,
            y,
            dragging: true,
          };
          if (
            controlType === "controlOne" &&
            newPoints[index].controls.controlTwo
          ) {
            newPoints[index].controls.controlTwo = {
              x: this.applyBoardLimits(2 * newPoints[index].x - x),
              y: this.applyBoardLimits(2 * newPoints[index].y - y),
              dragging: false,
            };
          } else if (
            controlType === "controlTwo" &&
            newPoints[index].controls.controlOne
          ) {
            newPoints[index].controls.controlOne = {
              x: this.applyBoardLimits(2 * newPoints[index].x - x),
              y: this.applyBoardLimits(2 * newPoints[index].y - y),
              dragging: false,
            };
          }
        } else {
          newPoints[index].controls[controlType] = {
            x,
            y,
            dragging: true,
          };

          const dx = x - newPoints[index].x;
          const dy = y - newPoints[index].y;
          const angle = Math.atan2(dy, dx);

          if (
            controlType === "controlOne" &&
            newPoints[index].controls.controlTwo
          ) {
            const distance = Math.hypot(
              newPoints[index].controls.controlTwo.x - newPoints[index].x,
              newPoints[index].controls.controlTwo.y - newPoints[index].y,
            );
            newPoints[index].controls.controlTwo = {
              x: this.applyBoardLimits(
                newPoints[index].x - distance * Math.cos(angle),
              ),
              y: this.applyBoardLimits(
                newPoints[index].y - distance * Math.sin(angle),
              ),
              dragging: false,
            };
          } else if (
            controlType === "controlTwo" &&
            newPoints[index].controls.controlOne
          ) {
            const distance = Math.hypot(
              newPoints[index].controls.controlOne.x - newPoints[index].x,
              newPoints[index].controls.controlOne.y - newPoints[index].y,
            );
            newPoints[index].controls.controlOne = {
              x: this.applyBoardLimits(
                newPoints[index].x + distance * Math.cos(angle + Math.PI),
              ),
              y: this.applyBoardLimits(
                newPoints[index].y + distance * Math.sin(angle + Math.PI),
              ),
              dragging: false,
            };
          }
        }
      } else {
        const point = newPoints[index];

        const oldX = point.x;
        const oldY = point.y;

        // Move the point itself
        point.x = x;
        point.y = y;

        // Maintain the relative position of the control points
        if (point.controls.controlOne) {
          const controlOne = point.controls.controlOne;
          point.controls.controlOne = {
            ...point.controls.controlOne,
            x: this.applyBoardLimits(controlOne.x + (x - oldX)),
            y: this.applyBoardLimits(controlOne.y + (y - oldY)),
          };
        }

        if (point.controls.controlTwo) {
          const controlTwo = point.controls.controlTwo;
          point.controls.controlTwo = {
            ...point.controls.controlTwo,
            x: this.applyBoardLimits(controlTwo.x + (x - oldX)),
            y: this.applyBoardLimits(controlTwo.y + (y - oldY)),
          };
        }
      }

      return newPoints;
    });
  };

  handleWheel = (event: WheelEvent) => {
    this.setPoints((prev) => {
      const newPoints = [...prev];
      const direction = event.deltaY < 0 ? 1 : -1;

      const selectedIndices = newPoints
        .map((point, index) => (point.selected ? index : -1))
        .filter((index) => index !== -1);

      selectedIndices.forEach((index) => {
        newPoints[index] = { ...newPoints[index], selected: false };
      });

      selectedIndices.forEach((index) => {
        let nextIndex =
          (index + direction + newPoints.length) % newPoints.length;
        newPoints[nextIndex] = { ...newPoints[nextIndex], selected: true };
      });

      return newPoints;
    });
  };

  handleDoubleClick = (event: React.MouseEvent) => {
    if (!this.svgRef.current) return;

    const rect = this.svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    let splitIndex = -1;
    let minDistance = Infinity;
    let splitT = 0.5; // Default split position at 50%

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      const c1 = p1.controls?.controlOne || p1;
      const c2 = p2.controls?.controlTwo || p2.controls?.controlOne || p2;

      // Approximate Bézier curve at multiple t values to find the closest point
      for (let t = 0.1; t < 1; t += 0.1) {
        const bx =
          (1 - t) ** 3 * p1.x +
          3 * (1 - t) ** 2 * t * c1.x +
          3 * (1 - t) * t ** 2 * c2.x +
          t ** 3 * p2.x;
        const by =
          (1 - t) ** 3 * p1.y +
          3 * (1 - t) ** 2 * t * c1.y +
          3 * (1 - t) * t ** 2 * c2.y +
          t ** 3 * p2.y;

        const distance = Math.hypot(bx - x, by - y);
        if (distance < minDistance) {
          minDistance = distance;
          splitIndex = i;
          splitT = t;
        }
      }
    }

    if (splitIndex !== -1) {
      this.setPoints((prev) => {
        let newPoints = [...prev];
        newPoints = this.handleDeselectAllPoints(newPoints);

        // Nearest segment points
        const p1 = newPoints[splitIndex];
        const p2 = newPoints[splitIndex + 1];

        // Compute exact split point on Bézier curve
        const c1 = p1.controls?.controlOne || p1;
        const c2 = p2.controls?.controlTwo || p2.controls?.controlOne || p2;
        const newX =
          (1 - splitT) ** 3 * p1.x +
          3 * (1 - splitT) ** 2 * splitT * c1.x +
          3 * (1 - splitT) * splitT ** 2 * c2.x +
          splitT ** 3 * p2.x;
        const newY =
          (1 - splitT) ** 3 * p1.y +
          3 * (1 - splitT) ** 2 * splitT * c1.y +
          3 * (1 - splitT) * splitT ** 2 * c2.y +
          splitT ** 3 * p2.y;

        // Compute tangent direction at the split point
        const dx =
          3 * (1 - splitT) ** 2 * (c1.x - p1.x) +
          6 * (1 - splitT) * splitT * (c2.x - c1.x) +
          3 * splitT ** 2 * (p2.x - c2.x);
        const dy =
          3 * (1 - splitT) ** 2 * (c1.y - p1.y) +
          6 * (1 - splitT) * splitT * (c2.y - c1.y) +
          3 * splitT ** 2 * (p2.y - c2.y);
        const length = Math.hypot(dx, dy);
        const normX = dx / length;
        const normY = dy / length;

        // Control points adapted to local curvature
        const controlOffset = length * 0.15;
        const controlOneX = newX + normX * controlOffset;
        const controlOneY = newY + normY * controlOffset;
        const controlTwoX = newX - normX * controlOffset;
        const controlTwoY = newY - normY * controlOffset;

        // Insert new point
        newPoints.splice(splitIndex + 1, 0, {
          type: "splitPoint",
          x: newX,
          y: newY,
          selected: true,
          inSelectionBox: false,
          dragging: false,
          hovering: false,
          controlType: "free",
          controls: {
            controlOne: { x: controlOneX, y: controlOneY, dragging: false },
            controlTwo: { x: controlTwoX, y: controlTwoY, dragging: false },
          },
        });

        return newPoints;
      });
    }
  };

  applyBoardLimits = (value: number) => {
    return Math.max(0, Math.min(100, value));
  };

  handleDeselectAllPoints = (points: BezierPoint[]) => {
    return points.map((point) => ({ ...point, selected: false }));
  };

  handleUnhoverAllPoints = (points: BezierPoint[]) => {
    return points.map((point) => ({ ...point, hovering: false }));
  };

  handleResize = () => {
    if (!this.bezierBackgroundContainerRef.current) return;

    if (
      this.bezierBackgroundContainerRef.current.clientHeight >
      this.bezierBackgroundContainerRef.current.clientWidth
    ) {
      this.setLargestDim("height");
    } else {
      this.setLargestDim("width");
    }

    const aspect =
      this.bezierBackgroundContainerRef.current.clientWidth /
      this.bezierBackgroundContainerRef.current.clientHeight;
    if (aspect > 0.85 && aspect < 1.15) {
      this.setAspectSquarish(true);
    } else {
      this.setAspectSquarish(false);
    }
  };

  handleReset = () => {
    this.setPoints(structuredClone(defaultPoints));
    this.setSettings(structuredClone(defaultSettings));
  };

  deleteSelectedAndHovering = () => {
    this.setPoints((prev) => {
      // Attempt to delete selected points (excluding first/last)
      const newPoints = prev.filter(
        (point, index) =>
          !point.selected || index === 0 || index === prev.length - 1,
      );

      // If no selected point was deleted and length is unchanged
      if (newPoints.length === prev.length) {
        // Attempt to delete hovering/dragging point (excluding first/last)
        const indexToDelete = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1,
        );

        // If a hovering/dragging point was found, remove it
        if (indexToDelete !== -1) {
          return prev.filter((_, index) => index !== indexToDelete);
        }

        // Otherwise, don't modify anything
        return prev;
      }

      return newPoints;
    });
  };

  swapControlType = (controlType: ControlTypes) => {
    this.setPoints((prev) => {
      const newPoints = [...prev];

      // Get all selected points (excluding first & last)
      const selectedIndices = prev
        .map((point, index) =>
          point.selected && index !== 0 && index !== prev.length - 1
            ? index
            : -1,
        )
        .filter((index) => index !== -1);

      // If none are selected, find the first hovered/dragging point
      if (selectedIndices.length === 0) {
        const hoveredIndex = prev.findIndex(
          (point, index) =>
            (point.hovering || point.dragging) &&
            index !== 0 &&
            index !== prev.length - 1,
        );
        if (hoveredIndex !== -1) selectedIndices.push(hoveredIndex);
      }

      if (selectedIndices.length === 0) return newPoints;

      selectedIndices.forEach((index) => {
        newPoints[index].controlType = controlType;
        const x = newPoints[index].controls.controlOne.x;
        const y = newPoints[index].controls.controlOne.y;

        if (newPoints[index].controlType === "inlineSymmetric") {
          const controlTwo = newPoints[index].controls.controlTwo;
          if (controlTwo) {
            newPoints[index].controls.controlTwo = {
              ...controlTwo,
              x: this.applyBoardLimits(2 * newPoints[index].x - x),
              y: this.applyBoardLimits(2 * newPoints[index].y - y),
            };
          }
        } else if (newPoints[index].controlType === "inline") {
          const controlTwo = newPoints[index].controls.controlTwo;
          if (controlTwo) {
            const dx = x - newPoints[index].x;
            const dy = y - newPoints[index].y;
            const angle = Math.atan2(dy, dx);

            const distance = Math.hypot(
              controlTwo.x - newPoints[index].x,
              controlTwo.y - newPoints[index].y,
            );
            newPoints[index].controls.controlTwo = {
              ...controlTwo,
              x: this.applyBoardLimits(
                newPoints[index].x - distance * Math.cos(angle),
              ),
              y: this.applyBoardLimits(
                newPoints[index].y - distance * Math.sin(angle),
              ),
            };
          }
        }
      });

      return newPoints;
    });
  };

  cycleControlType = (setIndex?: number) => {
    this.setPoints((prev) => {
      const newPoints = [...prev];

      // If an explicit index is given, only update that one
      let indicesToUpdate = setIndex !== undefined ? [setIndex] : [];

      if (indicesToUpdate.length === 0) {
        // Get all selected points (excluding first & last)
        indicesToUpdate = prev
          .map((point, index) =>
            point.selected && index !== 0 && index !== prev.length - 1
              ? index
              : -1,
          )
          .filter((index) => index !== -1);

        // If none are selected, find the first hovered/dragging point
        if (indicesToUpdate.length === 0) {
          const hoveredIndex = prev.findIndex(
            (point, index) =>
              (point.hovering || point.dragging) &&
              index !== 0 &&
              index !== prev.length - 1,
          );
          if (hoveredIndex !== -1) indicesToUpdate.push(hoveredIndex);
        }
      }

      if (indicesToUpdate.length === 0) return newPoints;

      indicesToUpdate.forEach((index) => {
        newPoints[index].controlType =
          cycleControlTypeMap[newPoints[index].controlType];

        const x = newPoints[index].controls.controlOne.x;
        const y = newPoints[index].controls.controlOne.y;

        if (newPoints[index].controlType === "inlineSymmetric") {
          const controlTwo = newPoints[index].controls.controlTwo;
          if (controlTwo) {
            newPoints[index].controls.controlTwo = {
              ...controlTwo,
              x: this.applyBoardLimits(2 * newPoints[index].x - x),
              y: this.applyBoardLimits(2 * newPoints[index].y - y),
            };
          }
        } else if (newPoints[index].controlType === "inline") {
          const controlTwo = newPoints[index].controls.controlTwo;
          if (controlTwo) {
            const dx = x - newPoints[index].x;
            const dy = y - newPoints[index].y;
            const angle = Math.atan2(dy, dx);

            const distance = Math.hypot(
              controlTwo.x - newPoints[index].x,
              controlTwo.y - newPoints[index].y,
            );
            newPoints[index].controls.controlTwo = {
              ...controlTwo,
              x: this.applyBoardLimits(
                newPoints[index].x - distance * Math.cos(angle),
              ),
              y: this.applyBoardLimits(
                newPoints[index].y - distance * Math.sin(angle),
              ),
            };
          }
        }
      });

      return newPoints;
    });
  };

  simulateHandlePointer = (controller: "controlOne" | "controlTwo") => {
    this.setPoints((prev) => {
      let index = prev.findIndex(
        (point, index) =>
          point.selected && index !== 0 && index !== prev.length - 1,
      );

      if (index === -1) {
        index = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1,
        );
      }

      if (index === -1) return prev;

      const syntheticEvent = new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      });

      this.handlePointerDown(
        syntheticEvent as unknown as React.PointerEvent,
        index,
        controller,
      );

      return prev;
    });
  };

  isOneSelected = (points: BezierPoint[]): boolean => {
    return points.some((point) => point.selected);
  };

  isOneInSelectionBox = (points: BezierPoint[]): boolean => {
    return points.some((point) => point.inSelectionBox);
  };

  isOneHovered = (points: BezierPoint[]): boolean => {
    return points.some((point) => point.hovering);
  };

  isOneDragging = (points: BezierPoint[]): boolean => {
    return points.some(
      (point) =>
        point.dragging ||
        point.controls.controlOne.dragging ||
        point.controls.controlTwo?.dragging,
    );
  };

  isOneSelectedExcludeEndPoints = (points: BezierPoint[]): boolean => {
    return points.slice(1, points.length - 1).some((point) => point.selected);
  };

  isOneHoveredExcludeEndPoints = (points: BezierPoint[]): boolean => {
    return points.slice(1, points.length - 1).some((point) => point.hovering);
  };

  isOneDraggingExcludeEndPoints = (points: BezierPoint[]): boolean => {
    return points
      .slice(1, points.length - 1)
      .some(
        (point) =>
          point.dragging ||
          point.controls.controlOne.dragging ||
          point.controls.controlTwo?.dragging,
      );
  };

  isFilter = (): boolean => {
    return Object.values(this.settings.filters).some((entry) => entry.value);
  };

  copyToClipBoardBezierCurve = () => {
    let svg = this.getCurrentDownloadableSVG();

    if (this.settings.downloadOptions.compression.value === "Minified")
      svg = this.minifySVG(svg);

    navigator.clipboard.writeText(svg).then(() => {
      this.setCopied(true);

      if (this.copiedTimeout.current) {
        clearTimeout(this.copiedTimeout.current);
        this.copiedTimeout.current = undefined;
      }

      this.copiedTimeout.current = setTimeout(() => {
        this.setCopied(false);
      }, 2250);
    });
  };

  private getFilters = () => {
    return `
      <defs>
        ${
          this.settings.filters.shadow.value
            ? `<filter id='bezierShadowFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feGaussianBlur
            in='SourceAlpha'
            stdDeviation="${this.settings.filters.shadow.strength.value}"
            result='blur'
          />
          <feOffset in='blur' dx="${this.settings.filters.shadow.offsetX.value}" dy="${this.settings.filters.shadow.offsetY.value}" result='offsetBlur' />
          <feFlood
            flood-color='${this.settings.filters.shadow.shadowColor.value}'
            result='colorBlur'
          />
          <feComposite
            in='colorBlur'
            in2='offsetBlur'
            operator='in'
            result='coloredBlur'
          />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>`
            : ""
        }

        ${
          this.settings.filters.blur.value
            ? `<filter id='bezierBlurFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feGaussianBlur in='SourceGraphic' stdDeviation="${this.settings.filters.blur.strength.value}" />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.grayscale.value
            ? `<filter id='bezierGrayscaleFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feColorMatrix type='saturate' values="${this.settings.filters.grayscale.scale.value}" />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.saturate.value
            ? `<filter id='bezierSaturateFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feColorMatrix type='saturate' values="${this.settings.filters.saturate.saturation.value}" />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.edgeDetection.value
            ? `<filter id='bezierEdgeDetectionFilter' x='-2000' y='-2000' width='4000' height='4000'>
                  <feConvolveMatrix
                    order='3'
                    kernelMatrix=' -1 -1 -1 -1 8 -1 -1 -1 -1 '
                    result='edgeDetected'
                  />
                </filter>`
            : ""
        }

        ${
          this.settings.filters.colorOverlay.value
            ? `<filter id='bezierColorOverlayFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feFlood flood-color='${this.settings.filters.colorOverlay.overlayColor.value}' result='flood' />
          <feComposite
            in2='SourceAlpha'
            operator='in'
            result='overlay'
          />
          <feComposite
            in='overlay'
            in2='SourceGraphic'
            operator='over'
          />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.waveDistortion.value
            ? `<filter id='bezierWaveDistortionFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency="${this.settings.filters.waveDistortion.frequency.value}"
            result='turbulence'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='turbulence'
            scale="${this.settings.filters.waveDistortion.strength.value}"
          />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.crackedGlass.value
            ? `<filter id='bezierCrackedGlassFilter' x='-2000' y='-2000' width='4000' height='4000'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency="${this.settings.filters.crackedGlass.density.value}"
            numOctaves="${Math.round(
              this.settings.filters.crackedGlass.detail.value,
            )}"
            result='turbulence'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='turbulence'
            scale="${this.settings.filters.crackedGlass.strength.value}"
          />
        </filter>`
            : ""
        }

        ${
          this.settings.filters.neonGlow.value
            ? `<filter id='bezierNeonGlowFilter' x='-2000' y='-2000' width='4000' height='4000'>
                  <feGaussianBlur
                    in='SourceAlpha'
                    stdDeviation='3'
                    result='blurred'
                  />
                  <feFlood flood-color='${this.settings.filters.neonGlow.neonColor.value}' result='glowColor' />
                  <feComposite
                    in='glowColor'
                    in2='blurred'
                    operator='in'
                    result='glow'
                  />
                  <feComposite in='SourceGraphic' in2='glow' operator='over' />
                </filter>`
            : ""
        }
      </defs>
    `;
  };

  getFilterURLs = () => {
    return `${
      this.settings.filters.shadow.value ? "url(#bezierShadowFilter)" : ""
    }${this.settings.filters.blur.value ? " url(#bezierBlurFilter)" : ""}${
      this.settings.filters.grayscale.value
        ? " url(#bezierGrayscaleFilter)"
        : ""
    }${
      this.settings.filters.saturate.value ? " url(#bezierSaturateFilter)" : ""
    }${
      this.settings.filters.edgeDetection.value
        ? " url(#bezierEdgeDetectionFilter)"
        : ""
    }${
      this.settings.filters.colorOverlay.value
        ? " url(#bezierColorOverlayFilter)"
        : ""
    }${
      this.settings.filters.waveDistortion.value
        ? " url(#bezierWaveDistortionFilter)"
        : ""
    }${
      this.settings.filters.crackedGlass.value
        ? " url(#bezierCrackedGlassFilter)"
        : ""
    }${
      this.settings.filters.neonGlow.value ? " url(#bezierNeonGlowFilter)" : ""
    }`;
  };

  private getCurrentDownloadableSVG = () => {
    const { size } = this.settings.downloadOptions;
    const svgWidth = size.value;
    const svgHeight = size.value;

    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${svgWidth}" height="${svgHeight}" style="background-color: ${
      this.settings.backgroundColor.value
    };">
      ${this.isFilter() ? this.getFilters() : ""}
      ${this.isFilter() ? `<g filter="${this.getFilterURLs()}">` : ""}
        <path
          d="${this.getPathData()}"
          stroke="${this.settings.color.value}"
          fill="none"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ${this.isFilter() ? "</g>" : ""}
    </svg>
  `;
  };

  private zipBlob = async (blob: Blob): Promise<Blob> => {
    const zip = new JSZip();
    zip.file("compressed-image", blob);
    return await zip.generateAsync({ type: "blob" });
  };

  downloadBezierCurve = async () => {
    const { mimeType, compression } = this.settings.downloadOptions;

    // Construct the SVG string
    let svgString = this.getCurrentDownloadableSVG();

    // Apply compression if needed
    if (compression.value === "Minified") {
      svgString = this.minifySVG(svgString);
    }

    // Convert SVG to a Blob
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const filename = this.name.current ? this.name.current : "download";

    // Handle SVGZ (Zipped SVG)
    if (
      mimeType.value === "svgz" ||
      (mimeType.value === "svg" && compression.value === "Zipped")
    ) {
      const compressedBlob = await this.zipBlob(svgBlob);
      const zipUrl = URL.createObjectURL(compressedBlob);
      this.downloadFile(zipUrl, `${filename}.svgz`);
      return;
    }

    // Handle standard SVG download
    if (mimeType.value === "svg") {
      const url = URL.createObjectURL(svgBlob);
      this.downloadFile(url, `${filename}.svg`);
      return;
    }

    // Convert SVG to an image format
    this.convertSVGToImage(
      svgString,
      mimeType.value,
      compression.value,
      filename,
    );
  };

  private minifySVG = (svgString: string) => {
    return svgString.replace(/\s+/g, " ").trim();
  };

  private downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  convertSVGToImage = async (
    svgString: string,
    format: string,
    compression: string,
    filename: string,
  ) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0, img.width, img.height);

      const mimeTypeMap: Record<string, string> = {
        jpg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        tiff: "image/tiff",
        heic: "image/heic",
      };

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create image blob.");
          return;
        }

        // Handle Zipped compression for raster images
        if (compression === "Zipped") {
          const compressedBlob = await this.zipBlob(blob);
          const zipUrl = URL.createObjectURL(compressedBlob);
          this.downloadFile(zipUrl, `${filename}.${format}.zip`);
          return;
        }

        // Normal image download
        const imageUrl = URL.createObjectURL(blob);
        this.downloadFile(imageUrl, `${filename}.${format}`);
      }, mimeTypeMap[format]);

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      console.error("Failed to load SVG into an image.");
    };

    img.src = url;
  };

  confirmBezierCurve = () => {
    const d = this.getPathData();
    const filters = this.isFilter() ? this.getFilters() : undefined;

    const svg = this.getCurrentDownloadableSVG();

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    if (this.confirmBezierCurveFunction)
      this.confirmBezierCurveFunction(
        url,
        svg,
        d,
        blob,
        this.name.current,
        filters,
      );
  };

  getPathData = () => {
    if (this.points.length < 2) return "";

    let d = `${this.handles ? "M 8 50 16 50 " : ""}M ${this.points[0].x} ${
      this.points[0].y
    }`;

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      const c1 = p1.controls.controlOne || p1;
      const c2 = p2.controls.controlTwo || p2.controls.controlOne || p2;

      d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
    }

    if (this.handles) d += " L 92 50";

    return d;
  };
}

export default BezierController;
