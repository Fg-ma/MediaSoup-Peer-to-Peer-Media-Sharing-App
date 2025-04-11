import { v4 as uuidv4 } from "uuid";
import { Signals } from "../../../context/signalContext/SignalContext";
import { InstanceType } from "../NewInstancesLayer";
import TableStaticContentSocketController from "../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";

class NewInstancesLayerController {
  constructor(
    private newInstanceLayerRef: React.RefObject<HTMLDivElement>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private newInstances: React.MutableRefObject<InstanceType[]>,
    private hideInstances: React.MutableRefObject<boolean>,
    private mousePosition: {
      x: number;
      y: number;
    },
    private setMousePosition: React.Dispatch<
      React.SetStateAction<{
        x: number;
        y: number;
      }>
    >,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleMouseMove = (event: MouseEvent) => {
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;

    if (this.newInstanceLayerRef.current && this.tableRef.current) {
      const box = this.newInstanceLayerRef.current.getBoundingClientRect();
      const cutoffBox = this.tableRef.current.getBoundingClientRect();
      minX = 0;
      minY = 0;
      maxX = box.width;
      maxY = box.height;

      const x = event.clientX - box.left;
      const y = event.clientY - box.top;

      if (
        event.clientY > cutoffBox.top + cutoffBox.height ||
        event.clientY < cutoffBox.top ||
        event.clientX > cutoffBox.left + cutoffBox.width ||
        event.clientX < cutoffBox.left
      ) {
        this.hideInstances.current = true;
      } else {
        this.hideInstances.current = false;
      }

      this.setMousePosition({
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      });
    }
  };

  handleScroll = (event: WheelEvent) => {
    if (event.shiftKey) {
      const delta = event.deltaY;

      if (delta < 0) {
        this.newInstances.current = this.newInstances.current.map(
          (instance) => ({
            ...instance,
            instances:
              instance.instances.length < 10
                ? [
                    ...instance.instances,
                    {
                      width: instance.instances[0].width,
                      height: instance.instances[0].height,
                      x: 0,
                      y: 0,
                    },
                  ]
                : instance.instances,
          }),
        );
      } else {
        this.newInstances.current = this.newInstances.current.map(
          (instance) => ({
            ...instance,
            instances:
              instance.instances.length >= 2
                ? instance.instances.slice(0, -1)
                : instance.instances,
          }),
        );
      }

      this.setRerender((prev) => !prev);
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case "x":
          this.newInstances.current = this.newInstances.current.map(
            (instance) => ({
              ...instance,
              instances:
                instance.instances.length > 1
                  ? [
                      {
                        width: instance.instances[0].width,
                        height: instance.instances[0].height,
                        x: 0,
                        y: 0,
                      },
                    ]
                  : instance.instances,
            }),
          );
          this.setRerender((prev) => !prev);
          break;
        case "m":
          this.newInstances.current = this.newInstances.current.map(
            (instance) => {
              const diff = 10 - instance.instances.length;

              return {
                ...instance,
                instances:
                  diff > 0
                    ? [
                        ...instance.instances,
                        ...Array.from({ length: diff }).map(() => ({
                          width: instance.instances[0].width,
                          height: instance.instances[0].height,
                          x: 0,
                          y: 0,
                        })),
                      ]
                    : instance.instances,
              };
            },
          );
          this.setRerender((prev) => !prev);
          break;
        default:
          break;
      }
    }
  };

  placeInstances = () => {
    if (!this.newInstanceLayerRef.current) return;
    const containerRect =
      this.newInstanceLayerRef.current.getBoundingClientRect();
    const instances = [...this.newInstances.current];
    const GAP = 4;

    const gridLeft = this.mousePosition.x;
    let gridBottom = this.mousePosition.y;

    let currentX = gridLeft;
    let currentRowMaxHeight = 0;
    let currentRowTop = gridBottom;

    const newPositions: InstanceType[] = [];

    instances.forEach((instance) => {
      const newIns: { width: number; height: number; x: number; y: number }[] =
        [];

      instance.instances.forEach((ins) => {
        const widthPx = (containerRect.width * ins.width) / 100;
        const heightPx = (containerRect.height * ins.height) / 100;

        if (currentX + widthPx > containerRect.width) {
          currentX = gridLeft;
          gridBottom = currentRowTop - GAP;
          currentRowMaxHeight = 0;
          currentRowTop = gridBottom;
        }

        const boxY = gridBottom - heightPx;
        const boxX = currentX;

        newIns.push({
          ...ins,
          x: Math.min(containerRect.width - widthPx, boxX),
          y: Math.max(0, boxY),
        });

        currentX += widthPx + GAP;

        currentRowMaxHeight = Math.max(currentRowMaxHeight, heightPx);
        currentRowTop = gridBottom - currentRowMaxHeight;
      });

      newPositions.push({
        ...instance,
        instances: newIns,
      });
    });

    this.newInstances.current = newPositions;
    this.setRerender((prev) => !prev);
  };

  handleSignals = (event: Signals) => {
    if (!event) return;

    switch (event.type) {
      case "startInstancesDrag":
        {
          const { instances } = event.data;

          this.newInstances.current = [
            ...this.newInstances.current,
            ...instances.map((instance) => ({
              contentType: instance.contentType,
              contentId: instance.contentId,
              instances: [
                ...instance.instances.map((ins) => ({
                  width: ins.width,
                  height: ins.height,
                  x: 0,
                  y: 0,
                })),
              ],
            })),
          ];
          this.setRerender((prev) => !prev);
        }
        break;
      case "stopInstancesDrag":
        {
          if (this.hideInstances.current) {
            this.newInstances.current = [];
            this.hideInstances.current = false;
            this.setRerender((prev) => !prev);
            return;
          }

          const instancesToUpload = this.newInstances.current.map(
            (instance) => ({
              contentType: instance.contentType,
              contentId: instance.contentId,
              instances: instance.instances.map((ins) => ({
                instanceId: uuidv4(),
                positioning: {
                  position: {
                    left:
                      (ins.x /
                        (this.newInstanceLayerRef.current?.clientWidth ?? 1)) *
                      100,
                    top:
                      (ins.y /
                        (this.newInstanceLayerRef.current?.clientHeight ?? 1)) *
                      100,
                  },
                  scale: {
                    x: ins.width,
                    y: ins.height,
                  },
                  rotation: 0,
                },
              })),
            }),
          );

          this.tableStaticContentSocket.current?.createNewInstances(
            instancesToUpload,
          );

          this.newInstances.current = [];
          this.hideInstances.current = false;
          this.setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };
}

export default NewInstancesLayerController;
