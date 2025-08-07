import { LittleBuddyInstanceType } from "../LittleBuddyPortal";
import TableStaticContentSocketController from "../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { LittleBuddiesTypes } from "src/tableBabylon/littleBuddies/lib/typeConstant";

class LittleBuddyPortalController {
  constructor(
    private indicators: React.MutableRefObject<
      LittleBuddyInstanceType | undefined
    >,
    private staticPlacement: React.MutableRefObject<{
      x: "default" | "hide" | number;
      y: "default" | "hide" | number;
      scale: "hide" | number;
    }>,
    private selected: React.MutableRefObject<
      | {
          littleBuddy: LittleBuddiesTypes;
          aspect: number;
        }
      | undefined
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private littleBuddyPortalRef: React.RefObject<HTMLDivElement>,
    private littleBuddyContentRef: React.RefObject<HTMLDivElement>,
    private setLittleBuddyActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  placeInstances = () => {
    const sel = this.selected.current;
    if (!sel) {
      this.indicators.current = undefined;
      return;
    }

    const { scale: rawScale, x, y } = this.staticPlacement.current;
    const scale = rawScale === "hide" ? 1 : (rawScale as number);

    const { aspect, littleBuddy } = sel;

    const w = 15 * aspect * scale;
    const h = 15 * scale;

    const posX = Math.min(
      100 - w,
      x === "default" || x === "hide" ? 50 : (x as number),
    );
    const posY = Math.max(
      0,
      (y === "default" || y === "hide" ? 50 : (y as number)) - h,
    );

    this.indicators.current = {
      littleBuddy,
      x: posX,
      y: posY,
      width: w,
      height: h,
    };
  };

  uploadInstances = () => {
    if (!this.selected.current || !this.indicators.current) return;

    this.placeInstances();

    const instancesToUpload = {
      littleBuddy: this.indicators.current.littleBuddy,
      positioning: {
        position: {
          left: this.indicators.current.x,
          top: this.indicators.current.y,
        },
        scale: {
          x: this.indicators.current.width,
          y: this.indicators.current.height,
        },
        rotation: 0,
      },
    };

    this.tableStaticContentSocket.current?.createNewInstances(
      instancesToUpload,
    );
  };

  reset = () => {
    if (this.selected.current) {
      this.selected.current = undefined;
      this.staticPlacement.current = {
        x: "default",
        y: "default",
        scale: 1,
      };
    } else {
      this.setLittleBuddyActive(false);
    }
    this.setRerender((prev) => !prev);
  };

  handlePortalClick = (event: React.PointerEvent) => {
    if (
      this.littleBuddyPortalRef.current?.contains(event.target as Node) &&
      !this.littleBuddyContentRef.current?.contains(event.target as Node)
    ) {
      this.setLittleBuddyActive(false);
    }
  };
}

export default LittleBuddyPortalController;
