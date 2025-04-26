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

  private tempInstances: InstanceType[] = [];

  placeInstances = () => {
    const sel = this.selected.current;
    if (!sel.length) {
      this.indicators.current = [];
      return;
    }

    const { scale: rawScale, x, y } = this.staticPlacement.current;
    const scale = rawScale === "hide" ? 1 : (rawScale as number);
    const GAP = 0.5;
    const containerWidth = 100;
    const gridLeft = x === "default" || x === "hide" ? 50 : (x as number);
    let gridBottom = y === "default" || y === "hide" ? 50 : (y as number);
    let currentX = gridLeft;
    let currentRowMaxH = 0;
    let currentRowTop = gridBottom;

    // clear and reuse
    this.tempInstances.length = 0;

    for (let si = 0; si < sel.length; si++) {
      const { count, aspect, contentId, contentType } = sel[si];
      if (count === "zero") continue;

      const n = Number(count);
      // reuse a small local array for this group
      const group: { x: number; y: number; width: number; height: number }[] =
        [];
      for (let k = 0; k < n; k++) {
        const w = 15 * aspect * scale;
        const h = 15 * scale;
        // wrap to next row?
        if (currentX + w > containerWidth) {
          currentX = gridLeft;
          gridBottom = currentRowTop - GAP;
          currentRowMaxH = 0;
          currentRowTop = gridBottom;
        }

        const posX = Math.min(containerWidth - w, currentX);
        const posY = Math.max(0, gridBottom - h);

        group.push({ x: posX, y: posY, width: w, height: h });

        currentX += w + GAP;
        currentRowMaxH = Math.max(currentRowMaxH, h);
        currentRowTop = gridBottom - currentRowMaxH;
      }

      this.tempInstances.push({ contentId, contentType, instances: group });
    }

    // one final assignment
    this.indicators.current = this.tempInstances;
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
