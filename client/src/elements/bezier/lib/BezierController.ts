import { BezierPoint, ControlTypes, cycleControlTypeMap } from "./typeConstant";

class BezierController {
  constructor(
    private points: BezierPoint[],
    private setPoints: React.Dispatch<React.SetStateAction<BezierPoint[]>>,
    private bezierContainerRef: React.RefObject<HTMLDivElement>,
    private svgRef: React.RefObject<SVGSVGElement>,
    private setInBezier: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (this.shiftPressed.current || this.controlPressed.current) return;

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
      case "c":
        this.cycleControlType();
        break;
      case "x":
        this.deleteSelectedAndHovering();
        break;
      case "delete":
        this.deleteSelectedAndHovering();
        break;
      case "shift":
        this.shiftPressed.current = true;
        break;
      case "control":
        this.controlPressed.current = true;
        break;
      default:
        break;
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = false;
        break;
      case "control":
        this.controlPressed.current = false;
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
      this.handlePointerMove
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeaveBezier = () => {
    this.bezierContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.bezierContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.leaveTimer.current = setTimeout(() => {
      this.setInBezier(false);
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }, 1250);
  };

  handleSVGClick = () => {
    this.setPoints((prev) => {
      let newPoints = [...prev];

      newPoints = this.handleDeselectAllPoints(newPoints);

      return newPoints;
    });
  };

  handlePointerDown = (
    event: React.PointerEvent,
    index: number,
    controlType?: "controlOne" | "controlTwo"
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
    controlType?: "controlOne" | "controlTwo"
  ) => {
    if (
      !this.svgRef.current ||
      ((index === 0 || index === this.points.length - 1) &&
        controlType === undefined)
    )
      return;
    const { clientX, clientY } = event;
    const rect = this.svgRef.current.getBoundingClientRect();
    const x = this.applyBoardLimits(((clientX - rect.left) / rect.width) * 100);
    const y = this.applyBoardLimits(((clientY - rect.top) / rect.height) * 100);

    this.setPoints((prev) => {
      const newPoints = [...prev];

      if (controlType !== undefined) {
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
              newPoints[index].controls.controlTwo.y - newPoints[index].y
            );
            newPoints[index].controls.controlTwo = {
              x: this.applyBoardLimits(
                newPoints[index].x - distance * Math.cos(angle)
              ),
              y: this.applyBoardLimits(
                newPoints[index].y - distance * Math.sin(angle)
              ),
              dragging: false,
            };
          } else if (
            controlType === "controlTwo" &&
            newPoints[index].controls.controlOne
          ) {
            const distance = Math.hypot(
              newPoints[index].controls.controlOne.x - newPoints[index].x,
              newPoints[index].controls.controlOne.y - newPoints[index].y
            );
            newPoints[index].controls.controlOne = {
              x: this.applyBoardLimits(
                newPoints[index].x + distance * Math.cos(angle + Math.PI)
              ),
              y: this.applyBoardLimits(
                newPoints[index].y + distance * Math.sin(angle + Math.PI)
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

  handleDoubleClick = (event: React.MouseEvent) => {
    if (!this.svgRef.current) return;
    const rect = this.svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    let splitIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const midpointX = (p1.x + p2.x) / 2;
      const midpointY = (p1.y + p2.y) / 2;
      const distance = Math.hypot(midpointX - x, midpointY - y);

      if (distance < minDistance) {
        minDistance = distance;
        splitIndex = i;
      }
    }

    if (splitIndex !== -1) {
      this.setPoints((prev) => {
        let newPoints = [...prev];

        newPoints = this.handleDeselectAllPoints(newPoints);

        // Add new split point
        newPoints.splice(splitIndex + 1, 0, {
          type: "splitPoint",
          x,
          y,
          selected: true,
          dragging: false,
          hovering: false,
          controlType: "free",
          controls: {
            controlOne: {
              x: x + 5,
              y: y + 5,
              dragging: false,
            },
            controlTwo: {
              x: x - 5,
              y: y - 5,
              dragging: false,
            },
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

  deleteSelectedAndHovering = () => {
    this.setPoints((prev) => {
      // Attempt to delete selected points (excluding first/last)
      const newPoints = prev.filter(
        (point, index) =>
          !point.selected || index === 0 || index === prev.length - 1
      );

      // If no selected point was deleted and length is unchanged
      if (newPoints.length === prev.length) {
        // Attempt to delete hovering/dragging point (excluding first/last)
        const indexToDelete = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1
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

      let index = prev.findIndex(
        (point, index) =>
          point.selected && index !== 0 && index !== prev.length - 1
      );

      if (index === -1) {
        index = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1
        );
      }

      if (index === -1) return newPoints;

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
            (controlTwo.x ?? 0) - newPoints[index].x,
            (controlTwo.y ?? 0) - newPoints[index].y
          );
          newPoints[index].controls.controlTwo = {
            ...controlTwo,
            x: this.applyBoardLimits(
              newPoints[index].x - distance * Math.cos(angle)
            ),
            y: this.applyBoardLimits(
              newPoints[index].y - distance * Math.sin(angle)
            ),
          };
        }
      }

      return newPoints;
    });
  };

  cycleControlType = () => {
    this.setPoints((prev) => {
      const newPoints = [...prev];

      let index = prev.findIndex(
        (point, index) =>
          point.selected && index !== 0 && index !== prev.length - 1
      );

      if (index === -1) {
        index = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1
        );
      }

      if (index === -1) return newPoints;

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
            (controlTwo.x ?? 0) - newPoints[index].x,
            (controlTwo.y ?? 0) - newPoints[index].y
          );
          newPoints[index].controls.controlTwo = {
            ...controlTwo,
            x: this.applyBoardLimits(
              newPoints[index].x - distance * Math.cos(angle)
            ),
            y: this.applyBoardLimits(
              newPoints[index].y - distance * Math.sin(angle)
            ),
          };
        }
      }

      return newPoints;
    });
  };

  simulateHandlePointer = (controller: "controlOne" | "controlTwo") => {
    this.setPoints((prev) => {
      let index = prev.findIndex(
        (point, index) =>
          point.selected && index !== 0 && index !== prev.length - 1
      );

      if (index === -1) {
        index = prev.findIndex(
          (point, index) =>
            (point.dragging || point.hovering) &&
            index !== 0 &&
            index !== prev.length - 1
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
        controller
      );

      return prev;
    });
  };

  isOneSelected = (points: BezierPoint[]): boolean => {
    return points.slice(1, points.length - 1).some((point) => point.selected);
  };

  isOneHovered = (points: BezierPoint[]): boolean => {
    return points.slice(1, points.length - 1).some((point) => point.hovering);
  };

  downloadBezierCurve = () => {};

  getPathData = () => {
    if (this.points.length < 2) return "";

    let d = `M 8 50 16 50 M ${this.points[0].x} ${this.points[0].y}`;

    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      const c1 = p1.controls.controlOne || p1;
      const c2 = p2.controls.controlTwo || p2.controls.controlOne || p2;

      d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
    }

    d += " L 92 50";

    return d;
  };
}

export default BezierController;
