import { v4 as uuidv4 } from "uuid";
import { StaticContentTypes } from "../../../../../../universal/contentTypeConstant";
import { InstanceType } from "../TabledPortal";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";

class TabledPortalController {
  constructor(
    private indicators: React.MutableRefObject<InstanceType[]>,
    private staticPlacement: React.MutableRefObject<{
      x: "default" | "hide" | number;
      y: "default" | "hide" | number;
      scale: "hide" | number;
    }>,
    private selected: React.MutableRefObject<
      {
        contentType: StaticContentTypes;
        contentId: string;
        aspect: number;
        count: number | "zero";
      }[]
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private tabledPortalRef: React.RefObject<HTMLDivElement>,
    private tabledContentRef: React.RefObject<HTMLDivElement>,
    private setTabledActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  private setIndicators = () => {
    if (this.selected.current.length > 0) {
      const scale =
        this.staticPlacement.current.scale === "hide"
          ? 1
          : this.staticPlacement.current.scale;

      this.indicators.current = this.selected.current
        .map((selection) => {
          if (selection.count === "zero") return null;

          return {
            contentId: selection.contentId,
            contentType: selection.contentType,
            instances: Array.from({ length: Number(selection.count) }, () => ({
              height: 15 * scale,
              width: 15 * selection.aspect * scale,
              x: 0,
              y: 0,
            })),
          };
        })
        .filter((item): item is InstanceType => item !== null);
    } else {
      this.indicators.current = [];
    }
  };

  placeInstances = () => {
    this.setIndicators();

    if (this.indicators.current.length === 0) {
      return;
    }

    // Directly use this.indicators.current to avoid copying the array
    const instances = this.indicators.current;
    const GAP = 0.5;
    const containerWidth = 100;

    // Calculate gridLeft and gridBottom only once
    const gridLeft =
      this.staticPlacement.current.x === "default" ||
      this.staticPlacement.current.x === "hide"
        ? 50
        : this.staticPlacement.current.x;

    let gridBottom =
      this.staticPlacement.current.y === "default" ||
      this.staticPlacement.current.y === "hide"
        ? 50
        : this.staticPlacement.current.y;

    let currentX = gridLeft;
    let currentRowMaxHeight = 0;
    let currentRowTop = gridBottom;

    const newPositions: InstanceType[] = [];

    // Use for-loop for better performance on the outer iteration
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      const newIns: { width: number; height: number; x: number; y: number }[] =
        [];

      // Use for-loop instead of forEach for inner iterations
      for (let j = 0; j < instance.instances.length; j++) {
        const ins = instance.instances[j];
        const { width, height } = ins;

        // Check if the current box exceeds the container width and reset position
        if (currentX + width > containerWidth) {
          currentX = gridLeft;
          gridBottom = currentRowTop - GAP;
          currentRowMaxHeight = 0;
          currentRowTop = gridBottom;
        }

        const boxY = gridBottom - height;
        const boxX = currentX;

        newIns.push({
          ...ins,
          x: Math.min(containerWidth - width, boxX),
          y: Math.max(0, boxY),
        });

        // Update currentX and row height
        currentX += width + GAP;
        currentRowMaxHeight = Math.max(currentRowMaxHeight, height);
        currentRowTop = gridBottom - currentRowMaxHeight;
      }

      newPositions.push({
        ...instance,
        instances: newIns,
      });
    }

    // Update indicators only once after processing
    this.indicators.current = newPositions;
  };

  uploadInstances = () => {
    if (this.selected.current.length === 0) return;

    this.placeInstances();

    const instancesToUpload = this.indicators.current.map((indicator) => ({
      contentType: indicator.contentType,
      contentId: indicator.contentId,
      instances: indicator.instances.map((ins) => ({
        instanceId: uuidv4(),
        positioning: {
          position: {
            left: ins.x,
            top: ins.y,
          },
          scale: {
            x: ins.width,
            y: ins.height,
          },
          rotation: 0,
        },
      })),
    }));

    this.tableStaticContentSocket.current?.createNewInstances(
      instancesToUpload,
    );
  };

  reset = () => {
    if (this.selected.current.length !== 0) {
      this.selected.current = [];
      this.staticPlacement.current = {
        x: "default",
        y: "default",
        scale: 1,
      };
    } else {
      this.setTabledActive(false);
    }
    this.setRerender((prev) => !prev);
  };

  handlePortalClick = (event: React.PointerEvent) => {
    if (
      this.tabledPortalRef.current?.contains(event.target as Node) &&
      !this.tabledContentRef.current?.contains(event.target as Node)
    ) {
      this.setTabledActive(false);
    }
  };
}

export default TabledPortalController;
