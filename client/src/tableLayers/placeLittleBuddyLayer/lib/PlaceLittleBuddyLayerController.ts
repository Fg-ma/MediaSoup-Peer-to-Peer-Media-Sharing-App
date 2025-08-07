import { v4 as uuidv4 } from "uuid";
import {
  onInstancesLayerModeType,
  onStartInstancesDragType,
  NewInstanceSignals,
  PlaceLittleBuddySignals,
  onStartPlaceLittleBuddyDragType,
} from "../../../context/signalContext/lib/typeConstant";
import TableStaticContentSocketController from "../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { LittleBuddyInstanceType } from "src/elements/littleBuddyPortal/LittleBuddyPortal";

class PlaceLittleBuddyLayerController {
  constructor(
    private newInstanceLayerRef: React.RefObject<HTMLDivElement>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private newLittleBuddy: React.MutableRefObject<
      LittleBuddyInstanceType | undefined
    >,
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

  placeInstances = () => {
    if (!this.newInstanceLayerRef.current || !this.newLittleBuddy.current)
      return;
    const containerRect =
      this.newInstanceLayerRef.current.getBoundingClientRect();

    const widthPx =
      (containerRect.width * this.newLittleBuddy.current.width) / 100;
    const heightPx =
      (containerRect.height * this.newLittleBuddy.current.height) / 100;

    const boxY = this.mousePosition.y - heightPx;

    this.newLittleBuddy.current = {
      ...this.newLittleBuddy.current,
      x: Math.min(containerRect.width - widthPx, this.mousePosition.x),
      y: Math.max(0, boxY),
    };
    this.setRerender((prev) => !prev);
  };

  onStartPlaceLittleBuddyDrag = (event: onStartPlaceLittleBuddyDragType) => {
    const { littleBuddy, width, height } = event.data;

    this.newLittleBuddy.current = {
      littleBuddy,
      width,
      height,
      x: 0,
      y: 0,
    };

    this.setRerender((prev) => !prev);
  };

  onStopPlaceLittleBuddyDrag = () => {
    if (this.hideInstances.current || !this.newLittleBuddy.current) {
      this.newLittleBuddy.current = undefined;
      this.hideInstances.current = false;
      this.setRerender((prev) => !prev);
      return;
    }

    const instancesToUpload = {
      littleBuddy: this.newLittleBuddy.current?.littleBuddy,
      positioning: {
        position: {
          left: this.newLittleBuddy.current.x,
          top: this.newLittleBuddy.current.y,
        },
        scale: {
          x: this.newLittleBuddy.current.width,
          y: this.newLittleBuddy.current.height,
        },
        rotation: 0,
      },
    };

    this.tableStaticContentSocket.current?.createNewInstances(
      instancesToUpload,
    );

    this.newLittleBuddy.current = undefined;
    this.hideInstances.current = false;
    this.setRerender((prev) => !prev);
  };

  handleSignals = (event: PlaceLittleBuddySignals) => {
    if (!event) return;

    switch (event.type) {
      case "startPlaceLittleBuddyDrag":
        this.onStartPlaceLittleBuddyDrag(event);
        break;
      case "stopPlaceLittleBuddyDrag":
        this.onStopPlaceLittleBuddyDrag();
        break;
      default:
        break;
    }
  };
}

export default PlaceLittleBuddyLayerController;
